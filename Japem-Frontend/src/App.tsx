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
import  PrivateRoute  from "./components/layout/PrivateRoute";

// Componente auxiliar para el Layout
const Layout = () => {
  const location = useLocation();
  const hiddenHeaderPaths = ["/login", "/"];
  const shouldHideGlobalLayout = hiddenHeaderPaths.includes(location.pathname);

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
            <Route path="/iaps" element={<IapTable />} />
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