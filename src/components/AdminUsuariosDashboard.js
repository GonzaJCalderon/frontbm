import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaHome, FaSearch, FaTimes } from 'react-icons/fa';
import UsuarioList from './UsuarioList';
import SolicitudesPendientes from './SolicitudesPendientes';
import UsuariosRechazados from './UsuariosRechazados';
import { searchItems } from '../redux/actions/search'; // Acción de búsqueda

const AdminUsuariosDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Estado de búsqueda por campo individual
    const [searchFields, setSearchFields] = useState({
        nombre: '',
        apellido: '',
        email: '',
        dni: '',
        cuit: '',
        direccion: ''
    });

    const [showSearch, setShowSearch] = useState(false);
    const [activeTab, setActiveTab] = useState('aprobados');

    const { loading, usuarios, bienes, error } = useSelector(state => state.search);
    const storedUser = JSON.parse(localStorage.getItem('userData')) || {};
    const user = useSelector(state => state.auth.user) || storedUser;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Manejo de búsqueda individual por campo
    const handleSearch = (e) => {
        const { name, value } = e.target;
        setSearchFields({ ...searchFields, [name]: value });
    
        console.log("🔍 Campo de búsqueda:", name, "Valor:", value);
    
        if (value.length > 2) {
            dispatch(searchItems(value, name)); // Envía la búsqueda solo en el campo seleccionado
        }
    };
    

    // Logout
    const handleLogout = () => {
        localStorage.removeItem('userData');
        navigate('/home');
    };

    const tabClass = (tab) => `
        m-2 flex-1 sm:flex-initial sm:w-1/3 lg:w-1/4 px-4 py-2 rounded
        ${activeTab === tab ? 'bg-blue-600 text-white border-b-4 border-blue-800' : 'bg-gray-200'}
    `;

    const logoSrc = 'https://res.cloudinary.com/dtx5ziooo/image/upload/v1739288789/logo-png-sin-fondo_lyddzv.png';

    return (
        <div className="p-6 bg-gray-100 min-h-screen flex flex-col">
            {/* Header igual al de Dashboard.js */}
            <header className="bg-blue-600 text-black p-4 flex justify-between items-center">
                <img src={logoSrc} alt="Logo" className="h-10 w-auto mr-6" />
                <h1 className="text-2xl text-white font-bold">
                    Bienvenido/a, {user ? `${user.nombre} ${user.apellido}` : 'Invitado'}
                </h1>
                <div className="flex items-center space-x-4">
                    <FaSearch
                        className="text-white w-5 h-5 cursor-pointer"
                        onClick={() => setShowSearch(!showSearch)}
                    />
                    {showSearch && (
                        <div className="relative flex flex-wrap bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
                            {Object.keys(searchFields).map((field) => (
                                <div key={field} className="flex items-center mb-2 w-full sm:w-auto">
                                    <input
                                        type="text"
                                        name={field}
                                        placeholder={`Buscar por ${field}`}
                                        value={searchFields[field]}
                                        onChange={handleSearch}
                                        className="border rounded p-2 mr-2 w-full sm:w-48"
                                    />
                                </div>
                            ))}
                            <FaTimes
                                className="text-gray-500 w-5 h-5 cursor-pointer ml-2"
                                onClick={() => setShowSearch(false)}
                            />
                        </div>
                    )}
                    <button
                        onClick={() => navigate('/home')}
                        className="flex items-center px-2 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                    >
                        <FaHome className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center px-2 py-2 bg-red-700 text-white rounded hover:bg-red-800"
                    >
                        <FaSignOutAlt className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Tabs de Usuarios */}
            <div className="mt-4 flex flex-wrap justify-center">
                <button className={tabClass('aprobados')} onClick={() => setActiveTab('aprobados')}>
                    Usuarios Aprobados
                </button>
                <button className={tabClass('pendientes')} onClick={() => setActiveTab('pendientes')}>
                    Solicitudes Pendientes
                </button>
                <button className={tabClass('rechazados')} onClick={() => setActiveTab('rechazados')}>
                    Usuarios Rechazados
                </button>
            </div>

            {/* Resultados de la Búsqueda */}
            <div className="mt-6">
                {loading && <p className="text-center">Cargando...</p>}
                {error && <p className="text-center text-red-600">{error}</p>}
                
                <h3 className="font-semibold">Usuarios:</h3>
                {usuarios.length === 0 ? (
                    <p>No se encontraron usuarios.</p>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md">
                        {usuarios.map(user => (
                            <div key={user.id} className="cursor-pointer hover:bg-gray-100 p-2 rounded-lg">
                                {user.nombre} {user.apellido} - {user.email} - {user.dni}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Renderizado de Usuarios por Tab */}
            <main className="mt-6 flex-grow">
                {loading && <p className="text-center">Cargando...</p>}
                {error && <p className="text-center text-red-600">{error}</p>}
                
                {activeTab === 'aprobados' && <UsuarioList usuarios={usuarios} />}
                {activeTab === 'pendientes' && <SolicitudesPendientes />}
                {activeTab === 'rechazados' && <UsuariosRechazados />}
            </main>
        </div>
    );
};

export default AdminUsuariosDashboard;
