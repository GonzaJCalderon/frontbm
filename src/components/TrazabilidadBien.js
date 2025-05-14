import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Spin,
  Alert,
  Space,
  Image,
  Tag,
  Typography,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTrazabilidadBien,
  fetchTrazabilidadPorBien,
} from '../redux/actions/bienes';

const TrazabilidadBien = () => {
  const { uuid, identificador } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { transacciones, loading, error } = useSelector((state) => state.bienes);
  const { Text } = Typography;

  useEffect(() => {
    if (identificador) {
      dispatch(fetchTrazabilidadBien(identificador));
    } else if (uuid) {
      dispatch(fetchTrazabilidadPorBien(uuid));
    }
  }, [dispatch, uuid, identificador]);

  const UsuarioDetalle = ({ usuario, empresa, rol }) => (
    <div>
      <Tag color={rol === 'comprador' ? 'green' : 'blue'}>
        {rol === 'comprador' ? 'Comprador' : 'Vendedor'}
      </Tag>

      {empresa?.razonSocial ? (
        <>
          <p><strong>{empresa.razonSocial}</strong></p>
          <p><em>Representado por: {usuario?.nombre} {usuario?.apellido}</em></p>
          {empresa.direccion && (
            <p>
              <strong>Dirección Empresa:</strong>{' '}
              {typeof empresa.direccion === 'string'
                ? empresa.direccion
                : `${empresa.direccion.calle || 'Calle N/D'}, ${empresa.direccion.altura || 'Altura N/D'}${empresa.direccion.departamento ? `, ${empresa.direccion.departamento}` : ''}`}
            </p>
          )}
        </>
      ) : (
        <p><strong>{usuario?.nombre} {usuario?.apellido}</strong></p>
      )}

      <p>DNI: {usuario?.dni || 'N/A'}</p>
      <p>Email: {usuario?.email || 'N/A'}</p>
      <p>CUIT: {usuario?.cuit || 'N/A'}</p>
      <p>
        <strong>Dirección:</strong>{' '}
        {typeof usuario?.direccion === 'string'
          ? usuario.direccion
          : `${usuario?.direccion?.calle || 'Calle N/D'}, ${usuario?.direccion?.altura || 'Altura N/D'}${usuario?.direccion?.departamento ? `, ${usuario.direccion.departamento}` : ''}`}
      </p>
    </div>
  );

  const renderIdentificadores = (identificadores) => {
    if (!identificadores || identificadores.length === 0) return 'Sin identificadores';
    return identificadores.map((det) => (
      <div key={det.identificador_unico}>
        <p>
          {det.identificador_unico}{' '}
          <span className="text-gray-500">
            ({det.estado || 'vendido'})
          </span>
        </p>
      </div>
    ));
  };

  const renderFotos = (record) => {
    let fotos = record?.fotos || [];

    if (record?.identificadores) {
      const fotosIdentificadores = record.identificadores.map(i => i.foto).filter(Boolean);
      fotos = [...fotos, ...fotosIdentificadores];
    }

    if (fotos.length === 0) return 'Sin fotos';

    return (
      <Image.PreviewGroup>
        <Space wrap>
          {fotos.map((foto, index) => (
            <Image
              key={index}
              width={80}
              height={80}
              style={{ objectFit: 'cover', borderRadius: '4px' }}
              src={foto}
              alt={`Foto ${index + 1}`}
              fallback="/images/placeholder.png"
            />
          ))}
        </Space>
      </Image.PreviewGroup>
    );
  };

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Comprador',
      key: 'comprador',
      render: (_, record) => (
        <UsuarioDetalle
          usuario={record.compradorTransaccion}
          empresa={record.empresaCompradora}
          rol="comprador"
        />
      ),
    },
    {
      title: 'Vendedor',
      key: 'vendedor',
      render: (_, record) => (
        <UsuarioDetalle
          usuario={record.vendedorTransaccion}
          empresa={record.empresaVendedora}
          rol="vendedor"
        />
      ),
    },
    {
      title: 'Bien',
      dataIndex: 'bienTransaccion',
      key: 'bien',
      render: (bien) => (
        <div>
          <p><strong>Descripción:</strong> {bien?.descripcion || 'N/A'}</p>
          <p><strong>Marca:</strong> {bien?.marca || 'N/A'}</p>
          <p><strong>Modelo:</strong> {bien?.modelo || 'N/A'}</p>
          <p><strong>Precio:</strong> ${bien?.precio || 'N/A'}</p>
        </div>
      ),
    },
    {
      title: 'Identificadores',
      key: 'identificadores',
      render: (_, record) => renderIdentificadores(record?.identificadores),
    },
    {
      title: 'Fotos',
      key: 'fotos',
      render: (_, record) => renderFotos(record),
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-4 flex items-center justify-between">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-4 text-blue-700">
        Historial de Trazabilidad del Bien
      </h1>

      {loading && <Spin tip="Cargando historial..." size="large" />}

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      {!loading && !error && transacciones.length === 0 ? (
        <Alert
          message="Este bien aún no tiene transacciones registradas."
          type="info"
          showIcon
        />
      ) : (
        !loading && !error && (
          <Table
            dataSource={transacciones}
            columns={columns}
            rowKey="uuid"
            pagination={{ pageSize: 5 }}
          />
        )
      )}
    </div>
  );
};

export default TrazabilidadBien;
