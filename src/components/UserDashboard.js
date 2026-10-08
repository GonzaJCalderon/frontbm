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
import logo from '../assets/logo-png-sin-fondo.png';
import api from '../redux/axiosConfig';

const ADMIN_UUID = "UUID_DEL_ADMIN";


const UserDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const unreadMessages = useSelector(state => state.messages.unread.length);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/home');
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
          <Link to="/perfil" className="group bg-blue-50 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center shadow-sm hover:shadow-lg hover:bg-blue-100 transition-all duration-300 border border-blue-200 hover:-translate-y-1">
            <FaUser className="text-blue-600 text-5xl group-hover:scale-110 transition-transform duration-300" />
            <div>
              <p className="text-xl font-bold font-montserrat text-blue-900 tracking-tight m-0">Perfil</p>
              <p className="text-blue-700 text-sm mt-1 font-medium m-0">Consulta y edita tus datos personales.</p>
            </div>
          </Link>

          <Link to="/operaciones" className="group bg-green-50 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center shadow-sm hover:shadow-lg hover:bg-green-100 transition-all duration-300 border border-green-200 hover:-translate-y-1">
            <FaShoppingCart className="text-green-600 text-5xl group-hover:scale-110 transition-transform duration-300" />
            <div>
              <p className="text-xl font-bold font-montserrat text-green-900 tracking-tight m-0">Transacciones</p>
              <p className="text-green-700 text-sm mt-1 font-medium m-0">Visualiza tus compras y ventas realizadas.</p>
            </div>
          </Link>

          <Link to="/registrar-bien" className="group bg-purple-50 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center shadow-sm hover:shadow-lg hover:bg-purple-100 transition-all duration-300 border border-purple-200 hover:-translate-y-1">
            <FaBoxOpen className="text-purple-600 text-5xl group-hover:scale-110 transition-transform duration-300" />
            <div>
              <p className="text-xl font-bold font-montserrat text-purple-900 tracking-tight m-0">Agregar Bien Mueble</p>
              <p className="text-purple-700 text-sm mt-1 font-medium m-0">Carga bienes nuevos con detalles e imágenes.</p>
            </div>
          </Link>

          <Link to="/inventario" className="group bg-yellow-50 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center shadow-sm hover:shadow-lg hover:bg-yellow-100 transition-all duration-300 border border-yellow-200 hover:-translate-y-1">
            <FaWarehouse className="text-yellow-600 text-5xl group-hover:scale-110 transition-transform duration-300" />
            <div>
              <p className="text-xl font-bold font-montserrat text-yellow-900 tracking-tight m-0">Inventario</p>
              <p className="text-yellow-700 text-sm mt-1 font-medium m-0">Visualiza tus bienes registrados.</p>
            </div>
          </Link>

          <Link to="/comprar" className="group bg-orange-50 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center shadow-sm hover:shadow-lg hover:bg-orange-100 transition-all duration-300 border border-orange-200 hover:-translate-y-1">
            <FaDollarSign className="text-orange-600 text-5xl group-hover:scale-110 transition-transform duration-300" />
            <div>
              <p className="text-xl font-bold font-montserrat text-orange-900 tracking-tight m-0">Comprar Bien Mueble</p>
              <p className="text-orange-700 text-sm mt-1 font-medium m-0">Registra la compra de un Bien Mueble.</p>
            </div>
          </Link>

          <Link to="/vender" className="group bg-red-50 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center shadow-sm hover:shadow-lg hover:bg-red-100 transition-all duration-300 border border-red-200 hover:-translate-y-1">
            <FaTags className="text-red-600 text-5xl group-hover:scale-110 transition-transform duration-300" />
            <div>
              <p className="text-xl font-bold font-montserrat text-red-900 tracking-tight m-0">Vender Bien Mueble</p>
              <p className="text-red-700 text-sm mt-1 font-medium m-0">Formaliza la venta de un bien que posees.</p>
            </div>
          </Link>

          <Link to="/upload-stock" className="group bg-teal-50 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center shadow-sm hover:shadow-lg hover:bg-teal-100 transition-all duration-300 border border-teal-200 hover:-translate-y-1">
            <FaFileExcel className="text-teal-600 text-5xl group-hover:scale-110 transition-transform duration-300" />
            <div>
              <p className="text-xl font-bold font-montserrat text-teal-900 tracking-tight m-0">Cargar Stock</p>
              <p className="text-teal-700 text-sm mt-1 font-medium m-0">Importa varios bienes desde un archivo Excel.</p>
            </div>
          </Link>

          <Link to="/mensaje-admin" onClick={handleMensajeAdminClick}
            className="group bg-indigo-50 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center shadow-sm hover:shadow-lg hover:bg-indigo-100 transition-all duration-300 border border-indigo-200 hover:-translate-y-1 relative"
          >
            <FaPaperPlane className="text-indigo-600 text-5xl group-hover:scale-110 transition-transform duration-300" />
            {unreadMessages > 0 && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce shadow-md">
                {unreadMessages}
              </span>
            )}
            <div>
              <p className="text-xl font-bold font-montserrat text-indigo-900 tracking-tight m-0">Enviar Mensaje</p>
              <p className="text-indigo-700 text-sm mt-1 font-medium m-0">Comunicate con el equipo de soporte.</p>
            </div>
          </Link>

{/* 💼 Tarjeta adicional para "Mi Empresa" */}
{storedUser.tipo === 'juridica' && empresaInfo && (
  <div
    onClick={() => navigate('/empresa/mia')}
    className="group bg-cyan-50 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center cursor-pointer shadow-sm hover:shadow-lg hover:bg-cyan-100 transition-all duration-300 border border-cyan-200 hover:-translate-y-1"
  >
    <FaBuilding className="text-cyan-600 text-5xl group-hover:scale-110 transition-transform duration-300" />
    <div>
      <p className="text-xl font-bold font-montserrat text-cyan-900 tracking-tight m-0">Mi Empresa</p>
      <p className="text-cyan-700 text-sm mt-1 font-medium m-0">Gestión, delegados y datos generales.</p>
    </div>
  </div>
)}

          
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
