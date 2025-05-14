// src/pages/ActivarCuenta.jsx
import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Result, Spin } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo-png-sin-fondo.png';
import api from '../redux/axiosConfig';

const ActivarCuenta = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [estado, setEstado] = useState('verificando'); // 'verificando' | 'form' | 'error' | 'exito'
  const [form] = Form.useForm();
  const [token, setToken] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenURL = queryParams.get('token');

    if (!tokenURL) {
      setEstado('error');
      return;
    }

    setToken(tokenURL);
    setEstado('form');
  }, [location.search]);

  const onFinish = async (values) => {
    try {
        console.log('📦 Enviando token:', token);
      const res = await api.post('/auth/activar-cuenta', {
        token,
        password: values.password,
      });

      message.success('✅ Cuenta activada correctamente');
      setEstado('exito');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      message.error('❌ Error al activar cuenta');
    }
  };

  if (estado === 'verificando') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-900 to-blue-500 text-white">
        <Spin tip="Verificando token..." />
      </div>
    );
  }

  if (estado === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-900 to-blue-500 flex items-center justify-center">
        <Result
          status="error"
          title="Token inválido o expirado"
          subTitle="Por favor revisá el enlace o pedí que te reenvíen la invitación."
        />
      </div>
    );
  }

  if (estado === 'exito') {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-900 to-blue-500 flex items-center justify-center">
        <Result
          status="success"
          title="Cuenta activada con éxito"
          subTitle="Redirigiendo al login..."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-blue-500 text-black font-sans">
      <div className="max-w-4xl mx-auto p-6 flex flex-col justify-center items-center h-full">
        <div className="grid md:grid-cols-2 gap-8 w-full">
          {/* Imagen e info institucional */}
          <div className="text-center md:text-left md:order-last">
            <img
              src={logo}
              alt="Registro de Bienes"
              className="object-contain w-full h-auto max-h-96"
            />
            <h1 className="text-4xl font-bold text-blue-100 mt-4 inline-block">
              Sistema Provincial Preventivo de Bienes Muebles Usados
            </h1>
          </div>

          {/* Formulario */}
          <div className="flex flex-col items-center justify-center md:items-start">
            <div className="bg-gray-100 p-6 rounded-lg shadow-md w-full">
              <h2 className="text-3xl font-bold text-blue-900 mb-4">
                Activar cuenta
              </h2>
              <p className="mb-4 text-gray-700">
                Ingresá una contraseña segura para habilitar tu cuenta.
              </p>

              <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                  label="Contraseña"
                  name="password"
                  rules={[
                    { required: true, min: 6, message: 'Mínimo 6 caracteres' },
                  ]}
                >
                  <Input.Password />
                </Form.Item>

                <Form.Item
                  label="Confirmar contraseña"
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Repetí la contraseña' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error('Las contraseñas no coinciden')
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300"
                >
                  Activar cuenta
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivarCuenta;
