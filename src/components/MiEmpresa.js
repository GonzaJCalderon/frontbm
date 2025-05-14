import React, { useEffect, useState } from 'react';
import {
  Button,
  Spin,
  List,
  Divider,
  Card,
  Descriptions,
  Row,
  Typography,
  Space,
  message,
  Modal,
  Menu,
   Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  LogoutOutlined,
  ArrowLeftOutlined,
  MailOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  BarcodeOutlined,
  HomeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDelegados } from '../redux/actions/usuarios';
import api from '../redux/axiosConfig';

const { Title } = Typography;

const MiEmpresa = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const delegados = useSelector((state) => state.usuarios.delegados);
  const loadingDelegados = useSelector((state) => state.usuarios.delegadosLoading);

  const [empresa, setEmpresa] = useState(null);
  const [loadingEmpresa, setLoadingEmpresa] = useState(true);

  const userData = JSON.parse(localStorage.getItem('userData'));
  console.log('🧠 userData:', userData);

  const token = localStorage.getItem('authToken');

  const handleVolver = () => navigate('/user/dashboard');
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  useEffect(() => {
    const fetchEmpresaYDelegados = async () => {
      setLoadingEmpresa(true);
      try {
        const token = localStorage.getItem('authToken');
        const res = await api.get('/empresas/delegado/empresa', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const empresaData = res.data?.empresa;
        if (empresaData?.uuid) {
          setEmpresa(empresaData);
          await dispatch(fetchDelegados(empresaData.uuid));
        } else {
          message.warning('No se encontró empresa válida.');
        }
      } catch (err) {
        console.error('[❌ Error]:', err);
        message.error('Error al cargar la información de la empresa.');
      } finally {
        setLoadingEmpresa(false);
      }
    };

    fetchEmpresaYDelegados();
  }, [dispatch]);

  const soloDelegados = Array.isArray(delegados)
    ? delegados.filter((d) => d.rolEmpresa?.toLowerCase() === 'delegado')
    : [];

  const formatFecha = (fechaISO) => {
    if (!fechaISO) return 'No registrada';
    const fecha = new Date(fechaISO);
    return isNaN(fecha) ? 'Fecha inválida' : fecha.toLocaleDateString();
  }; 

  const handleActivarDesactivar = async (uuid, activo) => {
    try {
      const token = localStorage.getItem('authToken');
  
      await api.patch(
        `/usuarios/${uuid}/activar`,
        { activo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      message.success(`✅ Delegado ${activo ? 'activado' : 'desactivado'} correctamente`);
  
      // Aquí asegúrate de recargar delegados correctamente
      if (empresa?.uuid) {
        await dispatch(fetchDelegados(empresa.uuid));
      }
  
    } catch (error) {
      console.error('❌ Error al cambiar estado del usuario:', error);
      message.error('❌ Error al cambiar estado del usuario');
    }
  };
  
  
  

  const handleEliminarDelegado = (uuidDelegado, nombreCompleto) => {
    Modal.confirm({
      title: `¿Eliminar a ${nombreCompleto}?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Esta acción no se puede deshacer.',
      okText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      okType: 'danger',
      async onOk() {
        try {
          const token = localStorage.getItem('authToken');
          await api.delete(`/empresas/delegado/${uuidDelegado}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          message.success(`Delegado ${nombreCompleto} eliminado correctamente`);
  
          if (empresa?.uuid) {
            dispatch(fetchDelegados(empresa.uuid));
          }
        } catch (error) {
          console.error('Error al eliminar delegado:', error);
          message.error('No se pudo eliminar el delegado');
        }
      },
    });
  };
  
    

  return (
    <div className="p-6 bg-white min-h-screen rounded-md shadow-md">
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={handleVolver}>
          Volver
        </Button>
        <Button icon={<LogoutOutlined />} onClick={handleLogout} danger>
          Cerrar sesión
        </Button>
      </Row>

      <Title level={2} style={{ color: '#1e3a8a' }}>Mi Empresa</Title>

      {loadingEmpresa ? (
        <Spin tip="Cargando información de la empresa..." />
      ) : empresa ? (
        <>
          <Card
            title={empresa.razonSocial}
            bordered={false}
            style={{ marginBottom: 32 }}
            headStyle={{ fontSize: 20, color: '#1677ff' }}
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label={<><MailOutlined /> Email</>}>
                {empresa.email}
              </Descriptions.Item>

              <Descriptions.Item label={<><BarcodeOutlined /> CUIT</>}>
                {empresa.cuit}
              </Descriptions.Item>

              {/* <Descriptions.Item label={<><CheckCircleOutlined /> Estado</>}>
                {empresa.estado || 'Desconocido'}
              </Descriptions.Item>

              <Descriptions.Item label={<><CalendarOutlined /> Fecha de registro</>}>
                {formatFecha(empresa.createdAt)}
              </Descriptions.Item> */}

              <Descriptions.Item label={<><HomeOutlined /> Dirección</>}>
                {empresa.direccion
                  ? `${empresa.direccion.calle} ${empresa.direccion.altura}, ${empresa.direccion.departamento}`
                  : 'No registrada'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Row justify="center" style={{ marginBottom: 40 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              className="bg-blue-600"
              onClick={() => navigate('/empresa/delegados/nuevo')}
            >
              Registrar Nuevo Delegado
            </Button>
          </Row>

          <Divider orientation="left">Delegados asignados</Divider>

          {loadingDelegados ? (
            <Spin tip="Cargando delegados..." />
          ) : (
            <List
            itemLayout="horizontal"
            dataSource={soloDelegados}
            bordered
            locale={{ emptyText: 'No hay delegados registrados.' }}
            renderItem={({ uuid, nombre, apellido, email, rolEmpresa, activo }) => (  // ⬅️ incluye "activo"
              <List.Item
                actions={[
                  uuid !== userData?.uuid && (
                    <Popconfirm
                      title={activo ? "¿Desactivar este delegado?" : "¿Activar este delegado?"}
                      onConfirm={() => handleActivarDesactivar(uuid, !activo)}
                      okText={activo ? "Sí, desactivar" : "Sí, activar"}
                      cancelText="Cancelar"
                    >
                      <span style={{ color: activo ? 'orange' : 'green', cursor: 'pointer' }}>
                        {activo ? 'Desactivar' : 'Activar'}
                      </span>
                    </Popconfirm>
                  ),
                ]}
              >
                <List.Item.Meta
                  avatar={<UserOutlined style={{ fontSize: 20, color: '#1677ff' }} />}
                  title={<strong>{`${nombre} ${apellido}`}</strong>}
                  description={
                    <Space direction="vertical" size={0}>
                      <span>{email}</span>
                      <span style={{ color: '#888' }}>{rolEmpresa}</span>
                      <span style={{ color: activo ? 'green' : 'red', fontWeight: 'bold' }}>
                        {activo ? 'Activo' : 'Inactivo'} {/* ⬅️ muestra estado aquí */}
                      </span>
                    </Space>
                  }
                />
              </List.Item>
            )}
            
             
            />
          )}
        </>
      ) : (
        <p className="text-gray-600">No se encontró información de la empresa.</p>
      )}
    </div>
  );
};

export default MiEmpresa;
