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
                    const transaccionesObtenidas = await obtenerTransacciones(usuarioActual.uuid);
                    console.log('📌 Transacciones obtenidas en el frontend:', transaccionesObtenidas); // 🔍 Agregar log
                    setTransacciones(transaccionesObtenidas);
                } else {
                    throw new Error('No se encontró el usuario actual en localStorage.');
                }
            } catch (error) {
                console.error('❌ Error al obtener transacciones:', error);
                setError(error.message || 'Error al cargar las transacciones.');
            } finally {
                setLoading(false);
            }
        };
    
        cargarTransacciones();
    }, [usuarioActual?.uuid]);
    
    
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
    

 // Función auxiliar para detectar si es un Teléfono Móvil
const esTelefonoMovil = (tipo) => {
    if (!tipo) return false;
    const lower = tipo.toLowerCase();
    return lower.includes('teléfono') && (lower.includes('móvil') || lower.includes('movil'));
};

// Función auxiliar para renderizar las imágenes
// Función segura para renderizar imágenes
// CORRECCIÓN DEFINITIVA
const renderImagen = (text, record) => {
    // Ajustamos el acceso a fotos según la estructura correcta
    const fotosBien = Array.isArray(record.bienTransaccion?.fotos) 
                      ? record.bienTransaccion.fotos 
                      : [];

    const fotosIMEIs = Array.isArray(record.imeis)
                      ? record.imeis.map((imei) => imei.foto).filter(Boolean)
                      : [];

    const todasLasFotos = [...fotosBien, ...fotosIMEIs];

    return todasLasFotos.length > 0 ? (
        <Space>
            {todasLasFotos.map((foto, index) => (
                <Image
                    key={index}
                    width={80}
                    src={foto}
                    alt={`Imagen ${index + 1}`}
                    onError={(e) => {
                        e.target.src = '/images/placeholder.png';
                    }}
                />
            ))}
        </Space>
    ) : (
        <span>Sin imagen</span>
    );
};





// Función para renderizar IMEIs (se usa en ambas columnas)
const renderIMEI = (detalles, record) => {
    console.log("📌 Detalles del bien en renderIMEI:", detalles, "Record:", record);

    if (esTelefonoMovil(record.bienTransaccion?.tipo)) {
        return detalles && detalles.length > 0 ? (
            <ul>
                {detalles.map((detalle) => (
                    <li key={detalle.identificador_unico}>
                        {detalle.identificador_unico}{' '}
                        <span style={{ color: detalle.estado === 'vendido' ? 'red' : 'green' }}>
                            ({detalle.estado})
                        </span>
                    </li>
                ))}
            </ul>
        ) : (
            <span style={{ color: 'gray' }}>Sin identificadores</span>
        );
    }
    return 'N/A';
};

// Función para renderizar la información del usuario (Comprador/Vendedor)
const renderUsuario = (usuario) => {
    return (
        <span>
            {usuario?.nombre || 'Sin nombre'} {usuario?.apellido || ''} <br />
            DNI: {usuario?.dni || usuario?.cuit || 'Sin DNI/CUIT'} <br />
            Email: {usuario?.email || 'Sin email'} <br />
            Dirección: {renderDireccion(usuario?.direccion)}
        </span>
    );
};

// Columnas de compras
const columnsCompras = [
    { title: 'Imagen', key: 'imagen', render: renderImagen },
    { title: 'Descripción', dataIndex: ['bienTransaccion', 'descripcion'], key: 'descripcion' },
    { title: 'Marca', dataIndex: ['bienTransaccion', 'marca'], key: 'marca' },
    { title: 'Modelo', dataIndex: ['bienTransaccion', 'modelo'], key: 'modelo' },
    { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
    { title: 'IMEI Comprado', dataIndex: ['bienTransaccion', 'detalles'], key: 'imei', render: renderIMEI },
    { title: 'Vendedor', key: 'vendedor', render: (text, record) => renderUsuario(record.vendedorTransaccion) },
    { title: 'Fecha', key: 'fecha', render: (text, record) => new Date(record.fecha).toLocaleString() },
];

// Columnas de ventas
const columnsVentas = [
    { title: 'Imagen', key: 'imagen', render: renderImagen },
    { title: 'Descripción', dataIndex: ['bienTransaccion', 'descripcion'], key: 'descripcion' },
    { title: 'Marca', dataIndex: ['bienTransaccion', 'marca'], key: 'marca' },
    { title: 'Modelo', dataIndex: ['bienTransaccion', 'modelo'], key: 'modelo' },
    { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
    { title: 'IMEI Vendido', dataIndex: ['bienTransaccion', 'detalles'], key: 'imei', render: renderIMEI },
    { title: 'Comprador', key: 'comprador', render: (text, record) => renderUsuario(record.compradorTransaccion) },
    { title: 'Fecha', key: 'fecha', render: (text, record) => new Date(record.fecha).toLocaleString() },
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
