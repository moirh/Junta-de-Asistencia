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

  // Definimos las rutas que tienen su propio diseño de Header o no lo necesitan
  // "/login": No lleva header.
  // "/": La Home ahora tiene su propio header integrado para el efecto transparente.
  const hiddenHeaderPaths = ["/login", "/"];
  
  const shouldHideGlobalLayout = hiddenHeaderPaths.includes(location.pathname);

  return (
    <>
      {/* Solo mostramos el Header global si NO estamos en Login ni en Home */}
      {!shouldHideGlobalLayout && <Header />}

      {/* Si estamos en Login o Home, quitamos el padding superior (pt-20) 
         para que el contenido o el slider lleguen hasta arriba.
      */}
      <div className={`${shouldHideGlobalLayout ? "" : "pt-20"} min-h-screen bg-gray-100`}>
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