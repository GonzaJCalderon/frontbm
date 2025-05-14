import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Card,
  Typography,
  Spin,
  notification,
  Modal,
  Form,
  Input,
  Popconfirm,
  Space, 
  Tag,
} from 'antd';
import {
  FaUserPlus,
  FaSignOutAlt,
  FaArrowLeft,
  FaEdit,
  FaTrashAlt,
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDelegados, deleteUsuario, updateUser } from '../redux/actions/usuarios';

const { Title } = Typography;

const DelegadosEmpresa = () => {
  const { uuid } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const delegados = useSelector((state) => state.usuarios.delegados);
  const delegadosLoading = useSelector((state) => state.usuarios.delegadosLoading);
  const delegadosError = useSelector((state) => state.usuarios.delegadosError);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDelegado, setSelectedDelegado] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (uuid) dispatch(fetchDelegados(uuid));
  }, [dispatch, uuid]);

  useEffect(() => {
    if (delegadosError) {
      notification.error({
        message: 'Error al cargar delegados',
        description: delegadosError,
      });
    }
  }, [delegadosError]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleEdit = (delegado) => {
    setSelectedDelegado(delegado);
    form.setFieldsValue({
      ...delegado,
      calle: delegado.direccion?.calle || '',
      altura: delegado.direccion?.altura || '',
      departamento: delegado.direccion?.departamento || '',
    });
    setEditModalOpen(true);
  };

  const handleDelete = async (uuidDelegado) => {
    try {
      await dispatch(deleteUsuario(uuidDelegado));
      notification.success({ message: 'Delegado eliminado correctamente' });
      dispatch(fetchDelegados(uuid));
    } catch (error) {
      notification.error({ message: 'Error al eliminar delegado', description: error.message });
    }
  };

  const handleEditSubmit = async (values) => {
    try {
      const delegadoUuid = selectedDelegado?.uuid;
      if (!delegadoUuid) throw new Error('No se seleccionó un delegado');

      const userData = {
        ...values,
        direccion: {
          calle: values.calle,
          altura: values.altura,
          departamento: values.departamento,
        },
      };

      await dispatch(updateUser(delegadoUuid, userData));
      setEditModalOpen(false);
      dispatch(fetchDelegados(uuid));
    } catch (error) {
      notification.error({
        message: 'Error al guardar cambios',
        description: error.message,
      });
    }
  };

 // 👇 Mismo código con columna nueva para mostrar el rol
const columns = [
  { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
  { title: 'Apellido', dataIndex: 'apellido', key: 'apellido' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'DNI', dataIndex: 'dni', key: 'dni' },
  {
    title: 'Rol en la Empresa',
    dataIndex: 'rolEmpresa',
    key: 'rolEmpresa',
    render: (rol) => (
      <Tag color={
        rol === 'responsable' ? 'red' :
        rol === 'delegado' ? 'blue' :
        'default'
      }>
        {rol ? rol.charAt(0).toUpperCase() + rol.slice(1) : 'Sin Rol'}
      </Tag>
    ),
  },
  {
    title: 'Dirección',
    dataIndex: 'direccion',
    key: 'direccion',
    render: (direccion) =>
      direccion
        ? `${direccion.calle || ''} ${direccion.altura || ''}, ${direccion.departamento || ''}`
        : 'No disponible',
  },
  {
    title: 'Estado',
    dataIndex: 'estado',
    key: 'estado',
    render: (estado) => estado?.charAt(0).toUpperCase() + estado?.slice(1),
  },
  {
    title: 'Fecha Alta',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (value) => new Date(value).toLocaleDateString(),
  },
  {
    title: 'Acciones',
    key: 'acciones',
    render: (_, delegado) => (
      <Space>
        <Button icon={<FaEdit />} onClick={() => handleEdit(delegado)}>
          Editar
        </Button>
        <Popconfirm
          title="¿Estás seguro de eliminar?"
          okText="Sí"
          cancelText="Cancelar"
          onConfirm={() => handleDelete(delegado.uuid)}
        >
          <Button icon={<FaTrashAlt />} danger>
            Eliminar
          </Button>
        </Popconfirm>
      </Space>
    ),
  },
];


  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<FaArrowLeft />} onClick={() => navigate(-1)}>
          Volver
        </Button>
        <Button icon={<FaSignOutAlt />} danger onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </Space>

      <Card
        title={<Title level={3}>Usuarios delegados</Title>}
        extra={
          <Button
            type="primary"
            icon={<FaUserPlus />}
            onClick={() => navigate('/empresa/registrar-delegado')}
          >
            Agregar delegado
          </Button>
        }
      >
        {delegadosLoading ? (
          <Spin size="large" />
        ) : (
          <Table
            dataSource={delegados}
            columns={columns}
            rowKey="uuid"
            pagination={{ pageSize: 5 }}
          />
        )}
      </Card>

      <Modal
        title="Editar Delegado"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={() => form.submit()}
        okText="Guardar Cambios"
      >
        <Form form={form} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="apellido" label="Apellido" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="dni" label="DNI">
            <Input />
          </Form.Item>
          <Form.Item name="calle" label="Calle">
            <Input />
          </Form.Item>
          <Form.Item name="altura" label="Altura">
            <Input />
          </Form.Item>
          <Form.Item name="departamento" label="Departamento">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DelegadosEmpresa;
