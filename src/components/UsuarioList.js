import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApprovedUsers, deleteUsuario, denyRegistration, approveUser } from '../redux/actions/usuarios';
import { useNavigate } from 'react-router-dom';
import { notification, Button, Table, Modal, Input } from 'antd';
import { ArrowLeftOutlined, LogoutOutlined } from '@ant-design/icons';
import FiltroUsuarios from './FiltroUsuarios';

const UsuarioList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { approvedUsers, loading, error } = useSelector(state => ({
    approvedUsers: state.usuarios.approvedUsers || [],
    loading: state.usuarios.loading || false,
    error: state.usuarios.error || null,
  }));
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserName, setCurrentUserName] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedUserBienes, setSelectedUserBienes] = useState(null);
  const [currentUsuario, setCurrentUsuario] = useState(null);
  const [filters, setFilters] = useState({});

  const userData = JSON.parse(localStorage.getItem('userData'));
  const isAdmin = userData && userData.rolDefinitivo === 'admin';

  useEffect(() => {
    dispatch(fetchApprovedUsers());
  }, [dispatch]);

  useEffect(() => {
    setFilteredUsuarios(approvedUsers);
  }, [approvedUsers]);

  const handleSearch = (newFilters) => {
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters, ...newFilters };
      const filtered = approvedUsers.filter((usuario) => {
        const matchesNombre = updatedFilters.nombre ? usuario.nombre?.toLowerCase().includes(updatedFilters.nombre.toLowerCase()) : true;
        const matchesApellido = updatedFilters.apellido ? usuario.apellido?.toLowerCase().includes(updatedFilters.apellido.toLowerCase()) : true;
        const matchesDni = updatedFilters.dni ? usuario.dni?.includes(updatedFilters.dni) : true;
        const matchesEmail = updatedFilters.email ? usuario.email?.toLowerCase().includes(updatedFilters.email.toLowerCase()) : true;
  
        return matchesNombre && matchesApellido && matchesDni && matchesEmail;
      });
  
      setFilteredUsuarios(filtered);
      return updatedFilters;
    });
  };

  const handleReject = (usuario) => {
    if (!usuario || !usuario.uuid) {
      notification.error({
        message: 'Error',
        description: 'El usuario seleccionado no tiene un identificador válido.',
      });
      return;
    }
    setCurrentUserId(usuario.uuid);
    setCurrentUserName(`${usuario.nombre} ${usuario.apellido}`);
    setIsModalVisible(true);
  };

  const handleRejectSubmit = () => {
    if (!currentUserId) {
      notification.error({
        message: 'Error al rechazar usuario',
        description: 'No se ha seleccionado un usuario válido.',
      });
      return;
    }

    if (!rejectionReason.trim()) {
      notification.warning({
        message: 'Motivo de rechazo requerido',
        description: 'Por favor, proporciona un motivo para rechazar al usuario.',
      });
      return;
    }

    const fechaRechazo = new Date().toISOString();
    const rechazadoPor = userData.uuid;

    dispatch(
      denyRegistration(currentUserId, { fechaRechazo, rechazadoPor, motivoRechazo: rejectionReason })
    )
      .then(() => {
        notification.success({
          message: 'Usuario rechazado',
          description: `El usuario ${currentUserName} ha sido rechazado correctamente.`,
        });
        setIsModalVisible(false);
        setRejectionReason('');
        dispatch(fetchApprovedUsers());
      })
      .catch((error) => {
        notification.error({
          message: 'Error al rechazar usuario',
          description: error.message || 'Ocurrió un error inesperado.',
        });
      });
  };

  const handleDelete = (usuario) => {
    if (!usuario || !usuario.uuid) {
      notification.error({
        message: 'Error',
        description: 'El usuario seleccionado no tiene un identificador válido.',
      });
      return;
    }
  
    // Confirmar la acción antes de eliminar
    Modal.confirm({
      title: `¿Estás seguro de que deseas eliminar al usuario ${usuario.nombre} ${usuario.apellido}?`,
      content: 'Esta acción no se puede deshacer.',
      okText: 'Eliminar',
      cancelText: 'Cancelar',
      onOk: () => {
        // Dispatch para eliminar
        dispatch(deleteUsuario(usuario.uuid))
          .then(() => {
            notification.success({
              message: 'Usuario eliminado',
              description: `El usuario ${usuario.nombre} ${usuario.apellido} ha sido eliminado correctamente.`,
            });
            dispatch(fetchApprovedUsers()); // Refrescar la lista de usuarios
          })
          .catch((error) => {
            notification.error({
              message: 'Error al eliminar usuario',
              description: error.message || 'Ocurrió un error inesperado.',
            });
          });
      },
    });
  };
  
  

  const handleViewBienes = (usuario) => {
    if (!usuario || !usuario.uuid) {
      notification.error({
        message: 'Error',
        description: 'El usuario seleccionado no tiene un identificador válido.',
      });
      return;
    }
    navigate(`/bienes-usuario/${usuario.uuid}`); // Redirige a la ruta de bienes por usuario
  };
  

  const handleViewDetails = (id) => {
    navigate(`/usuarios/${id}`);
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
      render: (text) => text || 'No disponible',
    },
    {
      title: 'DNI',
      dataIndex: 'dni',
      key: 'dni',
      render: (text) => text || 'No disponible',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Aprobado Por',
      dataIndex: 'aprobadoPor',
      key: 'aprobadoPor',
      render: (aprobadoPor) => aprobadoPor || 'No especificado',
    },
    {
      title: 'Fecha de Aprobación',
      dataIndex: 'fechaAprobacion',
      key: 'fechaAprobacion',
      render: (fechaAprobacion) => (fechaAprobacion ? new Date(fechaAprobacion).toLocaleString() : 'No disponible'),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (text, usuario) => (
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-2">
            <Button size="small" onClick={() => handleViewDetails(usuario.uuid)} className="bg-blue-500 text-white rounded">
              Ver Detalles
            </Button>
            <Button size="small" onClick={() => navigate(`/admin/operaciones/${usuario.uuid}`)} className="bg-green-500 text-white rounded">
              Operaciones
            </Button>
          </div>
          <div className="flex gap-2">
           <Button
  size="small"
  onClick={() => handleViewBienes(usuario)}
  className="bg-purple-500 text-white rounded"
>
  Bienes
</Button>

            <Button size="small" onClick={() => navigate(`/admin/historial-cambios/${usuario.uuid}`)} className="bg-blue-500 text-white rounded">
              Historial de Cambios
            </Button>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button size="small" onClick={() => navigate(`/usuarios/${usuario.uuid}/edit`)} className="bg-yellow-500 text-white rounded">
                Editar
              </Button>
              <Button size="small" onClick={() => handleReject(usuario)} className="bg-orange-500 text-white rounded">
                Rechazar
              </Button>
              <Button
  size="small"
  onClick={() => handleDelete(usuario)}
  className="bg-red-500 text-white rounded"
>
  Eliminar
</Button>

            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Modal
        title={`Rechazar Usuario: ${currentUserName}`}
        visible={isModalVisible}
        onOk={handleRejectSubmit}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input.TextArea
          rows={4}
          placeholder="Motivo del rechazo"
          value={rejectionReason}
          onChange={(e) => {
            setRejectionReason(e.target.value);
          }}
        />
      </Modal>


      <div className="p-6 bg-gray-100 min-h-screen">
  <Modal
    title={`Rechazar Usuario: ${currentUserName}`}
    visible={isModalVisible}
    onOk={handleRejectSubmit}
    onCancel={() => setIsModalVisible(false)}
  >
    <Input.TextArea
      rows={4}
      placeholder="Motivo del rechazo"
      value={rejectionReason}
      onChange={(e) => {
        setRejectionReason(e.target.value);
      }}
    />
  </Modal>

  <div className="flex justify-between items-center mb-4">
    <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/dashboard')}>
      Volver
    </Button>
    <Button type="primary" icon={<LogoutOutlined />} onClick={() => navigate('/home')}>
      Cerrar Sesión
    </Button>
  </div>

  <h1 className="text-2xl font-bold mb-4">Lista de Usuarios</h1>

  {/* Campos de Búsqueda */}
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
    <div className="text-center">Cargando...</div>
  ) : (
    <Table
      dataSource={filteredUsuarios}
      columns={columns}
      rowKey="uuid"
      pagination={{ pageSize: 10 }}
    />
  )}
  {error && <div className="text-red-500 mt-4">Error: {error}</div>}
</div>

    </div>
  );
};

export default UsuarioList;
