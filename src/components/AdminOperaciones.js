import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Table, Typography, Button, Spin, Space, Modal, Image,
} from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import {
  getUserByUuid,
  getEmpresaByUuid,
  obtenerTodasLasTransacciones
} from '../redux/actions/usuarios';

const { Title } = Typography;

const AdminOperaciones = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [usuario, setUsuario] = useState(null);
  const [uuidConsulta, setUuidConsulta] = useState(null);
  const [modo, setModo] = useState('usuario');
  const [compras, setCompras] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginaCompras, setPaginaCompras] = useState(1);
  const [paginaVentas, setPaginaVentas] = useState(1);
  const [totalCompras, setTotalCompras] = useState(0);
  const [totalVentas, setTotalVentas] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);

  const transaccionesPorPagina = 10;

  // ✅ Obtiene el usuario ya sea desde la navegación o desde la API
useEffect(() => {
  const cargarDatos = async () => {
    let user = location.state?.usuario;

    if (!user) {
      // ✅ Primero intentamos cargar como empresa
      const empresa = await getEmpresaByUuid(uuid);
      if (empresa) {
        user = {
          uuid: empresa.uuid,
          razonSocial: empresa.razonSocial,
          tipo: 'empresa',
        };
        setModo('empresa');
        setUsuario(user);
        setUuidConsulta(empresa.uuid);
        return;
      }

      // ⚠️ Si no es empresa, intentamos como usuario
      user = await getUserByUuid(uuid);

      const esEmpresa = ['responsable', 'delegado'].includes(user.rolEmpresa?.toLowerCase());
      if (esEmpresa) {
        const empresa = await getEmpresaByUuid(user.empresaUuid || user.empresa?.uuid);
        if (empresa) {
          user.empresa = empresa;
          user.razonSocial = empresa.razonSocial;
        }
      }

      setModo(esEmpresa ? 'empresa' : 'usuario');
      setUuidConsulta(esEmpresa ? user.empresa?.uuid : user.uuid);
      setUsuario(user);
    } else {
      const esEmpresa = ['responsable', 'delegado'].includes(user.rolEmpresa?.toLowerCase());
      setModo(esEmpresa ? 'empresa' : 'usuario');
      setUuidConsulta(esEmpresa ? user.empresa?.uuid : user.uuid);
      setUsuario(user);
    }
  };

  cargarDatos();
}, [uuid, location.state]);


  useEffect(() => {
    if (!uuidConsulta) return;
    fetchTransacciones();
  }, [uuidConsulta, paginaCompras, paginaVentas]);

  const fetchTransacciones = async () => {
    try {
      setLoading(true);
      const [resCompras, resVentas] = await Promise.all([
        obtenerTodasLasTransacciones(uuidConsulta, modo, paginaCompras, 'compra'),
        obtenerTodasLasTransacciones(uuidConsulta, modo, paginaVentas, 'venta'),
      ]);

      setCompras(resCompras.data || []);
      setTotalCompras(resCompras.total || 0);

      setVentas(resVentas.data || []);
      setTotalVentas(resVentas.total || 0);
    } catch (err) {
      console.error('❌ Error al cargar transacciones:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (fotos) => {
    setPreviewImages(fotos);
    setPreviewVisible(true);
  };

  const columnaTrazabilidad = {
    title: 'Trazabilidad',
    key: 'trazabilidad',
    render: (_, record) => {
      const detalles = record.detallesVendidos || [];
      if (!detalles.length) return 'Sin identificadores';
      return (
        <Space direction="vertical">
          {detalles.map((det, i) => (
            <Button
              key={i}
              size="small"
              type="link"
              onClick={() => navigate(`/bienes/trazabilidad-identificador/${det.identificador_unico}`)}
            >
              {det.identificador_unico}
            </Button>
          ))}
        </Space>
      );
    },
  };

  const columnasGenericas = [
    { title: 'Tipo', dataIndex: ['bienTransaccion', 'tipo'], key: 'tipo' },
    { title: 'Descripción', dataIndex: ['bienTransaccion', 'descripcion'], key: 'descripcion' },
    { title: 'Marca', dataIndex: ['bienTransaccion', 'marca'], key: 'marca' },
    { title: 'Modelo', dataIndex: ['bienTransaccion', 'modelo'], key: 'modelo' },
    {
      title: 'Fotos',
      key: 'fotos',
      render: (_, record) => {
        const fotos = record?.bienTransaccion?.fotos || [];
        return fotos.length === 0
          ? 'Sin fotos'
          : (
            <div style={{ display: 'flex', gap: '8px', cursor: 'pointer' }} onClick={() => handlePreview(fotos)}>
              {fotos.slice(0, 3).map((foto, i) => (
                <img key={i} src={foto} alt={`foto-${i}`} style={{ width: 60, height: 60, objectFit: 'cover' }} />
              ))}
            </div>
          );
      },
    },
    {
      title: 'Precio',
      dataIndex: ['precio'],
      key: 'precio',
      render: (precio) => `$${precio?.toFixed(2) || 'N/A'}`,
    },
    { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      render: (fecha) => new Date(fecha).toLocaleString(),
    },
    columnaTrazabilidad,
  ];

  const columnasCompras = [
    ...columnasGenericas,
    {
      title: 'Vendedor',
      key: 'vendedor',
      render: (_, record) => {
        const v = record.vendedorTransaccion;
        return record.empresaVendedora?.razonSocial || `${v?.nombre || ''} ${v?.apellido || ''}`;
      },
    },
  ];

  const columnasVentas = [
    ...columnasGenericas,
    {
      title: 'Comprador',
      key: 'comprador',
      render: (_, record) => {
        const c = record.compradorTransaccion;
        return record.empresaCompradora?.razonSocial || `${c?.nombre || ''} ${c?.apellido || ''}`;
      },
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<LeftOutlined />} onClick={() => navigate(-1)}>Volver</Button>
      </Space>

<Title level={2}>
  {usuario?.razonSocial
    ? `Operaciones de ${usuario.razonSocial}`
    : usuario
      ? `Operaciones de ${usuario.nombre} ${usuario.apellido}`
      : 'Cargando datos...'}
</Title>


      {loading ? <Spin tip="Cargando transacciones..." /> : (
        <>
          <Title level={3}>Compras</Title>
          <Table
            dataSource={compras}
            columns={columnasCompras}
            rowKey="uuid"
            pagination={{
              current: paginaCompras,
              pageSize: transaccionesPorPagina,
              total: totalCompras,
              onChange: (page) => setPaginaCompras(Number(page)),
            }}
          />

          <Title level={3} style={{ marginTop: 32 }}>Ventas</Title>
          <Table
            dataSource={ventas}
            columns={columnasVentas}
            rowKey="uuid"
            pagination={{
              current: paginaVentas,
              pageSize: transaccionesPorPagina,
              total: totalVentas,
              onChange: (page) => setPaginaVentas(Number(page)),
            }}
          />
        </>
      )}

      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        title="Vista previa del bien"
        width={800}
      >
        <Image.PreviewGroup>
          {previewImages.map((url, i) => (
            <Image key={i} src={url} alt={`preview-${i}`} style={{ marginBottom: 10 }} />
          ))}
        </Image.PreviewGroup>
      </Modal>
    </div>
  );
};

export default AdminOperaciones;
