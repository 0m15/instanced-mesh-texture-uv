import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react'

export default function Simulation({ data, children }) {
  const [nodesA, setNodes] = useState(() => [], [])
  const [nodesB, setNodesB] = useState(() => [], [])
  const [strength, setStrength] = useState(false)

  const worker = useMemo(() => {
    const worker = new Worker('/worker.js')

    worker.onmessage = (e) => {
      setNodes(e.data.nodes)
    }
    return worker
  }, [])

  const workerB = useMemo(() => {
    const worker = new Worker('/worker.js')

    worker.onmessage = (e) => {
      setNodesB(e.data.nodes)
    }
    return worker
  }, [])

  const onClickCanvas = useCallback(
    (evt) => {
      setStrength(!strength)
    },
    [strength]
  )

  // update simulation on data change
  useEffect(() => {
    if (worker && data) worker.postMessage({ nodes: data, collideStrength: 0.3 })
    if (workerB && data) workerB.postMessage({ nodes: data, collideStrength: 0.01 })
  }, [data, worker, workerB])

  const child = React.Children.only(children)

  return React.cloneElement(child, {
    onClickCanvas,
    nodes: strength ? nodesB : nodesA
  })
}
