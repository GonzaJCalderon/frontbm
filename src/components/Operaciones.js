import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Table,
  Typography,
  Spin,
  Alert,
  Space,
  Modal,
} from 'antd';
import {
  obtenerTodasLasTransacciones,
} from '../redux/actions/usuarios';
import {
  LeftOutlined,
  HomeOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { FaArrowLeft, FaHome, FaSignOutAlt, FaShoppingCart, FaTags } from "react-icons/fa";

const OperacionesUsuario = () => {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [loadingUsuario, setLoadingUsuario] = useState(true);
  const [loadingTransacciones, setLoadingTransacciones] = useState(false);
  const [compras, setCompras] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [paginaCompras, setPaginaCompras] = useState(1);
  const [paginaVentas, setPaginaVentas] = useState(1);
  const [totalCompras, setTotalCompras] = useState(0);
  const [totalVentas, setTotalVentas] = useState(0);
  const [imagenAmpliada, setImagenAmpliada] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [vistaActiva, setVistaActiva] = useState('menu'); // 'menu', 'compras', 'ventas'

  const transaccionesPorPagina = 10;


  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
      setUsuario(userData);
    }
    setLoadingUsuario(false);
  }, []);

  const esRepresentante = useMemo(() => {
    const rol = usuario?.rolEmpresa?.toLowerCase();
    return rol === 'responsable' || rol === 'delegado';
  }, [usuario]);

  const uuidConsulta = useMemo(() => {
    if (!usuario) return null;
    return esRepresentante && usuario.empresaUuid
      ? usuario.empresaUuid
      : usuario.uuid;
  }, [usuario, esRepresentante]);

  useEffect(() => {
    if (!uuidConsulta) return;

    const fetchTransacciones = async () => {
      setLoadingTransacciones(true);
      try {
        const [resCompras, resVentas] = await Promise.all([
          obtenerTodasLasTransacciones(uuidConsulta, esRepresentante ? 'empresa' : 'usuario', paginaCompras, 'compra'),
          obtenerTodasLasTransacciones(uuidConsulta, esRepresentante ? 'empresa' : 'usuario', paginaVentas, 'venta'),
        ]);

        setCompras(resCompras.data || []);
        setTotalCompras(resCompras.total || 0);

        setVentas(resVentas.data || []);
        setTotalVentas(resVentas.total || 0);
      } catch (error) {
        console.error('❌ Error al obtener transacciones:', error);
      } finally {
        setLoadingTransacciones(false);
      }
    };

    fetchTransacciones();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuidConsulta, paginaCompras, paginaVentas]);

  const mostrarImagen = (url) => {
    setImagenAmpliada(url);
    setModalVisible(true);
  };

  const columnasGenericas = [
    {
      title: 'Foto',
      key: 'foto',
      render: (_, record) => {
        const foto = record.bienTransaccion?.fotos?.[0];
        return foto ? (
          <img
            src={foto}
            alt="foto bien"
            width={60}
            style={{ cursor: 'pointer' }}
            onClick={() => mostrarImagen(foto)}
          />
        ) : 'Sin foto';
      },
    },
    {
      title: 'Marca',
      dataIndex: ['bienTransaccion', 'marca'],
    },
    {
      title: 'Modelo',
      dataIndex: ['bienTransaccion', 'modelo'],
    },
    {
      title: 'Tipo',
      dataIndex: ['bienTransaccion', 'tipo'],
    },
    {
      title: 'Precio',
      dataIndex: 'precio',
      render: (precio) => precio ? `$${precio.toLocaleString()}` : 'No disponible',
    },
    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      render: (fecha) => new Date(fecha).toLocaleString(),
    },
  ];

  const columnasCompras = [
    ...columnasGenericas,
    {
      title: 'Vendedor',
      render: (_, record) =>
        `${record.vendedorTransaccion?.nombre || ''} ${record.vendedorTransaccion?.apellido || ''}`,
    },
    {
      title: 'Email',
      dataIndex: ['vendedorTransaccion', 'email'],
    },
  ];

  const columnasVentas = [
    ...columnasGenericas,
    {
      title: 'Comprador',
      render: (_, record) =>
        `${record.compradorTransaccion?.nombre || ''} ${record.compradorTransaccion?.apellido || ''}`,
    },
    {
      title: 'Email',
      dataIndex: ['compradorTransaccion', 'email'],
    },
  ];

  const handleBack = () => navigate(-1);
  const handleHome = () => navigate('/user/dashboard');
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/home');
  };

  if (loadingUsuario) return <Spin tip="Cargando usuario..." />;

  return (
    <div className="bg-background min-h-screen font-inter flex flex-col pb-8">
      {/* Header Premium */}
      <header className="bg-primary text-white px-8 py-5 flex justify-between items-center shadow-md mb-8">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="flex items-center justify-center p-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all shadow-sm border-none cursor-pointer">
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold font-montserrat tracking-tight m-0 text-white">Mis Transacciones</h1>
            <p className="text-inverse-primary text-sm font-medium mt-0.5 mb-0">
              Operaciones de{' '}
              {usuario?.razonSocial
                ? `${usuario.razonSocial} (como ${usuario.rolEmpresa})`
                : `${usuario?.nombre} ${usuario?.apellido}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleHome} className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all font-semibold shadow-sm border-none cursor-pointer">
            <FaHome className="w-4 h-4" /> Home
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-error text-white rounded-lg hover:bg-red-600 transition-all font-semibold shadow-sm border-none cursor-pointer">
            <FaSignOutAlt className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto w-full px-8">

      {loadingTransacciones ? (
        <div className="flex justify-center my-10"><Spin tip="Cargando transacciones..." size="large" /></div>
      ) : (
        <>
          {vistaActiva === 'menu' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <div 
                onClick={() => setVistaActiva('compras')}
                className="group bg-green-50 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center cursor-pointer shadow-sm hover:shadow-lg hover:bg-green-100 transition-all duration-300 border border-green-200 hover:-translate-y-1"
              >
                <FaShoppingCart className="text-green-600 text-6xl group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <p className="text-2xl font-bold font-montserrat text-green-900 tracking-tight m-0">Mis Compras</p>
                  <p className="text-green-700 mt-2 font-medium m-0">Revisa el historial de bienes que has adquirido.</p>
                </div>
              </div>

              <div 
                onClick={() => setVistaActiva('ventas')}
                className="group bg-red-50 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center cursor-pointer shadow-sm hover:shadow-lg hover:bg-red-100 transition-all duration-300 border border-red-200 hover:-translate-y-1"
              >
                <FaTags className="text-red-600 text-6xl group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <p className="text-2xl font-bold font-montserrat text-red-900 tracking-tight m-0">Mis Ventas</p>
                  <p className="text-red-700 mt-2 font-medium m-0">Gestiona y consulta los bienes que has vendido.</p>
                </div>
              </div>
            </div>
          )}

          {vistaActiva === 'compras' && (
            <div className="mb-8 animate-fadeIn">
              <div className="flex items-center gap-4 border-b border-outline-variant pb-4 mb-6">
                <Button icon={<FaArrowLeft />} onClick={() => setVistaActiva('menu')} type="text" className="font-semibold text-primary">
                  Volver
                </Button>
                <h2 className="text-2xl font-bold font-montserrat text-primary m-0">Compras Realizadas</h2>
              </div>
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-level-2 overflow-hidden p-4">
                {compras.length === 0 ? (
                  <Alert message="Sin compras" type="info" showIcon className="my-4" />
                ) : (
                  <Table
                    columns={columnasCompras}
                    dataSource={compras}
                    rowKey="uuid"
                    pagination={{
                      current: paginaCompras,
                      pageSize: transaccionesPorPagina,
                      total: totalCompras,
                      onChange: (page) => setPaginaCompras(page),
                    }}
                    className="w-full"
                  />
                )}
              </div>
            </div>
          )}

          {vistaActiva === 'ventas' && (
            <div className="mb-8 animate-fadeIn">
              <div className="flex items-center gap-4 border-b border-outline-variant pb-4 mb-6">
                <Button icon={<FaArrowLeft />} onClick={() => setVistaActiva('menu')} type="text" className="font-semibold text-primary">
                  Volver
                </Button>
                <h2 className="text-2xl font-bold font-montserrat text-primary m-0">Ventas Realizadas</h2>
              </div>
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-level-2 overflow-hidden p-4">
                {ventas.length === 0 ? (
                  <Alert message="Sin ventas" type="info" showIcon className="my-4" />
                ) : (
                  <Table
                    columns={columnasVentas}
                    dataSource={ventas}
                    rowKey="uuid"
                    pagination={{
                      current: paginaVentas,
                      pageSize: transaccionesPorPagina,
                      total: totalVentas,
                      onChange: (page) => setPaginaVentas(page),
                    }}
                    className="w-full"
                  />
                )}
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
        centered
      >
        <img src={imagenAmpliada} alt="Imagen ampliada" style={{ width: '100%', borderRadius: '8px' }} />
      </Modal>
      </div>
    </div>
  );
};

export default OperacionesUsuario;
