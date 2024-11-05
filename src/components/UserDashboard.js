import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaHome, FaUser, FaShoppingCart, FaBoxOpen, FaWarehouse, FaFileExcel, FaDollarSign, FaTags, FaSearch } from 'react-icons/fa';
import ExcelUpload from '../components/ExcelUpload';
import logo from '../assets/logo-png-sin-fondo.png'; // Importa el logo

const UserDashboard = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchVisible, setSearchVisible] = useState(false);
    const [fullName, setFullName] = useState('');
    const [gender, setGender] = useState(''); // Nuevo estado para género

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('userData')) || {};
        const { nombre, apellido, genero } = storedUser; // Asegúrate de que 'genero' está aquí
        setFullName(`${nombre} ${apellido}`);
        setGender(genero); // Guarda el género del usuario
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
    };

    return (
        <div className="p-4 md:p-6 bg-gray-100 min-h-screen flex flex-col">
            <header className="bg-blue-600 text-white p-4 flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center">
                    <img src={logo} alt="Logo" className="h-10 w-10 mr-2" />
                    <h1 className="text-lg md:text-l font-semibold text-center md:text-left">
                        Bienvenido/a <span className="text-yellow-200">{fullName},</span> al Registro de Bienes Muebles
                    </h1>
                </div>
                <div className="flex items-center space-x-2 mt-2 md:mt-0">
                    <div className="relative">
                        <FaSearch
                            onClick={handleSearchToggle}
                            className="text-white w-5 h-5 cursor-pointer transition-transform duration-200 transform hover:scale-125"
                        />
                        {searchVisible && (
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="absolute top-0 left-0 mt-8 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                            />
                        )}
                    </div>
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
                        <p className="text-sm font-semibold text-gray-600 text-center">Busca y compra bienes.</p>
                    </Link>
                    <Link to="/vender" className="group bg-red-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4">
                        <FaTags className="text-red-500 text-5xl" />
                        <p className="text-xl font-semibold text-gray-900">Vender Bien Mueble</p>
                        <p className="text-sm font-semibold text-gray-600 text-center">Registra bienes para vender.</p>
                    </Link>
                    <div className="group bg-teal-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4">
                        <FaFileExcel className="text-teal-500 text-5xl" />
                        <p className="text-xl font-semibold text-gray-900">Cargar Stock</p>
                        <p className="text-sm font-semibold text-gray-600 text-center">Sube un archivo Excel para actualizar el stock</p>
                        <ExcelUpload />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;
