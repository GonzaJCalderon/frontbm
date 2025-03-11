import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaHome, FaSearch, FaUser, FaTimes, FaEnvelope } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import searchItems from '../redux/actions/search';
import { updateUser, deleteUsuario, resetPassword } from '../redux/actions/usuarios';
import { getUnreadMessages, markMessagesAsRead, markUserMessagesAsRead} from '../redux/actions/messageActions';



import '../assets/styles/fontawesome.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('nombre');
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showSearch, setShowSearch] = useState(false);

    const unreadMessages = useSelector(state => state.messages.unread.length);
    const { loading, usuarios, bienes, error, user } = useSelector(state => ({
        loading: state.search.loading,
        usuarios: state.search.usuarios,
        bienes: state.search.bienes,
        error: state.search.error,
        user: state.auth.user
    }));

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        rol: '',
        direccion: '',
        tipo: '',
        dni: '',
        cuit: ''
    });

    const logoSrc = 'https://res.cloudinary.com/dtx5ziooo/image/upload/v1739288789/logo-png-sin-fondo_lyddzv.png';

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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

    const handleSearch = (e) => {
        const term = e.target.value.trim();
        setSearchTerm(term);
        
        if (term.length > 2) {
            dispatch(searchItems(term, searchCategory));
        }
    };

    const handleCategoryChange = (e) => {
        setSearchCategory(e.target.value);
    };

    const closeSearch = () => {
        setShowSearch(false);
        setSearchTerm('');
    };

    const openModal = (item) => {
        setSelectedItem(item);
        setFormData({ ...item });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedItem(null);
        setFormData({
            nombre: '',
            apellido: '',
            email: '',
            rol: '',
            direccion: '',
            tipo: '',
            dni: '',
            cuit: ''
        });
    };

    const handleSave = () => {
        if (selectedItem) {
            dispatch(updateUser(selectedItem.id, formData));
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

   const handleInboxClick = () => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData?.uuid) return;

    console.log("✅ Marcando mensajes como leídos para:", userData.uuid);

    dispatch(markMessagesAsRead(userData.uuid));
    dispatch(markUserMessagesAsRead(userData.uuid, "UUID_DEL_ADMIN"));

    // 🔄 Limpiar mensajes no leídos en Redux inmediatamente
    dispatch({ type: GET_UNREAD_MESSAGES, payload: [] });

    setTimeout(() => {
        dispatch(getUnreadMessages(userData.uuid));
    }, 500);
};


    return (
        <div className="p-6 bg-gray-100 min-h-screen flex flex-col overflow-hidden">
            <header className="bg-blue-600 text-black p-4 flex justify-between items-center">
                <img src={logoSrc} alt="Logo" className="h-10 w-auto mr-6" />
                <h1 className="text-2xl text-white font-bold mb-4">
                    Bienvenido/a, {user ? `${user.nombre} ${user.apellido}` : 'Invitado'}
                </h1>
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/home')} className="px-2 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">
                        <FaHome className="w-5 h-5" />
                    </button>
                    <button onClick={handleLogout} className="px-2 py-2 bg-red-700 text-white rounded hover:bg-red-800">
                        <FaSignOutAlt className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="mt-6 flex-grow overflow-x-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link to="/admin/usuarios" className="group bg-blue-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4 w-full text-center">
                        <FaUser className="text-blue-500 text-5xl" />
                        <p className="text-xl font-semibold text-gray-900">Usuarios</p>
                    </Link>
                    
                    <Link to="/lista-bienes" className="group bg-green-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4 w-full text-center">
                        <i className="fas fa-boxes text-green-500 text-5xl mb-4"></i>
                        <p className="text-xl font-semibold text-gray-900">Bienes Muebles</p>
                    </Link>
                    
                    <Link to="/inbox" onClick={handleInboxClick} className="group bg-indigo-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4 w-full text-center relative">
                        <FaEnvelope className="text-indigo-500 text-5xl" />
                        {unreadMessages > 0 && (
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                                {unreadMessages}
                            </span>
                        )}
                        <p className="text-xl font-semibold text-gray-900">Bandeja de Mensajes</p>
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
