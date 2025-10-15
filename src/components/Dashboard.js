import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaHome, FaSearch, FaUser, FaEnvelope, FaBoxOpen } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import searchItems from '../redux/actions/search';
import FiltroUsuarios from './FiltroUsuarios'; // Asegura que el path sea correcto
import { updateUser, deleteUsuario, resetPassword } from '../redux/actions/usuarios';
import { getUnreadMessages, markMessagesAsRead, markUserMessagesAsRead, clearUnreadMessages,  assignUnreadToAdmin } from '../redux/actions/messageActions';
import EmpresasRegistradas from './EmpresasRegistradas'; // ⬅️ Asegúrate que esté importado
import api from '../redux/axiosConfig'; 


const Dashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Estados locales
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('nombre');
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showSearch, setShowSearch] = useState(false);
    
    // Referencia para limpiar intervalos
    const messagesIntervalRef = useRef(null);

    // Datos del usuario
    const { loading, usuarios, bienes, error, user } = useSelector(state => ({
        loading: state.search.loading,
        usuarios: state.search.usuarios,
        bienes: state.search.bienes,
        error: state.search.error,
        user: state.auth.user
    }));
    
const unreadMessages = useSelector(state => Array.isArray(state.messages?.unread) ? state.messages.unread.length : 0);



    const logoSrc = 'https://res.cloudinary.com/dtx5ziooo/image/upload/v1739288789/logo-png-sin-fondo_lyddzv.png';

    // Efecto para obtener mensajes no leídos
useEffect(() => {
  const userData = JSON.parse(localStorage.getItem('userData'));
  if (!userData?.uuid) return;

  dispatch(getUnreadMessages(userData.uuid)).then((unread) => {
    console.log("📬 Mensajes no leídos recibidos:", unread); // Ahora sí: debe ser array
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

    const handleSearch = (e) => {
        setSearchTerm(e.target.value.trim());
    };

    const handleCategoryChange = (e) => {
        setSearchCategory(e.target.value);
    };

    const openModal = (item) => {
        setSelectedItem(item);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedItem(null);
    };

    const handleSave = () => {
        if (selectedItem) {
            dispatch(updateUser(selectedItem.id, selectedItem));
            closeModal();
        }
    };

    const handleDelete = () => {
        if (selectedItem) {
            dispatch(deleteUsuario(selectedItem.id));
            closeModal();
        }
    };

    const handleResetPassword = () => {
        if (selectedItem) {
            dispatch(resetPassword(selectedItem.id));
            closeModal();
        }
    };

const handleInboxClick = async () => {
  const userData = JSON.parse(localStorage.getItem('userData'));
  if (!userData?.uuid) return;

  try {
    console.log("📩 Ejecutando flujo de Inbox...");

    // 🔹 1. Asignar globales no leídos al admin
    const assignRes = await dispatch(assignUnreadToAdmin(userData.uuid));
    console.log("🧩 Resultado assignUnreadToAdmin:", assignRes);

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
        <div className="p-6 bg-gray-100 min-h-screen flex flex-col">
            <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
                <img src={logoSrc} alt="Logo" className="h-10 w-auto" />
                <h1 className="text-2xl font-bold">
                    Bienvenido/a, {user ? `${user.nombre} ${user.apellido}` : 'Invitado'}
                </h1>
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/home')} className="px-3 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">
                        <FaHome className="w-5 h-5" />
                    </button>
                    <button onClick={handleLogout} className="px-3 py-2 bg-red-700 text-white rounded hover:bg-red-800">
                        <FaSignOutAlt className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="mt-6 flex-grow overflow-x-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link to="/admin/usuarios" className="group bg-blue-100 rounded-lg p-6 flex flex-col items-center">
                        <FaUser className="text-blue-500 text-5xl" />
                        <p className="text-xl font-semibold text-gray-900">Usuarios</p>
                    </Link>
                    <Link to="/lista-bienes" className="group bg-green-100 rounded-lg p-6 flex flex-col items-center">
  <FaBoxOpen className="text-green-500 text-5xl" />
  <p className="text-xl font-semibold text-gray-900">Bienes Muebles</p>
</Link>
                    
                  <Link to="/inbox" onClick={handleInboxClick} className="group bg-indigo-100 rounded-lg p-6 flex flex-col items-center relative">
  <div className="relative">
    <FaEnvelope className="text-indigo-500 text-5xl" />
    {unreadMessages > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] min-w-[20px] h-[20px] px-1 py-0.5 flex items-center justify-center rounded-full shadow-lg animate-ping z-10">

        {unreadMessages}
      </span>
    )}
  </div>
  <p className="text-xl font-semibold text-gray-900">Bandeja de Mensajes</p>
</Link>


                    
                </div>
                {user?.tipo === 'juridica' && !user?.delegadoDe && (
  <div className="mt-10">
    <h2 className="text-xl font-bold text-gray-800 mb-4">Gestión de Delegados</h2>
    <EmpresasRegistradas
      empresas={[user]} // Solo su propia empresa
      refreshEmpresas={() => {}} // Podés usar un fetch aquí si implementás edición
    />
  </div>
)}

            </main>
        </div>
    );
};

export default Dashboard;
