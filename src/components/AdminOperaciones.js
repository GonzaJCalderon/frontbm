import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransaccionesByAdmin, fetchUsuarios } from '../redux/actions/usuarios';
import { Button, Table, Image } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, LogoutOutlined } from '@ant-design/icons';

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

    // Configurar las columnas de las tablas
    const columnsCompras = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        {
            title: 'Imagen',
            dataIndex: ['bien', 'imagen'],
            key: 'imagen',
            render: (text, record) => <Image width={80} src={record.bien.imagen} alt={record.bien.descripcion} />
        },
        { title: 'Descripción del Bien', dataIndex: ['bien', 'descripcion'], key: 'descripcion' },
        { title: 'Marca', dataIndex: ['bien', 'marca'], key: 'marca' },
        { title: 'Modelo', dataIndex: ['bien', 'modelo'], key: 'modelo' },
        { title: 'Tipo', dataIndex: ['bien', 'tipo'], key: 'tipo' },
        { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
        { title: 'Estado', dataIndex: 'estado', key: 'estado' },
        {
            title: 'Vendedor',
            render: (text, record) => `${record.vendedor.nombre} ${record.vendedor.apellido}`,
            key: 'vendedor',
        },
        {
            title: 'Fecha',
            render: (text, record) => new Date(record.fecha).toLocaleString(),
            key: 'fecha',
        },
    ];

    const columnsVentas = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        {
            title: 'Imagen',
            dataIndex: ['bien', 'imagen'],
            key: 'imagen',
            render: (text, record) => <Image width={80} src={record.bien.imagen} alt={record.bien.descripcion} />
        },
        { title: 'Descripción del Bien', dataIndex: ['bien', 'descripcion'], key: 'descripcion' },
        { title: 'Marca', dataIndex: ['bien', 'marca'], key: 'marca' },
        { title: 'Modelo', dataIndex: ['bien', 'modelo'], key: 'modelo' },
        { title: 'Tipo', dataIndex: ['bien', 'tipo'], key: 'tipo' },
        { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
        { title: 'Estado', dataIndex: 'estado', key: 'estado' },
        {
            title: 'Comprador',
            render: (text, record) => `${record.comprador.nombre} ${record.comprador.apellido}`,
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

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-4">
                <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                    Volver
                </Button>
                <Button type="primary" icon={<LogoutOutlined />} onClick={() => {
                    localStorage.removeItem('token');
                    navigate('/home');
                }}>
                    Cerrar Sesión
                </Button>
            </div>

            <h1 className="text-2xl font-bold mb-4">Operaciones de {nombreCompleto}</h1>

            {loading ? (
                <div className="text-center">Cargando...</div>
            ) : error ? (
                <div className="text-red-500 text-center">{error}</div>
            ) : (
                <div>
                    {/* Sección de Compras */}
                    <div>
                        <h2 className="text-xl font-bold mb-2">Compras</h2>
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
                    </div>

                    {/* Sección de Ventas */}
                    <div className="mt-8">
                        <h2 className="text-xl font-bold mb-2">Ventas</h2>
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
            )}
        </div>
    );
};

export default AdminOperaciones;
