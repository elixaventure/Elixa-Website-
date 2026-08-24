"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";

/**
 * The customer's own floor plan, rendered live into the scene — laid out on
 * the lawn in front of the house like an architect's drawing. The texture is
 * a locally-rasterised preview (object URL), never a remote fetch.
 */
export function PlanMat({ url }: { url: string }) {
  const [tex, setTex] = useState<{ texture: THREE.Texture; aspect: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.load(url, (t) => {
      if (cancelled) {
        t.dispose();
        return;
      }
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      const img = t.image as { width: number; height: number };
      setTex({ texture: t, aspect: img.width / img.height });
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => () => tex?.texture.dispose(), [tex]);

  if (!tex) return null;

  // fit within a ~3.8 x 2.8 sheet on the front lawn
  const maxW = 3.8;
  const maxH = 2.8;
  let w = maxW;
  let h = w / tex.aspect;
  if (h > maxH) {
    h = maxH;
    w = h * tex.aspect;
  }

  return (
    <group position={[-2.4, 0.015, 3.9]} rotation={[-Math.PI / 2, 0, 0.08]}>
      {/* paper */}
      <mesh>
        <planeGeometry args={[w + 0.24, h + 0.24]} />
        <meshStandardMaterial color="#ffffff" roughness={0.85} />
      </mesh>
      {/* the plan itself */}
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={tex.texture} roughness={0.8} />
      </mesh>
    </group>
  );
}
