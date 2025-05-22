import './App.css';
import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import BienList from './components/BienList';
import BienForm from './components/BienForm';
import Home from './components/Home';
import UsuarioList from './components/UsuarioList';
import TrazabilidadBien from './components/TrazabilidadBien';
import Dashboard from './components/Dashboard';
import Operaciones from './components/Operaciones';
import EditUsuario from './components/EditarUsuario';
import SuccessPage from './components/SuccessPage';
import SeleccionarRol from './components/SeleccionarRol';
import ComprarPage from './components/ComprarPage';
import VenderPage from './components/VenderPage';
import Perfil from './components/Perfil';
import UserDashboard from './components/UserDashboard';
import Inventario from './components/inventario';
import AdminOperaciones from './components/AdminOperaciones';
import AdminUsuariosDashboard from './components/AdminUsuariosDashboard';
import ExcelUploadPage from './components/ExcelUploadPage';
import HistorialCambios from './components/HistorialCambios';
import BienesPorUsuario from './components/BienesPorUsuario';
import UsuarioDetails from './components/UsuarioDetails';
import UpdateAccount from './components/UpdateAccount';
import BienEdit from './components/BienEdit';
import ReintentarRegistro from './components/ReintentarRegistro';
import MessageToAdmin from './components/MessageToAdmin';
import MessageAdmin from './components/AdminMessages';
import AdminInbox from './components/AdminInbox';
import ResetPassword from './components/ResetPassword';
import ForgotPassword from './components/ForgotPassword';
import DelegadosEmpresa from './components/DelegadosEmpresa';
import RegistrarDelegado from './components/RegistrarDelegado';
import MiEmpresa from './components/MiEmpresa';
import ActivarCuenta from './components/ActivarCuenta';

import { refreshAuthToken } from './utils/auth'; // ✅ tu helper

const App = () => {
  const navigate = useNavigate();

  // ⏱ Refrescar token cada 25 minutos si hay sesión activa
useEffect(() => {
  const intentarRefreshInicial = async () => {
    const authToken = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken');

    // 🔐 Validación doble: ambos tokens deben estar presentes
    if (authToken && refreshToken) {
      const success = await refreshAuthToken();
      if (!success) {
        console.warn('⛔ No se pudo refrescar el token inicial. Cerrando sesión.');
        localStorage.clear();
        navigate('/login');
      }
    } else {
      console.warn('⛔ Tokens faltantes. Cerrando sesión.');
      localStorage.clear();
      navigate('/login');
    }
  };

  intentarRefreshInicial(); // Ejecuta una vez al cargar

  const interval = setInterval(() => {
    refreshAuthToken();
  }, 25 * 60 * 1000);

  return () => clearInterval(interval);
}, [navigate]);



  return (
    <div className="App">
      <Routes>
        <Route path="/bienes" element={<BienForm />} />
        <Route path="/bienes/edit/:uuid" element={<BienEdit />} />
        <Route path="/seleccionar-rol" element={<SeleccionarRol />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/lista-bienes" element={<BienList />} />
        <Route path="/bienes-usuario/:uuid" element={<BienesPorUsuario />} />
        <Route path="/usuarios/:id" element={<UsuarioDetails />} />
        <Route path="/usuarios" element={<UsuarioList />} />
        <Route path="/bienes/trazabilidad/:uuid" element={<TrazabilidadBien />} />
        <Route path="/bienes/trazabilidad-identificador/:identificador" element={<TrazabilidadBien />} />
        <Route path="/usuarios/:id/edit" element={<EditUsuario />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/operaciones/:uuid" element={<AdminOperaciones />} />
        <Route path="/admin/historial-cambios/:uuid" element={<HistorialCambios />} />
        <Route path="/admin/usuarios" element={<AdminUsuariosDashboard />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Home />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/comprar" element={<ComprarPage />} />
        <Route path="/vender" element={<VenderPage />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/operaciones" element={<Operaciones />} />
        <Route path="/login" element={<Home />} />
        <Route path="/upload-stock" element={<ExcelUploadPage />} />
        <Route path="/usuarios/:uuid/reintentar" element={<ReintentarRegistro />} />
        <Route path="/usuarios/update-account/:token" element={<UpdateAccount />} />
        <Route path="/inbox" element={<AdminInbox />} />
        <Route path="/admin/chat/:userUuid" element={<MessageAdmin />} />
        <Route path="/mensaje-admin" element={<MessageToAdmin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/empresa/:uuid/delegados" element={<DelegadosEmpresa />} />
        <Route path="/empresa/delegados/nuevo" element={<RegistrarDelegado />} />
        <Route path="/empresa/mia" element={<MiEmpresa />} />
        <Route path="/activar-cuenta" element={<ActivarCuenta />} />
      </Routes>
    </div>
  );
};

export default App;
