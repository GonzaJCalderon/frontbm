import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation  } from 'react-router-dom';
import {
  fetchBienesPorUsuario,
  fetchBienesPorEmpresa,
  deleteBien
} from '../redux/actions/bienes';
import { fetchApprovedUsers } from '../redux/actions/usuarios';
import {
  Spin,
  Table,
  Button,
  Tag,
  Space,
  Input,
  Modal,
  Image,
  Alert,
} from 'antd';
import {
  ArrowLeftOutlined,
  LogoutOutlined,
  UpOutlined,
  DownOutlined,
} from '@ant-design/icons';

const BienesPorUsuario = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
const nombreEmpresaDesdeState = location.state?.nombreEmpresa;
const desdeInfoEmpresas = location.state?.desdeInfoEmpresas;


  const [expandedFotoRows, setExpandedFotoRows] = useState({});
  const [expandedIMEIRows, setExpandedIMEIRows] = useState({});
  const [previewFoto, setPreviewFoto] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [usuarioActual, setUsuarioActual] = useState(null);

const bienesState = useSelector((state) => state.bienes);

// ✅ Toma los bienes según de dónde vengan
const bienes = bienesState.bienesEmpresa?.length
  ? bienesState.bienesEmpresa
  : bienesState.items || [];

console.log("🧾 Bienes desde Redux:", bienes);


  const usuarios = useSelector((state) => state.usuarios.approvedUsers || []);
  const isLoading = bienesState.loading;


  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const isAdmin = userData.rol === 'admin';

  useEffect(() => {
    dispatch(fetchApprovedUsers());
  }, [dispatch]);

 useEffect(() => {
  const usuario = usuarios.find((u) => u.uuid === uuid);
  if (!usuario) return;

  setUsuarioActual(usuario);

  const esEmpresa = ['responsable', 'delegado'].includes(
    usuario.rolEmpresa?.toLowerCase?.() || ''
  );

  const empresaUuidValida =
    usuario?.empresa &&
    typeof usuario.empresa.uuid === 'string' &&
    usuario.empresa.uuid !== 'undefined' &&
    usuario.empresa.uuid !== 'null' &&
    usuario.empresa.uuid.trim().length === 36
      ? usuario.empresa.uuid
      : null;

  const idDestino = esEmpresa && empresaUuidValida ? empresaUuidValida : usuario.uuid;

  // 🧠 Debug clave
  console.log({
    usuario,
    esEmpresa,
    empresaUuidValida,
    idDestino,
    empresa: usuario.empresa
  });

  if (esEmpresa && empresaUuidValida) {
    console.log("✅ Fetch por EMPRESA:", idDestino);
    dispatch(fetchBienesPorEmpresa(idDestino));
  } else {
    console.log("✅ Fetch por USUARIO:", idDestino);
    dispatch(fetchBienesPorUsuario(idDestino, true));
  }
}, [uuid, usuarios, dispatch]);



  const toggleFotoExpand = (idx) => {
    setExpandedFotoRows((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value.toLowerCase());

  const handleDeleteBien = (bienUuid) => {
    Modal.confirm({
      title: '¿Eliminar bien?',
      content: 'Esta acción es irreversible.',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await dispatch(deleteBien(bienUuid));
          Modal.success({ content: 'Bien eliminado correctamente.' });
          const idDestino = usuarioActual?.empresa_uuid || uuid;
          usuarioActual?.rolEmpresa
            ? dispatch(fetchBienesPorEmpresa(idDestino))
            : dispatch(fetchBienesPorUsuario(idDestino, true));
        } catch (err) {
          Modal.error({ title: 'Error', content: 'No se pudo eliminar el bien.' });
        }
      },
    });
  };

  const bienesFiltrados = bienes.filter((b) =>
    [b.tipo, b.marca, b.modelo, b.descripcion]
      .some((field) => field?.toLowerCase().includes(searchTerm))
  );

  const columns = [
    {
      title: 'Fecha de Registro',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => createdAt ? new Date(createdAt).toLocaleString() : 'Sin fecha',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
    },
    {
      title: 'Marca',
      dataIndex: 'marca',
      key: 'marca',
    },
    {
      title: 'Modelo',
      dataIndex: 'modelo',
      key: 'modelo',
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
    },
    {
      title: 'Precio',
      dataIndex: 'precio',
      key: 'precio',
      render: (precio) => `$${Number(precio).toFixed(2)}`,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (s) => (s > 0 ? `${s} unidades` : 'Sin stock'),
    },
    {
      title: 'IMEIs',
      dataIndex: 'identificadores',
      key: 'imeis',
      render: (identificadores = [], row) => {
        const expanded = expandedIMEIRows[row.uuid];
        const visibles = expanded ? identificadores : identificadores.slice(0, 1);
        return (
          <>
            {visibles.map((det) => (
              <p key={det.identificador_unico}>
                {det.identificador_unico}{' '}
                <Tag color={det.estado?.toLowerCase() === 'disponible' ? 'green' : 'red'}>
                  {det.estado}
                </Tag>
              </p>
            ))}
            {identificadores.length > 1 && (
              <Button
                type="link"
                size="small"
                onClick={() =>
                  setExpandedIMEIRows((prev) => ({
                    ...prev,
                    [row.uuid]: !prev[row.uuid],
                  }))
                }
              >
                {expanded ? <UpOutlined /> : <DownOutlined />} {expanded ? 'Ver menos' : 'Ver más'}
              </Button>
            )}
          </>
        );
      },
    },
    {
      title: 'Fotos',
      key: 'fotos',
      render: (_, row, idx) => {
        const fotos = row.fotos || [];
        const expanded = expandedFotoRows[idx];
        const visibles = expanded ? fotos : fotos.slice(0, 3);

        return fotos.length === 0 ? (
          'Sin fotos'
        ) : (
          <>
            <Space>
              {visibles.map((foto, i) => (
                <Image
                  key={i}
                  width={80}
                  src={foto}
                  alt={`Foto ${i + 1}`}
                  onClick={() => setPreviewFoto(foto)}
                  preview={false}
                />
              ))}
            </Space>
            {fotos.length > 3 && (
              <Button
                type="link"
                size="small"
                onClick={() => toggleFotoExpand(idx)}
              >
                {expanded ? <UpOutlined /> : <DownOutlined />} {expanded ? 'Ver menos' : 'Ver más'}
              </Button>
            )}
          </>
        );
      },
    },
    ...(isAdmin
      ? [{
          title: 'Acciones',
          key: 'acciones',
          render: (_, bien) => (
            <Space>
              <Button onClick={() => navigate(`/bienes/trazabilidad/${bien.uuid}`)}>
                Trazabilidad
              </Button>
             <Button
  type="primary"
  onClick={() =>
    navigate(`/bienes/edit/${bien.uuid}`, {
      state: {
        fromUserUuid: usuarioActual?.uuid || '',
      },
    })
  }
>
  Editar
</Button>

              <Button danger onClick={() => handleDeleteBien(bien.uuid)}>
                Eliminar
              </Button>
            </Space>
          )
        }]
      : []),
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between mb-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Volver</Button>
        <Button icon={<LogoutOutlined />} danger onClick={() => navigate('/home')}>Cerrar sesión</Button>
      </div>

    <h1 className="text-2xl font-bold mb-4 text-center">
  {desdeInfoEmpresas
    ? `Bienes de la empresa: ${nombreEmpresaDesdeState || localStorage.getItem('nombreUsuarioSeleccionado')}`
    : usuarioActual?.rolEmpresa === 'responsable' || usuarioActual?.rolEmpresa === 'delegado'
      ? `Bienes de la empresa: ${usuarioActual?.empresa?.razonSocial || localStorage.getItem('nombreUsuarioSeleccionado') || 'Empresa no identificada'}`
      : `Bienes del usuario: ${usuarioActual?.nombre} ${usuarioActual?.apellido}`}
</h1>



      <Input.Search
        placeholder="Buscar por tipo, marca, modelo, descripción..."
        onChange={handleSearchChange}
        allowClear
        enterButton
        style={{ maxWidth: 400, marginBottom: 20 }}
      />

      {isLoading ? (
        <Spin size="large" tip="Cargando bienes..." />
      ) : bienesFiltrados.length === 0 ? (
        <Alert type="info" message="No se encontraron bienes." />
      ) : (
        <Table
          dataSource={bienesFiltrados}
          columns={columns}
          rowKey="uuid"
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      )}

      <Modal
        open={!!previewFoto}
        footer={null}
        onCancel={() => setPreviewFoto(null)}
        centered
      >
        <img src={previewFoto} alt="Vista previa" style={{ width: '100%' }} />
      </Modal>
    </div>
  );
};

export default BienesPorUsuario;
