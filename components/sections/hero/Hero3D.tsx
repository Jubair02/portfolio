"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef, type ReactNode } from "react";
import type { Group } from "three";

/** Slowly rotates the scene and eases the camera toward the pointer. */
function Rig({ children }: { children: ReactNode }) {
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.08;
      group.current.rotation.x += delta * 0.02;
    }
    const { pointer, camera } = state;
    camera.position.x += (pointer.x * 1.3 - camera.position.x) * 0.03;
    camera.position.y += (pointer.y * 0.9 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });

  return <group ref={group}>{children}</group>;
}

export default function Hero3D({ active = true }: { active?: boolean }) {
  return (
    <Canvas
      // Stop rendering entirely when the hero is scrolled out of view — no
      // draw calls or rAF ticks while the user is elsewhere on the page.
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 5, 3]} intensity={1.6} />
      <directionalLight position={[-5, -2, -2]} intensity={0.8} color="#8b7dff" />

      <Rig>
        {/* Central wireframe sphere */}
        <Float speed={1.4} rotationIntensity={0.6} floatIntensity={0.8}>
          <mesh>
            <icosahedronGeometry args={[1.75, 4]} />
            <meshStandardMaterial
              color="#8b7dff"
              wireframe
              transparent
              opacity={0.55}
            />
          </mesh>
        </Float>

        {/* Floating solids */}
        <Float speed={2.2} rotationIntensity={1.2} floatIntensity={1.6}>
          <mesh position={[2.7, 1.1, -1]}>
            <octahedronGeometry args={[0.55, 0]} />
            <meshStandardMaterial
              color="#22d3ee"
              roughness={0.15}
              metalness={0.6}
            />
          </mesh>
        </Float>

        <Float speed={1.8} rotationIntensity={1} floatIntensity={1.3}>
          <mesh position={[-2.8, -1.3, -0.5]}>
            <dodecahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial
              color="#e879f9"
              roughness={0.2}
              metalness={0.5}
            />
          </mesh>
        </Float>

        <Float speed={2.6} rotationIntensity={1.4} floatIntensity={1.8}>
          <mesh position={[2.2, -1.6, 0.6]}>
            <torusGeometry args={[0.34, 0.14, 16, 48]} />
            <meshStandardMaterial
              color="#6d5efc"
              roughness={0.25}
              metalness={0.55}
            />
          </mesh>
        </Float>
      </Rig>
    </Canvas>
  );
}
