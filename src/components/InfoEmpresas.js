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
  Menu,
  notification,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getEmpresas, registrarYAsociarDelegado } from '../redux/actions/usuarios';
import { fetchBienesPorPropietario } from '../redux/actions/bienes';
import { useNavigate } from 'react-router-dom';
import api from '../redux/axiosConfig';
import { DownOutlined, SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

const departments = [
  'Capital', 'Godoy Cruz', 'Junín', 'Las Heras', 'Maipú', 'Guaymallén', 'Rivadavia',
  'San Martín', 'La Paz', 'Santa Rosa', 'General Alvear', 'Malargüe', 'San Carlos',
  'Tupungato', 'Tunuyán', 'San Rafael', 'Lavalle', 'Luján de Cuyo',
];

const InfoEmpresas = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState(null);
  const [departamentoFiltro, setDepartamentoFiltro] = useState(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalCrearVisible, setIsModalCrearVisible] = useState(false);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [form] = Form.useForm();
  const [formCrear] = Form.useForm();
const [empresaParaDelegado, setEmpresaParaDelegado] = useState(null);
const [isModalDelegadoVisible, setIsModalDelegadoVisible] = useState(false);
const [usuarioExistente, setUsuarioExistente] = useState(null);
const [busqueda, setBusqueda] = useState({ dni: '', email: '' });
const [validandoRenaper, setValidandoRenaper] = useState(false);
const [renaperError, setRenaperError] = useState('');



  const { empresas, loading } = useSelector((state) => ({
    empresas: state.usuarios.empresas || [],
    loading: state.usuarios.loading,
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
    } catch {
      message.error('❌ Error al aprobar la empresa');
    }
  };

  const validarDNIConRenaper = async (dni, callback) => {
  setValidandoRenaper(true);
  setRenaperError('');
  try {
    const { data } = await api.get(`/renaper/${dni}`);
    if (data.resultado === 0 && data.persona && !data.persona.fallecido) {
      callback(data.persona);
    } else if (data.persona?.fallecido) {
      setRenaperError('La persona figura como fallecida.');
    } else {
      setRenaperError('Persona no encontrada en Renaper.');
    }
  } catch {
    setRenaperError('Error al validar DNI con Renaper.');
  } finally {
    setValidandoRenaper(false);
  }
};

const esDeMendoza = (provincia) => provincia.toLowerCase().includes('mendoza');

const normalizarDepartamento = (localidad) => {
  if (!localidad) return '';

  const match = departments.find(dep => 
    dep.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase() ===
    localidad.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase()
  );

  return match || '';
};



  const handleViewBienesEmpresa = (empresa) => {
    if (!empresa?.uuid) {
      notification.error({
        message: 'UUID inválido',
        description: 'La empresa no tiene un identificador válido.',
      });
      return;
    }

    dispatch(fetchBienesPorPropietario(empresa.uuid))
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          localStorage.setItem('bienesUsuarioSeleccionado', JSON.stringify(res.data));
          localStorage.setItem('nombreUsuarioSeleccionado', empresa.razonSocial);
          navigate(`/bienes-usuario/${empresa.uuid}`, {
            state: { nombreEmpresa: empresa.razonSocial, desdeInfoEmpresas: true },
          });
        } else {
          notification.info({
            message: 'Sin bienes',
            description: `La empresa ${empresa.razonSocial} no posee bienes registrados.`,
          });
        }
      })
      .catch((err) => {
        notification.error({
          message: 'Error al obtener bienes',
          description: err.message || 'Error inesperado.',
        });
      });
  };

  const buscarUsuarioExistente = async () => {
  try {
    const { dni, email } = busqueda;
    const { data } = await api.post('/usuarios/check', { dni, email });
    if (data.existe) {
      setUsuarioExistente(data.usuario);
      notification.success({ message: 'Usuario encontrado', description: data.usuario.nombre });
    } else {
      setUsuarioExistente(null);
      notification.info({ message: 'Usuario no encontrado. Podés registrarlo nuevo.' });
    }
  } catch (err) {
    notification.error({ message: 'Error al buscar usuario', description: err.message });
  }
};
const asociarDelegadoExistente = async () => {
  try {
    await dispatch(registrarYAsociarDelegado(
      { uuidExistente: usuarioExistente.uuid }, 
      empresaParaDelegado.uuid
    ));
    setIsModalDelegadoVisible(false);
    dispatch(getEmpresas());
  } catch (err) {
    message.error('Error al asociar delegado existente: ' + err.message);
  }
};


const registrarDelegadoNuevo = async (values) => {
  try {
    await dispatch(registrarYAsociarDelegado(
      { ...values, tipo: 'fisica' },
      empresaParaDelegado.uuid
    ));
    setIsModalDelegadoVisible(false);
    formCrear.resetFields();
    dispatch(getEmpresas());
  } catch (err) {
    message.error('❌ Error al registrar delegado nuevo: ' + err.message);
  }
};


  const handleEliminar = async (uuid) => {
    try {
      await api.delete(`/empresas/${uuid}`);
      message.success('🗑 Empresa eliminada correctamente');
      dispatch(getEmpresas());
    } catch {
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
      departamento: empresa.direccion?.departamento || '',
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
        },
      });
      message.success('✅ Empresa actualizada correctamente');
      setIsModalVisible(false);
      dispatch(getEmpresas());
    } catch {
      message.error('❌ Error al actualizar empresa');
    }
  };

  const renderEstadoTag = (estado) => {
    const color = estado === 'aprobado' ? 'green' : estado === 'pendiente' ? 'orange' : 'red';
    return <Tag color={color} style={{ fontWeight: 'bold' }}>{estado.toUpperCase()}</Tag>;
  };

  const empresasFiltradas = useMemo(() => {
    return empresas.filter((emp) => {
      const responsable = emp.delegados?.find(d => d.rolEmpresa === 'responsable') || {};
      const coincideBusqueda = (str) => str?.toLowerCase().includes(searchTerm.toLowerCase());

      return (
        (coincideBusqueda(emp.razonSocial) ||
          coincideBusqueda(emp.email) ||
          coincideBusqueda(emp.cuit) ||
          coincideBusqueda(emp.direccion?.departamento) ||
          coincideBusqueda(responsable?.nombre) ||
          coincideBusqueda(responsable?.apellido) ||
          coincideBusqueda(responsable?.dni) ||
          coincideBusqueda(responsable?.email)) &&
        (!estadoFiltro || emp.estado === estadoFiltro) &&
        (!departamentoFiltro || emp.direccion?.departamento === departamentoFiltro)
      );
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
        const responsable = empresa.delegados?.find((d) => d.rolEmpresa === 'responsable');
        if (!responsable) return 'No asignado';

        return (
          <Space direction="vertical" size={0}>
            <span>{responsable.nombre} {responsable.apellido}</span>
            <Tag color={responsable.activo !== false ? 'green' : 'red'}>
              {responsable.activo !== false ? 'Activo' : 'Inactivo'}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: 'Dirección',
      dataIndex: 'direccion',
      key: 'direccion',
      render: (d) => d ? `${d.calle || ''} ${d.altura || ''}, Dpto. ${d.departamento || ''}` : 'No disponible',
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: renderEstadoTag,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, empresa) => {
        const menu = (
          <Menu>
            <Menu.Item onClick={() => navigate(`/empresa/${empresa.uuid}/delegados`)}>Ver Delegados</Menu.Item>
            <Menu.Item onClick={() => handleEditar(empresa)}>Editar</Menu.Item>
           <Menu.Item onClick={() => {
  setEmpresaParaDelegado(empresa);
  setIsModalDelegadoVisible(true);
}}>➕ Agregar Delegado</Menu.Item>

            {empresa.estado === 'pendiente' && (
              <Menu.Item onClick={() => handleAprobar(empresa.uuid)}>Aprobar Empresa</Menu.Item>
            )}
            <Menu.Item onClick={() => navigate(`/admin/operaciones/${empresa.uuid}`)}>Ver Operaciones</Menu.Item>
            <Menu.Item onClick={() => handleViewBienesEmpresa(empresa)}>Ver Bienes</Menu.Item>
            <Menu.Item>
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
            <Button>Acciones <DownOutlined /></Button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Empresas Registradas</h2>
        <Button type="primary" onClick={() => setIsModalCrearVisible(true)}>➕ Nueva Empresa</Button>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <Input
          placeholder="🔍 Buscar por razón social, email, DNI..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
          {departments.map((dep) => (
            <Option key={dep} value={dep}>{dep}</Option>
          ))}
        </Select>
      </div>

      {loading ? (
        <Spin size="large" className="block mx-auto mt-10" />
      ) : (
        <Table
          dataSource={empresasFiltradas}
          columns={columns}
          rowKey="uuid"
          pagination={{ pageSize: 10 }}
        />
      )}

      {/* Modal Editar Empresa */}
      <Modal
        title="Editar Empresa"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="Guardar Cambios"
      >
        <Form form={form} layout="vertical" onFinish={handleEditarSubmit}>
          <Form.Item name="razonSocial" label="Razón Social" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="cuit" label="CUIT" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="email" label="Correo Electrónico" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
          <Form.Item name="calle" label="Calle"><Input /></Form.Item>
          <Form.Item name="altura" label="Numeración"><Input /></Form.Item>
          <Form.Item name="departamento" label="Departamento">
            <Select>
              {departments.map(dep => <Option key={dep} value={dep}>{dep}</Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Crear Empresa */}
      <Modal
        title="Registrar Nueva Empresa"
        open={isModalCrearVisible}
        onCancel={() => setIsModalCrearVisible(false)}
        onOk={() => formCrear.submit()}
        okText="Crear"
      >
        <Form form={formCrear} layout="vertical" onFinish={async (values) => {
          try {
            await api.post('/empresas', {
              razonSocial: values.razonSocial,
              cuit: values.cuit,
              email: values.email,
              direccion: {
                calle: values.calle,
                altura: values.altura,
                departamento: values.departamento,
              },
            });
            message.success('🚀 Empresa creada exitosamente');
            setIsModalCrearVisible(false);
            dispatch(getEmpresas());
            formCrear.resetFields();
          } catch {
            message.error('❌ No se pudo crear la empresa');
          }
        }}>
          <Form.Item name="razonSocial" label="Razón Social" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="cuit" label="CUIT" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="email" label="Correo Electrónico" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
          <Form.Item name="calle" label="Calle"><Input /></Form.Item>
          <Form.Item name="altura" label="Numeración"><Input /></Form.Item>
          <Form.Item name="departamento" label="Departamento">
            <Select>
              {departments.map(dep => <Option key={dep} value={dep}>{dep}</Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
<Modal
  title={`Agregar Delegado a "${empresaParaDelegado?.razonSocial}"`}
  open={isModalDelegadoVisible}
  onCancel={() => {
    setIsModalDelegadoVisible(false);
    setUsuarioExistente(null);
    setBusqueda({ dni: '', email: '' });
  }}
  footer={null}
>
  <Form layout="vertical" onFinish={buscarUsuarioExistente}>
    <Form.Item label="Buscar por DNI o Email">
      <Input.Group compact>
        <Input
          style={{ width: '40%' }}
          placeholder="DNI"
          value={busqueda.dni}
          onChange={(e) => setBusqueda({ ...busqueda, dni: e.target.value })}
        />
        <Input
          style={{ width: '50%' }}
          placeholder="Email"
          value={busqueda.email}
          onChange={(e) => setBusqueda({ ...busqueda, email: e.target.value })}
        />
        <Button type="primary" htmlType="submit">Buscar</Button>
      </Input.Group>
    </Form.Item>
  </Form>

  {usuarioExistente ? (
    <div style={{ marginTop: 20 }}>
      <p><strong>Usuario encontrado:</strong> {usuarioExistente.nombre} {usuarioExistente.apellido}</p>
      <Button type="primary" onClick={asociarDelegadoExistente}>
        Asociar como Delegado
      </Button>
    </div>
  ) : (
    <div style={{ marginTop: 30 }}>
      <p>❗ No se encontró ningún usuario con los datos ingresados.</p>
      <p>Completá el siguiente formulario para crear uno nuevo, Ingrese el DNI y espere mientras RENAPER verifica la información.:</p>
   <Form
  layout="vertical"
  form={formCrear}
  onFinish={registrarDelegadoNuevo}
>
  <Form.Item name="dni" label="DNI" rules={[{ required: true }]}>
    <Input
      onBlur={(e) => {
        const dni = e.target.value;
        if (dni) {
          validarDNIConRenaper(dni, (persona) => {
            formCrear.setFieldsValue({
              nombre: persona.nombres,
              apellido: persona.apellidos,
              email: '',
              cuit: persona.nroCuil,
              direccion: {
                calle: persona.domicilio.calle || '',
                altura: persona.domicilio.nroCalle || '',
                departamento: esDeMendoza(persona.domicilio.provincia)
                  ? normalizarDepartamento(persona.domicilio.localidad)
                  : '',
              },
            });
          });
        }
      }}
      placeholder="Ingrese DNI"
    />
  </Form.Item>

  {validandoRenaper && <Spin size="small" />}
  {renaperError && <Tag color="red">{renaperError}</Tag>}

  <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
    <Input />
  </Form.Item>

  <Form.Item name="apellido" label="Apellido" rules={[{ required: true }]}>
    <Input />
  </Form.Item>

  <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
    <Input />
  </Form.Item>

  <Form.Item name="cuit" label="CUIT">
    <Input />
  </Form.Item>

  <Form.Item label="Dirección">
    <Input.Group compact>
      <Form.Item name={['direccion', 'calle']} noStyle>
        <Input style={{ width: '35%' }} placeholder="Calle" />
      </Form.Item>
      <Form.Item name={['direccion', 'altura']} noStyle>
        <Input style={{ width: '20%' }} placeholder="Altura" />
      </Form.Item>
      <Form.Item name={['direccion', 'departamento']} noStyle>
        <Input style={{ width: '45%' }} placeholder="Departamento" />
      </Form.Item>
    </Input.Group>
  </Form.Item>

  <Button type="primary" htmlType="submit">Crear y Asociar Delegado</Button>
</Form>

    </div>
  )}
</Modal>

    </div>
  );
};



export default InfoEmpresas;
