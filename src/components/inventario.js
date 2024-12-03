import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Typography, Spin, Alert, Button, Space, Input, Modal } from 'antd';
import { LeftOutlined, HomeOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Search } = Input;

const Inventario = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); // Estado para imagen seleccionada
  const [isModalVisible, setIsModalVisible] = useState(false); // Estado para el Modal

  const { items = [], error, loading } = useSelector((state) => state.bienes);

  useEffect(() => {
    const sortedItems = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFilteredItems(sortedItems);
  }, [items]);

  const handleSearch = (value) => {
    const lowercasedValue = value.toLowerCase();
    const filtered = items.filter((item) =>
      (item.tipo && item.tipo.toLowerCase().includes(lowercasedValue)) ||
      (item.marca && item.marca.toLowerCase().includes(lowercasedValue)) ||
      (item.modelo && item.modelo.toLowerCase().includes(lowercasedValue))
    );
    const sortedFiltered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFilteredItems(sortedFiltered);
  };

  const handleBack = () => navigate(-1);
  const handleHome = () => navigate('/userdashboard');
  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/home');
  };

  const handleImageClick = (image) => {
    setSelectedImage(image); // Selecciona la imagen
    setIsModalVisible(true); // Muestra el Modal
  };

  const handleModalClose = () => {
    setIsModalVisible(false); // Cierra el Modal
    setSelectedImage(null); // Limpia la imagen seleccionada
  };

  const columns = [
    {
      title: 'Tipo',
      dataIndex: 'tipo',
    },
    {
      title: 'Marca',
      dataIndex: 'marca',
    },
    {
      title: 'Modelo',
      dataIndex: 'modelo',
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
    },
    {
      title: 'IMEI',
      dataIndex: 'imei',
      render: (imei) => imei || 'No aplica',
    },
    {
      title: 'Foto',
      dataIndex: 'foto',
      render: (fotos) =>
        fotos && fotos.length > 0 ? (
          <img
            src={fotos[0]} // Muestra la primera foto
            alt="Foto del bien"
            style={{ width: '100px', height: 'auto', cursor: 'pointer' }} // Hacemos clickeable la imagen
            onClick={() => handleImageClick(fotos[0])} // Maneja el click
          />
        ) : (
          'Sin imagen'
        ),
    },
    {
      title: 'Fecha de creación',
      dataIndex: 'createdAt',
    },
  ];

  if (loading) return <Spin tip="Cargando..." />;
  if (error) return <Alert message="Error" description={error} type="error" />;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<LeftOutlined />} onClick={handleBack}>
          Volver
        </Button>
        <Button icon={<HomeOutlined />} onClick={handleHome}>
          Home
        </Button>
        <Button icon={<LogoutOutlined />} onClick={handleLogout} danger>
          Cerrar sesión
        </Button>
        <Search
          placeholder="Buscar por tipo, marca o modelo"
          onSearch={handleSearch}
          style={{ width: 200 }}
          enterButton
        />
      </Space>
      <Title level={2}>Inventario</Title>
      <Table dataSource={filteredItems} columns={columns} rowKey="uuid" pagination={{ pageSize: 10 }} />

      {/* Modal para la imagen */}
      <Modal
        visible={isModalVisible}
        footer={null}
        onCancel={handleModalClose}
        centered
      >
        <img src={selectedImage} alt="Vista ampliada" style={{ width: '100%' }} />
      </Modal>
    </div>
  );
};

export default Inventario;
