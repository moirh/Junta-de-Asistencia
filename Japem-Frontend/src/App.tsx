import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Header } from "./components/layout/Header";
import Home from "./pages/Home";
import { Donativos } from "./pages/Donativos";
import { Login } from "./pages/Login";
import { PrivateRoute } from "./components/layout/PrivateRoute";

// Componente auxiliar para controlar qué se muestra según la ruta
const Layout = () => {
  const location = useLocation();

  // Verificamos si la ruta actual es "/login"
  const isLoginPage = location.pathname === "/login";

  return (
    <>
      {/* Si NO es la página de login, mostramos el Header */}
      {!isLoginPage && <Header />}

      {/* Cambiamos bg-gray-50 a bg-gray-100 para coincidir con el Login.
         Mantenemos la lógica del padding superior.
      */}
      <div className={`${isLoginPage ? "" : "pt-20"} min-h-screen bg-gray-100`}>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<Login />} />

          {/* Rutas Privadas */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
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