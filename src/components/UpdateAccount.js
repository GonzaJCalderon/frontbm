import React, { useState } from 'react';
import { notification, Form, Input, Button, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../redux/axiosConfig';
import logo from '../assets/logo-png-sin-fondo.png';

const UpdateAccount = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const passwordRules = [
    {
      required: true,
      message: 'Por favor ingresa una nueva contraseña',
    },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      message:
        'La contraseña debe incluir mayúscula, minúscula, número y símbolo.',
    },
    {
      min: 8,
      message: 'La contraseña debe tener al menos 8 caracteres.',
    },
  ];

  const onFinish = async (values) => {
    const { nombre, apellido, newPassword, confirmPassword } = values;

    if (newPassword !== confirmPassword) {
      return notification.error({
        message: 'Las contraseñas no coinciden',
        description: 'Asegúrate de que ambas contraseñas sean iguales.',
      });
    }

    try {
      setLoading(true);

      const response = await api.post(`/usuarios/update-account/${token}`, {
        nombre,
        apellido,
        newPassword,
      });

      if (response.status === 200) {
        notification.success({
          message: 'Cuenta actualizada',
          description: 'Tu cuenta fue actualizada exitosamente.',
        });

        setTimeout(() => navigate('/home'), 2500);
      } else {
        notification.error({
          message: 'Error',
          description: 'No se pudo actualizar la cuenta.',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error.response?.data?.mensaje || 'Ocurrió un error inesperado.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-blue-500 text-black font-sans">
      <div className="max-w-6xl mx-auto p-6 flex flex-col justify-center items-center h-full">
        <div className="text-center mb-10">
          <img src={logo} alt="Logo" className="object-contain w-full h-auto max-h-96 mx-auto" />
          <h2 className="text-4xl font-extrabold text-blue-100 mt-4">
            ¡Bienvenido/a al Sistema Provincial de Bienes Muebles Usados!
          </h2>
          <p className="text-xl text-blue-200 mt-2">Actualiza tu cuenta para continuar</p>
        </div>

        <Spin spinning={loading} tip="Actualizando...">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="bg-white p-6 rounded-lg shadow-md w-full max-w-xl"
          >
            <Form.Item
              label="Nombre"
              name="nombre"
              rules={[{ required: true, message: 'Por favor ingresa tu nombre' }]}
            >
              <Input placeholder="Ej: Juan" />
            </Form.Item>

            <Form.Item
              label="Apellido"
              name="apellido"
              rules={[{ required: true, message: 'Por favor ingresa tu apellido' }]}
            >
              <Input placeholder="Ej: Pérez" />
            </Form.Item>

            <Form.Item
              label="Nueva Contraseña"
              name="newPassword"
              rules={passwordRules}
              hasFeedback
            >
              <Input.Password placeholder="Nueva contraseña segura" />
            </Form.Item>

            <Form.Item
              label="Confirmar Contraseña"
              name="confirmPassword"
              dependencies={['newPassword']}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: 'Por favor confirma tu contraseña',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject('Las contraseñas no coinciden.');
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Reingresa tu contraseña" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {loading ? 'Actualizando...' : 'Actualizar Cuenta'}
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </div>
    </div>
  );
};

export default UpdateAccount;
