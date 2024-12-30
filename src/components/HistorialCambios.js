import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Spin, Alert, Button, Space } from 'antd';
import { fetchHistorialCambios } from '../redux/actions/usuarios'; // Importa la acción corregida

const HistorialCambios = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [historial, setHistorial] = useState([]); // Estado para almacenar los datos
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Estado para manejar errores

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await fetchHistorialCambios(uuid);
        if (Array.isArray(data)) {
          setHistorial(data); // Almacena los datos en el estado
        } else {
          throw new Error('El historial no tiene un formato válido');
        }
      } catch (err) {
        console.error('Error en fetchHistory:', err.message);
        setError(err.message); // Almacena el error en el estado
      } finally {
        setLoading(false); // Finaliza la carga
      }
    };

    fetchHistory();
  }, [uuid]);

  // Función para formatear valores
  const formatValue = (value) => {
    try {
      const parsed = JSON.parse(value); // Intenta parsear como JSON
      if (typeof parsed === 'object' && parsed !== null) {
        // Si es un objeto JSON, devuelve un texto formateado con salto de línea
        return Object.entries(parsed)
          .map(([key, val]) => `${key}: ${val || '-'}`)
          .join(', ');
      }
    } catch (e) {
      // Si no es JSON válido, devuelve el valor original
    }
    return value === null || value === 'null' ? '-' : value; // Muestra '-' si el valor es null
  };

  // Configuración de las columnas de la tabla
  const columns = [
    { title: 'Campo', dataIndex: 'campo', key: 'campo' },
    {
      title: 'Valor Anterior',
      dataIndex: 'valor_anterior',
      key: 'valor_anterior',
      render: (text) => formatValue(text),
    },
    {
      title: 'Valor Nuevo',
      dataIndex: 'valor_nuevo',
      key: 'valor_nuevo',
      render: (text) => formatValue(text),
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      render: (text) => new Date(text).toLocaleString(), // Formatea la fecha
    },
  ];

  // Manejadores de los botones
  const handleBack = () => navigate(-1); // Regresa a la página anterior
  const handleLogout = () => {
    localStorage.removeItem('token'); // Elimina el token de sesión
    navigate('/login'); // Redirige al inicio de sesión
  };

  // Muestra un spinner mientras se cargan los datos
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Spin tip="Cargando historial de cambios..." />
      </div>
    );
  }

  // Muestra un mensaje de error si ocurre algún problema
  if (error) {
    return <Alert message="Error" description={error} type="error" />;
  }

  // Renderiza la tabla con los datos
  return (
    <div style={{ padding: '40px 20px' }}>
      <Space
        style={{
          marginBottom: '30px', // Espacio entre los botones y el título
          padding: '10px 30px', // Ajusta el relleno interno
          display: 'flex',
          justifyContent: 'space-between', // Mantiene los botones en extremos opuestos
        }}
      >
        <Button type="primary" onClick={handleBack}>
          Volver
        </Button>
        <Button danger onClick={handleLogout}>
          Cerrar Sesión
        </Button>
      </Space>
      <h2
        style={{
          textAlign: 'center',
          fontSize: '24px', // Tamaño más grande
          fontWeight: 'bold', // Negrita
          color: '#333', // Color destacado
          marginBottom: '30px', // Separación del título respecto a la tabla
        }}
      >
        Historial de Cambios de Usuario
      </h2>
      <Table
        dataSource={historial}
        columns={columns}
        rowKey="id" // Clave única para cada fila
        pagination={{ pageSize: 10 }} // Paginación
      />
    </div>
  );
};

export default HistorialCambios;
