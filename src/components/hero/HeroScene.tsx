"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";

function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ||
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true }) ||
      canvas.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}

function Globe() {
  return (
    <mesh>
      <sphereGeometry args={[1.35, 64, 64]} />
      <meshStandardMaterial
        color="#0b0b28"
        emissive="#0000fe"
        emissiveIntensity={0.25}
        metalness={0.15}
        roughness={0.75}
      />
    </mesh>
  );
}

function FlightArc() {
  // A stylized "route" arc to avoid external texture/deps.
  const points = React.useMemo(() => {
    const p: Array<[number, number, number]> = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const x = -1.8 + 3.6 * t;
      const y = 0.15 + Math.sin(Math.PI * t) * 0.9;
      const z = 1.35 + Math.cos(Math.PI * t) * 0.05;
      p.push([x * 0.45, y * 0.35, z * 0.18]);
    }
    return p;
  }, []);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(points.flat()), 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#0000fe" transparent opacity={0.65} />
    </line>
  );
}

function Plane() {
  // Minimal geometric "plane" silhouette.
  return (
    <group rotation={[0, 0.5, 0.12]} position={[0.45, 0.55, 0.35]}>
      <mesh>
        <coneGeometry args={[0.055, 0.22, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#0000fe" emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[0, -0.04, 0.03]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.16, 0.02, 0.07]} />
        <meshStandardMaterial color="#dbe4ff" />
      </mesh>
    </group>
  );
}

export function HeroScene() {
  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    setEnabled(isWebGLAvailable());
  }, []);

  if (!enabled) {
    // Graceful fallback when WebGL is unavailable (prevents console errors).
    return (
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-20 blur-2xl">
          <div className="absolute left-[-10%] top-[-10%] h-[60%] w-[60%] rounded-full bg-[color:var(--z-blue)]/30" />
          <div className="absolute right-[-10%] top-[10%] h-[55%] w-[55%] rounded-full bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0.45, 4.2], fov: 40 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.45} />
        <directionalLight position={[6, 6, 4]} intensity={1.2} />
        <pointLight position={[-6, -2, 2]} intensity={0.7} color="#0000fe" />

        <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.7}>
          <Globe />
          <FlightArc />
          <Plane />
        </Float>

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 2.2}
          maxPolarAngle={Math.PI / 2.2}
          rotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}

