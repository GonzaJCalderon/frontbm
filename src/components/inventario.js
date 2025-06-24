
import React, { useEffect, useState, useRef } from 'react'; // useRef agregado acá
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  Typography,
  Spin,
  Alert,
  Button,
  Space,
  Input,
  Modal,
  Carousel,
  Image
} from 'antd';
import { LeftOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {fetchBienesPorPropietario} from '../redux/actions/bienes';
import imagenPredeterminada from '../assets/27002.jpg';

const { Title } = Typography;
const { Search } = Input;

const Inventario = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem('userData') || '{}');

  const carouselRef = useRef(null); // ✅ ya no da warning

  
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentFotos, setCurrentFotos] = useState([]);
  const [expandedFotoRows, setExpandedFotoRows] = useState({});
  const [modalBien, setModalBien] = useState(null);



  // 1) Obtener { items, error, loading } desde el store
  const { items, error, loading } = useSelector((state) => state.bienes);

  

 // 2) Al montar, obtener bienes del usuario o empresa
useEffect(() => {
  const userData = JSON.parse(localStorage.getItem('userData'));

  const esDelegado = ['delegado', 'responsable'].includes(userData?.rolEmpresa);
  const uuidEmpresa = userData?.empresaUuid;
  const uuidUsuario = userData?.uuid;

  const fetch = async () => {
    const uuidAUsar = esDelegado && uuidEmpresa ? uuidEmpresa : uuidUsuario;
    if (!uuidAUsar) return;

    const res = await dispatch(fetchBienesPorPropietario(uuidAUsar));
    if (res.success) {
      const ordenados = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setFilteredItems(ordenados);
    }
  };

  fetch();
}, [dispatch]);

    

  
  

  // 3) Cuando items cambia, creamos filteredItems (ordenado, etc.)
  useEffect(() => {
    if (!loading && Array.isArray(items)) {
  
      const bienesConStock = items.filter(bien => bien.stock !== undefined && bien.stock !== null);
      const sorted = bienesConStock.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  
      setFilteredItems(sorted);
    }
  }, [items, loading]);
  
  const toggleFotoExpand = (uuid) => {
    setExpandedFotoRows(prev => ({
      ...prev,
      [uuid]: !prev[uuid],
    }));
  };
  
 
  
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
const handleOpenModal = (fotos, bien = null) => {
  const arrayFotos = Array.isArray(fotos) ? [...fotos] : [];
  console.log("🖼️ Fotos recibidas:", fotos);
console.log("🛠️ Tipo de fotos:", typeof fotos);

  setCurrentFotos(arrayFotos);
  setModalBien(bien);
  setIsModalVisible(true);
};

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setCurrentFotos([]);
    setModalBien(null);
  };

  // 7) Saber si es Teléfono Móvil
  const esTelefonoMovil = (tipo) => {
    if (!tipo) return false;
    const lower = tipo.toLowerCase();
    return lower.includes('teléfono') && (lower.includes('móvil') || lower.includes('movil'));
  };

  const exportCSV = () => {
    const headers = ['Tipo', 'Marca', 'Modelo', 'Stock', 'Precio'];
    const rows = filteredItems.map(b => [
      b.tipo,
      b.marca,
      b.modelo,
      b.stock,
      b.precio
    ]);
    const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "inventario.csv");
    document.body.appendChild(link);
    link.click();
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
        return value > 0 ? value : <span style={{ color: 'gray' }}>Sin stock</span>;
      },
      
    },

    {
      title: 'Precio',
      dataIndex: 'precio',
      render: (precio) => (precio !== undefined && precio !== null && precio !== 'No disponible'
        ? `$${Number(precio).toFixed(2)}`
        : 'No disponible'),
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
      render: (_, record) => {
        const isTelefono = esTelefonoMovil(record.tipo);
    
        if (isTelefono && Array.isArray(record.identificadores) && record.identificadores.length > 0) {
          const detallesConFoto = record.identificadores.filter((d) => d.foto);
    
          return detallesConFoto.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {detallesConFoto.map((det, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <Image
                    width={80}
                    src={det.foto}
                    alt={`IMEI: ${det.identificador_unico}`}
                    onError={(e) => (e.target.src = imagenPredeterminada)}
                  />
                  <div style={{ fontSize: 12, marginTop: 4 }}>{det.identificador_unico}</div>
                </div>
              ))}
            </div>
          ) : (
            <span style={{ color: 'gray' }}>Sin fotos por IMEI</span>
          );
        }
    
        // ✅ SOLUCIÓN ACA: Parseamos las fotos si vienen como string
        let fotos = [];
        if (record.fotos) {
          if (Array.isArray(record.fotos)) {
            fotos = record.fotos;
          } else if (typeof record.fotos === 'string') {
            try {
              fotos = JSON.parse(record.fotos);
            } catch (error) {
              console.warn('Error al parsear fotos del inventario:', error);
            }
          }
        }
    
        if (!fotos || fotos.length === 0) return 'Sin fotos';

        // ✅ Eliminar duplicados (por URL)
   const fotosUnicas = Array.isArray(record.fotos)
  ? record.fotos
  : typeof record.fotos === 'string'
    ? JSON.parse(record.fotos)
    : [];
// luego dedup un Set si querés

        
    
        const isExpanded = expandedFotoRows[record.uuid];
        const fotosLimitadas = isExpanded ? fotosUnicas : fotosUnicas.slice(0, 3);

    
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <Space wrap>
              {fotosLimitadas.map((foto, idx) => (
                <Image
                  key={idx}
                  width={80}
                  src={foto}
                  alt={`Foto ${idx + 1}`}
                 onClick={() => handleOpenModal(fotosUnicas, record)}

                  preview={false}
                  style={{ cursor: 'pointer' }}
                  onError={(e) => (e.target.src = imagenPredeterminada)}
                />
              ))}
            </Space>
            {fotos.length > 3 && (
              <Button
                type="link"
                onClick={() => toggleFotoExpand(record.uuid)}
                style={{ padding: 0 }}
              >
                {isExpanded ? 'Ver menos' : 'Ver más'}
              </Button>
            )}
          </div>
        );
      }
    }
    
    
    
    
  ];
  
  

  // 9) Render final
  if (loading) {
    return <Spin tip="Cargando bienes..." />;
  }
  if (error && !Array.isArray(items)) {
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

      {storedUser?.empresaUuid && (
  <Alert
    message="Estás operando en nombre de una empresa"
    description={`Todos los bienes que registres/modifiques pertenecerán a: ${storedUser?.razonSocial || 'Empresa'}`}
    type="info"
    showIcon
    style={{ marginBottom: 16 }}
  />
)}


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
  locale={{
    emptyText: "Aún no has registrado bienes.",
  }}
/>

<Modal
  open={isModalVisible}
  footer={null}
  onCancel={handleCloseModal}
  centered
  width={800}
  bodyStyle={{ padding: 0 }}
>
  <div style={{ padding: '1rem', background: '#f9f9f9' }}>
    <Title level={4} style={{ textAlign: 'center' }}>
      {modalBien?.tipo} {modalBien?.marca} {modalBien?.modelo}
    </Title>

    <div style={{ position: 'relative' }}>
    <Carousel ref={carouselRef}>
  {currentFotos.map((url, index) => (
    <div key={index}>
      <img
        src={url}
        alt={`Imagen ${index + 1}`}
        style={{ width: '100%', height: 'auto' }}
        onError={(e) => { e.target.src = '/images/placeholder.png'; }}
      />
    </div>
  ))}
</Carousel>

<div style={{ textAlign: 'center', marginTop: 16 }}>
  <Button onClick={() => carouselRef.current?.prev()} style={{ marginRight: 8 }}>
    Anterior
  </Button>
  <Button onClick={() => carouselRef.current?.next()}>
    Siguiente
  </Button>
</div>


      {/* Botones anterior / siguiente */}
      <Button
        onClick={() => carouselRef.current?.prev()}
        style={{
          position: 'absolute',
          top: '50%',
          left: 10,
          transform: 'translateY(-50%)',
          zIndex: 10,
        }}
      >
        ←
      </Button>
      <Button
        onClick={() => carouselRef.current?.next()}
        style={{
          position: 'absolute',
          top: '50%',
          right: 10,
          transform: 'translateY(-50%)',
          zIndex: 10,
        }}
      >
        →
      </Button>
    </div>
  </div>
</Modal>


<Button onClick={exportCSV}>Descargar inventario</Button>

    </div>
  );
};

export default Inventario;
