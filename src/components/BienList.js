import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllBienes, fetchTrazabilidadBien } from '../redux/actions/bienes';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaHome, FaArrowLeft } from 'react-icons/fa';
import { Table, Image, Alert, Modal, Carousel } from 'antd';

const BienList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items: bienes, totalPages, currentPage, error } = useSelector(state => state.bienes);
    const trazabilidad = useSelector(state => state.trazabilidad);
    const [selectedBien, setSelectedBien] = useState(null);
    const [visibleGallery, setVisibleGallery] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [visibleImage, setVisibleImage] = useState(false);

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

    const showGallery = (images, index) => {
        setCurrentImageIndex(index);
        setVisibleGallery(true);
    };

    const closeGallery = () => {
        setVisibleGallery(false);
    };

    const openImage = (image) => {
        setVisibleImage(image);
    };

    const closeImage = () => {
        setVisibleImage(false);
    };

    if (error) {
        return <Alert message="Error" description={error} type="error" />;
    }

    if (!bienes) {
        return <div className="text-center text-gray-500">Cargando bienes...</div>;
    }

    if (bienes.length === 0) {
        return <div className="text-center text-gray-500">No hay bienes disponibles.</div>;
    }

    const columns = [
        {
            title: 'Tipo',
            dataIndex: 'tipo',
            key: 'tipo',
            render: text => text || 'N/A',
        },
        {
            title: 'Modelo',
            dataIndex: 'modelo',
            key: 'modelo',
            render: text => text || 'N/A',
        },
        {
            title: 'Marca',
            dataIndex: 'marca',
            key: 'marca',
            render: text => text || 'N/A',
        },
        {
            title: 'Descripción',
            dataIndex: 'descripcion',
            key: 'descripcion',
            render: text => text || 'N/A',
        },
        {
            title: 'Precio',
            dataIndex: 'precio',
            key: 'precio',
            render: text => text || 'N/A',
        },
        {
            title: 'Vendedor',
            dataIndex: 'vendedor',
            key: 'vendedor',
            render: (text, record) => record.vendedor ? `${record.vendedor.nombre} ${record.vendedor.apellido}` : 'N/A',
        },
        {
            title: 'Comprador',
            dataIndex: 'comprador',
            key: 'comprador',
            render: (text, record) => record.comprador ? `${record.comprador.nombre} ${record.comprador.apellido}` : 'N/A',
        },
        {
            title: 'Fecha',
            dataIndex: 'fecha',
            key: 'fecha',
            render: text => text ? new Date(text).toLocaleDateString() : 'N/A',
        },
        {
            title: 'Foto',
            dataIndex: 'foto',
            key: 'foto',
            render: (text, record) => (
                <div onClick={() => showGallery(record.fotos, 0)} style={{ cursor: 'pointer' }}>
                    {text ? (
                        <Image
                            src={`http://localhost:5000/uploads/${text}`} // Cambia esto a la ruta correcta de tu API
                            alt="Foto del bien"
                            width={50}
                            preview={false}
                            onClick={() => openImage(`http://localhost:5000/uploads/${text}`)} // Para abrir la imagen grande
                            onError={(e) => {
                                e.target.src = 'ruta/a/imagen/por/defecto.jpg'; // Cambia esta ruta a tu imagen por defecto
                            }}
                        />
                    ) : 'No disponible'}
                </div>
            ),
        },
        {
            title: 'Acción',
            key: 'action',
            render: (text, bien) => (
                <button
                    onClick={() => handleBienClick(bien)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
                >
                    Ver más
                </button>
            ),
        },
    ];

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
            <Table
                dataSource={bienes}
                columns={columns}
                rowKey="id" // Asegúrate de que 'id' es único
                pagination={{ pageSize: 10 }}
            />

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
                        {selectedBien.fotos && selectedBien.fotos.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-lg font-semibold">Galería de Imágenes</h4>
                                <img
                                    src={`http://localhost:5000/uploads/${selectedBien.fotos[0]}`} // Muestra la primera foto
                                    alt="Foto del bien"
                                    className="w-full h-auto rounded-lg cursor-pointer"
                                    onClick={() => showGallery(selectedBien.fotos, 0)} // Al hacer clic, abre la galería
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
                    </div>
                </div>
            )}

            {/* Modal para mostrar la imagen grande */}
            <Modal visible={visibleImage} footer={null} onCancel={closeImage} width={800}>
                <img src={visibleImage} alt="Imagen grande" style={{ width: '100%', height: 'auto' }} />
            </Modal>

            <Modal open={visibleGallery} onCancel={closeGallery} footer={null} width={800}>
                <Carousel autoplay>
                    {selectedBien && selectedBien.fotos && selectedBien.fotos.map((foto, index) => (
                        <div key={index}>
                            <img
                                src={`http://localhost:5000/uploads/${foto}`} // Cambia esto a la ruta correcta de tu API
                                alt={`Foto ${index + 1}`}
                                style={{ width: '100%', height: 'auto', cursor: 'pointer' }}
                                onClick={() => openImage(`http://localhost:5000/uploads/${foto}`)} // Abre la imagen grande
                            />
                        </div>
                    ))}
                </Carousel>
            </Modal>
        </div>
    );
};

export default BienList;
