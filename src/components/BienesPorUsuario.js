import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Spin, Alert, Button, Space, Input, Modal, Carousel, Typography } from 'antd';
import { LeftOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchBienes } from '../redux/actions/bienes';

const { Search } = Input;
const { Title } = Typography;

const BienesPorUsuario = () => {
  const { uuid } = useParams(); // Obtener UUID de la URL
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentFotos, setCurrentFotos] = useState([]);
  const [userName, setUserName] = useState('');

  const { items = [], loading, error } = useSelector((state) => state.bienes || {});
  const usuarios = useSelector((state) => state.usuarios.approvedUsers || []); // Obtener lista de usuarios aprobados

  // Obtener los bienes del usuario al cargar el componente
  useEffect(() => {
    if (uuid) {
      dispatch(fetchBienes(uuid)); // Usamos fetchBienes con el UUID
    }
  }, [uuid, dispatch]);

  // Obtener información del usuario
  useEffect(() => {
    const usuario = usuarios.find((user) => user.uuid === uuid);
    if (usuario) {
      setUserName(`${usuario.nombre} ${usuario.apellido}`);
    }
  }, [usuarios, uuid]);

  // Actualizar elementos filtrados cuando se cargan bienes
  useEffect(() => {
    if (Array.isArray(items)) {
      const sortedItems = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setFilteredItems(sortedItems);
    } else {
      setFilteredItems([]);
    }
  }, [items]);

  // Manejo de búsqueda
  const handleSearch = (value) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setFilteredItems(items);
    } else {
      const filtered = items.filter((item) =>
        (item.tipo || '').toLowerCase().includes(value.toLowerCase()) ||
        (item.marca || '').toLowerCase().includes(value.toLowerCase()) ||
        (item.modelo || '').toLowerCase().includes(value.toLowerCase()) ||
        (item.descripcion || '').toLowerCase().includes(value.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  };

  // Mostrar imágenes en un modal
  const handleOpenModal = (fotos) => {
    setCurrentFotos(fotos.filter((url) => url)); // Asegurar que las fotos no sean nulas o indefinidas
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setCurrentFotos([]);
    setIsModalVisible(false);
  };

  // Manejo de cierre de sesión
  const handleLogout = () => {
    localStorage.clear();
    navigate('/home');
  };

  // Configuración de las columnas
  const columns = [
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      render: (text) => <span className="font-medium">{text || 'No disponible'}</span>,
    },
    {
      title: 'Marca',
      dataIndex: 'marca',
      key: 'marca',
      render: (text) => <span>{text || 'No disponible'}</span>,
    },
    {
      title: 'Modelo',
      dataIndex: 'modelo',
      key: 'modelo',
      render: (text) => <span>{text || 'No disponible'}</span>,
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      render: (text) => <span>{text || 'No disponible'}</span>,
    },
    {
      title: 'Precio',
      dataIndex: 'precio',
      key: 'precio',
      render: (precio) => <span className="text-green-500">{precio ? `$${precio}` : 'No disponible'}</span>,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => <span>{stock || 'No disponible'}</span>,
    },
    {
      title: 'Fecha de Creación',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => <span>{date ? new Date(date).toLocaleDateString() : 'No disponible'}</span>,
    },
    {
      title: 'Fotos',
      dataIndex: 'fotos',
      key: 'fotos',
      render: (fotos) => {
        const validFotos = (fotos || []).filter((url) => url);
        return validFotos.length > 0 ? (
          <img
            src={validFotos[0]} // Mostrar la primera imagen
            alt="Foto"
            style={{ width: '80px', height: 'auto', cursor: 'pointer', borderRadius: '8px' }}
            onClick={() => handleOpenModal(validFotos)} // Abre el modal al hacer clic
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
        <Button type="primary" onClick={() => navigate(`/bienes/trazabilidad/${bien.uuid}`)}>
          Ver Trazabilidad
        </Button>
      ),
    },
  ];

  // Renderización del componente
  if (loading) return <Spin tip="Cargando bienes..." />;
  if (error) return <Alert message="Error" description={error} type="error" />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<LeftOutlined />} onClick={() => navigate(-1)}>
          Volver
        </Button>
        <Button icon={<LogoutOutlined />} onClick={handleLogout} danger>
          Cerrar sesión
        </Button>
        <Search
          placeholder="Buscar bienes"
          value={searchTerm}
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
          enterButton
        />
      </Space>
      <Title level={3} className="mb-4">{`Bienes de ${userName || 'Usuario desconocido'}`}</Title>
      {filteredItems.length > 0 ? (
        <Table
          dataSource={filteredItems}
          columns={columns}
          rowKey="uuid"
          pagination={{ pageSize: 10, position: ['bottomCenter'] }}
          bordered
        />
      ) : (
        <Alert
          message="Sin bienes"
          description="No se encontraron bienes para este usuario."
          type="info"
          showIcon
        />
      )}

      <Modal
        open={isModalVisible}
        footer={null}
        onCancel={handleCloseModal}
        centered
        width={600}
      >
        <Carousel autoplay>
          {currentFotos.map((url, index) => (
            <div key={index}>
              <img
                src={url}
                alt={`Foto ${index + 1}`}
                style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
              />
            </div>
          ))}
        </Carousel>
      </Modal>
    </div>
  );
};

export default BienesPorUsuario;
