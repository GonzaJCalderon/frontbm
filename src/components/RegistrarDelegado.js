// src/components/RegistrarDelegado.js
import React, { useRef, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  notification,
  Alert,
  Spin,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchRenaperData, registerDelegado } from '../redux/actions/usuarios';
import { LogoutOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const RegistrarDelegado = () => {
  const [loading, setLoading] = useState(false);
  const [renaperLoading, setRenaperLoading] = useState(false);
  const isFetchingDni = useRef(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleDniBlur = async () => {
    const dni = form.getFieldValue('dni');
    if (!dni || isFetchingDni.current) return;

    try {
      isFetchingDni.current = true;
      setRenaperLoading(true);

      const persona = await dispatch(fetchRenaperData(dni));

      if (persona.fallecido === true) {
        notification.error({
          message: 'RENAPER',
          description: 'La persona consultada figura como fallecida. No puede ser registrada.',
        });
        return;
      }

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
        },
      });

      notification.success({
        message: 'RENAPER',
        description: 'Datos autocompletados correctamente.',
      });
    } catch (error) {
      notification.error({
        message: 'RENAPER',
        description: error.message || 'Error al validar el DNI.',
      });
    } finally {
      setRenaperLoading(false);
      isFetchingDni.current = false;
    }
  };

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        tipo: 'fisica', // 🔒 obligatorio
      };

      await dispatch(registerDelegado(payload));

      notification.success({
        message: 'Delegado registrado',
        description:
          'El delegado fue creado exitosamente. Se ha enviado un correo para que active su cuenta.',
      });

      navigate('/empresa/mia');
    } catch (error) {
      notification.error({
        message: 'Error al registrar delegado',
        description: error.message || 'Ocurrió un problema. Intentalo más tarde.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/empresa/delegados')}>
          Volver
        </Button>
        <Button icon={<LogoutOutlined />} onClick={handleLogout} danger>
          Cerrar sesión
        </Button>
      </div>

      {renaperLoading && (
        <Alert
          message="Consultando RENAPER"
          description={
            <span>
              Estamos verificando los datos del DNI ingresado...
              <Spin size="small" style={{ marginLeft: 8 }} />
            </span>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Card title="Registrar nuevo delegado" bordered>
        <Form layout="vertical" form={form} onFinish={handleFinish}>
          <Form.Item
            label="DNI"
            name="dni"
            rules={[{ required: true, message: 'El DNI es obligatorio' }]}
          >
            <Input onBlur={handleDniBlur} />
          </Form.Item>

          <Form.Item
            label="Nombre"
            name="nombre"
            rules={[{ required: true, message: 'El nombre es obligatorio' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Apellido"
            name="apellido"
            rules={[{ required: true, message: 'El apellido es obligatorio' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: 'email', message: 'Email inválido' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="CUIT" name="cuit">
            <Input />
          </Form.Item>

          <Form.Item label="Dirección">
            <Input.Group compact>
              <Form.Item name={['direccion', 'calle']} noStyle>
                <Input style={{ width: '25%' }} placeholder="Calle" />
              </Form.Item>
              <Form.Item name={['direccion', 'altura']} noStyle>
                <Input style={{ width: '15%' }} placeholder="Altura" />
              </Form.Item>
              <Form.Item name={['direccion', 'barrio']} noStyle>
                <Input style={{ width: '30%' }} placeholder="Barrio" />
              </Form.Item>
              <Form.Item name={['direccion', 'departamento']} noStyle>
                <Input style={{ width: '30%' }} placeholder="Localidad" />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Registrar delegado
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RegistrarDelegado;
