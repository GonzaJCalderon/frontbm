import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransaccionesByAdmin } from '../redux/actions/usuarios';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LogoutOutlined } from '@ant-design/icons';

const OperacionesUsuario = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { transacciones, loading, error, usuarioActual } = useSelector(state => state.usuarios || {});

    useEffect(() => {
        if (usuarioActual && usuarioActual.id) {
            dispatch(fetchTransaccionesByAdmin(usuarioActual.id)); // Para el usuario logueado
        }
    }, [dispatch, usuarioActual]);

    // Aseguramos que transacciones sea un array para evitar el error
    const compras = Array.isArray(transacciones) ? transacciones.filter(t => t.estado === 'comprado') : [];
    const ventas = Array.isArray(transacciones) ? transacciones.filter(t => t.estado === 'vendido') : [];

    useEffect(() => {
        console.log('Transacciones recibidas para el usuario actual:', transacciones);
        console.log('Usuario actual:', usuarioActual);
        console.log('Error:', error);
    }, [transacciones, usuarioActual, error]);

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-4">
                <Button type="primary" icon={<LogoutOutlined />} onClick={() => {
                    localStorage.removeItem('token');
                    navigate('/login');
                }}>
                    Cerrar Sesión
                </Button>
            </div>

            <h1 className="text-2xl font-bold mb-4">Operaciones de {usuarioActual?.nombre || 'Usuario'}</h1>

            {loading ? (
                <div className="text-center">Cargando...</div>
            ) : error ? (
                <div className="text-red-500 text-center">{error}</div>
            ) : (
                <div>
                    <h2 className="text-xl font-bold">Compras</h2>
                    {compras.length ? (
                        compras.map(compra => (
                            <div key={compra.id}>
                                <p>ID: {compra.id}</p>
                                <p>Descripción: {compra.descripcion}</p>
                            </div>
                        ))
                    ) : (
                        <p>No hay compras registradas</p>
                    )}

                    <h2 className="text-xl font-bold mt-4">Ventas</h2>
                    {ventas.length ? (
                        ventas.map(venta => (
                            <div key={venta.id}>
                                <p>ID: {venta.id}</p>
                                <p>Descripción: {venta.descripcion}</p>
                            </div>
                        ))
                    ) : (
                        <p>No hay ventas registradas</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default OperacionesUsuario;
