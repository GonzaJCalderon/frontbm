import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllBienes,deleteBien } from '../redux/actions/bienes';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaHome, FaArrowLeft } from 'react-icons/fa';
import { Table, Image, Modal, Carousel, Button, Spin } from 'antd';
import { notification } from 'antd';

const BienList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items: bienes, error } = useSelector(state => state.bienes);
    const [selectedBien, setSelectedBien] = useState(null);
    const [visibleGallery, setVisibleGallery] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [visibleImage, setVisibleImage] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Estado para manejar el loading

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
        const loadBienes = async () => {
            setIsLoading(true); // Activa el estado de carga
            try {
                await dispatch(fetchAllBienes()); // Llama a la acción para cargar bienes
            } catch (error) {
                console.error('Error al cargar los bienes:', error);
            } finally {
                setIsLoading(false); // Desactiva el estado de carga
            }
        };
    
        loadBienes(); // Ejecuta la función de carga
    }, [dispatch]);
    

     // Configuración de baseURL usando las variables de entorno
     const baseURL =
     process.env.REACT_APP_DB_USE === 'remote'
         ? process.env.REACT_APP_API_URL_REMOTE || 'http://10.100.1.80:5005'
         : process.env.REACT_APP_API_URL_LOCAL || 'http://localhost:5005';
 
 

    // Obtener trazabilidad de un bien
    const obtenerTrazabilidad = async (uuid) => {
        if (!baseURL) {
            console.error('BaseURL no definida. Esto no debería ocurrir.');
            notification.error({
                message: 'Error',
                description: 'La configuración del servidor no está definida correctamente.',
            });
            return;
        }
    
        try {
            const response = await fetch(`${baseURL}/bienes/trazabilidad/${uuid}`);
    
            if (!response.ok) {
                const errorMessage = await response.text();
                console.error(`Error al obtener trazabilidad: ${response.status} - ${errorMessage}`);
                throw new Error(`Error al obtener trazabilidad: ${errorMessage}`);
            }
    
            const data = await response.json();
            setTrazabilidad(data);
            console.log('Trazabilidad obtenida:', data);
        } catch (error) {
            console.error('Error al obtener trazabilidad:', error.message || error);
            notification.error({
                message: 'Error',
                description: error.message || 'Hubo un problema al obtener la trazabilidad.',
            });
        }
    };
    
    const handleEditBien = (bien) => {
        // Navegar a la página de edición con el ID del bien
        navigate(`/bienes/edit/${bien.uuid}`);
    };
    
    const handleDeleteBien = async (bien) => {
        const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este bien?');
        if (!confirmDelete) return;
      
        try {
          await dispatch(deleteBien(bien.uuid));
          notification.success({ message: 'Bien eliminado correctamente.' });
          dispatch(fetchAllBienes()); // Actualizar la lista después de eliminar
        } catch (error) {
          notification.error({
            message: 'Error',
            description: error.message || 'No se pudo eliminar el bien.',
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
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div>
                    <Spin size="large" />
                    <p className="mt-4 text-xl text-gray-700">Cargando bienes, por favor espera...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="text-center mt-10">
                <h2 className="text-red-500 text-2xl font-bold">Error al cargar los bienes</h2>
                <p className="text-gray-500">{error}</p>
               

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
            render: (_, record) => record.stock && record.stock.cantidad ? String(record.stock.cantidad) : 'Sin stock',
        }
        ,
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
                <div className="flex space-x-2">
                    <Button
                        type="primary"
                        onClick={() => handleBienClick(bien)}
                        style={{ background: '#1890ff', borderColor: '#1890ff' }}
                    >
                        Ver Trazabilidad
                    </Button>
                    {isAdmin && (
                        <>
                            <Button
                                type="default"
                                onClick={() => handleEditBien(bien)}
                                style={{
                                    background: '#ffc107', // Color amarillo
                                    borderColor: '#ffc107',
                                    color: '#000',
                                }}
                            >
                                Editar
                            </Button>
                            <Button
                                type="primary"
                                danger
                                onClick={() => handleDeleteBien(bien)}
                            >
                                Eliminar
                            </Button>
                        </>
                    )}
                </div>
            ),
        }
        
    ]
    
    

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
