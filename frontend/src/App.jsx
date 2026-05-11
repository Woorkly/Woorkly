import { useState } from 'react'
import Accueil from './page/accueil'
import Salle from './page/salle'
import SalleDétail from './page/salleDétail'
import {  Routes, Route } from 'react-router-dom'
import FormReservation from './page/FormReservation/index'
import Header from './components/header'
import Footer from './components/footer'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>    
    <Header/>
    <Routes>
      <Route path="/" element={<Accueil />} />
      <Route path="/salle" element={<Salle />} />
      <Route path="/salle/:ANZIZ/"element={<SalleDétail /> } />
      <Route path="/reservation" element={<FormReservation /> } />
    </Routes>
    <Footer />
    </>

  )
}

export default App
