import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRejectedUsers, approveUser } from '../redux/actions/usuarios';
import { notification } from 'antd';

const UsuariosRechazados = () => {
    const dispatch = useDispatch();
    const { rejectedUsers, loading, error } = useSelector(state => state.usuarios); 

    const adminData = JSON.parse(localStorage.getItem('userData'));

    useEffect(() => {
        dispatch(fetchRejectedUsers());
    }, [dispatch]);

    const handleApprove = (userId) => {
        dispatch(approveUser(userId));
        notification.success({ message: 'Usuario aprobado', description: `El usuario con ID ${userId} ha sido aprobado.` });
    };

    if (loading) return <p>Cargando usuarios rechazados...</p>;
    if (error) return <p>Error al cargar usuarios: {error}</p>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h2 className="text-2xl font-bold mb-4">Usuarios Rechazados</h2>
            <div className="overflow-x-auto">
                <table className="table-auto w-full bg-white rounded shadow-md">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Email</th>
                            <th>DNI</th>
                            <th>Dirección</th>
                            <th>Motivo de Rechazo</th>
                            <th>Fecha de Rechazo</th>
                            <th>Hora de Rechazo</th>
                            <th>Rechazado Por</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rejectedUsers && rejectedUsers.map(user => {
                            const fecha = new Date(user.fechaRechazo);
                            const horaRechazo = `${fecha.getHours()}:${fecha.getMinutes() < 10 ? '0' : ''}${fecha.getMinutes()}`;
                            return (
                                <tr key={user.id}>
                                    <td>{user.nombre}</td>
                                    <td>{user.apellido}</td>
                                    <td>{user.direccion.calle} </td> 
                                    <td>{user.direccion.altura}</td>
                                    <td>{user.direccion.departamento}</td>
                                    <td>{user.motivoRechazo}</td>
                                    <td>{fecha.toLocaleDateString()}</td> 
                                    <td>{horaRechazo}</td> 
                                    <td>{`${adminData.nombre} ${adminData.apellido}`}</td> 
                                    <td>
                                        <button onClick={() => handleApprove(user.id)} className="px-4 py-2 bg-green-600 text-white rounded">Aprobar</button>
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
