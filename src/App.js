import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BienList from './components/BienList';
import BienForm from './components/BienForm';
import Home from './components/Home';
import UsuarioList from './components/UsuarioList';
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


const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/bienes" element={<BienForm />} />
          <Route path="/seleccionar-rol" element={<SeleccionarRol />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/lista-bienes" element={<BienList />} />
          <Route path="/usuarios" element={<UsuarioList />} />
          <Route path="/usuarios/:id/edit" element={<EditUsuario />} />
          <Route path="/operaciones/:userId" element={<Operaciones />} />
          <Route path="/admin/usuarios" element={<UsuarioList />} />
          <Route path="/admin/operaciones/:userId" element={<AdminOperaciones />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/userdashboard" element={<UserDashboard />} />
          <Route path="/home" element={<Home />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/" element={<Home />} />
          <Route path="/comprar" element={<ComprarPage />} />
          <Route path="/vender" element={<VenderPage />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/operaciones" element={<Operaciones />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
