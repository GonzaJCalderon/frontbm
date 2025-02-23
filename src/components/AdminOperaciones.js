import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransaccionesByAdmin, fetchUsuarios } from '../redux/actions/usuarios';
import { Button, Table, Image, Space, Typography, Spin, Alert } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, LogoutOutlined, HomeOutlined } from '@ant-design/icons';

const { Title } = Typography;

const AdminOperaciones = () => {
    const { uuid } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { transacciones, loading, error, usuarios } = useSelector(state => state.usuarios || {});

    const [paginaCompras, setPaginaCompras] = useState(1);
    const [paginaVentas, setPaginaVentas] = useState(1);
    const transaccionesPorPagina = 10;

    useEffect(() => {
        if (uuid) {
            dispatch(fetchUsuarios());
            dispatch(fetchTransaccionesByAdmin(uuid));
        }
    }, [dispatch, uuid]);

    const transaccionesArray = Array.isArray(transacciones) ? transacciones : [];

    // Separar las transacciones en compras y ventas
    const compras = transaccionesArray
        .filter(transaccion => transaccion.comprador_uuid === uuid)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    const ventas = transaccionesArray
        .filter(transaccion => transaccion.vendedor_uuid === uuid)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    // Función para renderizar la dirección
    const renderDireccion = (direccion) => {
        return direccion ? `${direccion.calle}, ${direccion.altura}, ${direccion.barrio}, ${direccion.departamento}` : 'Sin dirección';
    };

    // Función auxiliar para detectar si es un Teléfono Móvil
    const esTelefonoMovil = (tipo) => {
        if (!tipo) return false;
        const lower = tipo.toLowerCase();
        return lower.includes('teléfono') && (lower.includes('móvil') || lower.includes('movil'));
    };

    // Función para renderizar las imágenes, incluyendo fotos de IMEIs si el bien es un teléfono móvil
    const renderImagen = (text, record) => {
        let fotos = record.bienTransaccion?.fotos || [];

        if (esTelefonoMovil(record.bienTransaccion?.tipo) && record.bienTransaccion?.detalles) {
            const fotosIMEIs = record.bienTransaccion.detalles
                .map((det) => det.foto)
                .filter((url) => url);
            fotos = [...fotos, ...fotosIMEIs]; 
        }

        return fotos.length > 0 ? (
            <Space>
                {fotos.map((foto, index) => (
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

    // Configurar las columnas de las tablas
    const columnsCompras = [
        { title: 'Imagen', key: 'imagen', render: renderImagen },
        { title: 'Descripción', dataIndex: ['bienTransaccion', 'descripcion'], key: 'descripcion' },
        { title: 'Marca', dataIndex: ['bienTransaccion', 'marca'], key: 'marca' },
        { title: 'Modelo', dataIndex: ['bienTransaccion', 'modelo'], key: 'modelo' },
        { title: 'Tipo', dataIndex: ['bienTransaccion', 'tipo'], key: 'tipo' },
        { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
        {
            title: 'Vendedor',
            render: (text, record) => (
                <span>
                    {record.vendedorTransaccion?.nombre} {record.vendedorTransaccion?.apellido} <br />
                    DNI: {record.vendedorTransaccion?.dni} <br />
                    CUIT: {record.vendedorTransaccion?.cuit} <br />
                    Email: {record.vendedorTransaccion?.email} <br />
                    Dirección: {renderDireccion(record.vendedorTransaccion?.direccion)}
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
        { title: 'Imagen', key: 'imagen', render: renderImagen },
        { title: 'Descripción', dataIndex: ['bienTransaccion', 'descripcion'], key: 'descripcion' },
        { title: 'Marca', dataIndex: ['bienTransaccion', 'marca'], key: 'marca' },
        { title: 'Modelo', dataIndex: ['bienTransaccion', 'modelo'], key: 'modelo' },
        { title: 'Tipo', dataIndex: ['bienTransaccion', 'tipo'], key: 'tipo' },
        { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
        {
            title: 'Comprador',
            render: (text, record) => (
                <span>
                    {record.compradorTransaccion?.nombre} {record.compradorTransaccion?.apellido} <br />
                    DNI: {record.compradorTransaccion?.dni} <br />
                    CUIT: {record.compradorTransaccion?.cuit} <br />
                    Email: {record.compradorTransaccion?.email} <br />
                    Dirección: {renderDireccion(record.compradorTransaccion?.direccion)}
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

    const usuario = usuarios.find(u => u.uuid === uuid);
    const nombreCompleto = usuario
        ? `${usuario.nombre || 'Sin nombre'} ${usuario.apellido || ''}`.trim()
        : 'Sin nombre';

    if (loading) {
        return <Spin tip="Cargando..." />;
    }

    if (error) {
        return <Alert message="Error" description={error} type="error" />;
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <Space style={{ marginBottom: 16 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Volver</Button>
                <Button icon={<HomeOutlined />} onClick={() => navigate('/admin/dashboard')}>Inicio</Button>
                <Button
                    type="primary"
                    icon={<LogoutOutlined />}
                    onClick={() => {
                        localStorage.removeItem('token');
                        navigate('/home');
                    }}
                    danger
                >
                    Cerrar Sesión
                </Button>
            </Space>

            <Title level={2}>Operaciones de {nombreCompleto}</Title>

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
                    rowKey="uuid"
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
                    rowKey="uuid"
                />
            </div>
        </div>
    );
};

export default AdminOperaciones;
