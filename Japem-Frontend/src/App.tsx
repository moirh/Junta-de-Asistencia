import { useState, useEffect } from "react"; // <--- 1. Importar Hooks
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
import { IapTable } from "./pages/Iap/IapTable";
import PrivateRoute from "./components/layout/PrivateRoute";

// Componente auxiliar para el Layout
const Layout = () => {
  const location = useLocation();
  const hiddenHeaderPaths = ["/login", "/"];
  const shouldHideGlobalLayout = hiddenHeaderPaths.includes(location.pathname);

  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const userStored = localStorage.getItem('user');
    if (userStored) {
      try {
        const userObj = JSON.parse(userStored);
        // Si existe el rol, lo usamos, si no, default 'lector'
        setUserRole(userObj.role || 'lector');
      } catch (error) {
        console.error("Error leyendo usuario en App.tsx", error);
      }
    }
  }, []);

  return (
    <>
      {!shouldHideGlobalLayout && <Header />}
      
      <div className={`${shouldHideGlobalLayout ? "" : "pt-10"} min-h-screen bg-gray-100`}>
        <Routes>
          {/* RUTA PÚBLICA */}
          <Route path="/login" element={<Login />} />

          {/* RUTAS PRIVADAS (Protegidas por PrivateRoute) */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/donativos" element={<Donativos />} />
            
            {/* 4. AQUÍ PASAMOS EL ROL A LA TABLA IAP */}
            <Route path="/iaps" element={<IapTable userRole={userRole} />} />
            
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