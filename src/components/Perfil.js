import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { FaEdit, FaSave, FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';
import { Button, Input, Form, Typography, notification, Card, Space, Avatar } from 'antd';
import { updateUser, logout } from '../redux/actions/usuarios';
import { UserOutlined } from '@ant-design/icons';

const { Title } = Typography;

const UserProfile = () => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    contraseña: '',
    direccion: '',
  });

  const dispatch = useDispatch();

  useEffect(() => {
    // Recuperar datos del usuario desde localStorage
    const storedUser = JSON.parse(localStorage.getItem('userData')) || {};

    setFormData({
      nombre: storedUser.nombre || '',
      apellido: storedUser.apellido || '',
      dni: storedUser.dni || '',
      email: storedUser.email || '',
      contraseña: '', // Por seguridad, no almacenamos contraseñas en localStorage
      direccion: storedUser.direccion || '',
    });
  }, []);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (formData.nombre.trim() === '' || formData.apellido.trim() === '') {
      notification.error({
        message: 'Error',
        description: 'Por favor, complete todos los campos.',
      });
      return;
    }

    // Aquí deberías actualizar el estado global si es necesario
    dispatch(updateUser(formData))
      .then(() => {
        setEditing(false);
        notification.success({
          message: 'Éxito',
          description: 'Datos actualizados exitosamente!',
        });
        // Actualizar localStorage con los nuevos datos
        localStorage.setItem('userData', JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          dni: formData.dni,
          email: formData.email,
          direccion: formData.direccion,
        }));
      })
      .catch((error) => {
        console.error('Error al actualizar datos:', error);
        notification.error({
          message: 'Error',
          description: 'Hubo un error al actualizar tus datos.',
        });
      });
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear(); // Limpia todos los datos de localStorage al cerrar sesión
    window.location.href = '/'; // Redirige a la página inicial
  };

  return (
    <div className="user-profile" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Card
        style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}
        actions={[
          <Button
            type="primary"
            icon={<FaSignOutAlt />}
            onClick={handleLogout}
          >
            Cerrar sesión
          </Button>,
          <Button
            type="default"
            icon={<FaArrowLeft />}
            onClick={() => window.history.back()}
          >
            Volver
          </Button>,
        ]}
      >
        <Avatar size={64} icon={<UserOutlined />} style={{ marginBottom: '20px' }} />
        <Title level={2}>Perfil</Title>
        <Form layout="vertical" style={{ maxWidth: '100%' }}>
          <Form.Item label="Nombre">
            <Input
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              disabled={!editing}
            />
          </Form.Item>
          <Form.Item label="Apellido">
            <Input
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              disabled={!editing}
            />
          </Form.Item>
          <Form.Item label="DNI">
            <Input
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              disabled={!editing}
            />
          </Form.Item>
          <Form.Item label="Email">
            <Input
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!editing}
            />
          </Form.Item>
          <Form.Item label="Contraseña">
            <Input.Password
              name="contraseña"
              value={formData.contraseña}
              onChange={handleChange}
              disabled={!editing}
            />
          </Form.Item>
          <Form.Item label="Dirección">
            <Input
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              disabled={!editing}
            />
          </Form.Item>
          {editing ? (
            <Form.Item>
              <Button
                type="primary"
                icon={<FaSave />}
                onClick={handleSave}
              >
                Guardar
              </Button>
            </Form.Item>
          ) : (
            <Form.Item>
              <Button
                type="default"
                icon={<FaEdit />}
                onClick={handleEdit}
              >
                Editar
              </Button>
            </Form.Item>
          )}
        </Form>
      </Card>
    </div>
  );
};

export default UserProfile;
