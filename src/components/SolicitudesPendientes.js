import React, { useEffect, useState } from 'react';  
import { useDispatch, useSelector } from 'react-redux';
import { fetchPendingRegistrations, approveUser, denyRegistration } from '../redux/actions/usuarios';
import { notification, Modal, Input, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, LogoutOutlined, HomeOutlined } from '@ant-design/icons';

const SolicitudesPendientes = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pendingRegistrations, loading, error } = useSelector(state => state.usuarios);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [updatedRegistrations, setUpdatedRegistrations] = useState([]);

    useEffect(() => {
        dispatch(fetchPendingRegistrations());
    }, [dispatch]);

    useEffect(() => {
        // Al recibir las solicitudes, ordenamos por fechaCreacion (o fechaRechazo)
        if (pendingRegistrations && pendingRegistrations.length > 0) {
            const sortedRegistrations = [...pendingRegistrations].sort((a, b) => {
                // Convertir las fechas a objetos Date y compararlas
                const dateA = new Date(a.fechaRechazo || a.fechaCreacion); // Usar la fecha de rechazo o la de creación
                const dateB = new Date(b.fechaRechazo || b.fechaCreacion);

                return dateB - dateA; // Orden descendente (más reciente primero)
            });
            setUpdatedRegistrations(sortedRegistrations);
        }
    }, [pendingRegistrations]);

    const handleApprove = async (id) => {
        try {
            await dispatch(approveUser(id));
            notification.success({ message: 'Registro aprobado', description: `El registro del usuario con ID ${id} ha sido aprobado.` });
            setUpdatedRegistrations(prev => prev.filter(user => user.id !== id));
        } catch (error) {
            notification.error({ message: 'Error', description: 'No se pudo aprobar el usuario.' });
        }
    };

    const showModal = (id) => {
        setSelectedUserId(id);
        setIsModalVisible(true);
    };

    const handleDeny = () => {
        if (selectedUserId && rejectionReason) {
            const storedData = localStorage.getItem('userData');
            const adminData = storedData ? JSON.parse(storedData) : null;

            if (adminData && adminData.id) {
                const adminId = adminData.id;
                dispatch(denyRegistration(selectedUserId, rejectionReason, adminId));
                notification.error({ message: 'Registro denegado', description: `El registro del usuario con ID ${selectedUserId} ha sido denegado. Motivo: ${rejectionReason}` });
                setRejectionReason('');
                setIsModalVisible(false);
                setUpdatedRegistrations(prev => prev.filter(user => user.id !== selectedUserId));
            } else {
                notification.error({ message: 'Error', description: 'No se pudo obtener el ID del administrador.' });
            }
        } else {
            notification.warning({ message: 'Motivo requerido', description: 'Por favor ingresa un motivo para la denegación.' });
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
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

            <h2 className="text-2xl font-bold mb-4">Solicitudes de Registro Pendientes</h2>
            {loading ? (
                <p>Cargando solicitudes...</p>
            ) : error ? (
                <p>Error al cargar solicitudes: {error}</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table-auto w-full bg-white rounded shadow-md">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>Email</th>
                                <th>DNI</th>
                                <th>CUIT</th>
                                <th>Dirección</th>
                                <th>Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {updatedRegistrations.map(user => (
                                <tr key={user.id}>
                                    <td>{user.nombre}</td>
                                    <td>{user.apellido}</td>
                                    <td>{user.email}</td>
                                    <td>{user.dni}</td>
                                    <td>{user.cuit || 'N/A'}</td>
                                    <td>
    {user.direccion ? (
        <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <div style={{ marginBottom: '8px' }}>
                <strong>Calle:</strong> {user.direccion.calle || 'Sin calle'}
            </div>
            <div style={{ marginBottom: '8px' }}>
                <strong>Altura:</strong> {user.direccion.altura || 'Sin altura'}
            </div>
            <div style={{ marginBottom: '8px' }}>
                <strong>Barrio:</strong> {user.direccion.barrio || 'Sin barrio'}
            </div>
            <div style={{ marginBottom: '8px' }}>
                <strong>Departamento:</strong> {user.direccion.departamento || 'Sin departamento'}
            </div>
        </div>
    ) : (
        'Sin Dirección'
    )}
</td>

                                    <td>{user.rolDefinitivo}</td>
                                    <td>
                                        <Button onClick={() => handleApprove(user.id)} className="bg-green-600 text-white rounded">
                                            Aprobar
                                        </Button>
                                        <Button onClick={() => showModal(user.id)} className="bg-red-600 text-white rounded">
                                            Denegar
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Modal 
                title="Motivo de Rechazo"
                open={isModalVisible}
                onOk={handleDeny}
                onCancel={handleCancel}
            >
                <Input.TextArea 
                    rows={4} 
                    placeholder="Ingresa el motivo de rechazo" 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                />
            </Modal>
            <Button 
                type="primary" 
                onClick={() => navigate('/usuarios-rechazados')}
                className="mt-4"
            >
                Ver Usuarios Rechazados
            </Button>
        </div>
    );
};

export default SolicitudesPendientes;
