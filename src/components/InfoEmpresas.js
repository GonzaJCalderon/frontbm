import React, { useEffect, useState, useMemo } from 'react';
import {
  Table,
  Spin,
  Button,
  Popconfirm,
  message,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Dropdown,
  Menu
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getEmpresas } from '../redux/actions/usuarios';
import { useNavigate } from 'react-router-dom';
import api from '../redux/axiosConfig';
import { DownOutlined, SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

const InfoEmpresas = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState(null);
  const [departamentoFiltro, setDepartamentoFiltro] = useState(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [form] = Form.useForm();

  const { empresas, loading, error } = useSelector((state) => ({
    empresas: state.usuarios.empresas || [],
    loading: state.usuarios.loading,
    error: state.usuarios.error,
  }));

  useEffect(() => {
    dispatch(getEmpresas());
  }, [dispatch]);

  const handleAprobar = async (uuid) => {
    try {
      await api.patch(`/empresas/estado/${uuid}`, {
        estado: 'aprobado',
        aprobadoPor: JSON.parse(localStorage.getItem('userData'))?.uuid,
      });
      message.success('✅ Empresa aprobada correctamente');
      dispatch(getEmpresas());
    } catch (err) {
      message.error('❌ Error al aprobar la empresa');
    }
  };

  const handleEliminar = async (uuid) => {
    try {
      await api.delete(`/empresas/${uuid}`);
      message.success('🗑 Empresa eliminada correctamente');
      dispatch(getEmpresas());
    } catch (err) {
      message.error('❌ Error al eliminar la empresa');
    }
  };

  const handleEditar = (empresa) => {
    setEmpresaSeleccionada(empresa);
    form.setFieldsValue({
      razonSocial: empresa.razonSocial,
      cuit: empresa.cuit,
      email: empresa.email,
      calle: empresa.direccion?.calle || '',
      altura: empresa.direccion?.altura || '',
      departamento: empresa.direccion?.departamento || ''
    });
    setIsModalVisible(true);
  };

  const handleEditarSubmit = async (values) => {
    try {
      await api.put(`/empresas/${empresaSeleccionada.uuid}`, {
        razonSocial: values.razonSocial,
        cuit: values.cuit,
        email: values.email,
        direccion: {
          calle: values.calle,
          altura: values.altura,
          departamento: values.departamento,
        }
      });
      message.success('✅ Empresa actualizada correctamente');
      setIsModalVisible(false);
      dispatch(getEmpresas());
    } catch (err) {
      message.error('❌ Error al actualizar empresa');
    }
  };

  const renderEstadoTag = (estado) => {
    const color = estado === 'aprobado' ? 'green' : estado === 'pendiente' ? 'orange' : 'red';
    return <Tag color={color} style={{ fontWeight: 'bold' }}>{estado.toUpperCase()}</Tag>;
  };

  const departamentos = useMemo(() => {
    const all = empresas.map(e => e.direccion?.departamento).filter(Boolean);
    return Array.from(new Set(all));
  }, [empresas]);

  // 🔍 FILTRADO COMPLETO
  const empresasFiltradas = useMemo(() => {
    return empresas.filter(emp => {
      const responsable = emp.delegados?.find(d => d.rolEmpresa === 'responsable') || {};

      const coincideBusqueda = (str) =>
        str?.toLowerCase().includes(searchTerm.toLowerCase());

      const coincide =
        coincideBusqueda(emp.razonSocial) ||
        coincideBusqueda(emp.email) ||
        coincideBusqueda(emp.cuit) ||
        coincideBusqueda(emp.direccion?.departamento) ||
        coincideBusqueda(responsable?.nombre) ||
        coincideBusqueda(responsable?.apellido) ||
        coincideBusqueda(responsable?.dni) ||
        coincideBusqueda(responsable?.email);

      const coincideEstado = estadoFiltro ? emp.estado === estadoFiltro : true;
      const coincideDepto = departamentoFiltro
        ? emp.direccion?.departamento === departamentoFiltro
        : true;

      return coincide && coincideEstado && coincideDepto;
    });
  }, [empresas, searchTerm, estadoFiltro, departamentoFiltro]);

  const columns = [
    { title: 'Razón Social', dataIndex: 'razonSocial', key: 'razonSocial' },
    { title: 'CUIT', dataIndex: 'cuit', key: 'cuit' },
    { title: 'Correo Electrónico', dataIndex: 'email', key: 'email' },
{
  title: 'Responsable',
  key: 'responsable',
  render: (_, empresa) => {
    const responsable = empresa.delegados?.find(d => d.rolEmpresa === 'responsable');

    if (!responsable) return 'No asignado';

    const estaActivo = responsable.activo !== false; // 👈 Por defecto es true si es undefined

    return (
      <Space direction="vertical" size={0}>
        <span>{responsable.nombre} {responsable.apellido}</span>
        <Tag color={estaActivo ? 'green' : 'red'}>
          {estaActivo ? 'Activo' : 'Inactivo'}
        </Tag>
      </Space>
    );
  }
},


    {
      title: 'Dirección',
      dataIndex: 'direccion',
      key: 'direccion',
      render: (direccion) =>
        direccion
          ? `${direccion?.calle || ''} ${direccion?.altura || ''}, Dpto. ${direccion?.departamento || ''}`
          : 'No disponible',
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: renderEstadoTag
    },
    {
      title: 'Fecha de Registro',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => new Date(createdAt).toLocaleDateString(),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, empresa) => {
        const menu = (
          <Menu>
            <Menu.Item key="delegados" onClick={() => navigate(`/empresa/${empresa.uuid}/delegados`)}>
              Ver Delegados
            </Menu.Item>
            <Menu.Item key="editar" onClick={() => handleEditar(empresa)}>
              Editar
            </Menu.Item>
            {empresa.estado === 'pendiente' && (
              <Menu.Item key="aprobar" onClick={() => handleAprobar(empresa.uuid)}>
                Aprobar Empresa
              </Menu.Item>
            )}
            <Menu.Item key="eliminar">
              <Popconfirm
                title="¿Eliminar esta empresa?"
                onConfirm={() => handleEliminar(empresa.uuid)}
                okText="Eliminar"
                cancelText="Cancelar"
              >
                <span style={{ color: 'red' }}>Eliminar</span>
              </Popconfirm>
            </Menu.Item>
          </Menu>
        );

        return (
          <Dropdown overlay={menu}>
            <Button>
              Acciones <DownOutlined />
            </Button>
          </Dropdown>
        );
      }
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Empresas Registradas</h2>

      <div className="flex flex-wrap gap-4 mb-4">
        <Input
          placeholder="🔍 Buscar por razón social, email, DNI, nombre/apellido..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: 300 }}
        />
        <Select
          placeholder="Filtrar por estado"
          value={estadoFiltro}
          onChange={setEstadoFiltro}
          allowClear
          style={{ width: 200 }}
        >
          <Option value="pendiente">Pendiente</Option>
          <Option value="aprobado">Aprobado</Option>
          <Option value="rechazado">Rechazado</Option>
        </Select>

        <Select
          placeholder="Filtrar por departamento"
          value={departamentoFiltro}
          onChange={setDepartamentoFiltro}
          allowClear
          style={{ width: 200 }}
        >
          {departamentos.map(dep => (
            <Option key={dep} value={dep}>{dep}</Option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="text-center mt-8">
          <Spin size="large" />
          <p className="mt-2">Cargando empresas...</p>
        </div>
      ) : (
        <Table
          dataSource={empresasFiltradas}
          columns={columns}
          rowKey="uuid"
          pagination={{ pageSize: 10 }}
        />
      )}

      {/* Modal de edición */}
      <Modal
        title="Editar Empresa"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="Guardar Cambios"
      >
        <Form form={form} layout="vertical" onFinish={handleEditarSubmit}>
          <Form.Item label="Razón Social" name="razonSocial" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="CUIT" name="cuit" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Correo Electrónico" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Calle" name="calle">
            <Input />
          </Form.Item>
          <Form.Item label="Altura" name="altura">
            <Input />
          </Form.Item>
          <Form.Item label="Departamento" name="departamento">
            <Select>
              {departamentos.map(dep => (
                <Option key={dep} value={dep}>{dep}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InfoEmpresas;
