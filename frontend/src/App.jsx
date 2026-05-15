import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import Landing from './page/Landing/index';
import Login from './page/Login/index';
import Register from './page/Register/index';
import Salle from './page/salle';
import SalleDétail from './page/salleDétail';
import FormReservation from './page/FormReservation/index';
import DashboardUser from './page/Dashboard/dashboardUser';
import DashboardAdmin from './page/Dashboard/DashBoardAdmin/dashboardAdmin';
import Gestionsalles from './page/Dashboard/Gestionsalles';
import GestionReservations from './page/Dashboard/gestionReservations';
import GestionUser from './page/Dashboard/Gestion_user';

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/salle" element={<Salle />} />
        <Route path="/salle/:ANZIZ" element={<SalleDétail />} />
        <Route path="/reservation" element={<FormReservation />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboardUser" element={<DashboardUser />} />
      </Route>

      <Route element={<AdminLayout />}>
        <Route path="/dashboardAdmin" element={<DashboardAdmin />} />
        <Route path="/Gestionsalles" element={<Gestionsalles />} />
        <Route path="/GestionReservations" element={<GestionReservations />} />
        <Route path="/GestionUser" element={<GestionUser />} />
      </Route>
    </Routes>
  );
}

export default App;