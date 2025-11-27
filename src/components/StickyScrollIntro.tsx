import { useRef, useEffect, useState, lazy, Suspense } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import heroElegantBg from '@/assets/hero-elegant-bg-hq.jpg';
import MultiplyChat from "./MultiplyChat";

// Lazy load 3D components for better performance
const Canvas = lazy(() => import("@react-three/fiber").then(module => ({ default: module.Canvas })));
const OrbitControls = lazy(() => import("@react-three/drei").then(module => ({ default: module.OrbitControls })));
const Environment = lazy(() => import("@react-three/drei").then(module => ({ default: module.Environment })));
const Float = lazy(() => import("@react-three/drei").then(module => ({ default: module.Float })));

function Scene3D() {
  return (
    <Suspense fallback={null}>
      <Environment preset="night" />
      <ambientLight intensity={0.3} />
      <spotLight position={[15, 15, 15]} angle={0.2} penumbra={1} intensity={1.5} color="#9ca3af" />
      
      {/* Simplified - only main central shape */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.3}>
        <mesh position={[0, 0, 0]}>
          <torusKnotGeometry args={[1.2, 0.35, 128, 16]} />
          <meshStandardMaterial 
            color="#9ca3af" 
            metalness={0.9} 
            roughness={0.1}
            emissive="#9ca3af"
            emissiveIntensity={0.4}
          />
        </mesh>
      </Float>
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.3}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
      />
    </Suspense>
  );
}

const StickyScrollIntro = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [show3D, setShow3D] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Simplified transforms for better performance
  const imageOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const canvasOpacity = useTransform(scrollYProgress, [0.6, 0.85], [0, 1]);

  // Monitor scroll progress to show 3D
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest > 0.65 && !show3D) {
        setShow3D(true);
      } else if (latest <= 0.65 && show3D) {
        setShow3D(false);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, show3D]);

  return (
    <div ref={containerRef} className="h-[200vh] relative">
      {/* Sticky container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Hero Image Layer */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: imageOpacity,
          }}
        >
          {!imageLoaded && (
            <div className="absolute inset-0 bg-black animate-pulse" />
          )}
          <motion.img
            src={heroElegantBg}
            alt="Hero"
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: imageLoaded ? 1 : 0, scale: imageLoaded ? 1 : 1.05 }}
            transition={{ duration: 2, ease: [0.25, 0.1, 0.25, 1] }}
            onLoad={() => setImageLoaded(true)}
          />
          <motion.div 
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              opacity: useTransform(scrollYProgress, [0, 0.5], [0.4, 0.8]),
            }}
          />
          
          {/* Hero text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <motion.h1
              className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight leading-none chrome-text"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Mobile layout - all words in one line */}
              <span className="md:hidden">
                THE FUTURE IS MULTIPLIED.
              </span>
              
              {/* Desktop layout - two lines */}
              <span className="hidden md:block">
                <div className="mb-4">
                  THE FUTURE IS
                </div>
                <div>
                  MULTIPLIED.
                </div>
              </span>
            </motion.h1>
            <motion.p
              className="mt-4 text-lg md:text-2xl font-semibold uppercase tracking-wide text-gray-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              Prompt Like a Billionare
            </motion.p>
          </div>
        </motion.div>

        {/* 3D Canvas Layer */}
        {show3D && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: canvasOpacity,
              background: 'radial-gradient(circle at center, rgba(107, 114, 128, 0.1) 0%, rgba(0, 0, 0, 0.95) 70%)',
            }}
          >
            <Suspense fallback={<div className="w-full h-full" />}>
              <Canvas 
                camera={{ position: [0, 0, 6], fov: 60 }}
                gl={{ 
                  antialias: false,
                  alpha: true,
                  powerPreference: "high-performance"
                }}
                dpr={[1, 1.5]}
              >
                <Scene3D />
              </Canvas>
            </Suspense>
          </motion.div>
        )}

        {/* Multiply Chat - only appears with 3D */}
        {show3D && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="absolute bottom-0 left-0 right-0 z-20"
          >
            <MultiplyChat />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StickyScrollIntro;
