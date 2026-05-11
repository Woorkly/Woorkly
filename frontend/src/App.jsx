import './App.css'
import Landing from './page/Landing/index'
import Salle from './page/salle'
import SalleDétail from './page/salleDétail'
import {  Routes, Route } from 'react-router-dom'

function App() {
  

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/salle" element={<Salle />} />
      <Route path="/salle/:ANZIZ/"element={<SalleDétail /> } /> 
    </Routes>
  )
}

export default App
