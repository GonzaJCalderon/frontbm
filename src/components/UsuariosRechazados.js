import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRejectedUsers, approveUser } from '../redux/actions/usuarios';
import { notification } from 'antd';
import { Button } from 'antd';
import { ArrowLeftOutlined, LogoutOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const UsuariosRechazados = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { rejectedUsers, loading, error } = useSelector(state => state.usuarios);

    const adminData = JSON.parse(localStorage.getItem('userData'));

    useEffect(() => {
        dispatch(fetchRejectedUsers());
    }, [dispatch]);

    const handleApprove = (userId) => {
        dispatch(approveUser(userId));
        notification.success({ message: 'Usuario aprobado', description: `El usuario con ID ${userId} ha sido aprobado.` });
    };

    const handleLogout = () => {
        localStorage.removeItem('userData');
        notification.success({
            message: 'Cierre de sesión exitoso',
            description: 'Has cerrado sesión correctamente.',
        });
        navigate('/home');
    };

    const handleBack = () => {
        navigate('/admin/dashboard');
    };

    if (loading) return <p>Cargando usuarios rechazados...</p>;
    if (error) return <p>Error al cargar usuarios: {error}</p>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                <Button
                    type="primary"
                    icon={<ArrowLeftOutlined />}
                    onClick={handleBack}
                >
                    Volver
                </Button>
                <div className="flex space-x-4 mt-2 md:mt-0">
                    <Button
                        type="default"
                        icon={<HomeOutlined />}
                        onClick={() => navigate('/admin/dashboard')}
                    >
                        Inicio
                    </Button>
                    <Button
                        type="primary"
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                    >
                        Cerrar Sesión
                    </Button>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Usuarios Rechazados</h2>
            <div className="overflow-x-auto mt-4">
                <table className="table-auto w-full bg-white rounded shadow-md">
                    <thead>
                        <tr>
                            <th className="p-2">Nombre</th>
                            <th className="p-2">Apellido</th>
                            <th className="p-2">Email</th>
                            <th className="p-2">DNI</th>
                            <th className="p-2">Dirección</th>
                            <th className="p-2">Motivo de Rechazo</th>
                            <th className="p-2">Fecha de Rechazo</th>
                            <th className="p-2">Hora de Rechazo</th>
                            <th className="p-2">Rechazado Por</th>
                            <th className="p-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rejectedUsers && rejectedUsers.map(user => {
                            const fecha = new Date(user.fechaRechazo);
                            const horaRechazo = `${fecha.getHours()}:${fecha.getMinutes() < 10 ? '0' : ''}${fecha.getMinutes()}`;
                            const direccionCompleta = `${user.direccion.calle} ${user.direccion.altura}, ${user.direccion.barrio}, ${user.direccion.departamento}`;

                            return (
                                <tr key={user.id}>
                                    <td className="p-2">{user.nombre}</td>
                                    <td className="p-2">{user.apellido}</td>
                                    <td className="p-2">{user.email}</td>
                                    <td className="p-2">{user.dni}</td>
                                    <td className="p-2">{direccionCompleta}</td>
                                    <td className="p-2">{user.motivoRechazo}</td>
                                    <td className="p-2">{fecha.toLocaleDateString()}</td>
                                    <td className="p-2">{horaRechazo}</td>
                                    <td className="p-2">{`${adminData.nombre} ${adminData.apellido}`}</td>
                                    <td className="p-2">
                                        <Button onClick={() => handleApprove(user.id)} className="bg-green-600 text-white rounded">
                                            Aprobar
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsuariosRechazados;
