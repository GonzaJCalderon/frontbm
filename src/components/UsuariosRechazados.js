import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRejectedUsers, approveUser } from '../redux/actions/usuarios';
import { notification, Button, Table, Modal, Input } from 'antd';
import { ArrowLeftOutlined, LogoutOutlined, HomeOutlined , CheckCircleOutlined} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const UsuariosRechazados = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 👇 Esto es lo que te faltaba
  const userData = JSON.parse(localStorage.getItem('userData'));

  const { rejectedUsers, loading, error } = useSelector((state) => state.usuarios);

  const isAdmin = userData?.rol === 'admin';

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUserUuid, setSelectedUserUuid] = useState(null);
  const [approvalComment, setApprovalComment] = useState('');


  useEffect(() => {
    console.log('Rol actual del usuario:', userData?.rolDefinitivo);
  }, [userData]);

  useEffect(() => {
    dispatch(fetchRejectedUsers());
  }, [dispatch]);



  const handleApprove = () => {
    const fechaAprobacion = new Date().toISOString();
    const aprobadoPor = userData.uuid;
    const aprobadoPorNombre = `${userData.nombre} ${userData.apellido}`;
    const estado = 'aprobado';

    dispatch(
      approveUser(selectedUserUuid, {
        estado,
        fechaAprobacion,
        aprobadoPor,
        aprobadoPorNombre,
        comentarioAprobacion: approvalComment,
      })
    )
      .then(() => {
        notification.success({
          message: 'Usuario aprobado',
          description: `El usuario ha sido aprobado correctamente.`,
        });
        dispatch(fetchRejectedUsers());
      })
      .catch((error) => {
        notification.error({
          message: 'Error al aprobar usuario',
          description: error.message || 'Ocurrió un error inesperado.',
        });
      });

    setIsModalVisible(false);
    setApprovalComment('');
  };

  const showModal = (uuid) => {
    setSelectedUserUuid(uuid);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setApprovalComment('');
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    notification.success({
      message: 'Cierre de sesión exitoso',
      description: 'Has cerrado sesión correctamente.',
    });
    navigate('/home');
  };

  const columns = [
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Apellido', dataIndex: 'apellido', key: 'apellido' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'DNI', dataIndex: 'dni', key: 'dni' },
    {
      title: 'Dirección',
      dataIndex: 'direccion',
      key: 'direccion',
      render: (direccion) =>
        direccion
          ? `${direccion.calle || ''} ${direccion.altura || ''}, ${direccion.barrio || ''}, ${direccion.departamento || ''}`
          : 'No disponible',
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
    { title: 'Motivo del Rechazo', dataIndex: 'motivoRechazo', key: 'motivoRechazo', render: (text) => text || 'No especificado' },
    { title: 'Rechazado Por', dataIndex: 'rechazadoPor', key: 'rechazadoPor', render: (rechazadoPor) => rechazadoPor || 'No especificado' },
    { title: 'Fecha y Hora del Rechazo', dataIndex: 'fechaRechazo', key: 'fechaRechazo', render: (fecha) => (fecha ? new Date(fecha).toLocaleString() : 'No disponible') },
  ];

  if (isAdmin) {
    columns.push({
      title: 'Acciones',
      key: 'acciones',
      render: (_, user) => (
        <Button
        onClick={() => showModal(user.uuid)}
        icon={<CheckCircleOutlined />}
        className="bg-green-600 hover:bg-green-700 text-white rounded shadow"
      >
        Aprobar
      </Button>
      
      ),
    });
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/dashboard')}>
          Volver
        </Button>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <Button icon={<HomeOutlined />} onClick={() => navigate('/admin/dashboard')}>
            Inicio
          </Button>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Usuarios Rechazados</h2>

      <Table dataSource={rejectedUsers} columns={columns} rowKey="uuid" pagination={{ pageSize: 10 }} loading={loading} />

      <Modal title="Confirmar Aprobación" open={isModalVisible} onOk={handleApprove} onCancel={handleCancel}>
      <p className="text-gray-700 mb-2">
¿Confirmas la aprobación del usuario rechazado? Esta acción moverá al usuario a la lista de aprobados.
</p>

        <Input.TextArea
          rows={4}
          placeholder="Comentario opcional para la aprobación"
          value={approvalComment}
          onChange={(e) => setApprovalComment(e.target.value)}
        />
      </Modal>

   {error && <p className="text-red-500">Error al cargar usuarios: {error}</p>}

    </div>
  );
};

export default UsuariosRechazados;
