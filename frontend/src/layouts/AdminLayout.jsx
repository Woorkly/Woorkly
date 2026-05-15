import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import '../page/Dashboard/DashBoardAdmin/adminStyle.css';

export default function AdminLayout() {
  return (
    <div className="admin-wrap">
      <AdminSidebar />
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}