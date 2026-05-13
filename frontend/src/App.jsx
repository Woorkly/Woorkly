import Landing from './page/Landing/index'
import Login from './page/Login/index'
import Register from './page/Register/index'
import Salle from './page/salle'
import SalleDétail from './page/salleDétail'
import {  Routes, Route } from 'react-router-dom'
import FormReservation from './page/FormReservation/index'
import Header from './components/header'
import Footer from './components/footer'
import DashboardUser from './page/Dashboard/dashboardUser'

function App() {
  

  return (
    <>    
    <Header/>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/salle" element={<Salle />} />
      <Route path="/salle/:ANZIZ/"element={<SalleDétail /> } />
      <Route path="/reservation" element={<FormReservation /> } />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboarduser" element={<DashboardUser />} />
      <Route path="/dashboardAdmin" element={<DashBoardAdmin />} />
    </Routes>
    <Footer />
    </>

  )
}

export default App
