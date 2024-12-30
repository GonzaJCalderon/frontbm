import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllBienes } from '../redux/actions/bienes';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaHome, FaArrowLeft } from 'react-icons/fa';
import { Table, Image, Modal, Carousel, Button } from 'antd';
import { notification } from 'antd';

const BienList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items: bienes, error } = useSelector(state => state.bienes);
    const [selectedBien, setSelectedBien] = useState(null);
    const [visibleGallery, setVisibleGallery] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [visibleImage, setVisibleImage] = useState(false);
    const [trazabilidad, setTrazabilidad] = useState(null); // Estado para almacenar la trazabilidad
    // Ordenar bienes por fecha de más nuevo a más antiguo
    
    
    const userData = JSON.parse(localStorage.getItem('userData'));
    const isAdmin = userData?.rolDefinitivo === 'admin';
    
    // Redirige si no es admin
    useEffect(() => {
        if (!isAdmin) {
            notification.error({
                message: 'Acción no permitida',
                description: 'Solo los administradores pueden gestionar bienes.',
            });
            navigate('/home');
        }
    }, [isAdmin, navigate]);
    
    useEffect(() => {
        dispatch(fetchAllBienes());
    }, [dispatch]);

    // Obtener trazabilidad de un bien
    const obtenerTrazabilidad = async (uuid) => {
        try {
            const response = await fetch(`http://localhost:5005/bienes/trazabilidad/${uuid}`);
            if (!response.ok) {
                throw new Error('Error al obtener la trazabilidad.');
            }
            const data = await response.json();
            setTrazabilidad(data); // Guardar la trazabilidad en el estado
            console.log('Trazabilidad:', data);
        } catch (error) {
            console.error('Error al obtener trazabilidad:', error);
            notification.error({
                message: 'Error',
                description: 'Hubo un problema al obtener la trazabilidad.',
            });
        }
    };
    
    const handleBienClick = (bien) => {
        setSelectedBien(bien); // Guardar el bien seleccionado en el estado
        if (bien && bien.uuid) { // Verificar que el bien y su uuid existan
            obtenerTrazabilidad(bien.uuid); // Usar el uuid correcto
            navigate(`/bienes/trazabilidad/${bien.uuid}`); // Navegar usando el uuid
        } else {
            // Manejar el caso donde no hay uuid disponible
            notification.error({
                message: 'Error',
                description: 'El bien seleccionado no tiene un identificador válido.',
            });
        }
    };
    


    const closeModal = () => {
        setSelectedBien(null);
    };
    
    const handleLogout = () => {
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
        return (
            <div className="text-center mt-10">
                <h2 className="text-red-500 text-2xl font-bold">Error al cargar los bienes</h2>
                <p className="text-gray-500">{error}</p>
                <button
                    onClick={() => navigate('/home')}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                    Ir al inicio
                </button>
            </div>
        );
    }
    
    if (!bienes || bienes.length === 0) {
        return (
            <div className="text-center mt-10">
                <h2 className="text-gray-700 text-2xl font-bold">No hay bienes disponibles</h2>
                <p className="text-gray-500">Actualmente no hay bienes para mostrar.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                    Volver
                </button>
            </div>
        );
    }
    
    // Ordenar bienes por fecha de más nuevo a más antiguo

    const sortedBienes = [...bienes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const columns = [
        {
            title: 'Tipo',
            dataIndex: 'tipo',
            key: 'tipo',
        },
        {
            title: 'Modelo',
            dataIndex: 'modelo',
            key: 'modelo',
        },
        {
            title: 'Marca',
            dataIndex: 'marca',
            key: 'marca',
        },
        {
            title: 'Descripción',
            dataIndex: 'descripcion',
            key: 'descripcion',
        },
        {
            title: 'Precio',
            dataIndex: 'precio',
            key: 'precio',
            render: (text) => text ? `$${text}` : 'Sin precio',
        },
        {
            title: 'Cantidad en Stock',
            key: 'stock',
            render: (_, record) => record.stock ? record.stock.cantidad : 'Sin stock',
        },
        {
            title: 'Propietario',
            key: 'propietario',
            render: (_, record) =>
              record.propietario
                ? `${record.propietario.nombre} ${record.propietario.apellido}`
                : 'Sin propietario',
          },
          
        {
            title: 'Vendedor',
            key: 'vendedor',
            render: (_, record) =>
                record.transacciones && record.transacciones.length > 0 && record.transacciones[0].vendedorTransaccion
                    ? `${record.transacciones[0].vendedorTransaccion.nombre} ${record.transacciones[0].vendedorTransaccion.apellido}`
                    : 'No asignado',
        },
        {
            title: 'Comprador',
            key: 'comprador',
            render: (_, record) =>
                record.transacciones && record.transacciones.length > 0 && record.transacciones[0].compradorTransaccion
                    ? `${record.transacciones[0].compradorTransaccion.nombre} ${record.transacciones[0].compradorTransaccion.apellido}`
                    : 'No asignado',
        },
        {
            title: 'Fecha',
            dataIndex: 'createdAt',
            key: 'fecha',
            render: (text) => text ? new Date(text).toLocaleDateString() : 'Sin fecha',
        },
        {
            title: 'Foto',
            key: 'foto',
            render: (_, record) =>
                record.fotos && record.fotos.length > 0 ? (
                    <Image
                        src={record.fotos[0]}
                        alt="Foto del bien"
                        width={50}
                        preview={false}
                    />
                ) : 'Sin foto',
        },
        {
            title: 'Acción',
            key: 'action',
            render: (_, bien) => (
                <Button
                    type="primary"
                    onClick={() => handleBienClick(bien)}
                >
                    Ver Trazabilidad
                </Button>
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
                dataSource={sortedBienes}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
            />

            {/* Modal para mostrar la galería de imágenes */}
            <Modal open={visibleGallery} onCancel={closeGallery} footer={null} width={800}>
                <Carousel autoplay>
                    {selectedBien && selectedBien.fotos && selectedBien.fotos.map((foto, index) => (
                        <div key={index}>
                            <img
                                src={foto}
                                alt={`Foto ${index + 1}`}
                                style={{ width: '100%', height: 'auto', cursor: 'pointer' }}
                                onClick={() => openImage(foto)}
                            />
                        </div>
                    ))}
                </Carousel>
            </Modal>

            {/* Modal para mostrar la trazabilidad del bien */}
            {trazabilidad && (
                <Modal open={true} onCancel={() => setTrazabilidad(null)} footer={null}>
                    <h3>Trazabilidad del Bien</h3>
                    <pre>{JSON.stringify(trazabilidad, null, 2)}</pre> {/* Muestra la trazabilidad */}
                </Modal>
            )}
        </div>
    );
};

export default BienList;
