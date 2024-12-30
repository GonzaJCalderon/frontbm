import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaHome, FaUser, FaShoppingCart, FaBoxOpen, FaWarehouse, FaFileExcel, FaDollarSign, FaTags, FaSearch } from 'react-icons/fa';
import logo from '../assets/logo-png-sin-fondo.png'; // Importa el logo
import { useDispatch, useSelector } from 'react-redux';  // Importa useDispatch y useSelector
import searchItems from '../redux/actions/search';  // Importa la acción de búsqueda

const UserDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();  // Configura dispatch
    const { usuarios, bienes } = useSelector(state => state.search); // Usa useSelector para obtener el estado de búsqueda

    const [searchTerm, setSearchTerm] = useState('');
    const [searchVisible, setSearchVisible] = useState(false);
    const [fullName, setFullName] = useState('');
    const [gender, setGender] = useState(''); // Nuevo estado para género
    const [selectedItem, setSelectedItem] = useState(null);  // Estado para almacenar el ítem seleccionado

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('userData')) || {};
        const nombre = storedUser.nombre || 'Usuario';
        const apellido = storedUser.apellido || '';
        const genero = storedUser.genero || ''; // Si es necesario
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

        // Llamar a la acción de búsqueda cada vez que se ingrese un término
        dispatch(searchItems(term, 'todos'));  // 'todos' es una categoría predeterminada; puedes ajustar según tu lógica
    };

    const handleItemClick = (item) => {
        setSelectedItem(item);  // Establecer el ítem seleccionado
    };

    return (
        <div className="p-4 md:p-6 bg-gray-100 min-h-screen flex flex-col">
            <header className="bg-blue-600 text-white p-4 flex flex-col md:flex-row justify-between items-center relative">
                <div className="flex items-center">
                    <img src={logo} alt="Logo" className="h-10 w-10 mr-2" />
                    <h1 className="text-lg md:text-l font-semibold text-center md:text-left">
                        Bienvenido/a <span className="text-yellow-200">{fullName},</span> al Registro de Bienes Muebles
                    </h1>
                </div>
                <div className="flex items-center space-x-2 mt-2 md:mt-0 relative">
                    {/* <div className="relative flex items-center">
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
                                className="absolute left-0 top-10 mt-2 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 w-64"
                                style={{
                                    left: '-200px',  // Mueve el campo de búsqueda a la izquierda
                                    transition: 'all 0.3s ease-out', // Animación de deslizamiento
                                }}
                            />
                        )}
                    </div> */}
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



                </div>
            </main>

            {/* Modal de búsqueda */}
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
                                            onClick={() => handleItemClick(user)} 
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
                                            onClick={() => handleItemClick(bien)} 
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

            {/* Modal para mostrar los detalles */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                        <h3 className="text-xl font-semibold mb-4">Detalles</h3>
                        {selectedItem.nombre && <p><strong>Nombre:</strong> {selectedItem.nombre}</p>}
                        {selectedItem.descripcion && <p><strong>Descripción:</strong> {selectedItem.descripcion}</p>}
                        {selectedItem.precio && <p><strong>Precio:</strong> ${selectedItem.precio}</p>}
                        {selectedItem.id && <p><strong>ID:</strong> {selectedItem.id}</p>}
                        
                        <div className="flex justify-end mt-4">
                            <button 
                                onClick={() => setSelectedItem(null)} 
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

export default UserDashboard;
