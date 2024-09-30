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
    const [searchTerm, setSearchTerm] = useState(''); // Para manejar el término de búsqueda
    const { items, error, loading } = useSelector(state => state.bienes);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const userId = userData?.id;

        if (userId) {
            dispatch(fetchBienes(userId));
        } else {
            console.error('ID del usuario no encontrado en localStorage');
        }
    }, [dispatch, reload]);

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
        setReload(!reload); // Alternar el estado para recargar
    };

    if (error) {
        return <Alert message="Error" description={error} type="error" />;
    }

    if (loading) {
        return <Spin tip="Cargando..." />;
    }

    if (!items.length) {
        return <div>No hay bienes disponibles.</div>;
    }

    // Definición de las columnas con ordenación por fecha
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
                        src={`http://localhost:5000/uploads/${text}`}
                        width={50}
                        preview={false}
                        onError={(e) => { e.target.src = 'ruta/a/imagen/por/defecto.jpg'; }}
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
