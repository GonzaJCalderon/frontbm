import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Spin, Alert, Button, Space } from 'antd';
import { fetchHistorialCambios } from '../redux/actions/usuarios';

const fieldMapping = {
  'direccion.calle': 'Calle de la Dirección',
  'direccion.altura': 'Altura de la Dirección',
  'direccion.departamento': 'Departamento',
  // Agrega más campos según sea necesario
};

// Función para mapear campos
const mapFieldName = (key) => fieldMapping[key] || key || 'Sin especificar';

const HistorialCambios = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uuid) {
      setError('UUID no válido');
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const data = await fetchHistorialCambios(uuid);
        if (!Array.isArray(data)) throw new Error('El historial no tiene un formato válido');

        setHistorial(data);
      } catch (err) {
        setError(err.message || 'Error al obtener los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [uuid]);

  // Memoriza las columnas para evitar recreaciones innecesarias
  const columns = useMemo(
    () => [
      {
        title: 'Campo',
        dataIndex: 'campo',
        key: 'campo',
        render: mapFieldName,
      },
      {
        title: 'Valor Anterior',
        dataIndex: 'valor_anterior',
        key: 'valor_anterior',
        render: (text) => text || '-',
      },
      {
        title: 'Valor Nuevo',
        dataIndex: 'valor_nuevo',
        key: 'valor_nuevo',
        render: (text) => text || '-',
      },
      {
        title: 'Fecha',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (text) =>
          text
            ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(text))
            : '-',
      },
    ],
    []
  );

  // Manejo de carga y errores
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Spin tip="Cargando historial de cambios..." />
      </div>
    );
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <div style={{ padding: '40px 20px' }}>
      <Space style={{ marginBottom: '30px', padding: '10px 30px', display: 'flex', justifyContent: 'space-between' }}>
        <Button type="primary" onClick={() => navigate(-1)}>
          Volver
        </Button>
        <Button danger onClick={() => navigate('/login')}>
          Cerrar Sesión
        </Button>
      </Space>

      <h2 style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '30px' }}>
        Historial de Cambios de Usuario
      </h2>

      <Table
        dataSource={historial}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default HistorialCambios;
