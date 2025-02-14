// src/components/UserDashboard.js
import api from '../redux/axiosConfig'; // Ajusta la ruta si es necesario
import React, { useState, useEffect, useCallback } from 'react';
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
  FaSearch,
  FaPaperPlane
} from 'react-icons/fa';
import logo from '../assets/logo-png-sin-fondo.png';
import { useDispatch, useSelector } from 'react-redux';
import searchItems from '../redux/actions/search';

const UserDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { usuarios, bienes } = useSelector(state => state.search);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [messages, setMessages] = useState([]); // Asegurar que es un array vacío

  

  // Al montar, se obtiene la información del usuario
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userData')) || {};
    const nombre = storedUser.nombre || 'Usuario';
    const apellido = storedUser.apellido || '';
    const genero = storedUser.genero || '';
    setFullName(`${nombre} ${apellido}`);
    setGender(genero);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/home');
  };

  const handleSearchToggle = () => {
    setSearchVisible(!searchVisible);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    dispatch(searchItems(term, 'todos'));
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };


  

  // Función para obtener el contador de mensajes no leídos
  const fetchMessages = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData?.uuid) return;
  
      const response = await api.get(`/messages/${userData.uuid}`);
      console.log("Respuesta de la API:", response.data);
  
      setMessages(response.data.messages || []); // Asegurar que sea un array
    } catch (error) {
      console.error("Error al obtener mensajes:", error);
      setMessages([]); // Evitar que sea undefined
    }
  };
  
  const fetchUnreadMessages = useCallback(async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData?.uuid) return;
  
      const response = await api.get(`/messages/unread/${userData.uuid}`);
      setUnreadMessages(response.data.count);
    } catch (error) {
      console.error("Error al obtener mensajes no leídos:", error);
    }
  }, []);
  
  

  // Se ejecuta al montar el componente
  useEffect(() => {
    fetchUnreadMessages();
  
    // Ejecutar cada 10 segundos para actualizar las notificaciones automáticamente
    const interval = setInterval(() => {
      fetchUnreadMessages();
    }, 10000); // Se actualiza cada 10 segundos
  
    return () => clearInterval(interval); // Limpiar el intervalo cuando el componente se desmonta
  }, []);
  
  

  // Al hacer clic para ingresar al componente de mensajes, se marca como leídos y se refresca el contador
  const handleMensajeAdminClick = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData?.uuid) return;
  
      // Actualizar UI inmediatamente
      setUnreadMessages(0);
  
      // Marcar como leídos en la API
      await api.put(`/messages/mark-as-read/${userData.uuid}`);
  
      // Despachar acción para actualizar Redux
      dispatch(fetchUnreadMessages());
    } catch (error) {
      console.error("Error al marcar mensajes como leídos:", error);
    }
  };
  
  
  

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4 flex flex-col md:flex-row justify-between items-center relative">
        <div className="flex items-center">
          <img src={logo} alt="Logo" className="h-10 w-10 mr-2" />
          <h1 className="text-lg md:text-l font-semibold text-center md:text-left">
            Bienvenido/a, <span className="text-yellow-200">{fullName},</span> al Registro de Bienes Muebles.
          </h1>
        </div>
        <div className="flex items-center space-x-2 mt-2 md:mt-0 relative">
          <FaHome
            onClick={() => navigate('/home')}
            className="text-white w-5 h-5 cursor-pointer"
          />
          <FaSignOutAlt
            onClick={handleLogout}
            className="text-white w-5 h-5 cursor-pointer hover:text-red-300 transition-colors duration-200"
          />
        </div>
      </header>

      <main className="mt-6 flex-grow overflow-x-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/perfil" className="group bg-blue-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4">
            <FaUser className="text-blue-500 text-5xl" />
            <p className="text-xl font-semibold text-gray-900">Perfil</p>
            <p className="text-sm font-semibold text-gray-600 text-center">Ver y editar tu perfil de usuario.</p>
          </Link>
          <Link to="/operaciones" className="group bg-green-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4">
            <FaShoppingCart className="text-green-500 text-5xl" />
            <p className="text-xl font-semibold text-gray-900">Transacciones</p>
            <p className="text-sm font-semibold text-gray-600 text-center">Ver el historial de tus compras y ventas.</p>
          </Link>
          <Link to="/bienes" className="group bg-purple-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4">
            <FaBoxOpen className="text-purple-500 text-5xl" />
            <p className="text-xl font-semibold text-gray-900">Agregar Bien Mueble</p>
            <p className="text-sm font-semibold text-gray-600 text-center">Añadir un nuevo bien mueble.</p>
          </Link>
          <Link to="/inventario" className="group bg-yellow-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4">
            <FaWarehouse className="text-yellow-500 text-5xl" />
            <p className="text-xl font-semibold text-gray-900">Inventario</p>
            <p className="text-sm font-semibold text-gray-600 text-center">Gestiona el inventario y el stock.</p>
          </Link>
          <Link to="/comprar" className="group bg-orange-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4">
            <FaDollarSign className="text-orange-500 text-5xl" />
            <p className="text-xl font-semibold text-gray-900">Comprar Bien Mueble</p>
            <p className="text-sm font-semibold text-gray-600 text-center">Compra bienes y registralos.</p>
          </Link>
          <Link to="/vender" className="group bg-red-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4">
            <FaTags className="text-red-500 text-5xl" />
            <p className="text-xl font-semibold text-gray-900">Vender Bien Mueble</p>
            <p className="text-sm font-semibold text-gray-600 text-center">Registra bienes para vender.</p>
          </Link>
          <Link to="/upload-stock" className="group bg-teal-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4">
            <FaFileExcel className="text-teal-500 text-5xl" />
            <p className="text-xl font-semibold text-gray-900">Cargar Stock</p>
            <p className="text-sm font-semibold text-gray-600 text-center">Sube un archivo Excel para actualizar el stock</p>
          </Link>
          {/* NUEVO LINK PARA MENSAJES */}
          <Link 
            to="/mensaje-admin" 
            onClick={handleMensajeAdminClick}
            className="group bg-indigo-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4 relative"
          >
            <FaPaperPlane className="text-indigo-500 text-5xl" />
            {unreadMessages > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadMessages}
              </span>
            )}
            <p className="text-xl font-semibold text-gray-900">Enviar Mensaje</p>
            <p className="text-sm font-semibold text-gray-600 text-center">Comunícate con el Equipo del Sistema Provincial Preventivo Bienes Muebles Usados </p>
          </Link>
        </div>
      </main>

      {/* Modal de búsqueda y detalles (ya existentes) */}
      {searchTerm && (usuarios.length > 0 || bienes.length > 0) && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Resultados de la búsqueda:</h2>
          {/* Aquí iría el contenido del modal */}
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-xl font-semibold mb-4">Detalles</h3>
            {/* Aquí se muestran los detalles del elemento seleccionado */}
            <div className="flex justify-end mt-4">
              <button onClick={() => setSelectedItem(null)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
