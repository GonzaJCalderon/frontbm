import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllBienes, deleteBien } from '../redux/actions/bienes';
import { searchItems } from '../redux/actions/search';
import { useNavigate, useLocation } from 'react-router-dom';

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
  const location = useLocation(); // ï¿½S& CORRECTO

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

  // --- Filtros ---
  const [filtroTipo, setFiltroTipo] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [bienesBase, setBienesBase] = useState([]); // copia original sin filtros

  useEffect(() => setCurrentPage(1), [filteredBienes]);

  // ï¿½S& USO CORRECTO DEL LOCATION
  useEffect(() => {
    if (location.state?.justUpdated) {
      setRefreshFlag((prev) => !prev);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const loadBienes = async () => {
      setIsLoading(true);
      try {
        const response = await dispatch(fetchAllBienes());
        if (Array.isArray(response)) {
          const sorted = response.map((bien) => ({
            ...bien,
            stock: bien.stock ?? 0,
            propietario: bien.propietario
              ? (typeof bien.propietario === 'object'
                  ? `${bien.propietario.nombre || ''} ${bien.propietario.apellido || ''}`.trim() || 'Desconocido'
                  : bien.propietario)
              : 'Desconocido',
            fechaActualizacion: bien.fechaActualizacion || 'Sin fecha',
            detalles: bien.identificadores || [],
            fotos: bien.fotos || [],
          }));
          setFilteredBienes(sorted);
          setBienesBase(sorted);
        }
      } catch (error) {
        console.error('ï¿½R Error al cargar bienes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!searchTerm) loadBienes();
  }, [dispatch, refreshFlag, searchTerm]);

  // Aplicar filtros de tipo y fecha sobre bienesBase
  useEffect(() => {
    let resultado = bienesBase.length > 0 ? bienesBase : filteredBienes;
    if (filtroTipo) {
      resultado = resultado.filter(b => b.tipo?.toLowerCase().includes(filtroTipo.toLowerCase()));
    }
    if (fechaDesde) {
      resultado = resultado.filter(b => {
        if (!b.fechaActualizacion || b.fechaActualizacion === 'Sin fecha') return false;
        const partes = b.fechaActualizacion.split('/');
        if (partes.length < 3) return false;
        const fecha = new Date(partes[2], partes[1] - 1, partes[0]);
        return fecha >= new Date(fechaDesde);
      });
    }
    if (fechaHasta) {
      resultado = resultado.filter(b => {
        if (!b.fechaActualizacion || b.fechaActualizacion === 'Sin fecha') return false;
        const partes = b.fechaActualizacion.split('/');
        if (partes.length < 3) return false;
        const fecha = new Date(partes[2], partes[1] - 1, partes[0]);
        return fecha <= new Date(fechaHasta);
      });
    }
    setFilteredBienes(resultado);
  }, [filtroTipo, fechaDesde, fechaHasta, bienesBase]);

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
        propietario: bien.propietario
              ? (typeof bien.propietario === 'object'
                  ? `${bien.propietario.nombre || ''} ${bien.propietario.apellido || ''}`.trim() || 'Desconocido'
                  : bien.propietario)
              : 'Desconocido',
        fechaActualizacion: bien.fechaActualizacion || 'Sin fecha',
        detalles: bien.identificadores || [],
        fotos: bien.fotos || [],
      }));
      setFilteredBienes(mapped);
    }
  }, [searchState.bienes, searchTerm]);

  useEffect(() => {
    if (success) {
      setRefreshFlag((prev) => !prev);
      setTimeout(() => dispatch({ type: 'RESET_BIEN_SUCCESS' }), 300);
    }
  }, [success, dispatch]);

  const handleDelete = (bien) => {
    Modal.confirm({
      title: 'Â¿Eliminar bien?',
      content: `${bien.tipo} - ${bien.modelo}`,
      okText: 'SÃ­',
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
    <div className="bg-background min-h-screen font-inter">
      {/* Header Corporativo (Similar a Usuarios) */}
      <header className="bg-primary text-white px-8 py-5 flex flex-col md:flex-row justify-between items-center shadow-md mb-8">
        <div>
          <h1 className="text-2xl font-bold font-montserrat tracking-tight">Lista de Bienes</h1>
          <p className="text-inverse-primary text-sm font-medium mt-0.5">Control y Trazabilidad del Inventario</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all shadow-sm font-semibold text-sm">
            <ArrowLeftOutlined className="mr-2" /> Volver
          </button>
          <button onClick={() => { localStorage.clear(); navigate('/home'); }} className="flex items-center justify-center px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-all shadow-sm font-semibold text-sm">
            <LogoutOutlined className="mr-2" /> Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto w-full px-4">
        {/* Barra de Búsqueda */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-level-2 mb-6">
          <label className="block text-sm font-semibold text-primary mb-3 uppercase tracking-wide">Filtros de búsqueda</label>
          <div className="flex flex-wrap gap-3 items-center">
            <Input.Search
              placeholder="Buscar por IMEI, tipo, marca o modelo..."
              allowClear
              enterButton
              size="large"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onSearch={handleSearch}
              className="flex-1 min-w-[250px]"
            />
            <select
              value={filtroTipo}
              className="px-3 py-2 border border-outline-variant rounded-lg bg-white text-sm h-[40px]"
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              {[...new Set(bienesBase.map(b => b.tipo).filter(Boolean))].sort().map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <span className="text-xs text-outline font-semibold">Desde:</span>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="px-3 py-2 border border-outline-variant rounded-lg bg-white text-sm h-[40px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-outline font-semibold">Hasta:</span>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="px-3 py-2 border border-outline-variant rounded-lg bg-white text-sm h-[40px]"
              />
            </div>
            {(filtroTipo || fechaDesde || fechaHasta) && (
              <button
                onClick={() => { setFiltroTipo(''); setFechaDesde(''); setFechaHasta(''); }}
                className="px-3 py-2 text-xs font-semibold text-error border border-error rounded-lg hover:bg-error/10 transition-colors h-[40px]"
              >
                Limpiar filtros
              </button>
            )}
          </div>
          <p className="text-xs text-outline mt-2">{filteredBienes.length} resultado(s) encontrado(s)</p>
        </div>

        {/* Tabla */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-level-2 overflow-hidden mt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-on-surface">
              <thead className="bg-surface-container border-b border-outline-variant text-xs uppercase text-primary font-bold">
                <tr>
                  <th className="px-4 py-4 min-w-[100px]">Tipo</th>
                  <th className="px-4 py-4 min-w-[100px]">Modelo</th>
                  <th className="px-4 py-4 min-w-[100px]">Marca</th>
                  <th className="px-4 py-4 min-w-[150px]">Descripción</th>
                  <th className="px-4 py-4 min-w-[100px]">Precio</th>
                  <th className="px-4 py-4 min-w-[120px]">Propietario</th>
                  <th className="px-4 py-4 min-w-[100px]">Fecha</th>
                  <th className="px-4 py-4 min-w-[200px]">IMEIs / ID</th>
                  <th className="px-4 py-4 min-w-[100px]">Stock</th>
                  <th className="px-4 py-4 min-w-[120px]">Fotos</th>
                  <th className="px-4 py-4 text-center min-w-[100px]">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {currentBienes.map((bien, idx) => {
                  const {
                    uuid, tipo, modelo, marca, descripcion, precio,
                    propietario, fechaActualizacion, detalles, stock, fotos,
                  } = bien;

                  const indexGlobal = (currentPage - 1) * itemsPerPage + idx;
                  const expandido = expandedFotoRows[indexGlobal] || false;
                  const fotosUnicas = [...new Set(fotos || [])];
                  const fotosFix = fotosUnicas.map(f => require('../utils/imageHelper').getFullImageUrl(f));
                  const fotosAMostrar = expandido ? fotosFix : fotosFix.slice(0, 1);

                  return (
                    <tr key={`${uuid}-${idx}`} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-4 py-4 font-medium">{tipo}</td>
                      <td className="px-4 py-4">{modelo}</td>
                      <td className="px-4 py-4 text-outline">{marca}</td>
                      <td className="px-4 py-4 text-xs text-on-surface-variant break-words whitespace-normal" title={descripcion}>{descripcion}</td>
                      <td className="px-4 py-4 font-semibold text-secondary">{precio ? `$${Number(precio).toFixed(2)}` : 'N/A'}</td>
                      <td className="px-4 py-4 font-medium text-xs">{propietario}</td>
                      <td className="px-4 py-4 text-xs text-outline">{fechaActualizacion}</td>
                      <td className="px-4 py-4 text-xs">
                        {detalles.length > 0 ? (
                          <div className="space-y-2">
                            <div className="flex items-center flex-wrap gap-2">
                              <span className="font-mono bg-surface-container px-2 py-0.5 rounded text-[11px] font-bold border border-outline-variant">{detalles[0].identificador_unico}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${detalles[0].estado === 'disponible' ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-error'}`}>
                                {detalles[0].estado}
                              </span>
                              <button
                                onClick={() => navigate(`/bienes/trazabilidad-identificador/${encodeURIComponent(detalles[0].identificador_unico)}`)}
                                className="text-primary hover:text-primary-container font-semibold text-[11px] underline"
                              > 🔍 Trazabilidad </button>
                            </div>
                            {detalles.length > 1 && (
                              <button
                                onClick={() => setExpandedIMEIRows((prev) => ({ ...prev, [uuid]: !prev[uuid] }))}
                                className="text-secondary hover:underline font-semibold text-[11px]"
                              >
                                {expandedIMEIRows[uuid] ? 'Ver menos' : `+ Ver más (${detalles.length - 1})`}
                              </button>
                            )}
                            {expandedIMEIRows[uuid] && detalles.slice(1).map((d, i) => (
                              <div key={`${d.identificador_unico}-${i}`} className="flex items-center flex-wrap gap-2 mt-1 pl-2 border-l-2 border-outline-variant">
                                <span className="font-mono bg-surface-container px-2 py-0.5 rounded text-[11px] font-bold border border-outline-variant">{d.identificador_unico}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${d.estado === 'disponible' ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-error'}`}>
                                  {d.estado}
                                </span>
                                <button
                                  onClick={() => navigate(`/bienes/trazabilidad-identificador/${encodeURIComponent(d.identificador_unico)}`)}
                                  className="text-primary hover:text-primary-container font-semibold text-[11px] underline"
                                > 🔍 Trazabilidad </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-outline italic">Sin identificadores</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        {stock > 0 ? (
                          <span className="font-bold bg-secondary-container text-secondary px-3 py-1 rounded-full text-xs inline-block whitespace-nowrap">{stock} uds.</span>
                        ) : (
                          <span className="text-outline text-xs">Sin stock</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {fotos.length === 0 ? (
                          <span className="text-outline text-xs italic">Sin fotos</span>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap gap-1">
                              {fotosAMostrar.map((foto, i) => (
                                <Image
                                  key={i}
                                  width={40}
                                  height={40}
                                  src={foto}
                                  alt={`Foto ${i + 1}`}
                                  className="rounded object-cover border border-outline-variant cursor-pointer hover:opacity-80 transition-opacity"
                                  fallback="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect width='100%25' height='100%25' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' font-size='14' text-anchor='middle' fill='%23666' dy='.3em'%3ESin Foto%3C/text%3E%3C/svg%3E"
                                  onClick={() => setPreviewFoto(foto)}
                                  preview={false}
                                />
                              ))}
                            </div>
                            {fotosFix.length > 1 && (
                              <button onClick={() => toggleFotoExpand(indexGlobal)} className="text-[11px] font-semibold text-primary hover:underline self-start">
                                {expandido ? 'Ver menos' : `Ver más (${fotosFix.length - 1})`}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs font-semibold bg-white z-10">
                        <div className="flex flex-col gap-2 min-w-[100px] items-center justify-center">
                          <button
                            onClick={() => navigate(`/bienes/trazabilidad/${uuid}`)}
                            className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                          > 🔍 Trazabilidad </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => navigate(`/bienes/edit/${uuid}`, { state: { fromBienList: true } })}
                                className="w-full px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg border border-gray-300 transition-colors shadow-sm"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(bien)}
                                className="w-full px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-xs font-semibold rounded-lg border border-red-200 transition-colors shadow-sm"
                              >
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Paginación */}
          <div className="bg-surface-container-lowest border-t border-outline-variant p-4 flex justify-between items-center text-sm font-medium text-on-surface-variant">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg border ${currentPage === 1 ? 'bg-surface-container opacity-50 cursor-not-allowed border-transparent' : 'bg-white border-outline-variant hover:bg-surface-container-lowest shadow-sm'}`}
            >
              Anterior
            </button>
            <span className="font-montserrat">Página {currentPage} de {totalPages}</span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg border ${currentPage === totalPages ? 'bg-surface-container opacity-50 cursor-not-allowed border-transparent' : 'bg-white border-outline-variant hover:bg-surface-container-lowest shadow-sm'}`}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={!!previewFoto}
        footer={null}
        onCancel={() => setPreviewFoto(null)}
        centered
        width={800}
      >
        <img
          alt="Vista previa"
          className="w-full max-h-[70vh] object-contain rounded-lg"
          src={previewFoto}
        />
      </Modal>
    </div>
  );
};

export default BienList;

