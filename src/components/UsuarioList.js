import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApprovedUsers, deleteUsuario } from '../redux/actions/usuarios';
import { useNavigate } from 'react-router-dom';
import { notification, Button, Table } from 'antd';
import { ArrowLeftOutlined, LogoutOutlined, HomeOutlined } from '@ant-design/icons';

const UsuarioList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { usuarios, loading, error } = useSelector(state => state.usuarios || { usuarios: [], loading: false, error: null });
  
  // Obtén el rol del usuario autenticado desde localStorage
  const userData = JSON.parse(localStorage.getItem('userData'));
  const isAdmin = userData && userData.rolDefinitivo === 'administrador';

  useEffect(() => {
    dispatch(fetchApprovedUsers());
  }, [dispatch]);

  const handleViewDetails = async (user) => {
    try {
      navigate(`/admin/operaciones/${user.id}`);
    } catch (error) {
      console.error('Error capturado en handleViewDetails:', error.message);
      notification.error({
        message: 'Error al cargar operaciones',
        description: error.message,
      });
    }
  };

  const handleEdit = (id) => {
    navigate(`/usuarios/${id}/edit`);
  };

  const handleDelete = (id) => {
    dispatch(deleteUsuario(id))
      .then(() => {
        notification.success({
          message: 'Usuario eliminado',
          description: `El usuario con ID ${id} ha sido eliminado con éxito.`,
        });
        dispatch(fetchApprovedUsers());  // Volver a cargar los usuarios
      })
      .catch(error => {
        notification.error({
          message: 'Error al eliminar usuario',
          description: error.message,
        });
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    notification.success({
      message: 'Cierre de sesión exitoso',
      description: 'Has cerrado sesión correctamente.',
    });
    navigate('/home');
  };

  const handleBack = () => {
    navigate('/admin/dashboard');
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
      render: text => text || 'No disponible',
    },
    {
      title: 'DNI',
      dataIndex: 'dni',
      key: 'dni',
      render: text => text || 'No disponible',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Dirección',
      dataIndex: 'direccion',
      key: 'direccion',
      render: direccion => direccion ? `${direccion.calle}, ${direccion.altura}, ${direccion.barrio}, ${direccion.departamento}` : 'No disponible',
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (text, user) => (
        <div className="flex space-x-2">
          <Button
            onClick={() => handleViewDetails(user)}
            className="bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          >
            Ver Operaciones
          </Button>
          {isAdmin && (
            <>
              <Button
                onClick={() => handleEdit(user.id)}
                className="bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
              >
                Editar
              </Button>
              <Button
                onClick={() => handleDelete(user.id)}
                className="bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Eliminar
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

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

      <h1 className="text-2xl font-bold mb-4">Lista de Usuarios</h1>
      {loading ? (
        <div className="text-center">Cargando...</div>
      ) : (
        <Table 
          dataSource={usuarios} 
          columns={columns} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      )}
      {error && (
        <div className="text-red-500 mt-4">
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
};

export default UsuarioList;
