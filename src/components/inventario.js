import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBienesPorUsuario } from '../redux/actions/bienes';
import { Table, Typography, Spin, Alert, Button, Space, Input } from 'antd';
import { LeftOutlined, HomeOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Search } = Input;

const Inventario = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [filteredItems, setFilteredItems] = useState([]);
  const { items = [], error, loading } = useSelector(state => state.bienes);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const userId = userData?.id;

    if (userId) {
      dispatch(fetchBienesPorUsuario(userId));  // Llamar a la acción con el userId
    } else {
      console.error('ID del usuario no encontrado en localStorage');
    }
  }, [dispatch]);

  useEffect(() => {
    const sortedItems = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFilteredItems(sortedItems);
  }, [items]);

  const handleSearch = (value) => {
    const lowercasedValue = value.toLowerCase();
    const filtered = items.filter(item =>
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

  // Si el usuario no tiene bienes registrados
  if (!loading && !filteredItems.length) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <Title level={3}>No tienes bienes registrados</Title>
        <p>Parece que aún no has añadido ningún bien a tu inventario.</p>
        <Button type="primary" icon={<LeftOutlined />} onClick={handleBack}>
          Volver a la página anterior
        </Button>
      </div>
    );
  }

  if (error) {
    const errorMessage = error.message || 'Ocurrió un error desconocido';
    return <Alert message="Error" description={errorMessage} type="error" />;
  }

  if (loading) {
    return <Spin tip="Cargando..." />;
  }

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
      title: 'Fecha de creación',
      dataIndex: 'createdAt',
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<LeftOutlined />} onClick={handleBack}>Volver</Button>
        <Button icon={<HomeOutlined />} onClick={handleHome}>Home</Button>
        <Button icon={<LogoutOutlined />} onClick={handleLogout} danger>Cerrar sesión</Button>
        <Search
          placeholder="Buscar por tipo, marca o modelo"
          onSearch={handleSearch}
          style={{ width: 200 }}
          enterButton
        />
      </Space>
      <Title level={2}>Inventario</Title>
      <Table
        dataSource={filteredItems}
        columns={columns}
        rowKey="uuid"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default Inventario;
