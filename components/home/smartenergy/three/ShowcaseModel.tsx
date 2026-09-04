"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/**
 * A pre-built showcase GLB of the property (e.g. a photorealistic furnished
 * model produced outside the engine), auto-centred and fitted to the scene.
 * This is presentation-only — the normalized property model remains the
 * source of truth for anything the engine needs to reason about.
 */
export function ShowcaseModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  const prepared = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    // some image-to-3D exports arrive Z-up; if the model is dramatically
    // taller than its footprint, lay it down
    if (size.y > Math.max(size.x, size.z) * 1.6) {
      root.rotation.x = -Math.PI / 2;
      root.updateMatrixWorld(true);
      box.setFromObject(root);
      box.getSize(size);
      box.getCenter(centre);
    }
    const fit = 9 / Math.max(size.x, size.z, 0.001);
    const group = new THREE.Group();
    group.add(root);
    root.position.set(-centre.x, -box.min.y, -centre.z);
    group.scale.setScalar(fit);
    return group;
  }, [scene]);

  return <primitive object={prepared} position={[0, 0.06, 0]} />;
}
