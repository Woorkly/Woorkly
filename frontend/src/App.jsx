import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import Landing from './page/Landing/index';
import Login from './page/Login/index';
import Register from './page/Register/index';
import Salle from './page/Salle';
import SalleDetail from './page/SalleDetail/SalleDetail';
import FormReservation from './page/FormReservation/index';
import DashboardUser from './page/Dashboard/DashboardUser/DashboardUser';
import DashboardAdmin from './page/Dashboard/DashBoardAdmin/DashboardAdmin';
import Gestionsalles from './page/Dashboard/DashBoardAdmin/Gestionsalles';
import GestionReservations from './page/Dashboard/DashBoardAdmin/GestionReservations';
import GestionUser from './page/Dashboard/DashBoardAdmin/Gestion_user';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './page/NotFound';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/salle" element={<Salle />} />
          <Route path="/salle/:id" element={<SalleDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route element={<ProtectedRoute allowRoles={['user', 'admin']} />}>
          <Route element={<PublicLayout />}>
            <Route path="/reservation" element={<FormReservation />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowRoles={['user']} />}>
          <Route element={<PublicLayout />}>
            <Route path="/dashboardUser" element={<DashboardUser />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowRoles={['admin']} redirectTo="/login" />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboardAdmin" element={<DashboardAdmin />} />
            <Route path="/Gestionsalles" element={<Gestionsalles />} />
            <Route path="/GestionReservations" element={<GestionReservations />} />
            <Route path="/GestionUser" element={<GestionUser />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
