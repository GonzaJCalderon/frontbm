import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Spin, Alert, Space, Image } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrazabilidadBien } from '../redux/actions/bienes';

const TrazabilidadBien = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { transacciones, loading, mensaje, error } = useSelector(state => state.bienes);

  useEffect(() => {
    dispatch(fetchTrazabilidadBien(uuid));
  }, [dispatch, uuid]);

  const renderFotos = (bien) => {
    // Obtener fotos de bienTransaccion y detalles
    let fotos = bien?.fotos || [];
  
    if (bien?.detalles) {
      const fotosDetalles = bien.detalles
        .map(det => det.foto)
        .filter(foto => foto); // Filtra nulls o undefined
      fotos = [...fotos, ...fotosDetalles];
    }
  
    return fotos.length > 0 ? (
      <Space>
        {fotos.map((foto, index) => (
          <Image
            key={index}
            width={80}
            src={foto}
            alt={`Imagen ${index + 1}`}
            onError={(e) => { e.target.src = '/images/placeholder.png'; }}
          />
        ))}
      </Space>
    ) : 'Sin fotos';
  };
  

  const renderIMEIs = (imeis) => (
    imeis.length > 0 ? imeis.join(', ') : 'Sin IMEIs'
  );

  const renderUsuario = (usuario) => (
    <div>
      <p>{usuario?.nombre} {usuario?.apellido}</p>
      <p>DNI: {usuario?.dni || 'N/A'}</p>
      <p>Email: {usuario?.email || 'N/A'}</p>
      <p>CUIT: {usuario?.cuit || 'N/A'}</p>
      <p>Dirección: {usuario?.direccion?.calle || 'N/A'}, {usuario?.direccion?.altura || ''}</p>
    </div>
  );

  const columns = [
    { 
      title: 'Fecha', 
      dataIndex: 'fecha', 
      key: 'fecha', 
      render: (text) => new Date(text).toLocaleString() 
    },
    {
      title: 'Comprador',
      dataIndex: 'compradorTransaccion',
      key: 'comprador',
      render: (comprador) => (
        <div>
          <p><strong>{comprador?.nombre} {comprador?.apellido}</strong></p>
          <p>DNI: {comprador?.dni || 'N/A'}</p>
          <p>Email: {comprador?.email || 'N/A'}</p>
          <p>CUIT: {comprador?.cuit || 'N/A'}</p>
          <p><strong>Dirección:</strong> {comprador?.direccion || 'Sin dirección'}</p>
        </div>
      ),
    },
    {
      title: 'Vendedor',
      dataIndex: 'vendedorTransaccion',
      key: 'vendedor',
      render: (vendedor) => (
        <div>
          <p><strong>{vendedor?.nombre} {vendedor?.apellido}</strong></p>
          <p>DNI: {vendedor?.dni || 'N/A'}</p>
          <p>Email: {vendedor?.email || 'N/A'}</p>
          <p>CUIT: {vendedor?.cuit || 'N/A'}</p>
          <p><strong>Dirección:</strong> {vendedor?.direccion || 'Sin dirección'}</p>
        </div>
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
      title: 'Identificadores IMEI',
      dataIndex: ['bienTransaccion', 'detalles'],
      key: 'imeis',
      render: (detalles) => (
        detalles && detalles.length > 0 
          ? detalles.map(det => <p key={det.identificador_unico}>{det.identificador_unico} ({det.estado})</p>) 
          : 'Sin IMEIs'
      ),
    },
    {
      title: 'Fotos',
      dataIndex: 'bienTransaccion',
      key: 'fotos',
      render: (bien) => renderFotos(bien),
    },
    
  ];
  
  

  if (loading) return <Spin tip="Cargando..." />;
  if (error) return <Alert message="Error" description={error} type="error" />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Volver</Button>
      <h1 className="text-2xl font-bold mb-4">Trazabilidad del Bien</h1>
      {mensaje ? (
        <Alert message="Información" description={mensaje} type="info" showIcon />
      ) : (
        <Table
          dataSource={transacciones}
          columns={columns}
          rowKey="uuid"
          pagination={{ pageSize: 5 }}
        />
      )}
    </div>
  );
};

export default TrazabilidadBien;
