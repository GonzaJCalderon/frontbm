import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaHome, FaUser, FaEnvelope, FaBoxOpen, FaExchangeAlt } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import searchItems from '../redux/actions/search';
import {  } from '../redux/actions/usuarios';
import { getUnreadMessages, markMessagesAsRead, markUserMessagesAsRead, clearUnreadMessages,  assignUnreadToAdmin } from '../redux/actions/messageActions';
import EmpresasRegistradas from './EmpresasRegistradas';


const Dashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Estados locales
    const [searchTerm] = useState('');
    const [searchCategory] = useState('nombre');
    const [selectedItem] = useState(null);
    const [showSearch, setShowSearch] = useState(false);
    
    // Referencia para limpiar intervalos
    const messagesIntervalRef = useRef(null);

    // Datos del usuario
    const { user } = useSelector(state => ({
        user: state.auth.user
    }));
    
const unreadMessages = useSelector(state => Array.isArray(state.messages?.unread) ? state.messages.unread.length : 0);



    const logoSrc = 'https://res.cloudinary.com/dtx5ziooo/image/upload/v1739288789/logo-png-sin-fondo_lyddzv.png';

    // Efecto para obtener mensajes no leídos
useEffect(() => {
  const userData = JSON.parse(localStorage.getItem('userData'));
  if (!userData?.uuid) return;

  dispatch(getUnreadMessages(userData.uuid)).then((unread) => {
    // console.log("📬 Mensajes no leídos recibidos:", unread); // Ahora sí: debe ser array
  });

  messagesIntervalRef.current = setInterval(() => {
    dispatch(getUnreadMessages(userData.uuid));
  }, 10000);

  return () => clearInterval(messagesIntervalRef.current);
}, [dispatch]);
useEffect(() => {
  const refreshUnread = () => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData?.uuid) return;
    dispatch(getUnreadMessages(userData.uuid));
  };

  window.addEventListener("user-sent-message", refreshUnread);

  return () => {
    window.removeEventListener("user-sent-message", refreshUnread);
  };
}, [dispatch]);



    // Evento de búsqueda con debounce (reduce llamadas innecesarias)
    useEffect(() => {
        if (searchTerm.length > 2) {
            const debounce = setTimeout(() => {
                dispatch(searchItems(searchTerm, searchCategory));
            }, 500); // Espera 500ms antes de hacer la búsqueda

            return () => clearTimeout(debounce);
        }
    }, [searchTerm, searchCategory, dispatch]);

    const handleLogout = () => {
        localStorage.removeItem('userData');
        navigate('/home');
    };


const handleInboxClick = async () => {
  const userData = JSON.parse(localStorage.getItem('userData'));
  if (!userData?.uuid) return;

  try {
    // console.log("📩 Ejecutando flujo de Inbox...");

    // 🔹 1. Asignar globales no leídos al admin
    const assignRes = await dispatch(assignUnreadToAdmin(userData.uuid));
    // console.log("🧩 Resultado assignUnreadToAdmin:", assignRes);

    // 🔹 2. Marcar mensajes del admin como leídos
    await dispatch(markMessagesAsRead(userData.uuid));
    await dispatch(markUserMessagesAsRead(userData.uuid, userData.uuid));

    // 🔹 3. Limpiar el badge temporalmente
    dispatch(clearUnreadMessages());

    // 🔹 4. Refrescar estado real después de medio segundo
    setTimeout(() => {
      dispatch(getUnreadMessages(userData.uuid));
    }, 500);
  } catch (error) {
    console.error("❌ Error en handleInboxClick:", error);
  }
};



    return (
        <div className="bg-background min-h-screen flex flex-col font-inter">
            {/* Header Superior - Calidad Premium */}
            <header className="bg-primary text-white px-8 py-5 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-4">
                    <img src={logoSrc} alt="Logo" className="h-12 w-auto bg-white/10 rounded p-1" />
                    <div>
                        <h1 className="text-2xl font-bold font-montserrat tracking-tight">
                            Bienvenido/a, {user ? `${user.nombre} ${user.apellido}` : 'Invitado'}
                        </h1>
                        <p className="text-inverse-primary text-sm font-medium mt-0.5">
                            Panel de Administración Central
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={handleLogout} className="flex items-center justify-center p-3 bg-error text-white rounded-lg hover:bg-error/90 transition-all shadow-sm">
                        <FaSignOutAlt className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Contenido Principal - Grid de Tarjetas Mejoradas */}
            <main className="flex-grow p-8 max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Tarjeta Usuarios */}
                    <Link to="/admin/usuarios" className="group bg-surface-container-lowest rounded-2xl p-8 flex flex-col items-center justify-center border border-outline-variant shadow-level-2 hover:shadow-level-3 transition-all hover:-translate-y-1">
                        <div className="bg-primary-container p-6 rounded-full mb-4 group-hover:scale-110 transition-transform">
                            <FaUser className="text-on-primary-container text-5xl" />
                        </div>
                        <p className="text-2xl font-bold text-primary font-montserrat">Usuarios</p>
                        <p className="text-on-surface-variant text-sm mt-2 text-center">Gestión y aprobación de cuentas</p>
                    </Link>

                    {/* Tarjeta Bienes Muebles */}
                    <Link to="/lista-bienes" className="group bg-surface-container-lowest rounded-2xl p-8 flex flex-col items-center justify-center border border-outline-variant shadow-level-2 hover:shadow-level-3 transition-all hover:-translate-y-1">
                        <div className="bg-secondary-container p-6 rounded-full mb-4 group-hover:scale-110 transition-transform">
                            <FaBoxOpen className="text-on-secondary-container text-5xl" />
                        </div>
                        <p className="text-2xl font-bold text-primary font-montserrat">Bienes Muebles</p>
                        <p className="text-on-surface-variant text-sm mt-2 text-center">Control de inventario general</p>
                    </Link>

                    {/* Tarjeta Transacciones Globales */}
                    <Link to="/admin/transacciones" className="group bg-surface-container-lowest rounded-2xl p-8 flex flex-col items-center justify-center border border-outline-variant shadow-level-2 hover:shadow-level-3 transition-all hover:-translate-y-1">
                        <div className="bg-tertiary-container p-6 rounded-full mb-4 group-hover:scale-110 transition-transform">
                            <FaExchangeAlt className="text-on-tertiary-container text-5xl" />
                        </div>
                        <p className="text-2xl font-bold text-primary font-montserrat">Operaciones</p>
                        <p className="text-on-surface-variant text-sm mt-2 text-center">Registro de compras y ventas</p>
                    </Link>
                    
                    {/* Tarjeta Mensajes */}
                    <Link to="/inbox" onClick={handleInboxClick} className="group bg-surface-container-lowest rounded-2xl p-8 flex flex-col items-center justify-center border border-outline-variant shadow-level-2 hover:shadow-level-3 transition-all hover:-translate-y-1 relative">
                        <div className="relative bg-surface-container-high p-6 rounded-full mb-4 group-hover:scale-110 transition-transform">
                            <FaEnvelope className="text-primary text-5xl" />
                            {unreadMessages > 0 && (
                                <span className="absolute 0 right-0 bg-error text-white text-xs font-bold w-8 h-8 flex items-center justify-center rounded-full shadow-lg border-2 border-white animate-pulse">
                                    {unreadMessages}
                                </span>
                            )}
                        </div>
                        <p className="text-2xl font-bold text-primary font-montserrat">Bandeja de Mensajes</p>
                        <p className="text-on-surface-variant text-sm mt-2 text-center">Alertas y trazabilidad</p>
                    </Link>
                </div>

                {/* Gestión de Delegados */}
                {user?.tipo === 'juridica' && !user?.delegadoDe && (
                    <div className="mt-12 bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant shadow-level-2">
                        <div className="border-b border-outline-variant pb-4 mb-6">
                            <h2 className="text-2xl font-bold text-primary font-montserrat">Gestión de Delegados</h2>
                            <p className="text-on-surface-variant text-sm mt-1">Administra los permisos de los delegados asociados a tu empresa.</p>
                        </div>
                        <EmpresasRegistradas
                            empresas={[user]} 
                            refreshEmpresas={() => {}} 
                        />
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
