import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPendingRegistrations, approveUser, denyRegistration } from '../redux/actions/usuarios';
import { notification, Modal, Input, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, LogoutOutlined, HomeOutlined } from '@ant-design/icons';

const SolicitudesPendientes = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pendingRegistrations, loading, error } = useSelector((state) => state.usuarios);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedUserUuid, setSelectedUserUuid] = useState(null);
    const [updatedRegistrations, setUpdatedRegistrations] = useState([]);

    // Obtener datos del usuario actual
    const storedData = localStorage.getItem('userData');
    const currentUser = storedData ? JSON.parse(storedData) : null;
    const userData = JSON.parse(localStorage.getItem('userData'));
const isAdmin = userData?.rolDefinitivo === 'admin'; // Verifica si es admin
const isModerator = userData?.rolDefinitivo === 'moderador'; // Verifica si es moderador


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
    const handleApprove = async (uuid) => {
        if (isModerator) {
            notification.warning({
                message: 'Acción no permitida',
                description: 'Los moderadores no pueden aprobar usuarios.',
            });
            return;
        }
    
        const storedData = localStorage.getItem('userData');
        const currentUser = storedData ? JSON.parse(storedData) : null;
    
        if (!currentUser || !currentUser.uuid || !currentUser.nombre) {
            notification.error({
                message: 'Error',
                description: 'No se pudo obtener el usuario actual para aprobar.',
            });
            return;
        }
    
        try {
            const fechaAprobacion = new Date().toISOString();
            const aprobadoPor = currentUser.uuid;
            const aprobadoPorNombre = `${currentUser.nombre} ${currentUser.apellido}`; // Nombre completo
            const estado = 'aprobado';
    
            const payload = {
                fechaAprobacion,
                aprobadoPor,
                aprobadoPorNombre,
                estado, // Cambia el estado del usuario
            };
    
            console.log('Payload enviado al Redux action:', payload);
    
            await dispatch(approveUser(uuid, payload));
    
            notification.success({
                message: 'Registro aprobado',
                description: `El usuario con UUID ${uuid} ha sido aprobado.`,
            });
    
            setUpdatedRegistrations((prev) => prev.filter((user) => user.uuid !== uuid));
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'No se pudo aprobar al usuario.',
            });
        }
    };
    

    // Mostrar modal de rechazo
    const showModal = (uuid) => {
        console.log('Usuario seleccionado para denegar:', uuid); // Log para verificar
        setSelectedUserUuid(uuid);
        setIsModalVisible(true);
    };

    // Manejo de rechazo de usuarios
    const handleDeny = async () => {
        if (!selectedUserUuid || !rejectionReason.trim()) {
          notification.warning({
            message: 'Motivo requerido',
            description: 'Por favor, ingresa un motivo para la denegación.',
          });
          return;
        }
        try {
          const payload = {
            rechazadoPor: currentUser.uuid, // ID del usuario que rechaza
            motivoRechazo: rejectionReason, // Motivo del rechazo
          };
      
          console.log('Payload enviado al backend:', payload);
      
          await dispatch(denyRegistration(selectedUserUuid, payload));
      
          notification.error({
            message: 'Registro denegado',
            description: `El usuario con UUID ${selectedUserUuid} ha sido rechazado. Motivo: ${rejectionReason}`,
          });
          setUpdatedRegistrations((prev) =>
            prev.filter((user) => user.uuid !== selectedUserUuid)
          );
          setIsModalVisible(false);
          setRejectionReason('');
        } catch (error) {
          console.error('Error al rechazar usuario:', error);
          notification.error({
            message: 'Error',
            description: 'No se pudo rechazar al usuario.',
          });
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
        notification.success({
            message: 'Cierre de sesión exitoso',
            description: 'Has cerrado sesión correctamente.',
        });
        navigate('/home');
    };

    const handleBack = () => navigate('/admin/dashboard');

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                <Button type="primary" icon={<ArrowLeftOutlined />} onClick={handleBack}>
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
                    <Button type="primary" icon={<LogoutOutlined />} onClick={handleLogout}>
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
        <th style={{ minWidth: '200px' }}>Email</th>
        <th>DNI</th>
        <th>CUIT</th>
        <th>Dirección</th>
        <th>Rol</th>
        {/* Renderiza el encabezado "Acciones" solo si no es moderador */}
        {!isModerator && <th>Acciones</th>}
    </tr>
</thead>

                        <tbody>
    {updatedRegistrations.map((user) => (
        <tr key={user.uuid}>
            <td>{user.nombre}</td>
            <td>{user.apellido}</td>
            <td>{user.email}</td>
            <td>{user.dni}</td>
            <td>{user.cuit || 'N/A'}</td>
            <td>
                {user.direccion
                    ? `${user.direccion.calle}, ${user.direccion.altura}, ${user.direccion.departamento}`
                    : 'Sin Dirección'}
            </td>
            <td>
                {user.estado === 'pendiente_revision' ? (
                    <span className="text-blue-600">Pendiente de Revisión</span>
                ) : (
                    <span className="text-yellow-600">Pendiente</span>
                )}
            </td>
            {/* Renderiza la columna de acciones solo si no es moderador */}
            {!isModerator && (
                <td>
                    <div>
                        <Button
                            onClick={() => handleApprove(user.uuid)}
                            className="bg-green-600 text-white rounded"
                        >
                            Aprobar
                        </Button>
                        <Button
                            onClick={() => showModal(user.uuid)}
                            className="bg-red-600 text-white rounded"
                        >
                            Denegar
                        </Button>
                    </div>
                </td>
            )}
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
        </div>
    );
};

export default SolicitudesPendientes;
