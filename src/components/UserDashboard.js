import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaHome, FaUser, FaShoppingCart, FaBoxOpen, FaWarehouse, FaFileExcel, FaDollarSign, FaTags } from 'react-icons/fa';
import ExcelUpload from '../components/ExcelUpload';
import UsuarioDetalles from '../components/UsuarioDetails';
import Operaciones from '../components/Operaciones';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const handleLogout = () => {
        navigate('/home');
    };

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        // Implementa la lógica de búsqueda aquí si es necesario
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen flex flex-col">
            <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold">User Dashboard</h1>
                <div className="flex space-x-4">
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="px-4 py-2 rounded"
                    />
                    <FaHome
                        onClick={() => navigate('/home')}
                        className="text-white w-5 h-5 cursor-pointer"
                    />
                    <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
                    >
                        <FaSignOutAlt className="mr-2 w-5 h-5" />
                        Salir
                    </button>
                </div>
            </header>

            <main className="mt-6 flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    {/* Nueva sección para comprar bienes */}
                    <Link to="/comprar" className="group bg-orange-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4">
                        <FaDollarSign className="text-orange-500 text-5xl" />
                        <p className="text-xl font-semibold text-gray-900">Comprar Bien Mueble</p>
                        <p className="text-sm font-semibold text-gray-600 text-center">Busca y compra bienes.</p>
                    </Link>
                    {/* Nueva sección para vender bienes */}
                    <Link to="/vender" className="group bg-red-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4">
                        <FaTags className="text-red-500 text-5xl" />
                        <p className="text-xl font-semibold text-gray-900">Vender Bien Mueble</p>
                        <p className="text-sm font-semibold text-gray-600 text-center">Registra bienes para vender.</p>
                    </Link>
                    {/* Nueva sección para cargar stock desde Excel */}
                    <div className="group bg-teal-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4">
                        <FaFileExcel className="text-teal-500 text-5xl" />
                        <p className="text-xl font-semibold text-gray-900">Cargar Stock</p>
                        <p className="text-sm font-semibold text-gray-600 text-center">Sube un archivo Excel para actualizar el stock.</p>
                        <ExcelUpload />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;
