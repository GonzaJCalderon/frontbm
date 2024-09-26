import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsuarioComprasVentas } from '../redux/actions/usuarios';
import { Table, Button, notification, message } from 'antd';
import { ArrowLeftOutlined, HomeOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const Operaciones = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { comprasVentas = {}, loading, error } = useSelector(state => state.usuarios || {});
    const { bienesComprados = [], bienesVendidos = [] } = comprasVentas;

    const loggedUser = JSON.parse(localStorage.getItem('userData'));
    const userId = loggedUser?.id;

    useEffect(() => {
        if (userId) {
            dispatch(fetchUsuarioComprasVentas(userId));
        } else {
            navigate('/home');
        }
    }, [dispatch, userId, navigate]);

    const columns = [
        {
            title: 'Descripción',
            dataIndex: 'bien.descripcion',
            key: 'descripcion',
            render: (text, record) => record.bien.descripcion,
        },
        {
            title: 'Marca',
            dataIndex: 'bien.marca',
            key: 'marca',
            render: (text, record) => record.bien.marca,
        },
        {
            title: 'Modelo',
            dataIndex: 'bien.modelo',
            key: 'modelo',
            render: (text, record) => record.bien.modelo,
        },
        {
            title: 'Fecha',
            dataIndex: 'fecha',
            key: 'fecha',
            render: fecha => new Date(fecha).toLocaleDateString(),
        },
        {
            title: 'Stock',
            dataIndex: 'cantidad',
            key: 'cantidad',
        },
        {
            title: 'Comprador',
            dataIndex: 'comprador',
            key: 'comprador',
            render: (comprador) => `${comprador.nombre} ${comprador.apellido}`,
        },
        {
            title: 'Vendedor',
            dataIndex: 'vendedor',
            key: 'vendedor',
            render: (vendedor) => `${vendedor.nombre} ${vendedor.apellido}`,
        },
        {
            title: 'Monto',
            dataIndex: 'monto',
            key: 'monto',
            render: monto => `$${monto.toLocaleString()}`,
        },
        {
            title: 'Método de Pago',
            dataIndex: 'metodoPago',
            key: 'metodoPago',
        },
        {
            title: 'Estado',
            dataIndex: 'estado',
            key: 'estado',
        },
    ];

    const datosComprados = bienesComprados.map(item => ({
        ...item,
    }));

    const datosVendidos = bienesVendidos.map(item => ({
        ...item,
    }));

    const handleBack = () => {
        navigate(-1);
    };

    const handleLogout = () => {
        message.success('Sesión cerrada exitosamente');
        localStorage.removeItem('userData');
        navigate('/home');
    };

    const handleHome = () => {
        navigate('/home');
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between mb-4">
                <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
                    Atrás
                </Button>
                <div className="flex space-x-4">
                    <Button icon={<HomeOutlined />} onClick={handleHome}>
                        Inicio
                    </Button>
                    <Button icon={<LogoutOutlined />} onClick={handleLogout}>
                        Cerrar Sesión
                    </Button>
                </div>
            </div>
            <h1 className="text-2xl font-bold mb-4">Operaciones</h1>
            {loading ? (
                <div className="text-center">Cargando...</div>
            ) : (
                <>
                    <h2 className="text-xl font-bold mb-2">Compras</h2>
                    {datosComprados.length > 0 ? (
                        <Table dataSource={datosComprados} columns={columns} rowKey="id" />
                    ) : (
                        <div>No hay compras disponibles.</div>
                    )}
                    <h2 className="text-xl font-bold mb-2 mt-4">Ventas</h2>
                    {datosVendidos.length > 0 ? (
                        <Table dataSource={datosVendidos} columns={columns} rowKey="id" />
                    ) : (
                        <div>No hay ventas disponibles.</div>
                    )}
                </>
            )}
            {error && <div className="text-red-500 mt-4"><p>Error: {error}</p></div>}
        </div>
    );
};

export default Operaciones;
