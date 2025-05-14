import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaSignOutAlt, FaHome, FaUser, FaShoppingCart, FaBoxOpen, FaWarehouse,
  FaFileExcel, FaDollarSign, FaTags, FaPaperPlane, FaBuilding
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import {
  getUnreadMessages,
  markMessagesAsRead,
  markUserMessagesAsRead,
  clearUnreadMessages
} from '../redux/actions/messageActions';
import searchItems from '../redux/actions/search';
import logo from '../assets/logo-png-sin-fondo.png';
import api from '../redux/axiosConfig';

const ADMIN_UUID = "UUID_DEL_ADMIN";

const UserDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const unreadMessages = useSelector(state => state.messages.unread.length);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [fullName, setFullName] = useState('');
  const [empresaInfo, setEmpresaInfo] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem('userData') || '{}');
  const esResponsableEmpresa = storedUser.tipo === 'juridica' && !storedUser.empresaUuid;

  useEffect(() => {
    setFullName(`${storedUser.nombre || 'Usuario'} ${storedUser.apellido || ''}`);
  }, []);

  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        const token = localStorage.getItem('authToken');
        let response = null;

        if (esResponsableEmpresa) {
          // Responsable: buscar por UUID del usuario creador (ajustá si usás otro endpoint)
          response = await api.get(`/empresas/${storedUser.uuid}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else if (storedUser.empresaUuid) {
          // Delegado: ruta dedicada
          response = await api.get(`/empresas/delegado/empresa`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }

        if (response?.data?.empresa) {
          setEmpresaInfo(response.data.empresa);
        } else {
          console.warn('⚠️ No se recibió información de empresa válida.');
        }
      } catch (error) {
        console.error('Error al obtener la empresa:', error);
      }
    };

    fetchEmpresa();
  }, [storedUser.empresaUuid, storedUser.uuid, esResponsableEmpresa]);

  useEffect(() => {
    if (storedUser?.uuid) {
      dispatch(getUnreadMessages(storedUser.uuid));
      const interval = setInterval(() => {
        dispatch(getUnreadMessages(storedUser.uuid));
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [dispatch]);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/home');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    dispatch(searchItems(e.target.value, 'todos'));
  };

  const handleMensajeAdminClick = async () => {
    if (!storedUser?.uuid) return;
    dispatch(clearUnreadMessages());
    await dispatch(markMessagesAsRead(storedUser.uuid));
    await dispatch(markUserMessagesAsRead(storedUser.uuid, ADMIN_UUID));
    setTimeout(() => dispatch(getUnreadMessages(storedUser.uuid)), 1000);
  };

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center">
          <img src={logo} alt="Logo" className="h-10 w-10 mr-2" />
          <h1 className="text-lg md:text-l font-semibold">
            Bienvenido/a, <span className="text-yellow-200">{fullName}</span>
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <FaHome onClick={() => navigate('/home')} className="text-white w-5 h-5 cursor-pointer" />
          <FaSignOutAlt onClick={handleLogout} className="text-white w-5 h-5 cursor-pointer hover:text-red-300 transition-colors duration-200" />
        </div>
      </header>

      {empresaInfo && storedUser.empresaUuid && (
        <div className="bg-yellow-200 text-yellow-900 text-center font-medium py-2 rounded shadow mt-4">
          Estás operando como empresa: <strong>{empresaInfo.razonSocial}</strong>
        </div>
      )}

      <main className="mt-6 flex-grow overflow-x-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Tarjetas comunes */}
          <Link to="/perfil" className="group bg-blue-100 rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-center">
            <FaUser className="text-blue-500 text-5xl" />
            <p className="text-xl font-semibold text-gray-900">Perfil</p>
            <p className="text-gray-600 text-sm">Consulta y edita tus datos personales.</p>
          </Link>

          <Link to="/operaciones" className="group bg-green-100 rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-center">
            <FaShoppingCart className="text-green-500 text-5xl" />
            <p className="text-xl font-semibold text-gray-900">Transacciones</p>
            <p className="text-gray-600 text-sm">Visualiza tus compras y ventas realizadas.</p>
          </Link>

          <Link to="/bienes" className="group bg-purple-100 rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-center">
            <FaBoxOpen className="text-purple-500 text-5xl" />
            <p className="text-xl font-semibold text-gray-900">Agregar Bien Mueble</p>
            <p className="text-gray-600 text-sm">Carga bienes nuevos con detalles e imágenes.</p>
          </Link>

          <Link to="/inventario" className="group bg-yellow-100 rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-center">
            <FaWarehouse className="text-yellow-500 text-5xl" />
            <p className="text-xl font-semibold text-gray-900">Inventario</p>
            <p className="text-gray-600 text-sm">Visualiza tus bienes registrados.</p>
          </Link>

          <Link to="/comprar" className="group bg-orange-100 rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-center">
            <FaDollarSign className="text-orange-500 text-5xl" />
            <p className="text-xl font-semibold text-gray-900">Comprar Bien Mueble</p>
            <p className="text-gray-600 text-sm">Registra la compra de un Bien Mueble.</p>
          </Link>

          <Link to="/vender" className="group bg-red-100 rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-center">
            <FaTags className="text-red-500 text-5xl" />
            <p className="text-xl font-semibold text-gray-900">Vender Bien Mueble</p>
            <p className="text-gray-600 text-sm">Formaliza la venta de un bien que posees.</p>
          </Link>

          <Link to="/upload-stock" className="group bg-teal-100 rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-center">
            <FaFileExcel className="text-teal-500 text-5xl" />
            <p className="text-xl font-semibold text-gray-900">Cargar Stock</p>
            <p className="text-gray-600 text-sm">Importa varios bienes desde un archivo Excel.</p>
          </Link>

          <Link to="/mensaje-admin" onClick={handleMensajeAdminClick}
            className="group bg-indigo-100 rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-center relative"
          >
            <FaPaperPlane className="text-indigo-500 text-5xl" />
            {unreadMessages > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                {unreadMessages}
              </span>
            )}
            <p className="text-xl font-semibold text-gray-900">Enviar Mensaje</p>
            <p className="text-gray-600 text-sm">Comunicate con el equipo de soporte.</p>
          </Link>

{/* 💼 Tarjeta adicional para "Mi Empresa" */}
{storedUser.tipo === 'juridica' && empresaInfo && (
  <div
    onClick={() => navigate('/empresa/mia')}
    className="group bg-cyan-100 rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:shadow-md hover:bg-cyan-200 transition-all duration-200"
  >
    <FaBuilding className="text-cyan-500 text-5xl" />
    <p className="text-xl font-semibold text-gray-900">Mi Empresa</p>
    <p className="text-gray-600 text-sm">Gestión, delegados y datos generales.</p>
  </div>
)}

          
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
