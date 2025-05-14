import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllBienes, deleteBien } from '../redux/actions/bienes';
import { searchItems } from '../redux/actions/search';
import { useNavigate } from 'react-router-dom';
import {
  Image,
  Button,
  Spin,
  Modal,
  Space,
  Input,
  Tag,
} from 'antd';
import {
  ArrowLeftOutlined,
  LogoutOutlined,
  DownOutlined,
  UpOutlined,
} from '@ant-design/icons';
import '../assets/css/BienList.css';

const BienList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: bienes, success } = useSelector((state) => state.bienes);

  const searchState = useSelector((state) => state.search);

  const [isLoading, setIsLoading] = useState(true);
  const [filteredBienes, setFilteredBienes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [expandedFotoRows, setExpandedFotoRows] = useState({});
  const [expandedIMEIRows, setExpandedIMEIRows] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [previewFoto, setPreviewFoto] = useState(null);

  const itemsPerPage = 10;
  const userData = JSON.parse(localStorage.getItem('userData'));
  const isAdmin = userData?.rol === 'admin';


  useEffect(() => setCurrentPage(1), [filteredBienes]);

  useEffect(() => {
    const loadBienes = async () => {
      setIsLoading(true);
      try {
        const response = await dispatch(fetchAllBienes());
        if (Array.isArray(response)) {
          const sorted = response.map((bien) => ({
            ...bien,
            stock: bien.stock ?? 0,
            propietario: bien.propietario || 'Desconocido',
            fechaActualizacion: bien.fechaActualizacion || 'Sin fecha',
            detalles: bien.identificadores || [],
            fotos: bien.todasLasFotos || [],
          }));
          setFilteredBienes(sorted);
        }
      } catch (error) {
        console.error('❌ Error al cargar bienes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!searchTerm) loadBienes();
  }, [dispatch, refreshFlag, searchTerm]);

  const handleSearch = (value) => {
    const term = value.trim();
    setSearchTerm(term);
    if (!term) return setFilteredBienes(bienes);
    dispatch(searchItems(term, 'bienes'));
  };

  useEffect(() => {
    if (searchTerm && Array.isArray(searchState.bienes)) {
      const mapped = searchState.bienes.map((bien) => ({
        ...bien,
        stock: bien.stock ?? 0,
        propietario: bien.propietario || 'Desconocido',
        fechaActualizacion: bien.fechaActualizacion || 'Sin fecha',
        detalles: bien.identificadores || [],
        fotos: bien.fotos || [],
      }));
      setFilteredBienes(mapped);
    }
  }, [searchState.bienes]);

  useEffect(() => {
    if (success) {
      setRefreshFlag((prev) => !prev);
  
      // Opcional: resetear success localmente (si no tenés acción para ello)
      setTimeout(() => dispatch({ type: 'RESET_BIEN_SUCCESS' }), 300); 
    }
  }, [success]);
  
  
  

  const handleDelete = (bien) => {
    Modal.confirm({
      title: '¿Eliminar bien?',
      content: `${bien.tipo} - ${bien.modelo}`,
      okText: 'Sí',
      cancelText: 'No',
      okType: 'danger',
      onOk: async () => {
        try {
          await dispatch(deleteBien(bien.uuid));
          setRefreshFlag((prev) => !prev);
        } catch (err) {
          console.error(err);
        }
      },
    });
  };

  const toggleFotoExpand = (idx) => {
    setExpandedFotoRows((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const totalPages = Math.ceil(filteredBienes.length / itemsPerPage);
  const currentBienes = filteredBienes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
        <p className="mt-4 text-xl text-gray-700">Cargando bienes...</p>
      </div>
    );
  }

  return (
    <div className="container-bienes">
      <div className="header-actions">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Volver</Button>
        <Button icon={<LogoutOutlined />} danger onClick={() => {
          localStorage.clear();
          navigate('/home');
        }}>
          Cerrar Sesión
        </Button>
      </div>

      <Input.Search
        placeholder="Buscar IMEI, tipo, marca o modelo"
        allowClear
        enterButton
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        onSearch={handleSearch}
        className="search-input"
      />

      <h2 className="text-2xl font-bold mb-4">Lista de Bienes</h2>

      <div className="custom-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Modelo</th>
              <th>Marca</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Propietario</th>
              <th>Fecha</th>
              <th>IMEIs</th>
              <th>Stock</th>
              <th>Fotos</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {currentBienes.map((bien, idx) => {
              const {
                uuid, tipo, modelo, marca, descripcion, precio,
                propietario, fechaActualizacion, detalles, stock, fotos,
              } = bien;

              const indexGlobal = (currentPage - 1) * itemsPerPage + idx;
              const expandido = expandedFotoRows[indexGlobal] || false;
              const fotosAMostrar = expandido ? fotos : fotos.slice(0, 3);

              return (
                <tr key={`${uuid}-${idx}`}>
                  <td>{tipo}</td>
                  <td>{modelo}</td>
                  <td>{marca}</td>
                  <td>{descripcion}</td>
                  <td>{precio ? `$${Number(precio).toFixed(2)}` : 'No disponible'}</td>
                  <td>{propietario}</td>
                  <td>{fechaActualizacion}</td>
                  <td>
                  {detalles.length > 0 ? (
  <div>
    <p style={{ marginBottom: 4 }}>
      <strong>{detalles[0].identificador_unico}</strong>{' '}
      <Tag color={detalles[0].estado === 'disponible' ? 'green' : 'red'}>
        {detalles[0].estado}
      </Tag>
      <Button
        size="small"
        type="link"
        onClick={() => navigate(`/bienes/trazabilidad-identificador/${detalles[0].identificador_unico}`)}
        style={{ marginLeft: 4 }}
      >
        📈 Trazabilidad
      </Button>
    </p>
    {detalles.length > 1 && (
      <Button
        type="link"
        size="small"
        style={{ padding: 0 }}
        onClick={() =>
          setExpandedIMEIRows((prev) => ({
            ...prev,
            [uuid]: !prev[uuid],
          }))
        }
      >
        {expandedIMEIRows[uuid] ? 'Ver menos' : `Ver más (${detalles.length - 1})`}
      </Button>
    )}
    {expandedIMEIRows[uuid] &&
      detalles.slice(1).map((d) => (
        <p key={`${d.identificador_unico}-${idx}`} style={{ marginBottom: 4 }}>
          <strong>{d.identificador_unico}</strong>{' '}
          <Tag color={d.estado === 'disponible' ? 'green' : 'red'}>
            {d.estado}
          </Tag>
          <Button
            size="small"
            type="link"
            onClick={() => navigate(`/bienes/trazabilidad-identificador/${d.identificador_unico}`)}
            style={{ marginLeft: 4 }}
          >
            📈 Trazabilidad
          </Button>
        </p>
      ))}
  </div>
) : (
  'Sin identificadores'
)}

                  </td>
                  <td>
                    {stock > 0 ? (
                      <span style={{ fontWeight: 600 }}>{stock} unidades</span>
                    ) : (
                      <span style={{ color: 'gray' }}>Sin stock</span>
                    )}
                  </td>
                  <td>
                    {fotos.length === 0 ? (
                      'Sin fotos'
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Space wrap>
                          {fotosAMostrar.map((foto, i) => (
                            <Image
                              key={i}
                              width={80}
                              src={foto}
                              alt={`Foto ${i + 1}`}
                              style={{ cursor: 'pointer' }}
                              fallback="/images/placeholder.png"
                              onClick={() => setPreviewFoto(foto)}
                              preview={false}
                            />
                          ))}
                        </Space>
                        {fotos.length > 3 && (
                          <Button type="link" onClick={() => toggleFotoExpand(indexGlobal)}>
                            {expandido ? <><UpOutlined /> Ver menos</> : <><DownOutlined /> Ver más</>}
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    <Space wrap>
                      <Button
                        type="primary"
                        onClick={() => navigate(`/bienes/trazabilidad/${uuid}`)}
                      >
                        Trazabilidad
                      </Button>
                      {isAdmin && (
                        <>
                          <Button
                            style={{
                              backgroundColor: '#ffc107',
                              borderColor: '#ffc107',
                              color: '#000',
                            }}
                            onClick={() => navigate(`/bienes/edit/${uuid}`)}
                          >
                            Editar
                          </Button>
                          <Button danger onClick={() => handleDelete(bien)}>
                            Eliminar
                          </Button>
                        </>
                      )}
                    </Space>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pagination-footer">
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Anterior
        </Button>
        <span>Página {currentPage} de {totalPages}</span>
        <Button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </Button>
      </div>

      <Modal
        open={!!previewFoto}
        footer={null}
        onCancel={() => setPreviewFoto(null)}
        centered
      >
        <img
          alt="Vista previa"
          style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
          src={previewFoto}
        />
      </Modal>
    </div>
  );
};

export default BienList;
