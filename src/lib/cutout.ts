import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to always download models
env.allowLocalModels = false;
env.useBrowserCache = true;

const MAX_IMAGE_DIMENSION = 1024;

type SupportedMask = {
  data: Float32Array | Uint8Array | Uint8ClampedArray;
  width?: number;
  height?: number;
};

let segmenterPromise: Promise<any> | null = null;

function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

function getSegmenter() {
  if (!segmenterPromise) {
    segmenterPromise = pipeline('image-segmentation', 'Xenova/u2net', {
      device: 'wasm'
    });
  }

  return segmenterPromise;
}

function normalizeMaskValue(value: number) {
  if (Number.isNaN(value)) return 0;
  if (value > 1) {
    // value might already be scaled 0-255
    return Math.min(255, value) / 255;
  }

  if (value < 0) return 0;
  return value;
}

function refineAlphaMask(alpha: Uint8ClampedArray, width: number, height: number) {
  const dilated = new Uint8ClampedArray(alpha.length);
  const eroded = new Uint8ClampedArray(alpha.length);
  const feathered = new Uint8ClampedArray(alpha.length);

  const radius = 1;

  // Dilate to close small holes
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let max = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            max = Math.max(max, alpha[ny * width + nx]);
          }
        }
      }
      dilated[y * width + x] = max;
    }
  }

  // Erode to remove halos while keeping subject intact
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let min = 255;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            min = Math.min(min, dilated[ny * width + nx]);
          }
        }
      }
      eroded[y * width + x] = min;
    }
  }

  // Feather edges by averaging neighbours
  const clamp = (value: number) => Math.min(255, Math.max(0, value));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            sum += eroded[ny * width + nx];
            count++;
          }
        }
      }
      feathered[y * width + x] = clamp(sum / count);
    }
  }

  return feathered;
}

function createAlphaMask(mask: SupportedMask, expectedWidth: number, expectedHeight: number) {
  const width = mask.width ?? expectedWidth;
  const height = mask.height ?? expectedHeight;
  const totalPixels = width * height;

  const alpha = new Uint8ClampedArray(totalPixels);
  const data = mask.data;

  if (data.length === totalPixels) {
    for (let i = 0; i < totalPixels; i++) {
      const normalized = normalizeMaskValue(data[i]);
      const boosted = Math.pow(normalized, 0.75);
      alpha[i] = Math.round(boosted * 255);
    }
  } else if (data.length === totalPixels * 4) {
    for (let i = 0; i < totalPixels; i++) {
      const normalized = normalizeMaskValue(data[i * 4]);
      const boosted = Math.pow(normalized, 0.75);
      alpha[i] = Math.round(boosted * 255);
    }
  } else {
    throw new Error('Unexpected mask dimensions');
  }

  const refined = refineAlphaMask(alpha, width, height);

  // Strengthen confident pixels and remove weak background remnants
  for (let i = 0; i < refined.length; i++) {
    const value = refined[i];
    if (value > 200) {
      refined[i] = 255;
    } else if (value < 25) {
      refined[i] = 0;
    }
  }

  return {
    data: refined,
    width,
    height
  };
}

function drawMaskToCanvas(alphaMask: { data: Uint8ClampedArray; width: number; height: number }) {
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = alphaMask.width;
  maskCanvas.height = alphaMask.height;
  const maskCtx = maskCanvas.getContext('2d');
  if (!maskCtx) {
    throw new Error('Could not get mask canvas context');
  }

  const maskImageData = maskCtx.createImageData(alphaMask.width, alphaMask.height);
  for (let i = 0; i < alphaMask.data.length; i++) {
    const alpha = alphaMask.data[i];
    const offset = i * 4;
    maskImageData.data[offset] = 255;
    maskImageData.data[offset + 1] = 255;
    maskImageData.data[offset + 2] = 255;
    maskImageData.data[offset + 3] = alpha;
  }

  maskCtx.putImageData(maskImageData, 0, 0);
  return maskCanvas;
}

export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = (error) => {
      URL.revokeObjectURL(img.src);
      reject(error);
    };
    img.src = URL.createObjectURL(file);
  });
};

export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Starting background removal process...');
    const segmenter = await getSegmenter();

    // Convert HTMLImageElement to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Could not get canvas context');

    // Resize image if needed and draw it to canvas
    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`Image ${wasResized ? 'was' : 'was not'} resized. Final dimensions: ${canvas.width}x${canvas.height}`);

    // Get image data as base64
    const imageData = canvas.toDataURL('image/png');
    console.log('Image converted to base64');

    // Process the image with the segmentation model
    console.log('Processing with segmentation model...');
    const result = await segmenter(imageData);

    console.log('Segmentation result:', result);

    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }

    const alphaMask = createAlphaMask(result[0].mask as SupportedMask, canvas.width, canvas.height);
    const maskCanvas = drawMaskToCanvas(alphaMask);

    // Create a new canvas for the masked image
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');

    if (!outputCtx) throw new Error('Could not get output canvas context');

    // Draw original image
    outputCtx.drawImage(canvas, 0, 0);

    // Apply the mask using destination-in to keep only the subject
    outputCtx.globalCompositeOperation = 'destination-in';
    outputCtx.drawImage(maskCanvas, 0, 0, outputCanvas.width, outputCanvas.height);
    outputCtx.globalCompositeOperation = 'source-over';

    console.log('Mask applied successfully');

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Successfully created final blob');
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};

/**
 * Cloud-based background removal stub
 * Add your API integration here (e.g., Replicate, Workers AI, etc.)
 */
export async function removeBackgroundCloud(file: File): Promise<Blob> {
  // Check if API key is available
  const apiKey = import.meta.env.VITE_CUTOUT_API_KEY;
  
  if (!apiKey) {
    throw new Error('API key not configured. Set VITE_CUTOUT_API_KEY to use Cloud mode.');
  }

  // Stub implementation - replace with actual API call
  throw new Error('Cloud mode not yet implemented. Configure your preferred API (Replicate, etc.)');
}
