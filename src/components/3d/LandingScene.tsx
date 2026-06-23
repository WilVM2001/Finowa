"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment, Float } from "@react-three/drei"
import { FloatingSphere } from "./FloatingSphere"
import { Particles } from "./Particles"
import { EffectComposer, Bloom } from "@react-three/postprocessing"

function SceneContent() {
  return (
    <>
      <color attach="background" args={["#000"]} />
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <FloatingSphere />
      </Float>
      <Particles count={800} />
      <Environment preset="city" />
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={0.3}
          mipmapBlur
        />
      </EffectComposer>
    </>
  )
}

export function LandingScene() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  )
}
