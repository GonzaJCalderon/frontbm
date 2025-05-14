import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Modal,
  Input,
  Form,
  notification,
  Tooltip,
  Space,
  Spin,
  Divider,
  Popconfirm,
  Empty,
} from 'antd';
import { UserAddOutlined, IdcardOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { registerUsuarioPorTercero, deleteUsuario, fetchRenaperData } from '../redux/actions/usuarios';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EmpresasRegistradas = ({ empresas, refreshEmpresas }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const isResponsable = userData?.tipo === 'juridica' && !userData?.empresaUuid;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [loadingRenaper, setLoadingRenaper] = useState(false);
  const [delegados, setDelegados] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);

  const isFetchingDni = useRef(false);

  const fetchDelegados = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/usuarios/delegados`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDelegados(data?.delegados || []);
    } catch (error) {
      console.error('Error al obtener delegados:', error);
    }
  };

  const validateDNIWithRenaper = async (dni) => {
    if (isFetchingDni.current) return;

    if (!dni || dni.length < 7) {
      notification.warning({ message: 'Ingrese un DNI válido' });
      return;
    }

    try {
      isFetchingDni.current = true;
      setLoadingRenaper(true);

      const persona = await dispatch(fetchRenaperData(dni));

      if (persona) {
        form.setFieldsValue({
          nombre: persona.nombres || '',
          apellido: persona.apellidos || '',
          email: persona.email || '',
          cuit: persona.nroCuil || '',
          direccion: {
            calle: persona.domicilio?.calle || '',
            altura: persona.domicilio?.nroCalle || '',
            barrio: persona.domicilio?.barrio || '',
            departamento: persona.domicilio?.localidad || '',
            provincia: persona.domicilio?.provincia || '',
          },
        });

        notification.success({ message: 'Datos completados desde RENAPER ✅' });
      }
    } catch (error) {
      notification.error({
        message: 'Error al validar DNI',
        description: error.message || '❌ Consulta fallida al RENAPER',
      });
    } finally {
      isFetchingDni.current = false;
      setLoadingRenaper(false);
    }
  };

  const handleRegistrarDelegado = async (values) => {
    try {
      const payload = {
        ...values,
        tipo: 'fisica',
        direccion: values.direccion,
        empresaUuid: empresaSeleccionada?.uuid,
      };

      await dispatch(registerUsuarioPorTercero(payload));

      notification.success({
        message: 'Delegado registrado',
        description: `Se envió un email a ${values.email} para que continúe el registro.`,
      });

      form.resetFields();
      setIsModalOpen(false);
      fetchDelegados();
      if (typeof refreshEmpresas === 'function') refreshEmpresas();
    } catch (error) {
      notification.error({
        message: 'No se pudo registrar el delegado',
        description: error.message,
      });
    }
  };

  const eliminarDelegado = async (uuid) => {
    try {
      await dispatch(deleteUsuario(uuid));
      notification.success({ message: 'Delegado eliminado correctamente.' });
      fetchDelegados();
    } catch (error) {
      notification.error({ message: 'Error al eliminar delegado', description: error.message });
    }
  };

  const openModal = (empresa) => {
    setEmpresaSeleccionada(empresa);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (isResponsable) {
      fetchDelegados();
    }
  }, []);

  // 🛡️ Protección: Si empresas es undefined o no array, evitamos .map crash
  if (!Array.isArray(empresas)) {
    console.warn('⚠️ Prop "empresas" no es un array válido:', empresas);
    return (
      <div className="text-center py-20">
        <Spin size="large" tip="Cargando empresas..." />
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {empresas.length > 0 ? (
        empresas.map((empresa) => (
          <div
            key={empresa.uuid}
            className="bg-white p-6 rounded shadow border border-gray-200"
          >
            <h3 className="text-xl font-bold text-blue-800 mb-2">
              {empresa.razonSocial || 'Empresa sin nombre'}
            </h3>
            <p><strong>Email:</strong> {empresa.email}</p>
            <p><strong>CUIT:</strong> {empresa.cuit}</p>
            <p>
              <strong>Estado:</strong>{' '}
              <span className={`font-semibold ${
                empresa.estado === 'aprobado'
                  ? 'text-green-600'
                  : empresa.estado === 'rechazado'
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }`}>
                {empresa.estado}
              </span>
            </p>
            <p><strong>Registrada:</strong> {new Date(empresa.createdAt).toLocaleDateString()}</p>

            <Space className="mt-4 flex-wrap" wrap>
              <Button
                onClick={() => navigate(`/empresa/${empresa.uuid}/bienes`)}
                type="primary"
                className="bg-blue-600"
              >
                Ver Bienes
              </Button>

              {isResponsable && (
                <Tooltip title="Agregar un nuevo delegado que operará en nombre de esta empresa">
                  <Button
                    icon={<UserAddOutlined />}
                    onClick={() => openModal(empresa)}
                    className="bg-indigo-600 text-white"
                  >
                    Agregar Delegado
                  </Button>
                </Tooltip>
              )}
            </Space>

            {delegados.length > 0 && (
              <>
                <Divider className="mt-4">Delegados Activos</Divider>
                <ul className="list-disc list-inside text-sm">
                  {delegados.map((d) => (
                    <li key={d.uuid} className="flex items-center justify-between">
                      <span>
                        {d.nombre} {d.apellido} - {d.email} ({d.estado})
                      </span>
                      {isResponsable && (
                        <Popconfirm
                          title="¿Estás seguro que deseas eliminar este delegado?"
                          onConfirm={() => eliminarDelegado(d.uuid)}
                          okText="Sí"
                          cancelText="Cancelar"
                        >
                          <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-12">
          <Empty description="No hay empresas registradas aún." />
        </div>
      )}

      {/* Modal para registrar delegado */}
      <Modal
        title="Registrar Delegado"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          layout="vertical"
          onFinish={handleRegistrarDelegado}
          form={form}
        >
          <Form.Item
            name="dni"
            label="DNI"
            rules={[{ required: true, message: 'DNI obligatorio' }]}
          >
            <Input
              onBlur={(e) => validateDNIWithRenaper(e.target.value)}
              prefix={<IdcardOutlined />}
              placeholder="Ingrese DNI y presione fuera del campo"
            />
          </Form.Item>

          {loadingRenaper && (
            <div className="mb-4 text-center">
              <Spin /> Consultando RENAPER...
            </div>
          )}

          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="apellido" label="Apellido" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Correo Electrónico" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>

          <Form.Item name={['direccion', 'calle']} label="Calle" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name={['direccion', 'altura']} label="Altura" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name={['direccion', 'barrio']} label="Barrio">
            <Input />
          </Form.Item>

          <Form.Item name={['direccion', 'departamento']} label="Localidad">
            <Input />
          </Form.Item>

          <Form.Item name={['direccion', 'provincia']} label="Provincia">
            <Input />
          </Form.Item>

          <Button
            htmlType="submit"
            type="primary"
            block
            className="bg-blue-600 mt-2"
          >
            Registrar Delegado
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default EmpresasRegistradas;
