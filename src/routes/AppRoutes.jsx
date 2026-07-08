// src/routes/AppRoutes.jsx
import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Importación de Pantallas y Componentes
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen'; 
import DashboardScreen from '../screens/DashboardScreen';
import GestionComplejo from '../screens/GestionComplejo';
import ReservarTurnoScreen from '../screens/ReservarTurnoScreen';
import ClasesScreen from '../screens/ClasesScreen'; 
import CrearClaseScreen from '../screens/CrearClaseScreen';
import TorneosScreen from '../screens/TorneosScreen';
import BuscadorClubesScreen from '../screens/BuscadorClubesScreen'; 
import TiendaScreen from '../screens/TiendaScreen'; 
import MisReservasScreen from '../screens/MisReservasScreen';
import PerfilScreen from '../screens/PerfilScreen';
import Layout from '../components/Layout'; 
import RankingScreen from "../screens/RankingScreen";
import CrearTorneoScreen from "../screens/CrearTorneoScreen";
import TorneoDetalleScreen from '../screens/TorneoDetalleScreen'; 
import PerfilPublicoScreen from '../screens/PerfilPublicoScreen';


const RutaPrivada = ({ children }) => {
  const { usuario, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ backgroundColor: '#0a0a0a', color: '#fff', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        Cargando ADN Pádel...
      </div>
    );
  }
  return usuario ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { usuario } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>
        {/* 🔓 RUTAS PÚBLICAS */}
        <Route 
          path="/login" 
          element={!usuario ? <LoginScreen /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/register" 
          element={!usuario ? <RegisterScreen /> : <Navigate to="/dashboard" />} 
        />

        {/* 🔒 RUTAS PRIVADAS */}
       <Route element={
          <RutaPrivada>
            <Layout />
          </RutaPrivada>
        }>
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/gestion-complejo" element={<GestionComplejo />} />
          <Route path="/mis-reservas" element={<MisReservasScreen />} />
          <Route path="/turnos" element={<BuscadorClubesScreen />} />
          <Route path="/reservar/:id" element={<ReservarTurnoScreen />} />
          <Route path="/tienda" element={<TiendaScreen />} />
          <Route path="/tienda/:id" element={<TiendaScreen />} />
          <Route path="/torneos" element={<TorneosScreen />} />
          <Route path="/clases" element={<ClasesScreen />} />
          <Route path="/crear-clase" element={<CrearClaseScreen />} />
          <Route path="/ranking" element={<RankingScreen />} />
          <Route path="/perfil" element={<PerfilScreen />} />
          <Route path="/torneos/crear" element={<CrearTorneoScreen />} />
          <Route path="/torneos/:id" element={<TorneoDetalleScreen />} />
          {/* 🔥 AQUÍ AGREGAMOS LA NUEVA RUTA PARA EL PERFIL PÚBLICO */}
          <Route path="/jugador/:id" element={<PerfilPublicoScreen />} />
        </Route>

        <Route path="*" element={<Navigate to={usuario ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;