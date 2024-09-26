import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBienes } from '../redux/actions/bienes';
import { Table, Image, Typography, Spin, Alert, Button, Space } from 'antd';
import { LeftOutlined, HomeOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
};

const Inventario = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [reload, setReload] = useState(false); // Nuevo estado para recargar
    const { items, error, loading } = useSelector(state => state.bienes);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const userId = userData?.id;

        if (userId) {
            dispatch(fetchBienes(userId));
        } else {
            console.error('ID del usuario no encontrado en localStorage');
        }
    }, [dispatch, reload]); // Añadir 'reload' a las dependencias

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
        setReload(!reload); // Alternar el estado para forzar la recarga
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

    const columns = [
       
        { title: 'Descripción', dataIndex: ['bien', 'descripcion'], key: 'descripcion', render: text => text || 'N/A' },
        { title: 'Precio', dataIndex: ['bien', 'precio'], key: 'precio', render: text => text || 'N/A' },
        { title: 'Fecha', dataIndex: 'fecha', key: 'fecha', render: text => text ? formatDate(text) : 'N/A' },
        { title: 'Foto', dataIndex: 'foto', key: 'foto', render: text => text ? <Image src={text} width={50} preview={false} /> : 'No disponible' },
        { title: 'Tipo', dataIndex: 'tipo', key: 'tipo', render: text => text || 'N/A' },
        { title: 'Marca', dataIndex: 'marca', key: 'marca', render: text => text || 'N/A' },
        { title: 'Modelo', dataIndex: 'modelo', key: 'modelo', render: text => text || 'N/A' },
        { title: 'IMEI', dataIndex: 'imei', key: 'imei', render: text => text || 'N/A' },
        { title: 'Stock', dataIndex: 'stock', key: 'stock', render: text => text || 'N/A' },
        { title: 'Creado', dataIndex: 'createdAt', key: 'createdAt', render: text => text ? formatDate(text) : 'N/A' },
        { title: 'Actualizado', dataIndex: 'updatedAt', key: 'updatedAt', render: text => text ? formatDate(text) : 'N/A' },
    ];

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Button icon={<LeftOutlined />} onClick={handleBack}>Volver</Button>
                <Button icon={<HomeOutlined />} onClick={handleHome}>Home</Button>
                <Button icon={<LogoutOutlined />} onClick={handleLogout} danger>Cerrar sesión</Button>
                <Button onClick={handleBienAgregado}>Recargar Bienes</Button> {/* Botón para recargar */}
            </Space>
            <Title level={2}>Inventario</Title>
            <Table dataSource={items} columns={columns} rowKey="id" />
        </div>
    );
};

export default Inventario;
