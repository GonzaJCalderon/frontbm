import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransaccionesByAdmin, fetchUsuarios } from '../redux/actions/usuarios'; 
import { Table, Button } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, LogoutOutlined } from '@ant-design/icons';

const AdminOperaciones = () => {
    const { userId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { transacciones = {}, loading, error, usuarios = [] } = useSelector(state => state.usuarios || {});
    const { bienesComprados = [], bienesVendidos = [] } = transacciones;

    // Verificar que el userId esté presente
    useEffect(() => {
        if (userId) {
            dispatch(fetchUsuarios()); // Cargar usuarios primero
            dispatch(fetchTransaccionesByAdmin(userId)); // Luego cargar transacciones
        }
    }, [dispatch, userId]);

    // Obtener el nombre y apellido del usuario consultado
    const usuario = usuarios.find(u => u.id === parseInt(userId));
    const nombreCompleto = usuario ? `${usuario.nombre || 'Sin nombre'} ${usuario.apellido || ''}`.trim() : 'Sin nombre';

    // Debug: Verificar el usuario encontrado
    console.log('Usuario encontrado:', usuario);

    // Columnas para la tabla de compras
    const columnsCompras = [
        {
            title: 'Bien',
            dataIndex: 'bien',
            key: 'descripcion',
            render: (bien) => bien?.descripcion || 'Sin descripción',
        },
        {
            title: 'Fecha',
            dataIndex: 'fecha',
            key: 'fecha',
            render: fecha => new Date(fecha).toLocaleDateString(),
        },
        {
            title: 'Cantidad',
            dataIndex: 'cantidad',
            key: 'cantidad',
        },
        {
            title: 'Vendedor',
            key: 'vendedor',
            render: (text, record) => {
                const vendedor = record.vendedor;
                return `${vendedor?.nombre || 'Sin nombre'} ${vendedor?.apellido || ''}`.trim();
            },
        },
        {
            title: 'DNI/CUIT Vendedor',
            key: 'dniVendedor',
            render: (text, record) => record.vendedor.dni || 'Sin DNI/CUIT',
        },
        {
            title: 'Email Vendedor',
            key: 'emailVendedor',
            render: (text, record) => record.vendedor.email || 'Sin email',
        },
        {
            title: 'Dirección Vendedor',
            key: 'direccionVendedor',
            render: (text, record) => record.vendedor.direccion || 'Sin dirección',
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
            title: 'Código Único de identificación de operación',
            dataIndex: 'uuid',
            key: 'uuid',
        },
    ];

    // Columnas para la tabla de ventas
    const columnsVentas = [
        {
            title: 'Bien',
            dataIndex: 'bien',
            key: 'descripcion',
            render: (bien) => bien?.descripcion || 'Sin descripción',
        },
        {
            title: 'Fecha',
            dataIndex: 'fecha',
            key: 'fecha',
            render: fecha => new Date(fecha).toLocaleDateString(),
        },
        {
            title: 'Cantidad',
            dataIndex: 'cantidad',
            key: 'cantidad',
        },
        {
            title: 'Comprador',
            key: 'comprador',
            render: (text, record) => {
                const comprador = record.comprador;
                return `${comprador?.nombre || 'Sin nombre'} ${comprador?.apellido || ''}`.trim();
            },
        },
        {
            title: 'DNI/CUIT Comprador',
            key: 'dniComprador',
            render: (text, record) => record.comprador.dni || 'Sin DNI/CUIT',
        },
        {
            title: 'Email Comprador',
            key: 'emailComprador',
            render: (text, record) => record.comprador.email || 'Sin email',
        },
        {
            title: 'Dirección Comprador',
            key: 'direccionComprador',
            render: (text, record) => record.comprador.direccion || 'Sin dirección',
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
            title: 'Código Único de identificación de operación',
            dataIndex: 'uuid',
            key: 'uuid',
        },
    ];

    const datosComprados = bienesComprados.map(item => ({
        id: item.id,
        uuid: item.uuid,
        fecha: item.fecha,
        monto: item.monto,
        cantidad: item.cantidad,
        estado: item.estado,
        metodoPago: item.metodoPago,
        vendedor: {
            nombre: item.vendedor?.nombre || 'Sin nombre',
            apellido: item.vendedor?.apellido || '',
            dni: item.vendedor?.dni || 'Sin DNI/CUIT',
            email: item.vendedor?.email || 'Sin email',
            direccion: item.vendedor?.direccion || 'Sin dirección',
        },
        bien: item.bien,
        comprador: {
            nombre: item.comprador?.nombre || 'Sin nombre',
            apellido: item.comprador?.apellido || '',
            dni: item.comprador?.dni || 'Sin DNI/CUIT',
            email: item.comprador?.email || 'Sin email',
            direccion: item.comprador?.direccion || 'Sin dirección',
        }
    }));

    const datosVendidos = bienesVendidos.map(item => ({
        id: item.id,
        uuid: item.uuid,
        fecha: item.fecha,
        monto: item.monto,
        cantidad: item.cantidad,
        estado: item.estado,
        metodoPago: item.metodoPago,
        comprador: {
            nombre: item.comprador?.nombre || 'Sin nombre',
            apellido: item.comprador?.apellido || 'Sin apellido',
            dni: item.comprador?.dni || 'Sin DNI/CUIT',
            email: item.comprador?.email || 'Sin email',
            direccion: item.comprador?.direccion || 'Sin dirección',
        },
        bien: item.bien,
        vendedor: {
            nombre: item.vendedor?.nombre || 'Sin nombre',
            apellido: item.vendedor?.apellido || 'Sin apellido',
            dni: item.vendedor?.dni || 'Sin DNI/CUIT',
            email: item.vendedor?.email || 'Sin email',
            direccion: item.vendedor?.direccion || 'Sin dirección',
        },
    }));

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-4">
                <Button
                    type="primary"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                >
                    Volver
                </Button>
                <Button
                    type="primary"
                    icon={<LogoutOutlined />}
                    onClick={() => {
                        localStorage.removeItem('token');
                        navigate('/login');
                    }}
                >
                    Cerrar Sesión
                </Button>
            </div>

            <h1 className="text-2xl font-bold mb-4">Operaciones de {nombreCompleto}</h1>
            
            {loading ? (
                <div className="text-center">Cargando...</div>
            ) : (
                <>
                    <h2 className="text-xl font-bold mb-2">Compras</h2>
                    <Table
                        columns={columnsCompras}
                        dataSource={datosComprados}
                        rowKey="id"
                        pagination={{ pageSize: 5 }}
                    />

                    <h2 className="text-xl font-bold mb-2">Ventas</h2>
                    <Table
                        columns={columnsVentas}
                        dataSource={datosVendidos}
                        rowKey="id"
                        pagination={{ pageSize: 5 }}
                    />
                </>
            )}
        </div>
    );
};

export default AdminOperaciones;
