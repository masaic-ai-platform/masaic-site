"use client"

import { useRef, useState, useMemo, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing"
import { Vector3, Color } from "three"
import { OrbitControls, Text, Stars } from "@react-three/drei"

// Background stars component
function StarField() {
  return <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
}

// Node component with much more subtle blinking and no stark white
function Node({ position, isActive, isPulsing, hasGlow, isBright, onHover, onLeave, size = 0.15 }) {
  const ref = useRef()
  const [hovered, setHovered] = useState(false)

  // Use refs for animation values to avoid re-renders
  const scaleRef = useRef(1)
  const colorRef = useRef(
    isActive ? new Color(isBright ? 0x8899dd : 0x6677bb) : new Color(isBright ? 0x667799 : 0x445577),
  )

  // Handle hover state
  const handlePointerOver = (e) => {
    e.stopPropagation()
    setHovered(true)
    onHover && onHover()
  }

  const handlePointerOut = (e) => {
    e.stopPropagation()
    setHovered(false)
    onLeave && onLeave()
  }

  // Animation with much more subtle effects and smooth movement
  useFrame((state) => {
    if (!ref.current) return

    // MUCH more subtle twinkling effect - reduced amplitude and slower frequency
    const twinkle = isBright
      ? 1 + Math.sin(state.clock.elapsedTime * 0.2) * 0.05
      : 1 + Math.sin(state.clock.elapsedTime * 0.1) * 0.02

    // More subtle pulsing animation
    if (isPulsing) {
      const pulse = Math.sin(state.clock.elapsedTime * 0.15) * 0.03 + 1
      scaleRef.current = pulse * twinkle
    } else {
      scaleRef.current = twinkle
    }

    // More subtle color animation with no stark white
    const baseColor = isActive ? new Color(isBright ? 0x8899dd : 0x6677bb) : new Color(isBright ? 0x667799 : 0x445577)
    const glowColor = new Color(isBright ? 0x99aadd : 0x7788cc)

    let targetColor = baseColor

    if (hovered) {
      targetColor = new Color(0x99aadd)
    } else if (hasGlow) {
      // More subtle glow effect
      targetColor = glowColor.clone().lerp(baseColor, 0.8 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2)
    }

    // Slower color transition
    colorRef.current.lerp(targetColor, 0.05)

    // Apply scale and color
    ref.current.scale.set(scaleRef.current, scaleRef.current, scaleRef.current)
    ref.current.material.color = colorRef.current
  })

  return (
    <group>
      {/* Main node sphere */}
      <mesh ref={ref} position={position} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color={colorRef.current} />
      </mesh>

      {/* Glow effect for special nodes - more subtle */}
      {hasGlow && (
        <mesh position={position}>
          <sphereGeometry args={[size * 1.8, 16, 16]} />
          <meshBasicMaterial color={new Color(isBright ? 0x99aadd : 0x7788cc)} transparent opacity={0.1} />
        </mesh>
      )}
    </group>
  )
}

// Neural/constellation connection line with animation
function Connection({
  start,
  end,
  opacity = 0.2,
  thickness = 1,
  isBranching = false,
  isForming = false,
  isDissolving = false,
}) {
  const ref = useRef()
  const pointsRef = useRef([])
  const progressRef = useRef(isForming ? 0 : 1)
  const startVec = useRef(new Vector3(...start))
  const endVec = useRef(new Vector3(...end))
  const midPointRef = useRef(null)

  // Initialize points
  useEffect(() => {
    startVec.current = new Vector3(...start)
    endVec.current = new Vector3(...end)

    if (isBranching) {
      const midPoint = new Vector3().lerpVectors(startVec.current, endVec.current, 0.5)
      // Add some random offset to midpoint for organic feel
      midPoint.x += (Math.random() - 0.5) * 0.5
      midPoint.y += (Math.random() - 0.5) * 0.5
      midPoint.z += (Math.random() - 0.5) * 0.5
      midPointRef.current = midPoint
    }

    updatePoints()
  }, [start, end, isBranching])

  // Update points based on animation progress
  const updatePoints = () => {
    if (isBranching && midPointRef.current) {
      if (isForming || isDissolving) {
        // For forming/dissolving with branching, animate from/to start point
        const progress = isDissolving ? 1 - progressRef.current : progressRef.current
        const currentEnd = new Vector3().lerpVectors(startVec.current, endVec.current, progress)
        const currentMid = new Vector3().lerpVectors(startVec.current, midPointRef.current, progress)
        pointsRef.current = [startVec.current, currentMid, currentEnd]
      } else {
        pointsRef.current = [startVec.current, midPointRef.current, endVec.current]
      }
    } else {
      if (isForming || isDissolving) {
        // For forming/dissolving without branching, animate from/to start point
        const progress = isDissolving ? 1 - progressRef.current : progressRef.current
        const currentEnd = new Vector3().lerpVectors(startVec.current, endVec.current, progress)
        pointsRef.current = [startVec.current, currentEnd]
      } else {
        pointsRef.current = [startVec.current, endVec.current]
      }
    }
  }

  useFrame((state, delta) => {
    if (!ref.current) return

    // Animate formation/dissolution
    if (isForming && progressRef.current < 1) {
      progressRef.current = Math.min(1, progressRef.current + delta * 2) // Form over 0.5 seconds
      updatePoints()
    } else if (isDissolving && progressRef.current > 0) {
      progressRef.current = Math.max(0, progressRef.current - delta * 1.5) // Dissolve over 0.67 seconds
      updatePoints()
    }

    // Update line positions
    ref.current.geometry.setFromPoints(pointsRef.current)
    ref.current.geometry.verticesNeedUpdate = true
  })

  return (
    <line ref={ref}>
      <bufferGeometry />
      <lineBasicMaterial
        color={isBranching ? 0x6688cc : 0x4466aa}
        transparent
        opacity={opacity * progressRef.current} // Fade with progress
        linewidth={thickness}
      />
    </line>
  )
}

// Tooltip component
function Tooltip({ position, text, visible }) {
  const { camera } = useThree()
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    if (visible) {
      setOpacity(1)
    } else {
      setOpacity(0)
    }
  }, [visible])

  return !visible ? null : (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <planeGeometry args={[1, 0.3]} />
        <meshBasicMaterial color={0x000000} transparent opacity={0.7} />
      </mesh>
      <Text position={[0, 0.3, 0.01]} fontSize={0.1} color="white" anchorX="center" anchorY="middle" opacity={opacity}>
        {text}
      </Text>
    </group>
  )
}

// Main scene component
function Scene() {
  // Generate constellation-like node patterns
  const generateConstellationNodes = () => {
    const constellations = [
      // Constellation 1 - Big Dipper-like
      [
        [0, 2, 0],
        [1, 1.5, 0],
        [2, 1.2, 0],
        [3, 1, 0],
        [3.5, 0, 0],
        [2.5, -0.5, 0],
        [1.5, -1, 0],
      ],
      // Constellation 2 - Orion-like
      [
        [-2, 2, 0],
        [-1.5, 1, 0],
        [-2, 0, 0],
        [-1, -1, 0],
        [-2, -2, 0],
        [-3, -1, 0],
        [-3, 1, 0],
      ],
      // Constellation 3 - Cassiopeia-like
      [
        [0, -2, 1],
        [1, -2.5, 1],
        [2, -2, 1],
        [3, -2.5, 1],
        [4, -2, 1],
      ],
    ]

    // Base nodes from constellations
    const baseNodes = []
    constellations.forEach((constellation, cIndex) => {
      constellation.forEach((pos, i) => {
        baseNodes.push({
          id: `c${cIndex}-${i}`,
          position: pos,
          isActive: true,
          isPulsing: i % 3 === 0,
          hasGlow: i % 4 === 0,
          isBright: true,
          size: 0.08 + Math.random() * 0.04, // Smaller constellation nodes
          isConstellation: true,
          constellationId: cIndex,
        })
      })
    })

    return baseNodes
  }

  // Generate initial nodes - combination of constellation patterns and random nodes
  const initialNodes = useMemo(() => {
    // Get constellation base nodes
    const baseNodes = generateConstellationNodes()

    // Add random nodes for neural network effect
    const count = 150 // More nodes for denser network
    const radius = 10
    const result = [...baseNodes]

    for (let i = 0; i < count; i++) {
      // Random position within a sphere, but flatter (more z-constrained) for constellation feel
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos((Math.random() * 2 - 1) * 0.3) // Constrain to be more planar
      const r = radius * Math.pow(Math.random(), 0.5) // More nodes toward center

      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi) * 0.3 // Flatten z-axis for constellation feel

      // More consistent, smaller size
      const sizeVariation = Math.random()
      // Much smaller nodes overall
      const size = sizeVariation > 0.98 ? 0.06 : sizeVariation > 0.9 ? 0.04 : sizeVariation > 0.7 ? 0.03 : 0.02

      // Brightness variation - fewer bright nodes
      const isBright = Math.random() > 0.9

      result.push({
        id: i + baseNodes.length,
        position: [x, y, z],
        isActive: Math.random() > 0.7,
        isPulsing: Math.random() > 0.8,
        hasGlow: Math.random() > 0.9,
        isBright,
        size,
        isConstellation: false,
      })
    }

    return result
  }, [])

  // Use refs for node positions to avoid re-renders
  const nodesRef = useRef(
    initialNodes.map((node) => ({
      ...node,
      positionRef: new Vector3(...node.position),
      velocity: new Vector3(
        (Math.random() - 0.5) * 0.001,
        (Math.random() - 0.5) * 0.001,
        (Math.random() - 0.5) * 0.001,
      ),
    })),
  )

  // State for rendering
  const [nodes, setNodes] = useState(initialNodes)
  const [hoveredNode, setHoveredNode] = useState(null)

  // Generate initial constellation connections
  const initialConstellationConnections = useMemo(() => {
    const result = []

    // Group nodes by constellation
    const constellationGroups = {}
    initialNodes.forEach((node) => {
      if (node.isConstellation) {
        if (!constellationGroups[node.constellationId]) {
          constellationGroups[node.constellationId] = []
        }
        constellationGroups[node.constellationId].push(node)
      }
    })

    // Connect constellation stars in sequence
    Object.values(constellationGroups).forEach((group) => {
      group.sort((a, b) => a.id.localeCompare(b.id))
      for (let i = 0; i < group.length - 1; i++) {
        result.push({
          id: `const-${group[i].id}-${group[i + 1].id}`,
          start: group[i].position,
          end: group[i + 1].position,
          opacity: 0.6,
          thickness: 1.2, // Slightly thinner
          isBranching: false,
          isConstellation: true,
        })
      }
    })

    return result
  }, [initialNodes])

  // State for connections with animation states
  const [connections, setConnections] = useState(
    initialConstellationConnections.map((conn) => ({
      ...conn,
      isForming: false,
      isDissolving: false,
    })),
  )

  // Reference to track time for connection updates
  const timeRef = useRef({
    lastConnectionUpdate: 0,
    lastNodeUpdate: 0,
    lastReconfigUpdate: 0,
  })

  // Slow rotation of the entire scene
  const groupRef = useRef()

  // Update logic in useFrame for smooth movement
  useFrame((state, delta) => {
    // Rotate the scene
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.01 // Slow rotation
    }

    // Smooth node movement every frame with velocity
    nodesRef.current.forEach((node) => {
      if (node.isConstellation) return // Keep constellation nodes fixed

      // Apply current velocity
      node.positionRef.add(node.velocity)

      // Occasionally change velocity direction
      if (Math.random() > 0.995) {
        node.velocity.set((Math.random() - 0.5) * 0.001, (Math.random() - 0.5) * 0.001, (Math.random() - 0.5) * 0.001)
      }

      // Boundary check - reverse direction if going too far
      const distance = node.positionRef.length()
      if (distance > 12) {
        node.velocity.multiplyScalar(-1)
      }
    })

    // Update rendered nodes position every frame for smooth movement
    setNodes(
      nodesRef.current.map((node) => ({
        ...node,
        position: [node.positionRef.x, node.positionRef.y, node.positionRef.z],
      })),
    )

    // Reconfigure some connections periodically
    if (state.clock.elapsedTime - timeRef.current.lastReconfigUpdate > 1.0) {
      timeRef.current.lastReconfigUpdate = state.clock.elapsedTime

      // Mark some non-constellation connections for dissolution
      setConnections((prev) =>
        prev.map((conn) => {
          if (conn.isConstellation) return conn
          if (Math.random() > 0.7 && !conn.isDissolving && !conn.isForming) {
            return { ...conn, isDissolving: true }
          }
          return conn
        }),
      )
    }

    // Update connections less frequently
    if (state.clock.elapsedTime - timeRef.current.lastConnectionUpdate > 0.5) {
      timeRef.current.lastConnectionUpdate = state.clock.elapsedTime

      // Create new neural connections
      const newConnections = []
      const maxDistance = 1.5

      // Process a subset of nodes each update
      const nodesToProcess = nodesRef.current.filter(() => Math.random() > 0.8)

      nodesToProcess.forEach((node) => {
        if (Math.random() > 0.8) return // Skip some nodes

        // Find nearby nodes
        const nearbyNodes = nodesRef.current.filter((other) => {
          if (other.id === node.id) return false

          const distance = node.positionRef.distanceTo(other.positionRef)
          return distance < maxDistance
        })

        // Connect to random neighbors
        const connectCount = Math.floor(Math.random() * 2) + 1
        const shuffled = nearbyNodes.sort(() => 0.5 - Math.random())

        for (let i = 0; i < Math.min(connectCount, shuffled.length); i++) {
          const neighbor = shuffled[i]
          const distance = node.positionRef.distanceTo(neighbor.positionRef)

          // Connection strength based on distance
          const strength = 1 - distance / maxDistance

          // More branching for neural look
          const isBranching = Math.random() > 0.6

          newConnections.push({
            id: `${node.id}-${neighbor.id}-${state.clock.elapsedTime.toFixed(1)}`,
            start: [node.positionRef.x, node.positionRef.y, node.positionRef.z],
            end: [neighbor.positionRef.x, neighbor.positionRef.y, neighbor.positionRef.z],
            opacity: Math.max(0.03, strength * 0.3),
            thickness: Math.random() > 0.9 ? 0.8 : 0.5, // Thinner lines
            isBranching,
            isConstellation: false,
            isForming: true, // New connections form
            isDissolving: false,
            createdAt: state.clock.elapsedTime,
          })
        }
      })

      // Update connections - keep constellation connections, age others
      setConnections((prev) => {
        // Remove fully dissolved connections
        const filteredConnections = prev.filter(
          (conn) => conn.isConstellation || !conn.isDissolving || (conn.isDissolving && conn.opacity > 0.02),
        )

        // Add new connections
        return [...filteredConnections, ...newConnections]
      })
    }
  })

  return (
    <>
      <color attach="background" args={["#000000"]} />
      {/* Background stars */}
      <StarField />
      <group ref={groupRef}>
        {/* Render connections */}
        {connections.map((conn) => (
          <Connection
            key={conn.id}
            start={conn.start}
            end={conn.end}
            opacity={conn.opacity}
            thickness={conn.thickness}
            isBranching={conn.isBranching}
            isForming={conn.isForming}
            isDissolving={conn.isDissolving}
          />
        ))}

        {/* Render nodes */}
        {nodes.map((node) => (
          <Node
            key={node.id}
            position={node.position}
            isActive={node.isActive}
            isPulsing={node.isPulsing}
            hasGlow={node.hasGlow}
            isBright={node.isBright}
            onHover={() => node.tooltip && setHoveredNode(node.id)}
            onLeave={() => setHoveredNode(null)}
            size={node.size}
          />
        ))}

        {/* Render tooltips */}
        {nodes.map(
          (node) =>
            node.tooltip && (
              <Tooltip
                key={`tooltip-${node.id}`}
                position={node.position}
                text={node.tooltip}
                visible={hoveredNode === node.id}
              />
            ),
        )}
      </group>
      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} height={300} intensity={0.7} />
        <Noise opacity={0.01} />
      </EffectComposer>
      {/* Camera controls */}
      <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.2} autoRotate autoRotateSpeed={0.1} />
    </>
  )
}

export default function NodeNetwork() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <Scene />
      </Canvas>
    </div>
  )
}
