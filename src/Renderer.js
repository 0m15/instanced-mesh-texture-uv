import React, { useEffect, useRef, useMemo, useState } from 'react'
import { useFrame, useThree } from 'react-three-fiber'
import * as THREE from 'three'
import { AdditiveBlending, BoxBufferGeometry, CircleBufferGeometry, Object3D, PlaneBufferGeometry } from 'three'
import lerp from 'lerp'
import image from './art3.jpg'

const Shader = {
  uniforms: {
    texture1: {},
    textureDivision: { value: new THREE.Vector2(20, 20) },
    time: { value: 0 }
  },
  vertexShader: `
    precision highp float;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform float time;
    uniform vec2 textureDivision;

    attribute vec3 position;
    attribute vec4 translate;
    attribute vec2 uv;
    attribute vec2 instanceUv;

    varying vec2 vUv;
    varying float vScale;

    void main() {
        float scale = translate.w;
        vec4 mvPosition = modelViewMatrix * vec4( translate.xyz, 1.0 );
        vScale = scale*2.0;
        mvPosition.xyz += position*scale*2.0;

        vec2 slices = vec2(1.0) / textureDivision;
        vUv = slices * instanceUv + slices * uv;
        //  vUv = instanceUv;
        
        gl_Position = projectionMatrix * mvPosition;
        // vUv = 0.5+(projectionMatrix * vec4((position)+translate.xyz, 1.0)).xy*0.5;

    }
  `,
  fragmentShader: `
    precision highp float;
    uniform sampler2D texture1;
    varying vec2 vUv;
    void main() {
        vec2 uv = vUv;
        // uv.y = 1.0-uv.y;
        vec3 col = texture2D(texture1, uv).rgb;
        // [0...1] -> 0 | 1
        float d = abs(step(0.5, uv.x));
        vec3 bw = vec3(abs(d - col.r));
        gl_FragColor = vec4(bw, 0.9);
        //gl_FragColor = vec4(1.0, 0.0,0.0, 1.0);
    }
  `,
  depthTest: true,
  depthWrite: true,
  transparent: true,
  blendMode: AdditiveBlending
}

export default function ThreeRenderer({ nodes, count, onClickCanvas, onClickNode, simulation, width, height }) {
  // Interaction
  const [selectedNode, setSelectedNode] = useState(undefined)
  const previous = useRef()
  const active = useRef({})
  const { camera, viewport } = useThree()
  useEffect(() => {
    previous.current = selectedNode
  }, [selectedNode])

  // Canvas click handler
  useEffect(() => {
    const onclick = (evt) => {
      if (active.current.id !== undefined) {
        const node = nodes.find((d) => d.id === active.current.id)
        console.log({ active: node })
        onClickNode(node)(evt)
        return
      }
      onClickCanvas(evt)
    }
    const onmousemove = (evt) => {
      const { x, y } = evt
      let mx = (-0.5 + x / window.innerWidth) * 2.0 * viewport.width
      let my = (-0.5 + y / window.innerHeight) * 2.0 * viewport.height
      let dx = 0
      let dy = 0
      let node
      for (let i = 0; i < nodes.length; i++) {
        node = nodes[i]
        dx = node.x + node.r - mx
        dy = node.y + node.r - my
        let dist = Math.sqrt(dy * dy + dx * dx)
        dist = Math.abs(Math.min(30, dist) / 30)
        node.scale = 1 + (1 - dist)
        // if (dist < node.r) {
        //   node.r = dist
        // } else {
        //   node.r = 2
        //   if (node.id === active.current.id) {
        //     active.current = {}
        //   }
        // }
      }
    }

    document.addEventListener('click', onclick)
    document.addEventListener('mousemove', onmousemove)
    return () => {
      document.removeEventListener('click', onclick)
      document.removeEventListener('mousemove', onmousemove)
    }
  }, [onClickCanvas, selectedNode, nodes, onClickNode, viewport.width, viewport.height])

  // Instantiate objects
  const geometry = useMemo(() => {
    return new PlaneBufferGeometry(4, 4)
  }, [])

  const texture = useMemo(() => {
    return new THREE.TextureLoader().load(image)
  }, [])

  const [translateArray, uvArray] = useMemo(() => {
    return [new Float32Array(count * 4), new Float32Array(count * 2)]
  }, [])

  // Instantiate geometry attributes
  useMemo(() => {
    for (let i = 0, i3 = 0, l = count; i < l; i++, i3 += 4) {
      if (nodes[i] && nodes[i].x) {
        translateArray[i3 + 0] = nodes[i].x
        translateArray[i3 + 1] = nodes[i].y
        translateArray[i3 + 2] = Math.random() * -4 + 2
        translateArray[i3 + 3] = 0
      }
    }

    for (let i = 0, i2 = 0, l = count; i < l; i++, i2 += 2) {
      if (nodes[i] && nodes[i].x) {
        uvArray[i2 + 0] = nodes[i].x % 10
        uvArray[i2 + 1] = nodes[i].y % 10
      }
    }

    geometry.setAttribute('translate', new THREE.InstancedBufferAttribute(translateArray, 4))
    geometry.setAttribute('instanceUv', new THREE.InstancedBufferAttribute(uvArray, 2))
  }, [geometry, nodes, translateArray, count, uvArray])

  const animations = useRef({})
  const ref = useRef()

  useFrame((state, delta) => {
    for (var i = 0, i3 = 0, l = count; i < l; i++, i3 += 4) {
      const node = nodes[i]

      if (!node || isNaN(node.x)) {
        break
      }

      if (!animations.current[node.id]) {
        animations.current[node.id] = {
          x: node.cx,
          y: node.cy,
          scale: node.scale
        }
      }

      const anim = animations.current[node.id]
      anim.x = lerp(anim.x, node.x, 0.05)
      anim.y = lerp(anim.y, node.y, 0.05)
      anim.scale = lerp(anim.scale || 0, node.scale || 1, 0.05)

      // update geometry attributes
      translateArray[i3 + 0] = anim.x
      translateArray[i3 + 1] = -anim.y
      translateArray[i3 + 3] = node.r * anim.scale

      // dummy.position.set(node.x, node.y, 0)
      // ref.current.setMatrixAt(i, dummy.matrix)
    }

    for (let i = 0, i2 = 0, l = count; i < l; i++, i2 += 2) {
      if (nodes[i] && nodes[i].x) {
        uvArray[i2 + 0] = ((4 + nodes[i].x * 0.5) % 20) * 2.0
        uvArray[i2 + 1] = ((4 + -nodes[i].y * 0.5) % 20) * 2.0
      }
    }

    geometry.getAttribute('translate').needsUpdate = true
    geometry.getAttribute('instanceUv').needsUpdate = true

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.mouse.x * 15, 0.05)
    // state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, -state.mouse.y * window.innerWidth * 0.1, 0.05)
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, null, count]}
      onPointerMove={(e) => {
        setSelectedNode(e.instanceId)
      }}
      onPointerOut={(e) => setSelectedNode(undefined)}>
      <rawShaderMaterial attach="material" args={[Shader]} uniforms-texture1-value={texture} />
    </instancedMesh>
  )
}
