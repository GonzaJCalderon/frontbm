// ⚙️ Importaciones...
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Table, Typography, Button, Spin, Space, Alert, Modal, Image,
} from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import {
  obtenerTransacciones,
  getUserByUuid,
  getEmpresaByUuid,
} from '../redux/actions/usuarios';

const { Title } = Typography;

const AdminOperaciones = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [usuario, setUsuario] = useState(null);
  const [uuidConsulta, setUuidConsulta] = useState(null);
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

  const fetchUsuario = useCallback(async () => {
    const user = await getUserByUuid(uuid);
    if (user.empresaUuid || user.empresa?.uuid) {
      const empresa = await getEmpresaByUuid(user.empresaUuid || user.empresa?.uuid);
      if (empresa) {
        user.razonSocial = empresa.razonSocial;
        user.empresa = empresa;
      }
    }
    setUsuario(user);
  }, [uuid]);

  useEffect(() => {
    const prepararUsuario = async () => {
      const stateUser = location.state?.usuario;
      if (stateUser) {
        setUsuario(stateUser);
      } else {
        await fetchUsuario();
      }
    };
    prepararUsuario();
  }, [location.state, fetchUsuario]);

  useEffect(() => {
    if (!usuario) return;
    const uuidFinal = ['delegado', 'responsable'].includes(usuario.rolEmpresa?.toLowerCase())
      ? usuario.empresa?.uuid || usuario.empresaUuid
      : usuario.uuid;
    setUuidConsulta(uuidFinal);
  }, [usuario]);

  useEffect(() => {
    if (!uuidConsulta) return;
    fetchCompras(uuidConsulta);
    fetchVentas(uuidConsulta);
  }, [uuidConsulta, paginaCompras, paginaVentas]);

  const fetchCompras = useCallback(async (uuidToUse) => {
    try {
      setLoading(true);
      const data = await obtenerTransacciones(uuidToUse, 'compra', paginaCompras, transaccionesPorPagina);
      setCompras(data.data || []);
      setTotalCompras(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [paginaCompras]);

  const fetchVentas = useCallback(async (uuidToUse) => {
    try {
      setLoading(true);
      const data = await obtenerTransacciones(uuidToUse, 'venta', paginaVentas, transaccionesPorPagina);
      setVentas(data.data || []);
      setTotalVentas(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [paginaVentas]);

  const handlePreview = (fotos) => {
    setPreviewImages(fotos);
    setPreviewVisible(true);
  };

  // ✅ COLUMNA COMPARTIDA: Trazabilidad
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
          ? `Operaciones de ${usuario.razonSocial} (operadas por ${usuario.nombre} ${usuario.apellido} como ${usuario.rolEmpresa})`
          : usuario
            ? `Operaciones de ${usuario.nombre} ${usuario.apellido}`
            : 'Cargando datos del usuario...'}
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
              onChange: (page) => setPaginaCompras(page),
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
              onChange: (page) => setPaginaVentas(page),
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
