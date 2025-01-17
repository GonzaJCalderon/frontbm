import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPendingRegistrations, approveUser, denyRegistration,fetchRejectedUsers } from '../redux/actions/usuarios';
import { notification, Modal, Input, Button, Table } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, LogoutOutlined, HomeOutlined } from '@ant-design/icons';

const SolicitudesPendientes = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pendingRegistrations, loading, error } = useSelector((state) => state.usuarios);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedUserUuid, setSelectedUserUuid] = useState(null);
    const [filteredRegistrations, setFilteredRegistrations] = useState([]);
    const [filters, setFilters] = useState({});

    const storedData = localStorage.getItem('userData');
    const currentUser = storedData ? JSON.parse(storedData) : null;
    const isAdmin = currentUser?.rolDefinitivo === 'admin';
    const isModerator = currentUser?.rolDefinitivo === 'moderador';
  
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    // Obtener las solicitudes pendientes al cargar
    useEffect(() => {
        dispatch(fetchPendingRegistrations());
    }, [dispatch]);

    // Ordenar y filtrar la lista de solicitudes
    useEffect(() => {
        if (pendingRegistrations && pendingRegistrations.length > 0) {
            const sortedRegistrations = [...pendingRegistrations].sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return dateB - dateA; // Orden descendente por fecha
            });
            setFilteredRegistrations(sortedRegistrations);
        }
    }, [pendingRegistrations]);

    // Manejo de búsqueda
    const handleSearch = (newFilters) => {
        setFilters((prevFilters) => {
            const updatedFilters = { ...prevFilters, ...newFilters };
            const filtered = pendingRegistrations.filter((usuario) => {
                const matchesNombre = updatedFilters.nombre ? usuario.nombre?.toLowerCase().includes(updatedFilters.nombre.toLowerCase()) : true;
                const matchesApellido = updatedFilters.apellido ? usuario.apellido?.toLowerCase().includes(updatedFilters.apellido.toLowerCase()) : true;
                const matchesDni = updatedFilters.dni ? usuario.dni?.includes(updatedFilters.dni) : true;
                const matchesEmail = updatedFilters.email ? usuario.email?.toLowerCase().includes(updatedFilters.email.toLowerCase()) : true;

                return matchesNombre && matchesApellido && matchesDni && matchesEmail;
            });
            setFilteredRegistrations(filtered);
            return updatedFilters;
        });
    };

    // Manejo de aprobación de usuarios
    const handleApprove = (userUuid) => {
        if (!userUuid) {
          notification.error({
            message: 'Error',
            description: 'No se pudo obtener el UUID del usuario. Inténtalo de nuevo.',
          });
          return;
        }
      
        if (isAdmin) {
          const fechaAprobacion = new Date().toISOString();
          const aprobadoPor = userData.uuid;
          const aprobadoPorNombre = `${userData.nombre} ${userData.apellido}`;
          const estado = 'aprobado';
      
          dispatch(approveUser(userUuid, { estado, fechaAprobacion, aprobadoPor, aprobadoPorNombre }))
            .then(() => {
              notification.success({
                message: 'Usuario aprobado',
                description: `El usuario con UUID ${userUuid} ha sido aprobado correctamente.`,
              });
      
              // Refrescar la lista de rechazados
              dispatch(fetchRejectedUsers());
            })
            .catch((error) => {
              notification.error({
                message: 'Error al aprobar usuario',
                description: error.message || 'Ocurrió un error inesperado.',
              });
            });
        }
      };
      

    // Mostrar modal de rechazo
    const showModal = (uuid) => {
        setSelectedUserUuid(uuid);
        setIsModalVisible(true);
    };

    // Manejo de rechazo de usuarios
    const handleDeny = async () => {
        if (!rejectionReason.trim()) {
            notification.warning({
                message: 'Motivo requerido',
                description: 'Por favor, ingresa un motivo para la denegación.',
            });
            return;
        }

        try {
            const payload = {
                estado: 'rechazado',
                motivoRechazo: rejectionReason,
                fechaRechazo: new Date().toISOString(),
                rechazadoPor: currentUser.uuid,
            };

            await dispatch(denyRegistration(selectedUserUuid, payload));

            notification.success({
                message: 'Registro denegado',
                description: 'El usuario ha sido rechazado correctamente.',
            });

            setFilteredRegistrations((prev) =>
                prev.filter((user) => user.uuid !== selectedUserUuid)
            );
            setIsModalVisible(false);
            setRejectionReason('');
        } catch (error) {
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

    const columns = [
        {
            title: 'Nombre',
            dataIndex: 'nombre',
            key: 'nombre',
        },
        {
            title: 'Apellido',
            dataIndex: 'apellido',
            key: 'apellido',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'DNI',
            dataIndex: 'dni',
            key: 'dni',
        },
        {
            title: 'CUIT',
            dataIndex: 'cuit',
            key: 'cuit',
            render: (cuit) => cuit || 'N/A',
        },
        {
            title: 'Dirección',
            dataIndex: 'direccion',
            key: 'direccion',
            render: (direccion) => 
                direccion
                    ? `${direccion.calle}, ${direccion.altura}, ${direccion.departamento}`
                    : 'Sin Dirección',
        },
        {
            title: 'Fecha de Solicitud',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (createdAt) => new Date(createdAt).toLocaleString(),
        },
        {
            title: 'Acciones',
            key: 'acciones',
            render: (_, user) => (
                <div>
                    <Button
                        onClick={() => handleApprove(user.uuid)}
                        className="bg-green-600 text-white rounded mr-2"
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
            ),
        },
    ];

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/dashboard')}>
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
                    <Button type="primary" icon={<LogoutOutlined />} onClick={() => navigate('/home')}>
                        Cerrar Sesión
                    </Button>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Solicitudes de Registro Pendientes</h2>

            <div className="grid grid-cols-4 gap-4 mb-4">
                <Input
                    placeholder="Nombre"
                    onChange={(e) => handleSearch({ nombre: e.target.value })}
                    allowClear
                />
                <Input
                    placeholder="Apellido"
                    onChange={(e) => handleSearch({ apellido: e.target.value })}
                    allowClear
                />
                <Input
                    placeholder="DNI"
                    onChange={(e) => handleSearch({ dni: e.target.value })}
                    allowClear
                />
                <Input
                    placeholder="Correo Electrónico"
                    onChange={(e) => handleSearch({ email: e.target.value })}
                    allowClear
                />
            </div>

            {loading ? (
                <p>Cargando solicitudes...</p>
            ) : (
                <Table
                    dataSource={filteredRegistrations}
                    columns={columns}
                    rowKey="uuid"
                    pagination={{ pageSize: 10 }}
                />
            )}

            {error && <p className="text-red-500">Error al cargar solicitudes: {error}</p>}

            <Modal
                title="Motivo de Rechazo"
                open={isModalVisible}
                onOk={handleDeny}
                onCancel={handleCancel}
            >
                <Input.TextArea
                    rows={4}
                    placeholder="Ingresa el motivo para rechazar"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                />
            </Modal>
        </div>
    );
};

export default SolicitudesPendientes;
