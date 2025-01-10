import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllBienes, deleteBien } from '../redux/actions/bienes';
import { useNavigate } from 'react-router-dom';
import { Table, Image, Button, Spin, notification, Modal, Input } from 'antd';
import { ArrowLeftOutlined, LogoutOutlined } from '@ant-design/icons';

const BienList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: bienes, error } = useSelector((state) => state.bienes);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({ tipo: '', modelo: '', marca: '', comprador: '' });
  const [filteredBienes, setFilteredBienes] = useState([]);

  const userData = JSON.parse(localStorage.getItem('userData'));
  const isAdmin = userData?.rolDefinitivo === 'admin';

  const handleLogout = () => {
    localStorage.clear(); // Limpia la sesión del usuario
    notification.success({
      message: 'Sesión cerrada',
      description: 'Has cerrado sesión correctamente.',
    });
    navigate('/login'); // Redirige a la página de inicio de sesión
  };

  useEffect(() => {
    const loadBienes = async () => {
      setIsLoading(true);
      try {
        const response = await dispatch(fetchAllBienes());
        if (response) {
          setFilteredBienes(response); // Inicializa los bienes filtrados
        }
      } catch (error) {
        console.error('Error al cargar los bienes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBienes();
  }, [dispatch]);

  // Manejo de filtros
  const handleFilters = () => {
    const { tipo, marca, modelo, comprador } = searchFilters;

    const filtered = bienes.filter((bien) => {
      const matchesTipo = tipo === '' || bien.tipo?.toLowerCase().includes(tipo.toLowerCase());
      const matchesMarca = marca === '' || bien.marca?.toLowerCase().includes(marca.toLowerCase());
      const matchesModelo = modelo === '' || bien.modelo?.toLowerCase().includes(modelo.toLowerCase());
      const matchesComprador =
        comprador === '' ||
        bien.transacciones?.some(
          (trans) =>
            trans.compradorTransaccion &&
            trans.compradorTransaccion.nombre.toLowerCase().includes(comprador.toLowerCase())
        );
      return matchesTipo && matchesMarca && matchesModelo && matchesComprador;
    });

    setFilteredBienes(filtered);
  };

  useEffect(() => {
    handleFilters();
  }, [searchFilters, bienes]);

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
      title: 'Foto',
      key: 'foto',
      render: (_, record) =>
        record.fotos && record.fotos.length > 0 ? (
          <Image src={record.fotos[0]} alt="Foto del bien" width={50} preview={false} />
        ) : (
          'Sin foto'
        ),
    },
    {
      title: 'Propietario',
      key: 'propietario',
      render: (_, record) =>
        record.propietario ? `${record.propietario.nombre} ${record.propietario.apellido}` : 'No asignado',
    },
    {
      title: 'Comprador',
      key: 'comprador',
      render: (_, record) =>
        record.transacciones?.map(
          (trans) =>
            `${trans.compradorTransaccion?.nombre} ${trans.compradorTransaccion?.apellido}`
        ) || 'Sin comprador',
    },
    {
      title: 'Stock',
      key: 'stock',
      render: (_, record) => (record.stock ? record.stock.cantidad : 'Sin stock'),
    },
    {
      title: 'Identificadores',
      key: 'identificadores',
      render: (_, record) => {
        const identificadores = record.detalles?.map((d) => d.identificador_unico) || [];
        return identificadores.length > 0 ? identificadores.join(', ') : 'N/A';
      },
    },
    {
      title: 'Acción',
      key: 'action',
      render: (_, bien) => (
        <div className="flex space-x-2">
          <Button
            type="primary"
            onClick={() => navigate(`/bienes/trazabilidad/${bien.uuid}`)}
          >
            Ver Trazabilidad
          </Button>
          {isAdmin && (
            <>
              <Button
                onClick={() => navigate(`/bienes/edit/${bien.uuid}`)}
                style={{
                  background: '#ffc107',
                  borderColor: '#ffc107',
                  color: '#000',
                }}
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

  if (error) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-red-500 text-2xl font-bold">Error al cargar los bienes</h2>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container flex-grow p-4">
      <div className="flex justify-between mb-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Volver
        </Button>
        <Button icon={<LogoutOutlined />} onClick={handleLogout} danger>
          Cerrar Sesión
        </Button>
      </div>

      <h2 className="text-2xl font-bold mb-4">Lista de Bienes</h2>

      <div className="flex space-x-4 mb-4">
        <Input
          placeholder="Buscar por tipo"
          value={searchFilters.tipo}
          onChange={(e) => setSearchFilters({ ...searchFilters, tipo: e.target.value })}
          style={{ width: '200px' }}
        />
        <Input
          placeholder="Buscar por marca"
          value={searchFilters.marca}
          onChange={(e) => setSearchFilters({ ...searchFilters, marca: e.target.value })}
          style={{ width: '200px' }}
        />
        <Input
          placeholder="Buscar por modelo"
          value={searchFilters.modelo}
          onChange={(e) => setSearchFilters({ ...searchFilters, modelo: e.target.value })}
          style={{ width: '200px' }}
        />
        <Input
          placeholder="Buscar por comprador"
          value={searchFilters.comprador}
          onChange={(e) => setSearchFilters({ ...searchFilters, comprador: e.target.value })}
          style={{ width: '200px' }}
        />
      </div>

      <Table
        dataSource={filteredBienes}
        columns={columns}
        rowKey="uuid"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default BienList;
