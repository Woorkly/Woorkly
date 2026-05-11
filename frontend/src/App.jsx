import Landing from './page/Landing/index'
import Salle from './page/salle'
import SalleDétail from './page/salleDétail'
import {  Routes, Route } from 'react-router-dom'
import FormReservation from './page/FormReservation/index'
import Header from './components/header'
import Footer from './components/footer'

function App() {
  

  return (
    <>    
    <Header/>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/salle" element={<Salle />} />
      <Route path="/salle/:ANZIZ/"element={<SalleDétail /> } />
      <Route path="/reservation" element={<FormReservation /> } />
    </Routes>
    <Footer />
    </>

  )
}

export default App
