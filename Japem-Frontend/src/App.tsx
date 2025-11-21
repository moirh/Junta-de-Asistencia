import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/layout/Header";
import Home from "./pages/Home";
import { Donativos } from "./pages/Donativos";
import { Login } from "./pages/Login";
import { PrivateRoute } from "./components/layout/PrivateRoute";

function App() {
  return (
    <Router>
      <Header />
      <div className="pt-20 min-h-screen bg-gray-50">
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<Login />} />

          {/* Rutas Privadas */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/donativos" element={<Donativos />} />
            {/* Agrega aquí más rutas que requieran login */}
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;