import { Navigate, Outlet } from 'react-router-dom';

export const PrivateRoute = () => {
  const token = localStorage.getItem('token');
  // Si hay token mostramos la ruta protegida (Outlet), si no redirigimos a login
  return token ? <Outlet /> : <Navigate to="/login" />;
};