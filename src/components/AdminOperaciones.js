import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransaccionesByAdmin, fetchUsuarios } from '../redux/actions/usuarios';
import { Button, Table, Image, Space, Typography, Spin, Alert } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, LogoutOutlined, HomeOutlined } from '@ant-design/icons';

const { Title } = Typography;

const AdminOperaciones = () => {
    const { userId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { transacciones, loading, error, usuarios } = useSelector(state => state.usuarios || {});

    const [paginaCompras, setPaginaCompras] = useState(1);
    const [paginaVentas, setPaginaVentas] = useState(1);
    const transaccionesPorPagina = 10;

    useEffect(() => {
        if (userId) {
            dispatch(fetchUsuarios());
            dispatch(fetchTransaccionesByAdmin(userId));
        }
    }, [dispatch, userId]);

    const transaccionesArray = Array.isArray(transacciones) ? transacciones : [];

    // Separar las transacciones en compras y ventas
    const compras = transaccionesArray
        .filter(transaccion => transaccion.compradorId === parseInt(userId))
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    const ventas = transaccionesArray
        .filter(transaccion => transaccion.vendedorId === parseInt(userId))
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    // Función para renderizar la dirección
    const renderDireccion = (direccion) => {
        return direccion ? `${direccion.calle}, ${direccion.altura}, ${direccion.barrio}, ${direccion.departamento}` : 'Sin dirección';
    };

    // Configurar las columnas de las tablas
    const columnsCompras = [
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

    const usuario = usuarios.find(u => u.id === parseInt(userId));
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

export default AdminOperaciones;
