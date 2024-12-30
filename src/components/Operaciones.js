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
    const renderOrDefault = (value, defaultValue = 'No disponible') => (value ? value : defaultValue);
    


useEffect(() => {
    const cargarTransacciones = async () => {
        setLoading(true);
        try {
            if (usuarioActual && usuarioActual.uuid) {
                const transaccionesObtenidas = await obtenerTransacciones(usuarioActual.uuid); // Cambiado a uuid
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
}, [usuarioActual?.uuid]); // Cambiado a uuid
    
    const transaccionesArray = Array.isArray(transacciones) ? transacciones : [];
    const compras = transaccionesArray.filter(
        (transaccion) => transaccion.compradorTransaccion?.uuid === usuarioActual?.uuid
    ).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    const ventas = transaccionesArray.filter(
        (transaccion) => transaccion.vendedorTransaccion?.uuid === usuarioActual?.uuid
    ).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    const renderDireccion = (direccion) => {
        return direccion ? `${direccion.calle}, ${direccion.altura}, ${direccion.barrio}, ${direccion.departamento}` : 'Sin dirección';
    };
    

    const columnsCompras = [
        {
            title: 'Imagen',
            key: 'imagen',
            render: (text, record) => {
                const fotos = record.fotos || [];
                return fotos.length > 0 ? (
                    fotos.map((url, index) => (
                        <Image
                            key={index}
                            width={80}
                            src={url}
                            alt={record?.bienTransaccion?.descripcion || 'Imagen del bien'}
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
        { title: 'Descripción', dataIndex: ['bienTransaccion', 'descripcion'], key: 'descripcion' },
        { title: 'Marca', dataIndex: ['bienTransaccion', 'marca'], key: 'marca' },
        { title: 'Modelo', dataIndex: ['bienTransaccion', 'modelo'], key: 'modelo' },
        { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
        {
            title: 'Vendedor',
            render: (text, record) => {
                const vendedor = record.vendedorTransaccion || {};
                return (
                    <span>
                        {vendedor.nombre || 'Sin nombre'} {vendedor.apellido || ''} <br />
                        DNI: {vendedor.dni || 'Sin DNI'} <br />
                        Email: {vendedor.email || 'Sin email'} <br />
                        Dirección: {renderDireccion(vendedor.direccion)}
                    </span>
                );
            },
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
            key: 'imagen',
            render: (text, record) => {
                const fotos = record.bienTransaccion?.fotos || []; // Accede correctamente a bienTransaccion.fotos
                return fotos.length > 0 ? (
                    fotos.map((url, index) => (
                        <Image
                            key={index}
                            width={80}
                            src={url}
                            alt={record?.bienTransaccion?.descripcion || 'Imagen del bien'}
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
        { title: 'Descripción', dataIndex: ['bienTransaccion', 'descripcion'], key: 'descripcion' },
        { title: 'Marca', dataIndex: ['bienTransaccion', 'marca'], key: 'marca' },
        { title: 'Modelo', dataIndex: ['bienTransaccion', 'modelo'], key: 'modelo' },
        { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
        {
            title: 'Comprador',
            render: (text, record) => {
                const comprador = record.compradorTransaccion || {};
                return (
                    <span>
                        {comprador.nombre || 'Sin nombre'} {comprador.apellido || ''} <br />
                        DNI: {comprador.dni || comprador.cuit || 'Sin DNI/CUIT'} <br />
                        Email: {comprador.email || 'Sin email'} <br />
                        Dirección: {renderDireccion(comprador.direccion)}
                    </span>
                );
            },
            key: 'comprador',
        },
        {
            title: 'Fecha',
            render: (text, record) => new Date(record.fecha).toLocaleString(),
            key: 'fecha',
        },
    ];
    

    const handleBack = () => navigate(-1);
    const handleHome = () => navigate('/user/dashboard');
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
                        description="Parece que aún no has realizado ninguna compra o venta."
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
