"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Sphere, MeshDistortMaterial } from "@react-three/drei"
import * as THREE from "three"

export function FloatingSphere() {
  const meshRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame(({ clock, pointer }) => {
    if (meshRef.current) {
      meshRef.current.position.x = Math.sin(clock.elapsedTime * 0.2) * 0.3 + pointer.x * 0.1
      meshRef.current.position.y = Math.sin(clock.elapsedTime * 0.3) * 0.2 + pointer.y * 0.1
      meshRef.current.rotation.x = clock.elapsedTime * 0.05
      meshRef.current.rotation.y = clock.elapsedTime * 0.08
    }
    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(clock.elapsedTime * 0.5) * 2
      lightRef.current.position.y = Math.cos(clock.elapsedTime * 0.4) * 2
    }
  })

  const gradientMap = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 2
    canvas.height = 256
    const ctx = canvas.getContext("2d")!
    const gradient = ctx.createLinearGradient(0, 0, 0, 256)
    gradient.addColorStop(0, "#6366f1")
    gradient.addColorStop(0.5, "#8b5cf6")
    gradient.addColorStop(1, "#a855f7")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 2, 256)
    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }, [])

  return (
    <>
      <pointLight ref={lightRef} position={[0, 0, 3]} intensity={2} color="#8b5cf6" />
      <Sphere ref={meshRef} args={[1.2, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#6366f1"
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          emissive="#4f46e5"
          emissiveIntensity={0.2}
          envMapIntensity={1.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </Sphere>
    </>
  )
}
