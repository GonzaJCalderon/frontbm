import React, { useEffect, useState } from 'react';
import { Button, Table, Image, Space, Typography, Spin, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { obtenerTransacciones } from '../redux/actions/usuarios';
import { LeftOutlined, HomeOutlined, LogoutOutlined } from '@ant-design/icons';

const { Title } = Typography;

const OperacionesUsuario = () => {
    const navigate = useNavigate();
    const localStorageData = JSON.parse(localStorage.getItem('userData'));
    const usuarioActual = localStorageData || null;

    const [transacciones, setTransacciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paginaCompras, setPaginaCompras] = useState(1);
    const [paginaVentas, setPaginaVentas] = useState(1);
    const transaccionesPorPagina = 10;

    useEffect(() => {
        const cargarTransacciones = async () => {
            setLoading(true);
            try {
                if (usuarioActual && usuarioActual.id) {
                    const transaccionesObtenidas = await obtenerTransacciones(usuarioActual.id);
                    console.log('Transacciones obtenidas:', transaccionesObtenidas); // LOG PARA DEPURAR
                    setTransacciones(transaccionesObtenidas);
                } else {
                    throw new Error('No se encontró el usuario actual en localStorage.');
                }
            } catch (error) {
                console.error('Error al obtener transacciones:', error);
                setError(error.message || 'Error al cargar las transacciones.');
            } finally {
                setLoading(false);
            }
        };
    
        cargarTransacciones();
    }, [usuarioActual?.id]);
    

    const transaccionesArray = Array.isArray(transacciones) ? transacciones : [];

    const compras = transaccionesArray.filter(
        (transaccion) => transaccion.compradorId === usuarioActual?.id
    );

    const ventas = transaccionesArray.filter(
        (transaccion) => transaccion.vendedorId === usuarioActual?.id
    );

    const columns = [
        {
            title: 'Imagen',
            dataIndex: ['bien', 'foto'],
            key: 'imagen',
            render: (text, record) =>
                Array.isArray(record.bien?.foto) && record.bien.foto.length > 0 ? (
                    record.bien.foto.map((url, index) => (
                        <Image
                            key={index}
                            width={80}
                            src={url} // URL completa desde Cloudinary o servidor
                            alt={record.bien.descripcion || 'Imagen del bien'}
                            onError={(e) => {
                                e.target.src = '/images/placeholder.png'; // Imagen por defecto
                            }}
                        />
                    ))
                ) : (
                    <span>Sin imagen</span>
                ),
        },
        { title: 'Descripción', dataIndex: ['bien', 'descripcion'], key: 'descripcion' },
        { title: 'Marca', dataIndex: ['bien', 'marca'], key: 'marca' },
        { title: 'Modelo', dataIndex: ['bien', 'modelo'], key: 'modelo' },
        { title: 'Tipo', dataIndex: ['bien', 'tipo'], key: 'tipo' },
        { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
        {
            title: 'Fecha',
            render: (text, record) => new Date(record.fecha).toLocaleString(),
            key: 'fecha',
        },
    ];

    const handleBack = () => navigate(-1);
    const handleHome = () => navigate('/userdashboard');
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/home');
    };

    if (loading) {
        return <Spin tip="Cargando..." />;
    }

    if (error) {
        return <Alert message="Error" description={error} type="error" />;
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <Space style={{ marginBottom: 16 }}>
                <Button icon={<LeftOutlined />} onClick={handleBack}>Volver</Button>
                <Button icon={<HomeOutlined />} onClick={handleHome}>Home</Button>
                <Button
                    type="primary"
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    danger
                >
                    Cerrar Sesión
                </Button>
            </Space>
            <Title level={2}>Operaciones de {usuarioActual?.nombre || 'Usuario'}</Title>

            <div>
                <Title level={3}>Compras</Title>
                <Table
                    columns={columns}
                    dataSource={compras}
                    pagination={{
                        current: paginaCompras,
                        pageSize: transaccionesPorPagina,
                        total: compras.length,
                        onChange: (page) => setPaginaCompras(page),
                    }}
                    rowKey="id"
                />

                <Title level={3} style={{ marginTop: '32px' }}>Ventas</Title>
                <Table
                    columns={columns}
                    dataSource={ventas}
                    pagination={{
                        current: paginaVentas,
                        pageSize: transaccionesPorPagina,
                        total: ventas.length,
                        onChange: (page) => setPaginaVentas(page),
                    }}
                    rowKey="id"
                />
            </div>
        </div>
    );
};

export default OperacionesUsuario;
