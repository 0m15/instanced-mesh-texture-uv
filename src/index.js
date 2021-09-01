import React from 'react'
import ReactDOM from 'react-dom'
import Graph from './Graph'
import './styles.css'
import Ui from './Ui'

function App() {
  return (
    <div className="canvas">
      <Ui />
      <Graph />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
