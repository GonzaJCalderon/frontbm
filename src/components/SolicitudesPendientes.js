import React, { useEffect, useState } from 'react'; 
import { useDispatch, useSelector } from 'react-redux';
import { fetchPendingRegistrations, approveUser, denyRegistration } from '../redux/actions/usuarios';
import { notification, Modal, Input, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const SolicitudesPendientes = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pendingRegistrations, loading, error } = useSelector(state => state.usuarios);
    
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [updatedRegistrations, setUpdatedRegistrations] = useState(pendingRegistrations);

    useEffect(() => {
        dispatch(fetchPendingRegistrations());
    }, [dispatch]);

    useEffect(() => {
        setUpdatedRegistrations(pendingRegistrations);
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
    
            // Agrega un log para verificar adminData
            console.log("adminData:", adminData); // Esto debería mostrar el objeto que almacenaste
    
            if (adminData && adminData.id) {
                const adminId = adminData.id; // Aquí obtienes el ID del administrador
                console.log("Admin ID:", adminId); // Agrega este log para verificar el adminId
    
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

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Solicitudes de Registro Pendientes</h2>
            {loading ? (
                <p>Cargando solicitudes...</p>
            ) : error ? (
                <p>Error al cargar solicitudes: {error}</p>
            ) : (
                <table className="table-auto w-full bg-white rounded shadow-md">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>DNI</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {updatedRegistrations.map(user => (
                            <tr key={user.id}>
                                <td>{user.nombre}</td>
                                <td>{user.email}</td>
                                <td>{user.dni}</td>
                                <td>
                                    <button onClick={() => handleApprove(user.id)} className="px-4 py-2 bg-green-600 text-white rounded">Aprobar</button>
                                    <button onClick={() => showModal(user.id)} className="px-4 py-2 bg-red-600 text-white rounded">Denegar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
