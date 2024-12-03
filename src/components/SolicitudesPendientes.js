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

    // Obtener datos del usuario actual
    const storedData = localStorage.getItem('userData');
    const currentUser = storedData ? JSON.parse(storedData) : null;
    const isModerator = currentUser?.rolDefinitivo === 'moderador'; // Ajustado para 'rolDefinitivo'

    // Obtener las solicitudes pendientes al cargar
    useEffect(() => {
        dispatch(fetchPendingRegistrations());
    }, [dispatch]);

    // Ordenar y actualizar la lista de solicitudes
    useEffect(() => {
        if (pendingRegistrations && pendingRegistrations.length > 0) {
            const sortedRegistrations = [...pendingRegistrations].sort((a, b) => {
                const dateA = new Date(a.fechaRechazo || a.fechaCreacion);
                const dateB = new Date(b.fechaRechazo || b.fechaCreacion);
                return dateB - dateA; // Orden descendente por fecha
            });
            setUpdatedRegistrations(sortedRegistrations);
        }
    }, [pendingRegistrations]);

    // Manejo de aprobación de usuarios
    const handleApprove = async (id) => {
        if (isModerator) {
            notification.warning({ message: 'Acción no permitida', description: 'Los moderadores no pueden aprobar usuarios.' });
            return;
        }
        try {
            await dispatch(approveUser(id));
            notification.success({ message: 'Registro aprobado', description: `El usuario con ID ${id} ha sido aprobado.` });
            setUpdatedRegistrations(prev => prev.filter(user => user.id !== id));
        } catch (error) {
            notification.error({ message: 'Error', description: 'No se pudo aprobar el usuario.' });
        }
    };

    // Mostrar modal de rechazo
    const showModal = (id) => {
        setSelectedUserId(id);
        setIsModalVisible(true);
    };

    // Manejo de rechazo de usuarios
    const handleDeny = async () => {
        if (!selectedUserId || !rejectionReason) {
            notification.warning({ message: 'Motivo requerido', description: 'Por favor ingresa un motivo para la denegación.' });
            return;
        }
        try {
            await dispatch(denyRegistration(selectedUserId, rejectionReason, currentUser.id));
            notification.error({ message: 'Registro denegado', description: `El usuario con ID ${selectedUserId} ha sido rechazado. Motivo: ${rejectionReason}` });
            setUpdatedRegistrations(prev => prev.filter(user => user.id !== selectedUserId));
            setIsModalVisible(false);
            setRejectionReason('');
        } catch (error) {
            notification.error({ message: 'Error', description: 'No se pudo rechazar al usuario.' });
        }
    };

    // Cerrar modal de rechazo
    const handleCancel = () => {
        setIsModalVisible(false);
        setRejectionReason('');
    };

    // Navegación
    const handleLogout = () => {
        localStorage.removeItem('userData');
        notification.success({ message: 'Cierre de sesión exitoso', description: 'Has cerrado sesión correctamente.' });
        navigate('/home');
    };

    const handleBack = () => navigate('/admin/dashboard');

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                <Button type="primary" icon={<ArrowLeftOutlined />} onClick={handleBack}>Volver</Button>
                <div className="flex space-x-4 mt-2 md:mt-0">
                    <Button type="default" icon={<HomeOutlined />} onClick={() => navigate('/admin/dashboard')}>Inicio</Button>
                    <Button type="primary" icon={<LogoutOutlined />} onClick={handleLogout}>Cerrar Sesión</Button>
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
                <th style={{ minWidth: '200px' }}>Email</th> {/* Ancho mínimo ajustado */}
                <th style={{ minWidth: '100px', paddingRight: '20px' }}>DNI</th> {/* Más espacio */}
                <th style={{ minWidth: '100px', paddingLeft: '20px' }}>CUIT</th> {/* Más espacio */}
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
                    <td style={{ wordBreak: 'break-word' }}>{user.email}</td> {/* Permitir quiebre de línea */}
                    <td style={{ textAlign: 'center', paddingRight: '20px' }}>{user.dni}</td>
                    <td style={{ textAlign: 'center', paddingLeft: '20px' }}>{user.cuit || 'N/A'}</td>
                    <td>
                        {user.direccion ? (
                            <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                                <strong>Calle:</strong> {user.direccion.calle || 'Sin calle'}
                                <br />
                                <strong>Altura:</strong> {user.direccion.altura || 'Sin altura'}
                                <br />
                                <strong>Barrio:</strong> {user.direccion.barrio || 'Sin barrio'}
                                <br />
                                <strong>Departamento:</strong> {user.direccion.departamento || 'Sin departamento'}
                            </div>
                        ) : 'Sin Dirección'}
                    </td>
                    <td>{user.rolDefinitivo}</td>
                    <td>
                        {isModerator ? (
                            <p className="text-gray-500">Acción no permitida para moderadores.</p>
                        ) : (
                            <div>
                                <Button onClick={() => handleApprove(user.id)} className="bg-green-600 text-white rounded">Aprobar</Button>
                                <Button onClick={() => showModal(user.id)} className="bg-red-600 text-white rounded">Denegar</Button>
                            </div>
                        )}
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
</div>

            )}

            <Modal title="Motivo de Rechazo" open={isModalVisible} onOk={handleDeny} onCancel={handleCancel}>
                <Input.TextArea
                    rows={4}
                    placeholder="Ingresa el motivo de rechazo"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                />
            </Modal>
        </div>
    );
};

export default SolicitudesPendientes;
