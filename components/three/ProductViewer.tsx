"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Lightformer,
  ContactShadows,
  Center,
  Html,
  useGLTF,
} from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { ExplodeCtx, ProductModel } from "./models";
import type { IconKey } from "@/content/services";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
  } catch {
    return false;
  }
}

/** Drop-in seam: a real photoreal GLB is used the moment one is supplied. */
function GLBModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function Rig({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<OrbitControlsImpl>(null);
  return (
    <OrbitControls
      ref={ref}
      makeDefault
      enablePan={false}
      autoRotate={!reducedMotion}
      autoRotateSpeed={0.9}
      minDistance={3.2}
      maxDistance={9}
      minPolarAngle={Math.PI * 0.18}
      maxPolarAngle={Math.PI * 0.62}
      // stop the idle spin the moment the visitor takes control
      onStart={() => {
        if (ref.current) ref.current.autoRotate = false;
      }}
    />
  );
}

export function ProductViewer({
  icon,
  glbUrl,
  exploded,
}: {
  icon: IconKey;
  /** Optional real model, e.g. `${BASE}/models/battery-storage.glb`. */
  glbUrl?: string;
  exploded: boolean;
}) {
  const [ok, setOk] = useState<boolean | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setOk(hasWebGL());
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  if (ok === false) {
    return (
      <div className="grid h-full w-full place-items-center rounded-4xl bg-elixa-gradient-soft">
        <p className="px-6 text-center text-sm font-medium text-navy/60">
          Interactive 3D preview unavailable on this device.
        </p>
      </div>
    );
  }

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [3.0, 1.4, 4.5], fov: 42 }}
      className="!touch-none"
    >
      <Suspense
        fallback={
          <Html center>
            <span className="text-sm font-medium text-navy/50">Loading…</span>
          </Html>
        }
      >
        <ExplodeCtx.Provider value={{ on: exploded }}>
          <Center>
            {glbUrl ? <GLBModel url={glbUrl} /> : <ProductModel icon={icon} />}
          </Center>
        </ExplodeCtx.Provider>

        {/* soft studio environment — generated in-engine, no external HDR fetch */}
        <Environment resolution={256}>
          <Lightformer intensity={2.4} position={[0, 4, -3]} scale={[12, 5, 1]} color="#ffffff" />
          <Lightformer intensity={1.1} position={[-5, 2, 2]} scale={[6, 6, 1]} color="#cfe3ff" />
          <Lightformer intensity={0.9} position={[5, 1, 3]} scale={[6, 6, 1]} color="#e6ffe0" />
        </Environment>

        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 6, 5]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} />

        <ContactShadows position={[0, -1.7, 0]} opacity={0.35} scale={12} blur={2.6} far={5} />
      </Suspense>

      <Rig reducedMotion={reduced} />
    </Canvas>
  );
}
