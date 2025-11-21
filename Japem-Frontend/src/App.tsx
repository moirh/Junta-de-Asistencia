import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Header } from "./components/layout/Header";
import Home from "./pages/Home";
import { Donativos } from "./pages/Donativos";
import { Login } from "./pages/Login";
import { PrivateRoute } from "./components/layout/PrivateRoute";

// Componente auxiliar para controlar qué se muestra según la ruta
const Layout = () => {
  const location = useLocation();
  
  // Verificamos si la ruta actual es "/login"
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      {/* Si NO es la página de login, mostramos el Header */}
      {!isLoginPage && <Header />}

      {/* Si NO es login, agregamos padding superior (pt-20) para no tapar contenido.
         Si ES login, quitamos el padding para que quede centrado perfecto.
      */}
      <div className={`${isLoginPage ? '' : 'pt-20'} min-h-screen bg-gray-50`}>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas Privadas */}
          <Route element={<PrivateRoute />}>
            <Route path="/donativos" element={<Donativos />} />
            {/* Agrega aquí más rutas protegidas si es necesario */}
          </Route>
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;