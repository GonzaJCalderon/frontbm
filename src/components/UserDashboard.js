import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaSignOutAlt,
  FaHome,
  FaUser,
  FaShoppingCart,
  FaBoxOpen,
  FaWarehouse,
  FaFileExcel,
  FaDollarSign,
  FaTags,
  FaPaperPlane
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux'
import { 
  getUnreadMessages, 
  markMessagesAsRead, 
  markUserMessagesAsRead  
} from '../redux/actions/messageActions'; 
import searchItems from '../redux/actions/search';
import logo from '../assets/logo-png-sin-fondo.png';

// 🔹 UUID del admin (ajustar según lógica real)
const ADMIN_UUID = "UUID_DEL_ADMIN"; 

const UserDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { usuarios, bienes } = useSelector(state => state.search);
  const unreadMessages = useSelector(state => state.messages.unread.length);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [fullName, setFullName] = useState('');

  // Obtener datos del usuario desde localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userData')) || {};
    setFullName(`${storedUser.nombre || 'Usuario'} ${storedUser.apellido || ''}`);
  }, []);

  // 🔥 Obtener mensajes no leídos al montar y actualizar cada 10 segundos
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (!userData?.uuid) {
        console.warn("⚠️ No se encontró adminUuid en localStorage.");
        return;
    }

    console.log("📩 Cargando mensajes no leídos para:", userData.uuid);
    
    dispatch(getUnreadMessages(userData.uuid));

    const interval = setInterval(() => {
        dispatch(getUnreadMessages(userData.uuid));
    }, 10000);

    return () => clearInterval(interval);
}, [dispatch]);


  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/home');
  };

  const handleSearchToggle = () => setSearchVisible(!searchVisible);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    dispatch(searchItems(e.target.value, 'todos'));
  };

  // 🔹 Marcar mensajes como leídos al entrar a la bandeja de mensajes
  const handleMensajeAdminClick = () => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData?.uuid) return;

    console.log("✅ Marcando mensajes como leídos para usuario:", userData.uuid);

    dispatch(markMessagesAsRead(userData.uuid));
    dispatch(markUserMessagesAsRead(userData.uuid, ADMIN_UUID));

    // 🔄 Limpiar notificación de mensajes inmediatamente
    dispatch({ type: GET_UNREAD_MESSAGES, payload: [] });

    setTimeout(() => {
        dispatch(getUnreadMessages(userData.uuid));
    }, 500);
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

      <main className="mt-6 flex-grow overflow-x-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/perfil" className="group bg-blue-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4">
            <FaUser className="text-blue-500 text-5xl" />
            <p className="text-xl font-semibold text-gray-900">Perfil</p>
          </Link>
          <Link to="/operaciones" className="group bg-green-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4">
            <FaShoppingCart className="text-green-500 text-5xl" />
            <p className="text-xl font-semibold text-gray-900">Transacciones</p>
          </Link>
          <Link to="/bienes" className="group bg-purple-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4">
            <FaBoxOpen className="text-purple-500 text-5xl" />
            <p className="text-xl font-semibold text-gray-900">Agregar Bien Mueble</p>
          </Link>
          <Link to="/inventario" className="group bg-yellow-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4">
            <FaWarehouse className="text-yellow-500 text-5xl" />
            <p className="text-xl font-semibold text-gray-900">Inventario</p>
          </Link>
          <Link to="/comprar" className="group bg-orange-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4">
            <FaDollarSign className="text-orange-500 text-5xl" />
            <p className="text-xl font-semibold text-gray-900">Comprar Bien Mueble</p>
          </Link>
          <Link to="/vender" className="group bg-red-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4">
            <FaTags className="text-red-500 text-5xl" />
            <p className="text-xl font-semibold text-gray-900">Vender Bien Mueble</p>
          </Link>
          <Link to="/upload-stock" className="group bg-teal-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4">
            <FaFileExcel className="text-teal-500 text-5xl" />
            <p className="text-xl font-semibold text-gray-900">Cargar Stock</p>
          </Link>

          {/* 🔥 Link para mensajes con notificación de mensajes no leídos */}
          <Link 
            to="/mensaje-admin" 
            onClick={handleMensajeAdminClick}
            className="group bg-indigo-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4 relative"
          >
            <FaPaperPlane className="text-indigo-500 text-5xl" />
            {unreadMessages > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                {unreadMessages}
              </span>
            )}
            <p className="text-xl font-semibold text-gray-900">Enviar Mensaje</p>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
