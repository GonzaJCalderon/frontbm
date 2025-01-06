import React, { useState } from 'react';
import { notification, Form, Input, Button, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../redux/axiosConfig'; // Asegúrate de importar tu instancia de Axios centralizada
import logo from '../assets/logo-png-sin-fondo.png';

const UpdateAccount = () => {
  const { token } = useParams(); // Extrae el token desde la URL
  const navigate = useNavigate(); // Usamos useNavigate para redirigir

  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);

      const response = await api.post(`/usuarios/update-account/${token}`, values); // Usa tu instancia de Axios

      if (response.status === 200) {
        notification.success({
          message: 'Cuenta actualizada y aprobada',
          description: 'Los datos de tu cuenta han sido actualizados exitosamente.',
        });

        // Redirigir al dashboard
        navigate('/home'); // Redirigir al dashboard o página de inicio
      } else {
        notification.error({
          message: 'Error',
          description: 'Hubo un error al actualizar tu cuenta. Por favor, intenta nuevamente.',
        });
      }
    } catch (error) {
      console.error('Error al actualizar la cuenta:', error);
      notification.error({
        message: 'Error',
        description: error.response?.data?.mensaje || 'Ocurrió un error. Por favor verifica los datos.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-blue-500 text-black font-sans">
      <div className="max-w-6xl mx-auto p-6 flex flex-col justify-center items-center h-full">
        {/* Logo y Título */}
        <div className="text-center mb-10">
          <img src={logo} alt="Logo" className="object-contain w-full h-auto max-h-96 mx-auto" />
          <h2 className="text-4xl font-extrabold text-blue-100 mt-4">
            ¡Bienvenido/a al Sistema Provincial Preventivo de Bienes Muebles Usados!
          </h2>
          <p className="text-xl text-blue-200 mt-2">
            Aquí podrá Actualizar su Cuenta
          </p>
        </div>

        {/* Formulario de actualización */}
        <Spin spinning={loading} tip="Actualizando...">
          <Form
            name="updateAccount"
            onFinish={onFinish}
            initialValues={{ nombre: '', apellido: '', newPassword: '' }}
            layout="vertical"
            className="bg-white p-6 rounded-lg shadow-md w-full max-w-xl"
          >
            <Form.Item
              label="Nombre"
              name="nombre"
              rules={[{ required: true, message: 'Por favor ingresa tu nombre' }]}
            >
              <Input placeholder="Ingresa tu nombre" />
            </Form.Item>

            <Form.Item
              label="Apellido"
              name="apellido"
              rules={[{ required: true, message: 'Por favor ingresa tu apellido' }]}
            >
              <Input placeholder="Ingresa tu apellido" />
            </Form.Item>

            <Form.Item
              label="Nueva Contraseña"
              name="newPassword"
              rules={[{ required: true, message: 'Por favor ingresa una nueva contraseña' }]}
            >
              <Input.Password placeholder="Ingresa tu nueva contraseña" />
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
