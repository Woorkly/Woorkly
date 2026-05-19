import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/header';
import Footer from '../components/footer';

export default function PublicLayout() {
  const { pathname } = useLocation();
  const isDashboardUser = pathname === '/dashboardUser';

  return (
    <>
      <Header isDashboardUser={isDashboardUser} />
      <Outlet />
      {!isDashboardUser && <Footer />}
    </>
  );
}