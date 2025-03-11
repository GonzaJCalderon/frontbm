import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Spin, Alert, Button, Space, Input, Modal, Form, InputNumber, message, Typography } from 'antd';
import { LeftOutlined, LogoutOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchBienesPorUsuario, updateBien, deleteBien } from '../redux/actions/bienes';

const { Search } = Input;
const { Title } = Typography;
const { confirm } = Modal;

const BienesPorUsuario = () => {
  const { uuid } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [userName, setUserName] = useState('');
  const [form] = Form.useForm();

  const { items = [], loading, error } = useSelector((state) => state.bienes || {});
  const usuarios = useSelector((state) => state.usuarios.approvedUsers || []);

  useEffect(() => {
    if (uuid) {
      dispatch(fetchBienesPorUsuario(uuid));
    }
  }, [uuid, dispatch]);

  useEffect(() => {
    if (Array.isArray(items)) {
      setFilteredItems(items);
    }
  }, [items]);

  useEffect(() => {
    const usuario = usuarios.find((user) => user.uuid === uuid);
    if (usuario) {
      setUserName(`${usuario.nombre} ${usuario.apellido}`);
    }
  }, [usuarios, uuid]);

  // 🔹 Abrir modal de edición
  const handleEdit = (bien) => {
    setCurrentItem(bien);
    form.setFieldsValue({ ...bien });
    setIsEditModalVisible(true);
  };

  // 🔹 Cerrar modal de edición
  const handleCancelEdit = () => {
    setCurrentItem(null);
    setIsEditModalVisible(false);
    form.resetFields();
  };

  // 🔹 Guardar cambios
  const handleSaveEdit = async () => {
    try {
      const updatedValues = await form.validateFields();
      dispatch(updateBien(currentItem.uuid, updatedValues));
      message.success('Bien actualizado correctamente.');
      handleCancelEdit();
    } catch (error) {
      console.error('Error al actualizar:', error);
    }
  };

  // 🔹 Confirmar eliminación
  const handleDelete = (uuid) => {
    confirm({
      title: '¿Estás seguro de eliminar este bien?',
      icon: <ExclamationCircleOutlined />,
      content: 'Esta acción no se puede deshacer.',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk() {
        dispatch(deleteBien(uuid));
        message.success('Bien eliminado correctamente.');
      },
    });
  };

  // 🔹 Columnas de la tabla
  const columns = [
    { title: 'Tipo', dataIndex: 'tipo', key: 'tipo' },
    { title: 'Marca', dataIndex: 'marca', key: 'marca' },
    { title: 'Modelo', dataIndex: 'modelo', key: 'modelo' },
    { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion' },
    { 
      title: 'Precio', 
      dataIndex: 'precio', 
      key: 'precio', 
      render: (precio) => precio ? `$${Number(precio).toFixed(2)}` : 'No disponible' 
    },
    { title: 'Stock', dataIndex: 'stock', key: 'stock' },
    {
      title: 'IMEIs y Estado',
      dataIndex: 'identificadores',
      key: 'identificadores',
      render: (identificadores) => {
        if (!identificadores || identificadores.length === 0) {
          return <span style={{ color: 'gray' }}>Sin identificadores disponibles</span>;
        }
        return identificadores.map((imei, index) => (
          <p key={index}>{imei.identificador_unico} - {imei.estado || 'Disponible'}</p>
        ));
      },
    },
    {
      title: 'Fotos',
      dataIndex: 'fotos',
      key: 'fotos',
      render: (fotos) => {
        const validFotos = (fotos || []).filter((url) => url);
        return validFotos.length > 0 ? (
          <img
            src={validFotos[0]}
            alt="Foto"
            style={{ width: '80px', height: 'auto', cursor: 'pointer', borderRadius: '8px' }}
          />
        ) : (
          <span style={{ color: 'gray' }}>Sin imagen</span>
        );
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, bien) => (
        <Space>
          <Button type="primary" onClick={() => navigate(`/bienes/trazabilidad/${bien.uuid}`)}>
            Ver Trazabilidad
          </Button>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(bien)}>
            Editar
          </Button>
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(bien.uuid)}>
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<LeftOutlined />} onClick={() => navigate(-1)}>Volver</Button>
        <Button icon={<LogoutOutlined />} onClick={() => { localStorage.clear(); navigate('/home'); }} danger>Cerrar sesión</Button>
        <Search placeholder="Buscar bienes" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: 300 }} enterButton />
      </Space>

      <Title level={3} className="mb-4">Bienes de {userName || 'Usuario desconocido'}</Title>

      {loading ? <Spin tip="Cargando bienes..." /> :
        error ? <Alert message="Error" description={error} type="error" /> :
        <Table dataSource={filteredItems} columns={columns} rowKey="uuid" pagination={{ pageSize: 10, position: ['bottomCenter'] }} bordered />
      }

      {/* 🛠 MODAL PARA EDITAR */}
      <Modal title="Editar Bien" visible={isEditModalVisible} onOk={handleSaveEdit} onCancel={handleCancelEdit} okText="Guardar cambios">
        <Form form={form} layout="vertical">
          <Form.Item name="descripcion" label="Descripción" rules={[{ required: true, message: 'Ingrese la descripción' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="precio" label="Precio" rules={[{ required: true, message: 'Ingrese el precio' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stock" label="Stock" rules={[{ required: true, message: 'Ingrese la cantidad de stock' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BienesPorUsuario;
