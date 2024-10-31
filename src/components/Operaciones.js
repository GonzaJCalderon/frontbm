import React, { useEffect, useState } from 'react';
import { Button, Table, Image, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LogoutOutlined, LeftOutlined, HomeOutlined } from '@ant-design/icons';
import { obtenerTransacciones } from '../redux/actions/usuarios'; // Asegúrate de que esta ruta sea correcta

const OperacionesUsuario = () => {
    const navigate = useNavigate();

    // Obtener los datos desde localStorage correctamente
    const localStorageData = JSON.parse(localStorage.getItem('userData'));
    const usuarioActual = localStorageData ? localStorageData : null;

    // Estado local para manejar transacciones, loading y error
    const [transacciones, setTransacciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [paginaCompras, setPaginaCompras] = useState(1);
    const [paginaVentas, setPaginaVentas] = useState(1);
    const transaccionesPorPagina = 10;

    // Llamar a la acción para obtener las transacciones del usuario logueado
    useEffect(() => {
        const cargarTransacciones = async () => {
            setLoading(true);
            if (usuarioActual && usuarioActual.id) {
                console.log('Cargando transacciones para el usuario ID:', usuarioActual.id);
                try {
                    const transaccionesObtenidas = await obtenerTransacciones(usuarioActual.id, false);
                    console.log('Transacciones obtenidas:', transaccionesObtenidas);
                    setTransacciones(transaccionesObtenidas);
                } catch (error) {
                    console.error('Error al obtener transacciones:', error);
                    setError(error.message);
                } finally {
                    setLoading(false);
                }
            } else {
                console.error('No se encontró el usuario actual en localStorage.');
                setLoading(false);
            }
        };

        cargarTransacciones();
    }, [usuarioActual ? usuarioActual.id : null]); // Cambiar dependencia para evitar loop infinito

    const transaccionesArray = Array.isArray(transacciones) ? transacciones : [];

    const compras = transaccionesArray
        .filter(transaccion => transaccion.compradorId === usuarioActual?.id)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    const ventas = transaccionesArray
        .filter(transaccion => transaccion.vendedorId === usuarioActual?.id)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    console.log('Compras:', compras);
    console.log('Ventas:', ventas);

    // Configurar las columnas de las tablas
    const columnsCompras = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        {
            title: 'Imagen',
            dataIndex: ['bien', 'imagen'],
            key: 'imagen',
            render: (text, record) => record.bien?.imagen
                ? <Image width={80} src={`http://localhost:5000/uploads/${record.bien.imagen}`} alt={record.bien.descripcion} />
                : 'Sin imagen'
        },
        { title: 'Descripción del Bien', dataIndex: ['bien', 'descripcion'], key: 'descripcion' },
        { title: 'Marca', dataIndex: ['bien', 'marca'], key: 'marca' },
        { title: 'Modelo', dataIndex: ['bien', 'modelo'], key: 'modelo' },
        { title: 'Tipo', dataIndex: ['bien', 'tipo'], key: 'tipo' },
        { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
       
        {
            title: 'Vendedor',
            render: (text, record) => `${record.vendedor?.nombre || ''} ${record.vendedor?.apellido || ''}`,
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
            render: (text, record) => record.bien?.imagen
                ? <Image width={80} src={`http://localhost:5000/uploads/${record.bien.imagen}`} alt={record.bien.descripcion} />
                : 'Sin imagen'
        },
        { title: 'Descripción del Bien', dataIndex: ['bien', 'descripcion'], key: 'descripcion' },
        { title: 'Marca', dataIndex: ['bien', 'marca'], key: 'marca' },
        { title: 'Modelo', dataIndex: ['bien', 'modelo'], key: 'modelo' },
        { title: 'Tipo', dataIndex: ['bien', 'tipo'], key: 'tipo' },
        { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
        
        {
            title: 'Comprador',
            render: (text, record) => `${record.comprador?.nombre || ''} ${record.comprador?.apellido || ''}`,
            key: 'comprador',
        },
        {
            title: 'Fecha',
            render: (text, record) => new Date(record.fecha).toLocaleString(),
            key: 'fecha',
        },
    ];

    const handleBack = () => {
        navigate(-1);
    };

    const handleHome = () => {
        navigate('/userdashboard');
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-4">
                <Space>
                    <Button icon={<LeftOutlined />} onClick={handleBack}>Volver</Button>
                    <Button icon={<HomeOutlined />} onClick={handleHome}>Home</Button>
                    <Button type="primary" icon={<LogoutOutlined />} onClick={() => {
                        localStorage.removeItem('token');
                        navigate('/login');
                    }}>
                        Cerrar Sesión
                    </Button>
                </Space>
            </div>

            <h1 className="text-2xl font-bold mb-4">Operaciones de {usuarioActual?.nombre || 'Usuario'}</h1>

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

export default OperacionesUsuario;
