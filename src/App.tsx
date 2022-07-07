import { useState } from 'react'
import logo from './logo.svg'
import './App.css'
import PixelPainter from "./components/PixelPainter"

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <PixelPainter/>
    </div>
  )
}

export default App
