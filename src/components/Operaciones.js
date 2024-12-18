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
    ).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // Ordenar por fecha

    const ventas = transaccionesArray.filter(
        (transaccion) => transaccion.vendedorId === usuarioActual?.id
    ).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // Ordenar por fecha

    const renderDireccion = (direccion) => {
        return direccion ? `${direccion.calle}, ${direccion.altura}, ${direccion.barrio}, ${direccion.departamento}` : 'Sin dirección';
    };

    const columnsCompras = [
        {
            title: 'Imagen',
            dataIndex: ['bien', 'foto'],
            key: 'imagen',
            render: (text, record) => {
                console.log('Verificando fotos de compras:', record.bien.foto); // Debugging
    
                return Array.isArray(record.bien?.foto) && record.bien.foto.length > 0 ? (
                    record.bien.foto.map((url, index) => (
                        <Image
                            key={index}
                            width={80}
                            src={url}
                            alt={record.bien.descripcion || 'Imagen del bien'}
                            onError={(e) => {
                                e.target.src = '/images/placeholder.png';
                            }}
                        />
                    ))
                ) : (
                    <span>Sin imagen</span>
                );
            },
        },
        { title: 'Descripción', dataIndex: ['bien', 'descripcion'], key: 'descripcion' },
        { title: 'Marca', dataIndex: ['bien', 'marca'], key: 'marca' },
        { title: 'Modelo', dataIndex: ['bien', 'modelo'], key: 'modelo' },
        { title: 'Tipo', dataIndex: ['bien', 'tipo'], key: 'tipo' },
        { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
        {
            title: 'Vendedor',
            render: (text, record) => (
                <span>
                    {record.vendedor.nombre} {record.vendedor.apellido} <br />
                    DNI: {record.vendedor.dni} <br />
                    CUIT: {record.vendedor.cuit} <br />
                    Email: {record.vendedor.email} <br />
                    Dirección: {renderDireccion(record.vendedor.direccion)} <br />
                   
                </span>
            ),
            key: 'vendedor',
        },
        {
            title: 'Fecha',
            render: (text, record) => new Date(record.fecha).toLocaleString(),
            key: 'fecha',
        },
    ];

    const columnsVentas = [
        {
            title: 'Imagen',
            dataIndex: ['bien', 'foto'],
            key: 'imagen',
            render: (text, record) => {
                return Array.isArray(record.bien?.foto) && record.bien.foto.length > 0 ? (
                    record.bien.foto.map((url, index) => (
                        <Image
                            key={index}
                            width={80}
                            src={url}
                            alt={record.bien.descripcion || 'Imagen del bien'}
                            onError={(e) => {
                                e.target.src = '/images/placeholder.png';
                            }}
                        />
                    ))
                ) : (
                    <span>Sin imagen</span>
                );
            },
        },
        { title: 'Descripción', dataIndex: ['bien', 'descripcion'], key: 'descripcion' },
        { title: 'Marca', dataIndex: ['bien', 'marca'], key: 'marca' },
        { title: 'Modelo', dataIndex: ['bien', 'modelo'], key: 'modelo' },
        { title: 'Tipo', dataIndex: ['bien', 'tipo'], key: 'tipo' },
        { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
        {
            title: 'Comprador',
            render: (text, record) => (
                <span>
                    {record.comprador.nombre} {record.comprador.apellido} <br />
                    DNI: {record.comprador.dni} <br />
                    CUIT: {record.comprador.cuit} <br />
                    Email: {record.comprador.email} <br />
                    Dirección: {renderDireccion(record.comprador.direccion)} <br />
                    
                </span>
            ),
            key: 'comprador',
        },
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
    
    // En lugar de mostrar error, muestra un mensaje amigable si no hay transacciones
    if (transaccionesArray.length === 0) {
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
                    <Alert
                        message="¡Aún no tienes transacciones!"
                        description="Parece que aún no has realizado ninguna compra o venta. ¿Por qué no exploras los productos?"
                        type="info"
                        showIcon
                    />
                    <Button type="primary" onClick={handleBack} style={{ marginTop: 16 }}>
                        Volver
                    </Button>
                </div>
            </div>
        );
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
                    columns={columnsCompras}
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
                    columns={columnsVentas}
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
