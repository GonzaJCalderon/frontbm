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

const { Title } = Typography;

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

  const transaccionesPorPagina = 10;

  const uuidFromToken = useMemo(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const [, payloadBase64] = token.split('.');
      const decoded = JSON.parse(atob(payloadBase64));
      return decoded?.uuid || null;
    } catch (err) {
      console.error('❌ Error al decodificar el token:', err);
      return null;
    }
  }, []);

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
    <div className="p-6 bg-gray-100 min-h-screen">
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<LeftOutlined />} onClick={handleBack}>Volver</Button>
        <Button icon={<HomeOutlined />} onClick={handleHome}>Home</Button>
        <Button icon={<LogoutOutlined />} danger onClick={handleLogout}>Cerrar sesión</Button>
      </Space>

      <Title level={2}>
        Operaciones de{' '}
        {usuario?.razonSocial
          ? `${usuario.razonSocial} (como ${usuario.rolEmpresa})`
          : `${usuario?.nombre} ${usuario?.apellido}`}
      </Title>

      {loadingTransacciones ? (
        <Spin tip="Cargando transacciones..." />
      ) : (
        <>
          <Title level={3}>Compras</Title>
          {compras.length === 0 ? (
            <Alert message="Sin compras" type="info" showIcon />
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
            />
          )}

          <Title level={3} style={{ marginTop: 32 }}>Ventas</Title>
          {ventas.length === 0 ? (
            <Alert message="Sin ventas" type="info" showIcon />
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
            />
          )}
        </>
      )}

      <Modal
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
        centered
      >
        <img src={imagenAmpliada} alt="Imagen ampliada" style={{ width: '100%' }} />
      </Modal>
    </div>
  );
};

export default OperacionesUsuario;
