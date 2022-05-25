import { useState } from 'react'
import logo from './logo.svg'
import './App.css'
import Schedule from "./components/Schedule"

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <Schedule/>
    </div>
  )
}

export default App
