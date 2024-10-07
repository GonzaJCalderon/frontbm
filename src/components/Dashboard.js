import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaHome, FaSearch, FaUser, FaShoppingCart, FaBoxOpen, FaWarehouse, FaFileExcel, FaDollarSign, FaTags } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { searchItems } from '../redux/actions/search';
import { updateUser, deleteUsuario, resetPassword } from '../redux/actions/usuarios';
import '../assets/styles/fontawesome.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        rol: '',
        direccion: '',
        tipo: ''
    });

    const { loading, results, error } = useSelector(state => state.search || {});

    const handleLogout = () => {
        navigate('/home');
    };

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        dispatch(searchItems(term));
    };

    const openModal = (user) => {
        setSelectedUser(user);
        setFormData({
            nombre: user.nombre || '',
            apellido: user.apellido || '',
            email: user.email || '',
            rol: user.rol || '',
            direccion: user.direccion || '',
            tipo: user.tipo || ''
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
        setFormData({
            nombre: '',
            apellido: '',
            email: '',
            rol: '',
            direccion: '',
            tipo: ''
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
        if (selectedUser) {
            dispatch(updateUser(selectedUser.id, formData));
            closeModal();
        }
    };

    const handleDelete = () => {
        if (selectedUser) {
            dispatch(deleteUsuario(selectedUser.id));
            closeModal();
        }
    };

    const handleResetPassword = () => {
        if (selectedUser) {
            dispatch(resetPassword(selectedUser.id));
            closeModal();
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen flex flex-col">
            <header className="bg-blue-600 text-black p-4 flex justify-between items-center">
                <h1 className="text-2xl text-white font-bold">Dashboard</h1>
                <div className="flex space-x-4">
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="px-4 py-2 rounded"
                    />
                    <FaSearch
                        className="text-white w-5 h-5 cursor-pointer"
                    />
                    <button
                        onClick={() => navigate('/home')}
                        className="flex items-center px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                    >
                        <FaHome className="mr-2 w-5 h-5" />
                        Inicio
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
                    >
                        <FaSignOutAlt className="mr-2 w-5 h-5" />
                        Salir
                    </button>
                </div>
            </header>
            <main className="mt-6 flex-grow flex items-center justify-center">
                {loading ? (
                    <div className="flex items-center justify-center w-full h-full">
                        <p>Cargando...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
                        <Link to="/admin/usuarios" className="group bg-blue-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4">
                            <FaUser className="text-blue-500 text-5xl" />
                            <p className="text-xl font-semibold text-gray-900">Usuarios</p>
                            <p className="text-sm font-semibold text-gray-600 text-center">Administra los usuarios aprobados y pendientes.</p>
                        </Link>

                        <Link to="/lista-bienes" className="m-2 group px-10 py-5 bg-green-100 rounded-lg flex flex-col items-center justify-center gap-2">
                            <i className="fas fa-boxes text-green-500 text-5xl mb-4"></i>
                            <p className="font-semibold text-gray-900 text-xl">Bienes Muebles</p>
                            <p className="font-semibold text-gray-600 text-xs">Administra los bienes muebles aquí.</p>
                        </Link>
                        {showModal && (
                            <div className="fixed inset-0 flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3 relative">
                                    <button
                                        onClick={closeModal}
                                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                    </button>
                                    <h2 className="text-xl font-bold mb-4">Detalles del Usuario</h2>
                                    {error && (
                                        <div className="mb-4">
                                            <h3 className="text-lg font-semibold">Error de Búsqueda</h3>
                                            <p>{error}</p>
                                        </div>
                                    )}
                                    <div>
                                        {['nombre', 'apellido', 'email', 'rol', 'direccion', 'tipo'].map(field => (
                                            <label key={field} className="block mb-2">
                                                {field.charAt(0).toUpperCase() + field.slice(1)}:
                                                <input
                                                    type="text"
                                                    name={field}
                                                    value={formData[field]}
                                                    onChange={handleInputChange}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                    <div className="flex space-x-4 mt-4">
                                        <button
                                            onClick={handleSave}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Guardar Cambios
                                        </button>
                                        <button
                                            onClick={handleResetPassword}
                                            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                                        >
                                            Resetear Contraseña
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                        >
                                            Eliminar Usuario
                                        </button>
                                    </div>
                                </div>
                                <div className="fixed inset-0 bg-black opacity-50"></div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
