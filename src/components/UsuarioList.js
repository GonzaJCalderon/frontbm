import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApprovedUsers, fetchRejectedUsers, fetchPendingRegistrations, deleteUsuario, denyRegistration, approveUser} from '../redux/actions/usuarios';
import { fetchBienes, fetchBienesPorPropietario  } from '../redux/actions/bienes';
import { useNavigate } from 'react-router-dom';
import { notification, Button, Table, Modal, Input, Spin, Divider } from 'antd';
import { ArrowLeftOutlined, LogoutOutlined } from '@ant-design/icons';


const UsuarioList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { approvedUsers = [], loading, error } = useSelector(state => ({
    approvedUsers: Array.isArray(state.usuarios.approvedUsers) ? state.usuarios.approvedUsers : [],
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
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [bienes, setBienes] = useState([]);



  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  console.log('🔐 Usuario desde localStorage:', userData);
  
  const userRol = (userData?.rol || '').toLowerCase(); // Siempre seguro
  const isAdmin = userRol === 'admin';
  

  


  useEffect(() => {
    dispatch(fetchApprovedUsers())
      .then((response) => {
// 🔹 Verifica qué datos devuelve la API
      })
      .catch((error) => {
      });
  }, [dispatch]);
  

  useEffect(() => {
    setFilteredUsuarios(approvedUsers);
  }, [approvedUsers]);

  const handleSearch = (newFilters) => {
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters, ...newFilters };
      
      const filtered = approvedUsers
        .filter((usuario) => usuario && typeof usuario === 'object')
        .filter((usuario) => {
          const matchesNombre = updatedFilters.nombre
            ? usuario.nombre?.toLowerCase().includes(updatedFilters.nombre.toLowerCase())
            : true;
  
          const matchesApellido = updatedFilters.apellido
            ? usuario.apellido?.toLowerCase().includes(updatedFilters.apellido.toLowerCase())
            : true;
  
          const matchesDNI = updatedFilters.dni
            ? usuario.dni?.toString().includes(updatedFilters.dni)
            : true;
  
          const matchesEmail = updatedFilters.email
            ? usuario.email?.toLowerCase().includes(updatedFilters.email.toLowerCase())
            : true;
  
          return matchesNombre && matchesApellido && matchesDNI && matchesEmail;
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
    const rechazadoPor = userData.uuid; // Usuario que está autenticado
  
    // Mostrar spinner
    setIsLoadingAction(true);
  
    dispatch(
      denyRegistration(currentUserId, { fechaRechazo, rechazadoPor, motivoRechazo: rejectionReason })
    )
      .then((response) => {
        notification.success({
          message: 'Usuario rechazado',
          description: `El usuario ${currentUserName} ha sido rechazado correctamente.`,
        });
        setIsModalVisible(false); // Cerrar el modal de motivo de rechazo
        setRejectionReason('');
  
        // Actualizar las listas de usuarios aprobados y rechazados
        return Promise.all([
          dispatch(fetchApprovedUsers()),
          dispatch(fetchRejectedUsers()),
        ]);
      })
      .then(() => {
        setIsLoadingAction(false); // Ocultar spinner
      })
      .catch((error) => {
        setIsLoadingAction(false); // Ocultar spinner en caso de error
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
  const esDelegadoResponsable = ['delegado', 'responsable'].includes(usuario.rolEmpresa?.toLowerCase());
  const propietarioUuid = esDelegadoResponsable && usuario.empresa?.uuid
    ? usuario.empresa.uuid
    : usuario.uuid;

  if (!propietarioUuid || typeof propietarioUuid !== 'string' || propietarioUuid.length !== 36) {
    notification.error({
      message: 'UUID inválido',
      description: 'El usuario no tiene un identificador válido ni empresa asociada.',
    });
    return;
  }

  dispatch(fetchBienesPorPropietario(propietarioUuid))
    .then((response) => {
      if (response.success && Array.isArray(response.data)) {
        if (response.data.length > 0) {
          localStorage.setItem('bienesUsuarioSeleccionado', JSON.stringify(response.data));
          localStorage.setItem('nombreUsuarioSeleccionado', `${usuario.nombre} ${usuario.apellido}`);
          navigate(`/bienes-usuario/${usuario.uuid}`);
        } else {
          notification.info({
            message: 'Sin bienes',
            description: `El usuario ${usuario.nombre} ${usuario.apellido} no posee bienes registrados.`,
          });
        }
      } else {
        notification.info({
          message: 'Sin bienes',
          description: `El usuario ${usuario.nombre} ${usuario.apellido} no posee bienes registrados.`,
        });
      }
    })
    .catch((error) => {
      notification.error({
        message: 'Error al obtener bienes',
        description: error.message || 'Ocurrió un error inesperado al consultar los bienes.',
      });
    });
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
      title: 'Rol en Empresa',
      key: 'rolEmpresa',
      render: (usuario) =>
        usuario.rolEmpresa
          ? usuario.rolEmpresa.charAt(0).toUpperCase() + usuario.rolEmpresa.slice(1)
          : usuario.tipo === 'juridica'
          ? 'Responsable'
          : 'Sin rol',
    },
    
    {
      title: 'Empresa',
      key: 'empresa',
      render: (usuario) =>
        usuario.empresa?.razonSocial ||
        (usuario.tipo === 'juridica' ? 'Empresa propia' : 'No asignada'),
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
          <Button
            size="small"
            onClick={() => handleViewDetails(usuario.uuid)}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded shadow"
          >
            Ver Detalles
          </Button>
          <Button
  size="small"
  onClick={() => {
    const esDelegadoResponsable = ['delegado', 'responsable'].includes(usuario.rolEmpresa?.toLowerCase());
    const targetUuid = esDelegadoResponsable && usuario.empresa?.uuid
      ? usuario.empresa.uuid
      : usuario.uuid;

    navigate(`/admin/operaciones/${targetUuid}`, {
      state: { usuario },
    });
  }}
  className="bg-green-500 hover:bg-green-600 text-white rounded shadow"
>
  Operaciones
</Button>




    
          <Button
            size="small"
            onClick={() => handleViewBienes(usuario)}
            className="bg-purple-500 hover:bg-purple-600 text-white rounded shadow"
          >
            Bienes
          </Button>
    
          <Button
            size="small"
            onClick={() => navigate(`/admin/historial-cambios/${usuario.uuid}`)}
            className="bg-sky-500 hover:bg-sky-600 text-white rounded shadow"
          >
            Historial
          </Button>
    
          {isAdmin && (
  <>
    <Divider type="horizontal" className="my-2" />
    <Button
      size="small"
      onClick={() => navigate(`/usuarios/${usuario.uuid}/edit`)}
      className="bg-yellow-500 hover:bg-yellow-600 text-white rounded shadow"
    >
      Editar
    </Button>
    <Button
      size="small"
      onClick={() => handleReject(usuario)}
      className="bg-orange-500 hover:bg-orange-600 text-white rounded shadow"
    >
      Rechazar
    </Button>
    <Button
      size="small"
      onClick={() => handleDelete(usuario)}
      className="bg-red-500 hover:bg-red-600 text-white rounded shadow"
    >
      Eliminar
    </Button>
  </>
)}

        </div>
      ),
    }
    ,
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Modal del Spinner */}
      <Modal
  open={isLoadingAction}
  footer={null}
  closable={false}
  centered
  className="text-center"
  width={300}
>
  <Spin size="large" />
  <h2 className="mt-4 text-gray-800 font-semibold">Espere un momento...</h2>
  <p className="text-gray-500 text-sm">Procesando solicitud</p>
</Modal>


  
      {/* Modal de Motivo de Rechazo */}
      <Modal
  title={`Motivo de rechazo para ${currentUserName}`}
  open={isModalVisible}
  onOk={handleRejectSubmit}
  onCancel={() => setIsModalVisible(false)}
  okText="Rechazar"
  cancelText="Cancelar"
>
  <p className="text-sm text-gray-600 mb-2">Escribe el motivo por el cual estás rechazando al usuario:</p>
  <Input.TextArea
    rows={4}
    placeholder="Motivo del rechazo..."
    value={rejectionReason}
    onChange={(e) => setRejectionReason(e.target.value)}
  />
</Modal>

  
      {/* Botones de Navegación */}
      <div className="flex justify-between items-center mb-4">
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/dashboard')}
        >
          Volver
        </Button>
        <Button
          type="primary"
          icon={<LogoutOutlined />}
          onClick={() => navigate('/home')}
        >
          Cerrar Sesión
        </Button>
      </div>
  
      {/* Título */}
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
  
      {/* Tabla de Usuarios */}
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
  );
  
  
};

export default UsuarioList;
