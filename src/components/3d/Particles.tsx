"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function Particles({ count = 800 }) {
  const meshRef = useRef<THREE.Points>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const radius = 4 + Math.random() * 3
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = radius * Math.cos(phi)
      const c = new THREE.Color().setHSL(0.72 + Math.random() * 0.15, 0.8, 0.5 + Math.random() * 0.3)
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }

    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3))
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3))
    geo.computeBoundingSphere()

    return geo
  }, [count])

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const positions = geometry.attributes.position.array as Float32Array
      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        const radius = 4 + ((i % 8) * 0.3)
        const speed = 0.03 + (i % 3) * 0.005
        const theta = Math.atan2(positions[i3 + 1], positions[i3]) + speed * 0.003
        const phiVal = Math.max(-1, Math.min(1, positions[i3 + 2] / radius))
        const phi = Math.acos(phiVal) + speed * 0.001
        const sinPhi = Math.sin(phi)
        positions[i3] = radius * sinPhi * Math.cos(theta)
        positions[i3 + 1] = radius * sinPhi * Math.sin(theta)
        positions[i3 + 2] = radius * Math.cos(phi)
      }
      geometry.attributes.position.needsUpdate = true
      geometry.computeBoundingSphere()
    }
  })

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        size={0.025}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
