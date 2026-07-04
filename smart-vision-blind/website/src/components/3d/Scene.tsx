import { useState, Suspense } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { PerformanceMonitor, Preload } from "@react-three/drei";
import * as THREE from "three";
import { Terrain } from "./Terrain";
import { Particles } from "./Particles";
import { Lighting } from "./Lighting";

// Camera waypoints — position, lookAt target, FOV
const CAMERA_PATH = [
  { pos: [0, 14, 55],   target: [0, 2, 0],    fov: 60 }, // hero
  { pos: [5, 10, 30],   target: [0, 3, -5],   fov: 62 }, // about (closer, slight offset)
  { pos: [-12, 8, -5],  target: [0, 4, -30],  fov: 68 }, // features
  { pos: [0, 26, -35],  target: [0, 0, -60],  fov: 55 }, // contact
  { pos: [0, 40, -55],  target: [0, 0, -85],  fov: 50 }, // footer
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Pre-allocated vectors — avoids GC thrashing in render loop
const _posVec = new THREE.Vector3();
const _targetVec = new THREE.Vector3();

function CameraRig({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const { camera } = useThree();

  useFrame(() => {
    const t = Math.max(0, Math.min(1, scrollProgress.current));
    const segments = CAMERA_PATH.length - 1;
    const seg = Math.min(Math.floor(t * segments), segments - 1);
    const localT = t * segments - seg;

    const from = CAMERA_PATH[seg];
    const to = CAMERA_PATH[seg + 1];
    // Smoothstep easing
    const ease = localT * localT * (3 - 2 * localT);

    // Interpolate position
    _posVec.set(
      lerp(from.pos[0], to.pos[0], ease),
      lerp(from.pos[1], to.pos[1], ease),
      lerp(from.pos[2], to.pos[2], ease)
    );

    // Interpolate look-at target
    _targetVec.set(
      lerp(from.target[0], to.target[0], ease),
      lerp(from.target[1], to.target[1], ease),
      lerp(from.target[2], to.target[2], ease)
    );

    // Smooth follow with lerp factor
    camera.position.lerp(_posVec, 0.05);
    camera.lookAt(_targetVec);

    // FOV transition
    const cam = camera as THREE.PerspectiveCamera;
    const targetFov = lerp(from.fov, to.fov, ease);
    cam.fov += (targetFov - cam.fov) * 0.04;
    cam.updateProjectionMatrix();
  });

  return null;
}

interface SceneProps {
  scrollProgress: React.MutableRefObject<number>;
}

export function Scene({ scrollProgress }: SceneProps) {
  const [quality, setQuality] = useState<"high" | "low">("high");

  return (
    <Canvas
      dpr={[1, quality === "high" ? 1.5 : 1]}
      camera={{ position: [0, 14, 55], fov: 60, near: 0.5, far: 500 }}
      shadows={quality === "high"}
      gl={{
        antialias: quality === "high",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.85,
        powerPreference: "high-performance",
      }}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    >
      <PerformanceMonitor
        onDecline={() => setQuality("low")}
        onIncline={() => setQuality("high")}
        flipflops={3}
        onFallback={() => setQuality("low")}
      />
      <Suspense fallback={null}>
        <Lighting />
        <Terrain />
        <Particles count={2000} quality={quality} />
        <CameraRig scrollProgress={scrollProgress} />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
