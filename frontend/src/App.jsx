import Landing from './page/Landing/index'
import Login from './page/Login/index'
import Register from './page/Register/index'
import Salle from './page/salle'
import SalleDetail from './page/salleDetail'
import { Routes, Route } from 'react-router-dom'
import FormReservation from './page/FormReservation/index'
import Header from './components/header'
import Footer from './components/footer'

function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/salle" element={<Salle />} />
        <Route path="/salle/:id" element={<SalleDetail />} />
        <Route path="/reservation" element={<FormReservation />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>

      <Footer />
    </>
  )
}

export default App