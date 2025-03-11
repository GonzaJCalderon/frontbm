import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Typography, Spin, Alert, Button, Space, Input, Modal, Carousel,Image } from 'antd';
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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentFotos, setCurrentFotos] = useState([]);

  // 1) Obtener { items, error, loading } desde el store
  const { items, error, loading } = useSelector((state) => state.bienes);

  // 2) Al montar, sacar el userUuid y hacer fetchBienes
  useEffect(() => {
    const userUuid = localStorage.getItem('userUuid');
    if (userUuid) {
      dispatch(fetchBienes(userUuid));
    } else {
      console.error('No se encontró userUuid en localStorage');
    }
  }, [dispatch]);

  // 3) Cuando items cambia, creamos filteredItems (ordenado, etc.)
  useEffect(() => {
    if (!loading && Array.isArray(items)) {
      console.log("📌 Bienes en Redux antes de procesar:", JSON.stringify(items, null, 2));
  
      const bienesConStock = items.filter(bien => bien.stock !== undefined && bien.stock !== null);
      const sorted = bienesConStock.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
      console.log("✅ Bienes listos para renderizar:", JSON.stringify(sorted, null, 2));
  
      setFilteredItems(sorted);
    }
  }, [items, loading]);
  

  
  // 4) Manejo de búsqueda
  const handleSearch = (value) => {
    setSearchTerm(value);
    if (!value.trim()) {
      // Restaurar la lista si no hay búsqueda y ordenar por fecha de creación
      const resetList = [...items]
        .filter(bien => bien.stock !== undefined && bien.stock !== null)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
      setFilteredItems(resetList);
      return;
    }
  
    const lowerValue = value.toLowerCase();
    const filtered = items.filter((bien) => {
      const matchTipo = bien.tipo?.toLowerCase().includes(lowerValue);
      const matchMarca = bien.marca?.toLowerCase().includes(lowerValue);
      const matchModelo = bien.modelo?.toLowerCase().includes(lowerValue);
      const matchImei = bien.identificadores?.some((det) =>
        det.identificador_unico.toLowerCase().includes(lowerValue)
      );
      return matchTipo || matchMarca || matchModelo || matchImei;
    });
  
    // 🔥 Aplicamos el ordenamiento por fecha de creación a los resultados filtrados
    const sortedFiltered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
    setFilteredItems(sortedFiltered);
  };
  

  // 5) Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate('/home');
  };

  // 6) Modal para mostrar fotos
  const handleOpenModal = (fotos) => {
    setCurrentFotos(fotos);
    setIsModalVisible(true);
  };
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setCurrentFotos([]);
  };

  // 7) Saber si es Teléfono Móvil
  const esTelefonoMovil = (tipo) => {
    if (!tipo) return false;
    const lower = tipo.toLowerCase();
    return lower.includes('teléfono') && (lower.includes('móvil') || lower.includes('movil'));
  };

  // 8) Definir columnas
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
      render: (value, record) => {
        console.log("📌 Stock recibido en la tabla:", record.tipo, "->", value);
        return value > 0 ? value : <span style={{ color: 'gray' }}>Sin stock</span>;
      },
    },
    
    
    
    {
      title: 'IMEI',
      dataIndex: 'identificadores',
      render: (identificadores, record) => {
        if (esTelefonoMovil(record.tipo)) {
          return identificadores.length ? (
            <ul>
              {identificadores.map((d) => (
                <li key={d.identificador_unico}>
                  {d.identificador_unico}{' '}
                  <span style={{ color: d.estado === 'vendido' ? 'red' : 'green' }}>
                    ({d.estado})
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <span style={{ color: 'gray' }}>Sin IMEIs registrados</span>
          );
        }
        return 'N/A';
      },
    },
    {
      title: 'Fotos',
      dataIndex: 'fotos',
      render: (fotos) => {
        console.log("📸 Fotos en la tabla para:", fotos);
        
        if (!fotos || fotos.length === 0) {
          return 'Sin fotos';
        }
    
        return (
          <Space>
            {fotos.map((foto, index) => (
              <Image
                key={index}
                width={80}
                src={foto}
                alt={`Foto ${index + 1}`}
                onError={(e) => { e.target.src = '/images/placeholder.png'; }} // ✅ Evita imágenes rotas
              />
            ))}
          </Space>
        );
      },
    },
    
  ];
  
  

  // 9) Render final
  if (loading) {
    return <Spin tip="Cargando bienes..." />;
  }
  if (error) {
    return <Alert message="Error" description={error} type="error" />;
  }

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

      <p class="mb-4">Aquí podrás consultar tu stock de Bienes Muebles Registrados</p>


      <Table
        dataSource={filteredItems}
        columns={columns}
        rowKey="uuid"
        pagination={{
          pageSize: 5,
          showSizeChanger: false,
          position: ['bottomCenter'],
        }}
      />

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
          alt={`Imagen ${index + 1}`}
          style={{ width: '100%', height: 'auto' }}
          onError={(e) => { e.target.src = '/images/placeholder.png'; }} // ✅ Manejo de error
        />
      </div>
    ))}
  </Carousel>
</Modal>
    </div>
  );
};

export default Inventario;
