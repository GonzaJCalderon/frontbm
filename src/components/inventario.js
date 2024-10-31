import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBienes } from '../redux/actions/bienes';
import { Table, Image, Typography, Spin, Alert, Button, Space, Input } from 'antd';
import { LeftOutlined, HomeOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Search } = Input;

const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
};

const Inventario = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [reload, setReload] = useState(false);
    const [filteredItems, setFilteredItems] = useState([]); // Para manejar el filtrado de bienes
    const { items = [], error, loading } = useSelector(state => state.bienes); // Asegúrate de que items siempre sea un array

    // Cargar bienes al montar el componente
    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const userId = userData?.id;

        if (userId) {
            dispatch(fetchBienes(userId));
        } else {
            console.error('ID del usuario no encontrado en localStorage');
        }
    }, [dispatch]);

    // Actualizar la lista filtrada cuando cambian los bienes
    useEffect(() => {
        setFilteredItems(items); // Inicialmente, mostrar todos los bienes
    }, [items]);

    // Función de búsqueda para filtrar por tipo, marca o modelo
    const handleSearch = (value) => {
        const lowercasedValue = value.toLowerCase();
        const filtered = items.filter(item =>
            (item.tipo && item.tipo.toLowerCase().includes(lowercasedValue)) ||
            (item.marca && item.marca.toLowerCase().includes(lowercasedValue)) ||
            (item.modelo && item.modelo.toLowerCase().includes(lowercasedValue))
        );
        setFilteredItems(filtered);
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleHome = () => {
        navigate('/userdashboard');
    };

    const handleLogout = () => {
        localStorage.removeItem('userData');
        navigate('/home');
    };

    const handleBienAgregado = () => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const userId = userData?.id;
    
        if (userId) {
            dispatch(fetchBienes(userId)); // Cargar bienes directamente
        }
    };
    
    

    // Manejo de errores
    if (error) {
        const errorMessage = error.message || 'Ocurrió un error desconocido'; // Acceder al mensaje del error
        return <Alert message="Error" description={errorMessage} type="error" />;
    }

    // Mostrar indicador de carga
    if (loading) {
        return <Spin tip="Cargando..." />;
    }

    // Mensaje cuando no hay bienes disponibles
    if (!filteredItems.length) {
        return <div>No hay bienes disponibles.</div>;
    }

    // Definición de las columnas de la tabla
    const columns = [
        {
            title: 'Descripción',
            dataIndex: 'descripcion',
            key: 'descripcion',
            render: text => text || 'N/A'
        },
        {
            title: 'Precio',
            dataIndex: 'precio',
            key: 'precio',
            render: text => text || 'N/A',
            sorter: (a, b) => a.precio - b.precio, // Ordenar por precio
        },
        {
            title: 'Fecha',
            dataIndex: 'createdAt',
            key: 'fecha',
            render: text => text ? formatDate(text) : 'N/A',
            sorter: (a, b) => new Date(b.createdAt) - new Date(a.createdAt), // Ordenar por fecha
        },
        {
            title: 'Foto',
            dataIndex: 'foto',
            key: 'foto',
            render: text => (
                text ? (
                    <Image
                        src={`http://localhost:5005/uploads/${text}`} // URL de la imagen
                        width={50}
                        preview={false}
                        onError={(e) => {
                            e.target.src = '/images/defecto.jpg'; // Cambia esta ruta a tu imagen por defecto
                        }}
                        
                        alt="Imagen del bien" // Mejora la accesibilidad
                    />
                ) : 'No disponible'
            )
            
        },
        {
            title: 'Tipo',
            dataIndex: 'tipo',
            key: 'tipo',
            render: text => text || 'N/A'
        },
        {
            title: 'Marca',
            dataIndex: 'marca',
            key: 'marca',
            render: text => text || 'N/A'
        },
        {
            title: 'Modelo',
            dataIndex: 'modelo',
            key: 'modelo',
            render: text => text || 'N/A'
        },
        {
            title: 'IMEI',
            dataIndex: 'imei',
            key: 'imei',
            render: text => text || 'N/A'
        },
        {
            title: 'Stock',
            dataIndex: 'stock',
            key: 'stock',
            render: text => text || 'N/A'
        }
    ];

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Button icon={<LeftOutlined />} onClick={handleBack}>Volver</Button>
                <Button icon={<HomeOutlined />} onClick={handleHome}>Home</Button>
                <Button icon={<LogoutOutlined />} onClick={handleLogout} danger>Cerrar sesión</Button>
                <Button onClick={handleBienAgregado}>Recargar Bienes</Button>
                <Search
                    placeholder="Buscar por tipo, marca o modelo"
                    onSearch={handleSearch}
                    style={{ width: 200 }}
                    enterButton
                />
            </Space>
            <Title level={2}>Inventario</Title>
            <Table
                dataSource={filteredItems}
                columns={columns}
                rowKey="uuid"
                pagination={{ pageSize: 10 }} // Mostrar 10 bienes por página
            />
        </div>
    );
};

export default Inventario;
