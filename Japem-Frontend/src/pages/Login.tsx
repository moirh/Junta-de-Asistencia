import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/api/login', {
        email,
        password
      });

      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
      
      navigate('/donativos'); // Ajustado para ir a donativos tras el login
      
    } catch (err) {
      console.error(err);
      setError('Credenciales inválidas o error de conexión');
    }
  };

  return (
    // CONTENEDOR PRINCIPAL DE LA PÁGINA
    // Usamos flex-col para poner el logo ARRIBA de la tarjeta
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      
      {/* 1. LOGO Y TÍTULO (FUERA DE LA TARJETA) */}
      <div className="flex flex-col items-center text-center mb-8">
        <img 
            src="/Logo.png" 
            alt="Junta de Asistencia Privada" 
            className="h-18 w-auto object-contain mb-4 drop-shadow-sm" 
        />
        <h1 className="text-3xl font-black text-gray-800 uppercase tracking-wider">
            Junta de Asistencia Privada del Estado de México
        </h1>
        <p className="text-lg text-gray-600 font-medium mt-1 italic font-serif">
            Juntos hacemos la diferencia
        </p>
      </div>

      {/* 2. TARJETA BLANCA (SOLO FORMULARIO) */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center text-gray-700">
          Bienvenido
        </h2>
        
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
              placeholder="ejemplo@japem.gob.mx"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 text-black font-semibold bg-green-700 rounded-lg hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-md transition-colors"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>

      {/* Pie de página opcional */}
      <p className="mt-8 text-xs text-gray-400">
        © 2025 JAPEM. Todos los derechos reservados.
      </p>
    </div>
  );
};