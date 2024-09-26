import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllBienes, fetchTrazabilidadBien } from '../redux/actions/bienes';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaHome, FaArrowLeft } from 'react-icons/fa';

const BienList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items: bienes, totalPages, currentPage } = useSelector(state => state.bienes);
    const trazabilidad = useSelector(state => state.trazabilidad);
    const [selectedBien, setSelectedBien] = useState(null);

    useEffect(() => {
        dispatch(fetchAllBienes(currentPage));
    }, [dispatch, currentPage]);

    const handleBienClick = (bien) => {
        setSelectedBien(bien);
        dispatch(fetchTrazabilidadBien(bien.uuid)); // Usando uuid aquí
    };

    const handlePageChange = (pageNumber) => {
        dispatch(fetchAllBienes(pageNumber));
    };

    const closeModal = () => {
        setSelectedBien(null);
    };

    const handleLogout = () => {
        // Implementar lógica de cierre de sesión
        navigate('/home');
    };

    if (!bienes) {
        return <div className="text-center text-gray-500">Cargando bienes...</div>;
    }

    if (bienes.length === 0) {
        return <div className="text-center text-gray-500">No hay bienes disponibles.</div>;
    }

    return (
        <div className="container flex-grow p-4">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-800"
                >
                    <FaArrowLeft className="mr-2" />
                    Volver
                </button>
                <div className="flex space-x-4">
                    <button
                        onClick={() => navigate('/home')}
                        className="px-4 py-2 bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-800"
                    >
                        <FaHome className="mr-2" />
                        Inicio
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-700 text-white rounded-lg shadow-md hover:bg-red-800"
                    >
                        <FaSignOutAlt className="mr-2" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Lista de Bienes</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                    <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                            <th className="p-2 text-center">Tipo</th>
                            <th className="p-2 text-center">Modelo</th>
                            <th className="p-2 text-center">Marca</th>
                            <th className="p-2 text-center">Descripción</th>
                            <th className="p-2 text-center">Precio</th>
                            <th className="p-2 text-center">Vendedor</th>
                            <th className="p-2 text-center">Comprador</th>
                            <th className="p-2 text-center">Fecha</th>
                            <th className="p-2 text-center">Foto</th>
                            <th className="p-2 text-center">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bienes.map(bien => (
                            <tr
                                key={bien.id}
                                className="hover:bg-gray-100 cursor-pointer transition duration-200"
                            >
                                <td className="p-2 border-b border-gray-200 text-center">{bien.tipo || 'N/A'}</td>
                                <td className="p-2 border-b border-gray-200 text-center">{bien.modelo || 'N/A'}</td>
                                <td className="p-2 border-b border-gray-200 text-center">{bien.marca || 'N/A'}</td>
                                <td className="p-2 border-b border-gray-200 text-center">{bien.descripcion || 'N/A'}</td>
                                <td className="p-2 border-b border-gray-200 text-center">{bien.precio || 'N/A'}</td>
                                <td className="p-2 border-b border-gray-200 text-center">
                                    {bien.vendedor ? `${bien.vendedor.nombre} ${bien.vendedor.apellido}` : 'N/A'}
                                </td>
                                <td className="p-2 border-b border-gray-200 text-center">
                                    {bien.comprador ? `${bien.comprador.nombre} ${bien.comprador.apellido}` : 'N/A'}
                                </td>
                                <td className="p-2 border-b border-gray-200 text-center">
                                    {bien.fecha ? new Date(bien.fecha).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="p-2 border-b border-gray-200 text-center">
                                    {bien.foto && (
                                        <img
                                            src={bien.foto}
                                            alt="Foto del bien"
                                            className="w-16 h-16 object-cover rounded-md"
                                        />
                                    )}
                                </td>
                                <td className="p-2 border-b border-gray-200 text-center">
                                    <button
                                        onClick={() => handleBienClick(bien)}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
                                    >
                                        Ver más
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedBien && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg relative w-3/4 md:w-1/2 lg:w-1/3">
                        <button
                            onClick={closeModal}
                            className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                        >
                            <i className="fas fa-times fa-lg"></i>
                        </button>
                        <h3 className="text-xl font-semibold mb-2">Detalles del Bien</h3>
                        <p><strong>Tipo:</strong> {selectedBien.tipo || 'N/A'}</p>
                        <p><strong>Modelo:</strong> {selectedBien.modelo || 'N/A'}</p>
                        <p><strong>Marca:</strong> {selectedBien.marca || 'N/A'}</p>
                        <p><strong>Descripción:</strong> {selectedBien.descripcion || 'N/A'}</p>
                        <p><strong>Precio:</strong> {selectedBien.precio || 'N/A'}</p>
                        <p><strong>Fecha:</strong> {selectedBien.fecha ? new Date(selectedBien.fecha).toLocaleDateString() : 'N/A'}</p>
                        {selectedBien.foto && (
                            <div className="mt-4">
                                <img
                                    src={selectedBien.foto}
                                    alt="Foto del bien"
                                    className="w-full h-auto rounded-lg"
                                />
                            </div>
                        )}
                        <div className="mt-4">
                            <h4 className="text-lg font-semibold">Datos del Vendedor</h4>
                            <p><strong>Nombre:</strong> {selectedBien.vendedor ? `${selectedBien.vendedor.nombre} ${selectedBien.vendedor.apellido}` : 'N/A'}</p>
                            <p><strong>Email:</strong> {selectedBien.vendedor?.email || 'N/A'}</p>
                            <p><strong>Dirección:</strong> {selectedBien.vendedor?.direccion || 'N/A'}</p>
                        </div>
                        <div className="mt-4">
                            <h4 className="text-lg font-semibold">Datos del Comprador</h4>
                            <p><strong>Nombre:</strong> {selectedBien.comprador ? `${selectedBien.comprador.nombre} ${selectedBien.comprador.apellido}` : 'N/A'}</p>
                            <p><strong>Email:</strong> {selectedBien.comprador?.email || 'N/A'}</p>
                            <p><strong>Dirección:</strong> {selectedBien.comprador?.direccion || 'N/A'}</p>
                        </div>

                        {/* Mostrar trazabilidad */}
                        {trazabilidad && trazabilidad[selectedBien.id] && (
                            <div className="mt-4">
                                <h4 className="text-lg font-semibold">Trazabilidad del Bien</h4>
                                <pre>{JSON.stringify(trazabilidad[selectedBien.id], null, 2)}</pre>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Navegación de páginas */}
            <div className="flex justify-center mt-4">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-4 py-2 border rounded-lg ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BienList;
