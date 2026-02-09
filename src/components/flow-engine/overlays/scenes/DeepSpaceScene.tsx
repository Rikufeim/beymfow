import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

interface Props {
  variant: string;
  speedScale: number;
  opacityScale: number;
}

export default function DeepSpaceScene({ speedScale, opacityScale }: Props) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 2800;
  const spread = 28;

  const [positions, randoms] = useMemo(() => {
    const rng = seeded(12345);
    const pos = new Float32Array(count * 3);
    const rand = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rng() - 0.5) * spread * 2;
      pos[i * 3 + 1] = (rng() - 0.5) * spread * 2;
      pos[i * 3 + 2] = (rng() - 0.5) * spread * 2;
      rand[i] = rng();
    }
    return [pos, rand];
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current || speedScale <= 0) return;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 2] += delta * speedScale * (0.3 + randoms[i] * 0.5);
      if (pos[i * 3 + 2] > spread * 0.5) pos[i * 3 + 2] -= spread;
      if (pos[i * 3 + 2] < -spread * 0.5) pos[i * 3 + 2] += spread;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        transparent
        opacity={0.75 * opacityScale}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#e8ecf4"
      />
    </points>
  );
}
