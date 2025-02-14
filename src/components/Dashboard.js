// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaHome, FaSearch, FaUser, FaTimes, FaEnvelope } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import searchItems from '../redux/actions/search';
import { updateUser, deleteUsuario, resetPassword } from '../redux/actions/usuarios';
import logo from '../assets/logo-png-sin-fondo.png';
import '../assets/styles/fontawesome.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('nombre');
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
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
    const [showSearch, setShowSearch] = useState(false);

    const { loading, usuarios, bienes, error, user } = useSelector(state => ({
        loading: state.search.loading,
        usuarios: state.search.usuarios,
        bienes: state.search.bienes,
        error: state.search.error,
        user: state.auth.user
    }));

    const logoSrc = 'https://res.cloudinary.com/dtx5ziooo/image/upload/v1739288789/logo-png-sin-fondo_lyddzv.png';


    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('userData');
        navigate('/home');
    };

    const handleSearch = (e) => {
        const term = e.target.value.trim();
        setSearchTerm(term);
        if (term.length > 2) {
            dispatch(searchItems(term, searchCategory));
        } else {
            console.log("Búsqueda demasiado corta para procesar");
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
        if (user.rol === 'moderador' && !item.dni && !item.cuit) {
            setFormData({
                tipo: item.tipo || '',
                marca: item.marca || '',
                modelo: item.modelo || '',
                descripcion: item.descripcion || '',
                fotos: item.fotos || [],
            });
        } else {
            setFormData({
                ...item,
            });
        }
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSave = () => {
        if (selectedItem) {
            if (selectedItem.dni || selectedItem.cuit) {
                dispatch(updateUser(selectedItem.id, formData));
            }
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

    return (
        <div className="p-6 bg-gray-100 min-h-screen flex flex-col overflow-hidden">
           <header className="bg-blue-600 text-black p-4 flex justify-between items-center">
  <img src={logoSrc} alt="Logo" className="h-10 w-auto mr-6" />
  <h1 className="text-2xl text-white font-bold mb-4">
    Bienvenido/a, {user ? `${user.nombre} ${user.apellido}` : 'Invitado'}
  </h1>
  <div className="flex items-center space-x-4">
    <FaSearch
      className="text-white w-5 h-5 cursor-pointer"
      onClick={() => setShowSearch(!showSearch)}
    />
    {showSearch && (
      <div className="relative">
        <div className="flex items-center">
          <select
            value={searchCategory}
            onChange={handleCategoryChange}
            className="px-2 py-2 rounded border border-gray-300 mr-2"
          >
            <option value="nombre">Nombre</option>
            <option value="apellido">Apellido</option>
            <option value="email">Email</option>
            <option value="dni">DNI</option>
            <option value="cuit">CUIT</option>
            <option value="direccion">Dirección</option>
            <option value="marca">Marca</option>
            <option value="modelo">Modelo</option>
            <option value="tipo">Tipo</option>
          </select>
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={handleSearch}
            className="px-4 py-2 rounded border border-gray-300"
          />
          <FaTimes
            className="text-gray-500 w-5 h-5 cursor-pointer ml-2"
            onClick={closeSearch}
          />
        </div>
        {(usuarios.length > 0 || bienes.length > 0) && (
          <div className="absolute bg-white border border-gray-300 w-full mt-2 max-h-60 overflow-y-auto">
            {usuarios.map(user => (
              <div
                key={user.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => openModal(user)}
              >
                {user.nombre}
              </div>
            ))}
            {bienes.map(bien => (
              <div
                key={bien.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => openModal(bien)}
              >
                {bien.nombre}
              </div>
            ))}
          </div>
        )}
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

            <main className="mt-6 flex-grow overflow-x-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link
                        to="/admin/usuarios"
                        className="group bg-blue-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4 w-full text-center"
                    >
                        <FaUser className="text-blue-500 text-5xl" />
                        <p className="text-xl font-semibold text-gray-900">Usuarios</p>
                        <p className="text-sm font-semibold text-gray-600">
                            Administra los usuarios aprobados y pendientes.
                        </p>
                    </Link>
                    <Link
                        to="/lista-bienes"
                        className="group bg-green-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4 w-full text-center"
                    >
                        <i className="fas fa-boxes text-green-500 text-5xl mb-4"></i>
                        <p className="font-semibold text-gray-900 text-xl">Bienes Muebles</p>
                        <p className="font-semibold text-gray-600 text-xs">
                            Administra los bienes muebles aquí.
                        </p>
                    </Link>
                    {/* NUEVO ENLACE A LA BANDEJA DE MENSAJES */}
                    <Link
                        to="/inbox"
                        className="group bg-indigo-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4 w-full text-center"
                    >
                        <FaEnvelope className="text-indigo-500 text-5xl" />
                        <p className="text-xl font-semibold text-gray-900">Bandeja de Mensajes</p>
                        <p className="text-sm font-semibold text-gray-600 text-center">
                            Accede a las conversaciones.
                        </p>
                    </Link>
                </div>
            </main>

            {/* Modal de búsqueda y de detalles (ya existentes) */}
            {searchTerm && (usuarios.length > 0 || bienes.length > 0) && (
                <div className="mt-6">
                    <h2 className="text-2xl font-semibold mb-4">Resultados de la búsqueda:</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold">Usuarios:</h3>
                            {usuarios.length === 0 ? (
                                <p>No se encontraron usuarios.</p>
                            ) : (
                                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md">
                                    {usuarios.map(user => (
                                        <div 
                                            key={user.id} 
                                            onClick={() => openModal(user)} 
                                            className="cursor-pointer hover:bg-gray-100 p-2 rounded-lg"
                                        >
                                            {user.nombre}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="mt-4">
                            <h3 className="font-semibold">Bienes:</h3>
                            {bienes.length === 0 ? (
                                <p>No se encontraron bienes.</p>
                            ) : (
                                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md">
                                    {bienes.map(bien => (
                                        <div 
                                            key={bien.id} 
                                            onClick={() => openModal(bien)} 
                                            className="cursor-pointer hover:bg-gray-100 p-2 rounded-lg"
                                        >
                                            {bien.nombre}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3">
                        <h3 className="text-xl font-semibold mb-4">
                            {selectedItem.dni || selectedItem.cuit ? 'Detalles del Usuario' : 'Detalles del Bien'}
                        </h3>
                        {selectedItem && (
                            <>
                                {selectedItem.dni || selectedItem.cuit ? (
                                    <div>
                                        <p><strong>Nombre:</strong> {formData.nombre}</p>
                                        <p><strong>Apellido:</strong> {formData.apellido}</p>
                                        <p><strong>Email:</strong> {formData.email}</p>
                                        <p><strong>Rol:</strong> {formData.rol}</p>
                                        <p><strong>DNI:</strong> {formData.dni}</p>
                                        <p><strong>CUIT:</strong> {formData.cuit}</p>
                                        <p><strong>Dirección:</strong> {formData.direccion}</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p><strong>Tipo:</strong> {formData.tipo}</p>
                                        <p><strong>Marca:</strong> {formData.marca}</p>
                                        <p><strong>Modelo:</strong> {formData.modelo}</p>
                                        <p><strong>Descripción:</strong> {formData.descripcion}</p>
                                        {Array.isArray(formData.fotos) && formData.fotos.length > 0 && (
                                            <div className="grid grid-cols-2 gap-2">
                                                {formData.fotos.map((foto, index) => (
                                                    <img
                                                        key={index}
                                                        src={foto}
                                                        alt={`Foto ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                        <div className="flex justify-end mt-4">
                            <button 
                                onClick={closeModal} 
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
