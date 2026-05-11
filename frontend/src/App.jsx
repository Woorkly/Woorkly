import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Accueil from './page/accueil'
import Salle from './page/salle'
import SalleDétail from './page/salleDétail'
import {  Routes, Route } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path="/" element={<Accueil />} />
      <Route path="/salle" element={<Salle />} />
      <Route path="/salle/:id/"element={<SalleDétail /> } /> 
    </Routes>
  )
}

export default App
