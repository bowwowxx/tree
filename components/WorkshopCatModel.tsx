"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** A small handmade cream cat; shared by the owner's porch and the studio. */
export function WorkshopCatModel({ animated = true }: { animated?: boolean }) {
  const body = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!animated) return;
    const time = clock.elapsedTime;
    if (body.current) body.current.scale.y = 1 + Math.sin(time * 1.7) * 0.018;
    if (tail.current) tail.current.rotation.z = Math.sin(time * 1.15) * 0.08;
  });
  return (
    <group>
      <group ref={body}>
        <mesh position={[0, 0.29, 0]} scale={[0.28, 0.31, 0.3]} castShadow>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color="#eee0c9" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.36, 0.22]} scale={[0.19, 0.2, 0.12]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color="#fff6e7" roughness={1} />
        </mesh>
        <group position={[0, 0.62, 0.1]}>
          <mesh scale={[0.29, 0.25, 0.25]} castShadow>
            <sphereGeometry args={[1, 16, 12]} />
            <meshStandardMaterial color="#eee0c9" roughness={0.95} />
          </mesh>
          {[-1, 1].map((side) => (
            <group key={side}>
              <mesh position={[side * 0.2, 0.22, 0]} rotation={[0, 0, -side * 0.22]} castShadow>
                <coneGeometry args={[0.14, 0.27, 3]} />
                <meshStandardMaterial color="#dfc5a0" roughness={0.9} />
              </mesh>
              <mesh position={[side * 0.2, 0.23, 0.075]} rotation={[0, 0, -side * 0.22]}>
                <coneGeometry args={[0.07, 0.17, 3]} />
                <meshStandardMaterial color="#d9a5a1" roughness={1} />
              </mesh>
              <mesh position={[side * 0.12, 0.035, 0.235]} rotation={[0, 0, side * 0.08]}>
                <capsuleGeometry args={[0.017, 0.045, 4, 8]} />
                <meshStandardMaterial color="#344037" roughness={0.7} />
              </mesh>
              <mesh position={[side * 0.19, -0.035, 0.225]} scale={[0.055, 0.027, 0.014]}>
                <sphereGeometry args={[1, 8, 6]} />
                <meshStandardMaterial color="#dcaca0" roughness={1} />
              </mesh>
              {[0, 1].map((line) => (
                <mesh key={line} position={[side * 0.28, -0.035 - line * 0.04, 0.22]} rotation={[0, 0, side * (1.3 + line * 0.2)]}>
                  <cylinderGeometry args={[0.004, 0.004, 0.19, 4]} />
                  <meshStandardMaterial color="#9e886f" />
                </mesh>
              ))}
            </group>
          ))}
          <mesh position={[0, -0.03, 0.26]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.034, 0.035, 3]} />
            <meshStandardMaterial color="#ba827f" />
          </mesh>
        </group>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.15, 0.055, 0.23]} scale={[0.11, 0.07, 0.15]} castShadow>
            <sphereGeometry args={[1, 12, 8]} />
            <meshStandardMaterial color="#fff2df" roughness={0.9} />
          </mesh>
        ))}
        <mesh position={[0, 0.44, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.19, 0.026, 6, 18]} />
          <meshStandardMaterial color="#6b957b" />
        </mesh>
        <mesh position={[0, 0.43, 0.255]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#deb768" metalness={0.5} roughness={0.4} />
        </mesh>
      </group>
      <group ref={tail} position={[0.19, 0.14, -0.09]}>
        <mesh rotation={[Math.PI / 2, 0, 0.25]}>
          <torusGeometry args={[0.26, 0.06, 8, 18, Math.PI * 1.5]} />
          <meshStandardMaterial color="#dfc5a0" roughness={0.95} />
        </mesh>
      </group>
    </group>
  );
}
