import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uOpacity;

// Hash-based 3D noise
vec3 hash33(vec3 p) {
  p = fract(p * vec3(443.897, 441.423, 437.195));
  p += dot(p.zxy, p.yxz + 19.27);
  return fract((p.xxy + p.yxx) * p.zyx);
}

float noise3d(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  
  float n = mix(
    mix(
      mix(dot(hash33(i), f), dot(hash33(i + vec3(1,0,0)), f - vec3(1,0,0)), f.x),
      mix(dot(hash33(i + vec3(0,1,0)), f - vec3(0,1,0)), dot(hash33(i + vec3(1,1,0)), f - vec3(1,1,0)), f.x),
      f.y
    ),
    mix(
      mix(dot(hash33(i + vec3(0,0,1)), f - vec3(0,0,1)), dot(hash33(i + vec3(1,0,1)), f - vec3(1,0,1)), f.x),
      mix(dot(hash33(i + vec3(0,1,1)), f - vec3(0,1,1)), dot(hash33(i + vec3(1,1,1)), f - vec3(1,1,1)), f.x),
      f.y
    ),
    f.z
  );
  return n;
}

float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  float f = 1.0;
  for (int i = 0; i < 5; i++) {
    v += a * noise3d(p * f);
    f *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv - 0.5;
  vec3 p = vec3(uv * 3.0, uTime * 0.08);
  
  float n = fbm(p);
  float n2 = fbm(p + vec3(100.0, 50.0, 20.0));
  float n3 = fbm(p * 1.5 + vec3(0, 0, uTime * 0.05));
  
  float d = n * 0.6 + n2 * 0.3 + n3 * 0.2;
  d = smoothstep(0.2, 0.6, d);
  
  vec3 col = mix(
    vec3(0.15, 0.05, 0.25),
    vec3(0.4, 0.15, 0.6),
    d
  );
  col = mix(col, vec3(0.1, 0.25, 0.5), n2 * 0.5);
  col = mix(col, vec3(0.2, 0.5, 0.6), n3 * 0.3);
  
  float alpha = d * 0.5 + 0.1;
  alpha *= uOpacity;
  
  gl_FragColor = vec4(col, alpha);
}
`;

interface Props {
  variant: string;
  speedScale: number;
  opacityScale: number;
}

export default function NebulaCoreScene({ speedScale, opacityScale }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta * speedScale;
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = timeRef.current;
      materialRef.current.uniforms.uOpacity.value = 0.7 * opacityScale;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -2]} scale={[20, 20, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uOpacity: { value: 0.7 * opacityScale },
        }}
      />
    </mesh>
  );
}
