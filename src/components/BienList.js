import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllBienes, deleteBien } from '../redux/actions/bienes';
import { useNavigate } from 'react-router-dom';
import { Table, Image, Button, Spin, notification, Modal, Space } from 'antd';
import { ArrowLeftOutlined, LogoutOutlined } from '@ant-design/icons';

const BienList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: bienes, error } = useSelector((state) => state.bienes);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredBienes, setFilteredBienes] = useState([]);

  const userData = JSON.parse(localStorage.getItem('userData'));
  const isAdmin = userData?.rolDefinitivo === 'admin';

  const [refreshFlag, setRefreshFlag] = useState(false); // 🚀 Estado para controlar recargas

  useEffect(() => {
    const loadBienes = async () => {
      setIsLoading(true);
      try {
        const response = await dispatch(fetchAllBienes());
  
        if (response && Array.isArray(response)) {
          console.log("📌 Bienes recibidos (frontend):", response);
  
          const sortedBienes = response.map((bien) => ({
            ...bien,
            stock: bien.detalles
              ? bien.detalles.filter((det) => det.estado === "disponible").length
              : bien.stock !== undefined && bien.stock !== null
              ? bien.stock
              : 0,
            propietario: bien.propietario || "Desconocido",
            fechaActualizacion: bien.fechaActualizacion || "Sin fecha",

          }));
  
          sortedBienes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); // 🔥 Asegurar que se ordenan bien
          setFilteredBienes(sortedBienes);
        } else {
          console.error("⚠️ fetchAllBienes no devolvió un array:", response);
        }
      } catch (error) {
        console.error("❌ Error al cargar los bienes:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    loadBienes();
  }, [dispatch, refreshFlag]); // 🔥 Se actualiza cuando cambia refreshFlag
  
  
  
  

  const handleDelete = (bien) => {
    Modal.confirm({
      title: '¿Estás seguro de que deseas eliminar este bien?',
      content: `Tipo: ${bien.tipo}, Modelo: ${bien.modelo}`,
      okText: 'Sí',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await dispatch(deleteBien(bien.uuid));
        } catch (error) {
          console.error('Error al eliminar el bien:', error);
        }
      },
    });
  };

  const columns = [
    { title: 'Tipo', dataIndex: 'tipo', key: 'tipo' },
    { title: 'Modelo', dataIndex: 'modelo', key: 'modelo' },
    { title: 'Marca', dataIndex: 'marca', key: 'marca' },
    { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion' },
    {
      title: 'Propietario', // ✅ Mostrar correctamente el propietario
      dataIndex: 'propietario',
      key: 'propietario',
      render: (propietario, record) => propietario ?? "Sin propietario",
    },
    { title: "Fecha", 
      dataIndex: "fechaActualizacion", 
      key: "fechaActualizacion" },

    {
      title: 'Fotos',
      dataIndex: 'todasLasFotos',
      render: (fotos) => {
        if (!fotos || fotos.length === 0) {
          return 'Sin fotos';
        }
        return (
          <Space>
            {fotos.map((foto, index) => (
              <Image
                key={index}
                width={80}
                src={foto}
                alt={`Foto ${index + 1}`}
                onError={(e) => { e.target.src = '/images/placeholder.png'; }}
              />
            ))}
          </Space>
        );
      }
    },
    {
      title: 'Stock',
      key: 'stock',
      render: (_, record) => (record.stock > 0 ? record.stock : 'Sin stock'),
    },
    {
      title: 'Acción',
      key: 'action',
      render: (_, bien) => (
        <div className="flex space-x-2">
          <Button type="primary" onClick={() => navigate(`/bienes/trazabilidad/${bien.uuid}`)}>
            Ver Trazabilidad
          </Button>
          {isAdmin && (
            <>
              <Button
                onClick={() => navigate(`/bienes/edit/${bien.uuid}`)}
                style={{ background: '#ffc107', borderColor: '#ffc107', color: '#000' }}
              >
                Editar
              </Button>
              <Button danger onClick={() => handleDelete(bien)}>
                Eliminar
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];
  

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
        <p className="mt-4 text-xl text-gray-700">Cargando bienes, por favor espera...</p>
      </div>
    );
  }

  return (
    <div className="container flex-grow p-4">
      <div className="flex justify-between mb-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Volver</Button>
        <Button icon={<LogoutOutlined />} onClick={() => { localStorage.clear(); navigate('/login'); }} danger>Cerrar Sesión</Button>
      </div>

      <h2 className="text-2xl font-bold mb-4">Lista de Bienes</h2>

      <Table dataSource={filteredBienes} columns={columns} rowKey="uuid" pagination={{ pageSize: 10 }} />
    </div>
  );
};

export default BienList;
