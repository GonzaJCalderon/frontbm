import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Typography, Spin, Alert, Button, Space, Input, Modal, Carousel } from 'antd';
import { LeftOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { fetchBienes } from '../redux/actions/bienes';


const { Title } = Typography;
const { Search } = Input;

const Inventario = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
const [currentFotos, setCurrentFotos] = useState([]);

  const { items = [], error, loading } = useSelector((state) => state.bienes);

  useEffect(() => {
    const userUuid = localStorage.getItem('userUuid'); // Verifica el almacenamiento
    if (userUuid) {
        console.log('UUID del usuario obtenido:', userUuid); // Agrega un log para depurar
        dispatch(fetchBienes(userUuid)); // Llama a la acción con el UUID
    } else {
        console.error('No se encontró el UUID del usuario en el localStorage');
    }
}, [dispatch]);



useEffect(() => {
  console.log('Bienes cargados:', JSON.stringify(items, null, 2)); // Log detallado para depurar
  if (Array.isArray(items)) {
    const sortedItems = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFilteredItems(sortedItems);
  }
}, [items]);


  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value.trim() === '') {
      setFilteredItems([...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } else {
      const filtered = items.filter((item) =>
        item.tipo.toLowerCase().includes(value.toLowerCase()) ||
        item.marca.toLowerCase().includes(value.toLowerCase()) ||
        item.modelo.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/home');
  };

  const handleOpenModal = (fotos) => {
    setCurrentFotos(fotos); // Almacena todas las fotos válidas
    setIsModalVisible(true); // Abre el modal
  };
  
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setCurrentFotos([]);
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
      render: (stock) => stock || 0,
    },
    {
      title: 'IMEI',
      dataIndex: 'identificadores',
      render: (identificadores, record) =>
        record.tipo && record.tipo.toLowerCase() === 'teléfono movil' ? (
          identificadores && identificadores.length > 0 ? (
            <ul>
              {identificadores.map((detalle) => (
                <li key={detalle.identificador_unico}>
                  {detalle.identificador_unico} -{' '}
                  <span style={{ color: detalle.estado === 'vendido' ? 'red' : 'green' }}>
                    {detalle.estado}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <span style={{ color: 'gray' }}>Sin identificadores</span>
          )
        ) : (
          'N/A' // Mostrar "N/A" para bienes que no sean teléfonos móviles
        ),
    },
    {
      title: 'Fotos',
      dataIndex: 'fotos',
      render: (fotos) => {
        const validFotos = (fotos || []).filter((url) => url !== null && url !== undefined);
        return validFotos.length > 0 ? (
          <img
            src={validFotos[0]} // Muestra solo la primera imagen
            alt="Foto principal"
            style={{ width: '100px', height: 'auto', cursor: 'pointer' }}
            onClick={() => handleOpenModal(validFotos)} // Abre el modal con todas las imágenes
            onError={(e) => {
              e.target.src = '/images/placeholder.png'; // Imagen de fallback
            }}
          />
        ) : (
          <span style={{ color: 'gray' }}>Sin imagen</span>
        );
      },
    },
  ];
  

  if (loading) return <Spin tip="Cargando bienes..." />;
  if (error) return <Alert message="Error" description={error} type="error" />;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<LeftOutlined />} onClick={() => navigate(-1)}>
          Volver
        </Button>
        <Button icon={<LogoutOutlined />} onClick={handleLogout} danger>
          Cerrar sesión
        </Button>
        <Search
          placeholder="Buscar"
          onSearch={handleSearch}
          style={{ width: 200 }}
          enterButton
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </Space>
      <Title level={2}>Inventario</Title>
      <Table
  dataSource={filteredItems}
  columns={columns}
  rowKey="uuid"
  pagination={{
    pageSize: 5, // Número de elementos por página
    showSizeChanger: false, // No permitir al usuario cambiar el tamaño de la página
    position: ['bottomCenter'], // Posición del paginado
  }}
/>

      <Modal
  visible={isModalVisible}
  footer={null}
  onCancel={handleCloseModal}
  centered
  width={600} // Ajusta el tamaño según lo necesites
>
  <Carousel autoplay>
    {currentFotos.map((url, index) => (
      <div key={index}>
        <img
          src={url}
          alt={`Imagen ${index + 1}`}
          style={{ width: '100%', height: 'auto' }}
          onError={(e) => {
            e.target.src = '/images/placeholder.png';
          }}
        />
      </div>
    ))}
  </Carousel>
</Modal>

    </div>
  );
};

export default Inventario;
