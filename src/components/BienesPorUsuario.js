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
  const [currentIdentifiers, setCurrentIdentifiers] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
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
      const filtered = items.filter((item) => {
        const matchGeneral =
          (item.tipo || '').toLowerCase().includes(value.toLowerCase()) ||
          (item.marca || '').toLowerCase().includes(value.toLowerCase()) ||
          (item.modelo || '').toLowerCase().includes(value.toLowerCase()) ||
          (item.descripcion || '').toLowerCase().includes(value.toLowerCase());

        const matchIdentificadores = (item.identificadores || []).some((imei) =>
          imei.estado.toLowerCase().includes(value.toLowerCase())
        );

        return matchGeneral || matchIdentificadores;
      });
      setFilteredItems(filtered);
    }
  };

  // Modal para mostrar detalles de IMEIs
  const handleOpenIdentifiersModal = (identificadores, item) => {
    setCurrentIdentifiers(identificadores);
    setCurrentItem(item);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setCurrentIdentifiers([]);
    setCurrentItem(null);
    setIsModalVisible(false);
  };

  // Mostrar imágenes en un modal
  const handleOpenFotosModal = (fotos) => {
    setCurrentFotos(fotos.filter((url) => url)); // Asegurar que las fotos no sean nulas o indefinidas
    setIsModalVisible(true);
  };

  const handleCloseFotosModal = () => {
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
      render: (stock) => <span>{stock || 0}</span>,
    },
    {
      title: 'IMEIs y Estado',
      dataIndex: 'identificadores',
      key: 'identificadores',
      render: (identificadores, record) => {
        if (!identificadores || identificadores.length === 0) {
          return <span style={{ color: 'gray' }}>Sin identificadores disponibles</span>;
        }

        return (
          <>
            <span>{`${identificadores.length} identificadores`}</span>
            <Button
              type="link"
              onClick={() => handleOpenIdentifiersModal(identificadores, record)}
              style={{ marginLeft: 8 }}
            >
              Ver detalles
            </Button>
          </>
        );
      },
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
            onClick={() => handleOpenFotosModal(validFotos)} // Abre el modal al hacer clic
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
        title={`IMEIs y Estado - ${currentItem?.tipo || ''}`}
        visible={isModalVisible}
        footer={null}
        onCancel={handleCloseModal}
        width={800}
      >
        <Table
          dataSource={currentIdentifiers.map((detalle, index) => ({
            key: index,
            identificador: detalle.identificador_unico,
            estado: detalle.estado || 'Disponible',
          }))}
          columns={[
            { title: 'Identificador Único', dataIndex: 'identificador', key: 'identificador' },
            { title: 'Estado', dataIndex: 'estado', key: 'estado' },
          ]}
          pagination={{ pageSize: 10 }}
        />
      </Modal>
    </div>
  );
};

export default BienesPorUsuario;
