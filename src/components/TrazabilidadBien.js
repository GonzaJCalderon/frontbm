import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, notification, Spin, Alert } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';

const TrazabilidadBien = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const fetchTrazabilidad = async () => {
      try {
        const response = await axios.get(`http://localhost:5005/bienes/trazabilidad/${uuid}`);
        if (response.data.message) {
          setMensaje(response.data.message); // Guarda el mensaje cuando no hay transacciones
          setTransacciones([]); // Asegúrate de que transacciones esté vacío
        } else {
          setTransacciones(response.data); // Guarda las transacciones
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
  
    fetchTrazabilidad();
  }, [uuid]);
  

  const renderDireccion = (direccion) => {
    if (!direccion) return 'N/A';
    const { calle, altura, barrio, departamento } = direccion;
    return `${calle || ''} ${altura || ''}, ${barrio || ''}, ${departamento || ''}`;
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
      dataIndex: 'compradorTransaccion',
      key: 'comprador',
      render: (comprador) => (
        <div>
          <p>{comprador.nombre} {comprador.apellido}</p>
          <p>DNI: {comprador.dni}</p>
          <p>Email: {comprador.email}</p>
          <p>CUIT: {comprador.cuit}</p>
          <p>Dirección: {renderDireccion(comprador.direccion)}</p>
        </div>
      ),
    },
    {
      title: 'Vendedor',
      dataIndex: 'vendedorTransaccion',
      key: 'vendedor',
      render: (vendedor) => (
        <div>
          <p>{vendedor.nombre} {vendedor.apellido}</p>
          <p>DNI: {vendedor.dni}</p>
          <p>Email: {vendedor.email}</p>
          <p>CUIT: {vendedor.cuit}</p>
          <p>Dirección: {renderDireccion(vendedor.direccion)}</p>
        </div>
      ),
    },
    {
      title: 'Bien',
      dataIndex: 'bienTransaccion',
      key: 'bien',
      render: (bien) => `${bien.descripcion} - ${bien.marca} ${bien.modelo}`,
    },
    {
      title: 'Identificadores',
      dataIndex: 'imeis',
      key: 'imeis',
      render: (imeis) => (
        imeis && imeis.length > 0 ? imeis.join(', ') : 'N/A'
      ),
    },
  ];
  

  if (loading) {
    return <Spin tip="Cargando..." />;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" />;
  }

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
