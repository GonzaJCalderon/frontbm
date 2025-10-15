import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchApprovedUsers,
   fetchRejectedUsers, 
   fetchPendingRegistrations, 
   deleteUsuario, 
   denyRegistration, 
   approveUser, 
   registrarUsuarioYAsignarRol,
  checkExistingUser } from '../redux/actions/usuarios';
import { fetchBienes, fetchBienesPorPropietario  } from '../redux/actions/bienes';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../redux/axiosConfig';
import { notification, Button, Table, Modal, Input, Spin, Divider,Form, Select } from 'antd';
import { ArrowLeftOutlined, LogoutOutlined } from '@ant-design/icons';

const { Option } = Select;

const departments = [
  'Capital', 'Godoy Cruz', 'Junín', 'Las Heras', 'Maipú', 'Guaymallén', 'Rivadavia',
  'San Martín', 'La Paz', 'Santa Rosa', 'General Alvear', 'Malargüe', 'San Carlos',
  'Tupungato', 'Tunuyán', 'San Rafael', 'Lavalle', 'Luján de Cuyo',
];


const UsuarioList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
const location = useLocation();
const shouldReload = location.state?.reload === true;


  const { approvedUsers = [], loading, error } = useSelector(state => ({
    approvedUsers: Array.isArray(state.usuarios.approvedUsers) ? state.usuarios.approvedUsers : [],
    loading: state.usuarios.loading || false,
    error: state.usuarios.error || null,
  }));
  
  const [filteredUsuarios, setFilteredUsuarios] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserName, setCurrentUserName] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedUserBienes, setSelectedUserBienes] = useState(null);
  const [currentUsuario, setCurrentUsuario] = useState(null);
  const [filters, setFilters] = useState({});
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [bienes, setBienes] = useState([]);
  const [isAddUserModalVisible, setIsAddUserModalVisible] = useState(false);
const [addUserForm] = Form.useForm();
const [validandoRenaper, setValidandoRenaper] = useState(false);
const [renaperError, setRenaperError] = useState('');
const [bloquearDatosRenaper, setBloquearDatosRenaper] = useState(false);
const [datosRenaperCargados, setDatosRenaperCargados] = useState(false);


  



  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  console.log('🔐 Usuario desde localStorage:', userData);
  
  const userRol = (userData?.rol || '').toLowerCase(); // Siempre seguro
  const isAdmin = userRol === 'admin';
  

useEffect(() => {
  const recargarUsuarios = async () => {
    await dispatch(fetchApprovedUsers());

    // 🔄 Limpieza del state o URL según el origen
    if (shouldReload) {
      navigate(location.pathname, { replace: true, state: {} });
      const params = new URLSearchParams(location.search);
      params.delete('reload');
      const newUrl = `${location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    }
  };

  if (shouldReload || approvedUsers.length === 0) {
    recargarUsuarios();
  }
}, [dispatch, shouldReload, location.pathname, location.search, navigate, approvedUsers.length]);



  

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
 
 const validarDNIConRenaper = async (dni, callback) => {
  setValidandoRenaper(true);
  setRenaperError('');
  try {
    const { data } = await api.get(`/renaper/${dni}`);
    console.log('📦 Datos RENAPER:', data);

    if (data.resultado === 0 && data.persona && !data.persona.fallecido) {
      const persona = data.persona;

      // Prepara datos formateados
      const datosFormateados = {
        nombre: persona.nombres,
        apellido: persona.apellidos,
        cuit: persona.nroCuil || '',
        direccion: {
          calle: persona.domicilio?.calle || '',
          altura: persona.domicilio?.nroCalle?.toString() || '',
          departamento: esDeMendoza(persona.domicilio?.provincia)
            ? normalizarDepartamento(persona.domicilio?.localidad)
            : '',
        },
      };

      // Aplica los valores al formulario
      addUserForm.setFieldsValue(datosFormateados);

      // Estado UI
      setBloquearDatosRenaper(true);
      setDatosRenaperCargados(true);
    } else if (data.persona?.fallecido) {
      setRenaperError('La persona figura como fallecida.');
    } else {
      setRenaperError('Persona no encontrada en Renaper.');
    }
  } catch (err) {
    console.error('❌ Error RENAPER:', err);
    setRenaperError('Error al validar DNI con Renaper.');
  } finally {
    setValidandoRenaper(false);
  }
};



const esDeMendoza = (provincia) => provincia.toLowerCase().includes('mendoza');

const normalizarDepartamento = (localidad) => {
  if (!localidad) return '';
  const match = departments.find(dep => 
    dep.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase() ===
    localidad.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase()
  );
  return match || '';
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
  console.log("👤 Usuario seleccionado:", usuario);

  // Detectar si pertenece a una empresa válida
  const esDelegadoResponsable = ['delegado', 'responsable'].includes(
    usuario?.rolEmpresa?.toLowerCase?.() || ''
  );

  // ✅ Tomar la empresa solo si tiene un UUID real
  const empresaUuidValida =
    usuario?.empresa &&
    typeof usuario.empresa.uuid === 'string' &&
    usuario.empresa.uuid !== 'undefined' &&
    usuario.empresa.uuid !== 'null' &&
    usuario.empresa.uuid.trim().length === 36
      ? usuario.empresa.uuid
      : null;

  // ✅ Si tiene empresa válida → usa empresa, si no → usa su propio UUID
  const propietarioUuid = esDelegadoResponsable && empresaUuidValida
    ? empresaUuidValida
    : usuario.uuid;

  if (!propietarioUuid || propietarioUuid === 'undefined') {
    notification.warning({
      message: '⚠️ Sin empresa asignada',
      description: `El usuario ${usuario.nombre} ${usuario.apellido} no tiene una empresa asociada.`,
    });
    return;
  }

  console.log("🏷️ UUID final para obtener bienes:", propietarioUuid);

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
{isAdmin &&
  usuario.uuid !== userData.uuid && // 💥 No se puede autoeliminar
  !['admin', 'moderador'].includes((usuario.rolDefinitivo || '').toLowerCase()) && (
    <Button
      size="small"
      onClick={() => handleDelete(usuario)}
      className="bg-red-500 hover:bg-red-600 text-white rounded shadow"
    >
      Eliminar
    </Button>
)}
  </>
)}

        </div>
      ),
    }
    ,
  ];






  return (
    <div className="p-6 bg-gray-100 min-h-screen">
{/* Modal de Agregar Usuario */}
<Modal
  title="Registrar nuevo usuario"
  open={isAddUserModalVisible}
  onCancel={() => setIsAddUserModalVisible(false)}
  onOk={() => addUserForm.submit()}
  okText="Registrar"
  cancelText="Cancelar"
>
   <p>Completá el siguiente formulario para registrar un nuevo usuario, Ingrese el DNI y espere mientras RENAPER verifica la información.:</p>
  <Form
    form={addUserForm}
    layout="vertical"
   onFinish={async (values) => {
  try {
    // 👀 Validar si ya existe usuario por DNI, nombre y apellido
    const existe = await dispatch(checkExistingUser({
      dni: values.dni,
      nombre: values.nombre,
      apellido: values.apellido
    }));

    if (existe?.existe) {
      notification.error({
        message: '❌ Usuario duplicado',
        description: 'Ya existe un usuario registrado con este DNI, nombre y apellido.',
      });
      return; // Detener registro
    }

    // Registrar y asignar rol
    await dispatch(registrarUsuarioYAsignarRol(values));
    notification.success({ message: '✅ Usuario registrado y rol asignado correctamente' });

    setIsAddUserModalVisible(false);
    addUserForm.resetFields();
    dispatch(fetchApprovedUsers());
  } catch (error) {
    notification.error({
      message: '❌ Error',
      description: error.message || 'Error al registrar usuario.',
    });
  }
}}

  >
     <Form.Item
  name="dni"
  label="DNI"
  rules={[{ required: true, message: 'El DNI es obligatorio' }]}
>
  <Input
    onBlur={(e) => {
  const dni = e.target.value;
  if (dni && /^\d{7,8}$/.test(dni)) {
    validarDNIConRenaper(dni, (persona) => {
      addUserForm.setFieldsValue({
        nombre: persona.nombres,
        apellido: persona.apellidos,
        cuit: persona.nroCuil || '',
        direccion: {
          departamento: esDeMendoza(persona.provincia)
            ? normalizarDepartamento(persona.localidad)
            : '',
        },
      });
      setBloquearDatosRenaper(true);
    });
  }
}}

  />
</Form.Item>

{renaperError && (
  <p className="text-red-500 text-sm mb-2">{renaperError}</p>
)}
{validandoRenaper && (
  <Spin size="small" className="mb-2" />
)}

  <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
  <Input disabled={bloquearDatosRenaper} />
</Form.Item>
<Form.Item name="apellido" label="Apellido" rules={[{ required: true }]}>
  <Input disabled={bloquearDatosRenaper} />
</Form.Item>

  


    <Form.Item name="cuit" label="CUIT" rules={[{ required: true }]}><Input /></Form.Item>
    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
    <Form.Item name="tipo" label="Tipo" rules={[{ required: true }]}>
      <Select placeholder="Seleccione tipo de usuario">
        <Option value="fisica">Persona Física</Option>
        <Option value="juridica">Persona Jurídica</Option>
      </Select>
    </Form.Item>
    <Form.Item name="rol" label="Rol" rules={[{ required: true }]}>
      <Select placeholder="Seleccione rol">
        <Option value="admin">Admin</Option>
        <Option value="moderador">Moderador</Option>
        <Option value="usuario">Usuario</Option>
        <Option value="responsable">Responsable</Option>
        <Option value="delegado">Delegado</Option>
      </Select>
    </Form.Item>
    <Form.Item name={['direccion', 'calle']} label="Calle" rules={[{ required: true }]}><Input /></Form.Item>
    <Form.Item name={['direccion', 'altura']} label="Altura" rules={[{ required: true }]}><Input /></Form.Item>
    <Form.Item name={['direccion', 'departamento']} label="Departamento" rules={[{ required: true }]}>
  <Input disabled={bloquearDatosRenaper} />
</Form.Item>
{datosRenaperCargados && (
  <Button size="small" onClick={() => {
    setBloquearDatosRenaper(false);
    setDatosRenaperCargados(false);
    notification.info({ message: 'Modo manual activado' });
  }}>
    ✏️ Editar manualmente
  </Button>
)}

  </Form>
</Modal>

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

        {/* <Button
          type="primary"
          icon={<LogoutOutlined />}
          onClick={() => navigate('/home')}
        >
          Cerrar Sesión
        </Button> */}
      <Button
  style={{
    backgroundColor: '	#A3D9A5', // Celeste pastel
    borderColor: '	#A3D9A5',
    color: '#000000',
    fontWeight: 'bold',
    borderRadius: '6px',
  }}
  icon={<span style={{ fontSize: '1.2em', fontWeight: 'bold' }}>＋</span>}
  onClick={() => setIsAddUserModalVisible(true)}
>
  Agregar Usuario
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
