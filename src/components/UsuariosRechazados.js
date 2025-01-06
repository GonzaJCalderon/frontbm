import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRejectedUsers, approveUser } from '../redux/actions/usuarios';
import { notification, Button, Table } from 'antd';
import { ArrowLeftOutlined, LogoutOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const UsuariosRechazados = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { rejectedUsers, loading, error } = useSelector((state) => state.usuarios);

  const userData = JSON.parse(localStorage.getItem('userData'));
  const isAdmin = userData?.rolDefinitivo === 'admin';

  useEffect(() => {
    dispatch(fetchRejectedUsers());
  }, [dispatch]);

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

  if (loading) {
    return <p>Cargando usuarios rechazados...</p>;
  }
  if (error) {
    return <p>Error al cargar usuarios: {error}</p>;
  }

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
      title: 'Dirección',
      dataIndex: 'direccion',
      key: 'direccion',
      render: (direccion) =>
        direccion
          ? `${direccion.calle || ''} ${direccion.altura || ''}, ${direccion.barrio || ''}, ${direccion.departamento || ''}`
          : 'No disponible',
    },
    {
      title: 'Motivo del Rechazo',
      dataIndex: 'motivoRechazo',
      key: 'motivoRechazo',
      render: (text) => text || 'No especificado',
    },
    {
      title: 'Rechazado Por',
      dataIndex: 'rechazadoPor',
      key: 'rechazadoPor',
      render: (rechazadoPor) => rechazadoPor || 'No especificado',
    },
    {
      title: 'Fecha y Hora del Rechazo',
      dataIndex: 'fechaRechazo',
      key: 'fechaRechazo',
      render: (fechaRechazo) => (fechaRechazo ? new Date(fechaRechazo).toLocaleString() : 'No disponible'),
    },
  ];
  
  // Si el usuario es administrador, agregar columna de acciones.
  if (isAdmin) {
    columns.push({
      title: 'Acciones',
      key: 'acciones',
      render: (text, user) => (
        <Button onClick={() => handleApprove(user.uuid)} className="bg-green-600 text-white rounded">
          Aprobar
        </Button>
      ),
    });
  }
  

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <Button type="primary" icon={<ArrowLeftOutlined />} onClick={handleBack}>
          Volver
        </Button>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <Button type="default" icon={<HomeOutlined />} onClick={() => navigate('/admin/dashboard')}>
            Inicio
          </Button>
          <Button type="primary" icon={<LogoutOutlined />} onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Usuarios Rechazados</h2>
      <div className="overflow-x-auto mt-4">
        <Table
          dataSource={rejectedUsers}
          columns={columns}
          rowKey="uuid"
          pagination={{ pageSize: 10 }}
        />
      </div>
    </div>
  );
};

export default UsuariosRechazados;
