"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { bonsaiNodes } from "@/lib/bonsai";
import { deckRadius } from "@/lib/rarity";
import type { Stargazer } from "@/lib/stargazers";
import { useI18n } from "@/lib/i18n";
import { WorkshopCatModel } from "./WorkshopCatModel";

export function WorkshopCat({ stars, stargazers, interactive = true, onFind }: {
  stars: number;
  stargazers: Stargazer[] | null;
  interactive?: boolean;
  onFind?: () => void;
}) {
  const { locale } = useI18n();
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const inner = useRef<THREE.Group>(null);
  const perch = useMemo(() => {
    // Slot zero is reserved for the permanent owner, even with no visitors.
    const index = Math.max(0, stargazers?.findIndex((resident) => resident.isOwner) ?? 0);
    const node = bonsaiNodes(Math.max(index + 1, Math.floor(stars)))[index];
    const angle = node.angle + 0.24;
    const position = node.tip.clone().add(new THREE.Vector3(
      Math.cos(angle) * deckRadius(index, stargazers) * 0.94,
      0.55,
      Math.sin(angle) * deckRadius(index, stargazers) * 0.94,
    ));
    return { position, rotation: Math.PI / 2 - angle };
  }, [stars, stargazers]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!interactive) setHovered(false);
    if (hovered && interactive) document.body.style.cursor = "pointer";
    return () => { if (hovered) document.body.style.cursor = "auto"; };
  }, [hovered, interactive]);
  useFrame((_, dt) => {
    if (inner.current) inner.current.scale.setScalar(THREE.MathUtils.damp(inner.current.scale.x, hovered ? 0.94 : 0.85, 8, dt));
  });
  const open = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (!interactive) return;
    setHovered(false);
    onFind?.();
  };
  return (
    <group name="owner-workshop-cat" position={perch.position} rotation={[0, perch.rotation, 0]}>
      <group ref={inner} scale={0.85} onClick={interactive ? open : undefined}
        onPointerOver={interactive ? (event) => { event.stopPropagation(); setHovered(true); } : undefined}
        onPointerOut={() => setHovered(false)}>
        <WorkshopCatModel animated={!reducedMotion} />
      </group>
      {interactive && onFind && (
        <Html position={[0, 1.12, 0]} center distanceFactor={12} zIndexRange={[18, 0]}>
          <button type="button" data-testid="workshop-entry" onClick={(event) => { event.stopPropagation(); setHovered(false); onFind(); }}
            style={{ whiteSpace: "nowrap", padding: "6px 12px", borderRadius: 20, border: "1px solid #c4ab7959", background: "#17251deb", color: "#f2e6ca", fontSize: 11, cursor: "pointer" }}>
            {locale === "zh" ? "跟小貓進工作室 ↗" : "Follow the cat ↗"}
          </button>
        </Html>
      )}
    </group>
  );
}
