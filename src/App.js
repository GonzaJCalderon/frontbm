import './App.css';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
import ComprarPage from './components/ComprarPage'; // Asegúrate de tener este componente
import VenderPage from './components/VenderPage';
import Perfil from './components/Perfil';
import UserDashboard from './components/UserDashboard';
import Inventario from './components/inventario';
import AdminOperaciones from './components/AdminOperaciones';
import AdminUsuariosDashboard from './components/AdminUsuariosDashboard';  // Nueva ruta
import ExcelUploadPage from './components/ExcelUploadPage'; 
import HistorialCambios from './components/HistorialCambios';
import BienesPorUsuario from './components/BienesPorUsuario';
import UsuarioDetails from './components/UsuarioDetails';
import UpdateAccount from './components/UpdateAccount';
import BienEdit from './components/BienEdit';
import ReintentarRegistro from './components/ReintentarRegistro';

const App = () => {
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
        <Route path="/usuarios/:id/edit" element={<EditUsuario />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/operaciones/:uuid" element={<AdminOperaciones />} />
        <Route path="/admin/historial-cambios/:uuid" element={<HistorialCambios />} />
        <Route path="/admin/usuarios" element={<AdminUsuariosDashboard />} />  
        <Route path="/user/dashboard" element={<UserDashboard />} /> 
        <Route path="/home" element={<Home />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/" element={<Home />} />
        <Route path="/comprar" element={<ComprarPage />} />
        <Route path="/vender" element={<VenderPage />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/operaciones" element={<Operaciones />} />
        <Route path="/login" element={<Home />} />
        <Route path="/upload-stock" element={<ExcelUploadPage />} />
        <Route path="/usuarios/:uuid/reintentar" element={<ReintentarRegistro />} />
        <Route path="/usuarios/update-account/:token" element={<UpdateAccount />} />
      </Routes>
    </div>
  );
};

export default App;
