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
    const [filteredItems, setFilteredItems] = useState([]);
    const { items = [], error, loading } = useSelector(state => state.bienes);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const userId = userData?.id;

        if (userId) {
            dispatch(fetchBienes(userId));
        } else {
            console.error('ID del usuario no encontrado en localStorage');
        }
    }, [dispatch]);

    useEffect(() => {
        // Ordenar los bienes por fecha de creación, de más nuevo a más antiguo
        const sortedItems = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setFilteredItems(sortedItems);
    }, [items]);

    const handleSearch = (value) => {
        const lowercasedValue = value.toLowerCase();
        const filtered = items.filter(item =>
            (item.tipo && item.tipo.toLowerCase().includes(lowercasedValue)) ||
            (item.marca && item.marca.toLowerCase().includes(lowercasedValue)) ||
            (item.modelo && item.modelo.toLowerCase().includes(lowercasedValue))
        );
        // Ordenar los resultados filtrados por fecha de creación
        const sortedFiltered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setFilteredItems(sortedFiltered);
    };

    const handleBack = () => navigate(-1);
    const handleHome = () => navigate('/userdashboard');
    const handleLogout = () => {
        localStorage.removeItem('userData');
        navigate('/home');
    };

    const handleBienAgregado = () => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const userId = userData?.id;
    
        if (userId) {
            dispatch(fetchBienes(userId));
        }
    };

    if (error) {
        const errorMessage = error.message || 'Ocurrió un error desconocido';
        return <Alert message="Error" description={errorMessage} type="error" />;
    }

    if (loading) {
        return <Spin tip="Cargando..." />;
    }

    if (!filteredItems.length) {
        return <div>No hay bienes disponibles.</div>;
    }

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
            sorter: (a, b) => a.precio - b.precio,
        },
        {
            title: 'Fecha',
            dataIndex: 'createdAt',
            key: 'fecha',
            render: text => text ? formatDate(text) : 'N/A',
            sorter: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        },
        {
            title: 'Foto',
            dataIndex: 'foto',
            key: 'foto',
            render: fotos => (
                Array.isArray(fotos) && fotos.length > 0 ? (
                    fotos.map((url, index) => (
                        <Image
                            key={index}
                            src={url} 
                            width={50}
                            preview={{ src: url }} 
                            onError={(e) => {
                                console.error('Error al cargar la imagen:', e.target.src);
                                e.target.src = '/images/defecto.jpg'; 
                            }}
                            alt="Imagen del bien"
                        />
                    ))
                ) : (
                    <span>No disponible</span>
                )
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
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default Inventario;
