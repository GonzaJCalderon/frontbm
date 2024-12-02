import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaHome, FaSearch, FaUser, FaTimes } from 'react-icons/fa';
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

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleLogout = () => {
        navigate('/home');
    };

    const handleSearch = (e) => {
        const term = e.target.value.trim();
        setSearchTerm(term); // Guarda el término de búsqueda
    
        if (term.length > 2) {
            // Si el término es mayor que 2 caracteres, despacha la búsqueda
            dispatch(searchItems(term, searchCategory));
        } else {
            // Si el término es demasiado corto, muestra una advertencia
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
        if (item.dni || item.cuit) { // Si es un usuario
            setFormData({
                nombre: item.nombre || '',
                apellido: item.apellido || '',
                email: item.email || '',
                rol: item.rol || '',
                direccion: item.direccion || '',
                dni: item.dni || '',
                cuit: item.cuit || ''
            });
        } else { // Si es un bien
            setFormData({
                tipo: item.tipo || '',
                marca: item.marca || '',
                modelo: item.modelo || '',
                fotos: item.fotos || [] // Añadido para manejar fotos
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
                <img src={logo} alt="Logo" className="h-10 w-auto mr-6" />
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
                                    {usuarios.map(usuario => (
                                        <div
                                            key={usuario.id}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => openModal(usuario)}
                                        >
                                            {usuario.nombre} {usuario.apellido}
                                        </div>
                                    ))}
                                    {bienes.map(bien => (
                                        <div
                                            key={bien.id}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => openModal(bien)}
                                        >
                                            {bien.marca} {bien.modelo}
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
            <main className="mt-6 flex-grow flex flex-col items-center">
                {loading ? (
                    <div className="flex items-center justify-center w-full h-full">
                        <p>Cargando...</p>
                    </div>
                ) : (
                    <div className="w-full">
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
                        {showModal && (
                            <div className="fixed inset-0 flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3">
                                    <h2 className="text-2xl font-bold mb-4">
                                        {selectedItem.dni || selectedItem.cuit ? 'Detalles del Usuario' : 'Detalles del Bien'}
                                    </h2>
                                    {selectedItem && (
    <>
        {selectedItem.dni || selectedItem.cuit ? (
            // Detalles del usuario
            <>
                <p><strong>Nombre:</strong> {selectedItem.nombre}</p>
                <p><strong>Apellido:</strong> {selectedItem.apellido}</p>
                <p><strong>Email:</strong> {selectedItem.email}</p>
                <p><strong>Rol:</strong> {selectedItem.rolDefinitivo}</p>
                <p><strong>DNI:</strong> {selectedItem.dni}</p>
                <p><strong>CUIT:</strong> {selectedItem.cuit}</p>
                <p><strong>Dirección:</strong> {`${selectedItem.direccion.calle} ${selectedItem.direccion.altura}, ${selectedItem.direccion.barrio}, ${selectedItem.direccion.departamento}`}</p>
            </>
        ) : (
            // Detalles del bien
            <>
                <p><strong>Tipo:</strong> {selectedItem.tipo}</p>
                <p><strong>Marca:</strong> {selectedItem.marca}</p>
                <p><strong>Modelo:</strong> {selectedItem.modelo}</p>
                <p><strong>Precio:</strong> ${selectedItem.precio}</p>
                <p><strong>Descripción:</strong> {selectedItem.descripcion}</p>
                <p><strong>Fotos:</strong></p>
                {Array.isArray(selectedItem.foto) && selectedItem.foto.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                        {selectedItem.foto.map((foto, index) => (
                            <img
                                key={index}
                                src={foto}
                                alt={`Foto ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                            />
                        ))}
                    </div>
                ) : (
                    <p>No hay fotos disponibles.</p>
                )}
            </>
        )}
    </>
)}

                                    <div className="mt-6 flex justify-end">
                                        <button
                                            onClick={closeModal}
                                            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
    
};

export default Dashboard;
