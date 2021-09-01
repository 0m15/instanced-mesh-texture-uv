import React, { useCallback, useEffect, useState } from 'react'
import { scalePow } from 'd3-scale'
import { Canvas } from 'react-three-fiber'
import { Color } from 'three'

import Simulation from './Simulation'
import ThreeRenderer from './Renderer'

const count = 500

const randomNodes = [...Array(count).keys()].map((d) => ({
  id: d,
  cx: Math.random() * 20 - 10,
  cy: Math.random() * 0.5 - 0.25,
  r: ((Math.random() * 300) / 300) * 0.2 + 0.001
}))

export default function Graph({ data: initialData = [], type = 'dom' }) {
  const [data, setData] = useState(() => {
    return initialData
  }, [])

  useEffect(() => {
    setData(randomNodes)
  }, [])

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }}>
      <Canvas
        gl={{ alpha: false }}
        // orthographic
        camera={{
          position: [0, 0, 15]
        }}
        onCreated={({ gl }) => {
          // gl.toneMapping = THREE.Uncharted2ToneMapping
          gl.setClearColor(new Color('black'))
        }}>
        <ambientLight />
        <Simulation data={data}>
          <ThreeRenderer count={count} />
        </Simulation>
      </Canvas>
    </div>
  )
}
