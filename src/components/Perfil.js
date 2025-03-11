import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { FaEdit, FaSave, FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';
import { Button, Input, Form, Typography, notification, Card, Avatar, Select } from 'antd';
import { updateUser, logout } from '../redux/actions/usuarios';
import { UserOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const departments = [
  'Capital', 'Godoy Cruz', 'Junín', 'Las Heras', 'Maipú', 'Guaymallén', 'Rivadavia',
  'San Martín', 'La Paz', 'Santa Rosa', 'General Alvear', 'Malargüe', 'San Carlos',
  'Tupungato', 'Tunuyán', 'San Rafael', 'Lavalle', 'Luján de Cuyo',
];

const UserProfile = () => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    contraseña: '',
    direccion: {
      calle: '',
      altura: '',
      barrio: '',
      departamento: '',
    },
  });

  const dispatch = useDispatch();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userData')) || {};
    console.log("🔍 Datos cargados desde localStorage:", storedUser);

    setFormData({
      id: storedUser.uuid || '',
      nombre: storedUser.nombre || '',
      apellido: storedUser.apellido || '',
      dni: storedUser.dni || 'Sin DNI',
      email: storedUser.email || '',
      contraseña: storedUser.contraseña || '',  // ✅ Ahora muestra la contraseña real
      direccion: {
        calle: storedUser.direccion?.calle || 'Sin calle',
        altura: storedUser.direccion?.altura || 'Sin altura',
        barrio: storedUser.direccion?.barrio || 'Sin barrio',
        departamento: storedUser.direccion?.departamento || '',
      },
    });
  }, []);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.direccion) {
      setFormData({
        ...formData,
        direccion: {
          ...formData.direccion,
          [name]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = () => {
    const { id: uuid, ...userData } = formData;

    if (!uuid) {
      notification.error({
        message: 'Error',
        description: 'No se pudo identificar al usuario.',
      });
      return;
    }

    // Enviar solo los campos modificados
    const updatedData = {
      email: formData.email,
      contraseña: formData.contraseña !== '********' ? formData.contraseña : undefined, // ✅ Se envía la nueva contraseña solo si fue cambiada
      direccion: formData.direccion,
    };

    dispatch(updateUser(uuid, updatedData))
      .then(() => {
        setEditing(false);
        notification.success({
          message: 'Éxito',
          description: 'Datos actualizados correctamente!',
        });
        localStorage.setItem('userData', JSON.stringify(formData));
      })
      .catch((error) => {
        console.error('Error en la actualización:', error);
        notification.error({
          message: 'Error',
          description: 'Hubo un problema al actualizar los datos.',
        });
      });
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="user-profile" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Card
        style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}
        actions={[
          <Button type="primary" icon={<FaSignOutAlt />} onClick={handleLogout}>
            Cerrar sesión
          </Button>,
          <Button type="default" icon={<FaArrowLeft />} onClick={() => window.history.back()}>
            Volver
          </Button>,
        ]}
      >
        <Avatar size={64} icon={<UserOutlined />} style={{ marginBottom: '20px' }} />
        <Title level={2}>Perfil</Title>
        <Form layout="vertical" style={{ maxWidth: '100%' }}>
          <Form.Item label="Nombre">
            <Input name="nombre" value={formData.nombre} disabled />
          </Form.Item>
          <Form.Item label="Apellido">
            <Input name="apellido" value={formData.apellido} disabled />
          </Form.Item>
          <Form.Item label="DNI">
            <Input name="dni" value={formData.dni} disabled /> {/* ✅ Ahora se asegura de que el DNI se muestre */}
          </Form.Item>
          <Form.Item label="Email">
            <Input name="email" value={formData.email} onChange={handleChange} disabled={!editing} />
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
            <Input name="calle" placeholder="Calle" value={formData.direccion.calle} onChange={handleChange} disabled={!editing} />
            <Input name="altura" placeholder="Altura" value={formData.direccion.altura} onChange={handleChange} disabled={!editing} />
            <Input name="barrio" placeholder="Barrio" value={formData.direccion.barrio} onChange={handleChange} disabled={!editing} />
          </Form.Item>
          <Form.Item label="Departamento">
            <Select
              value={formData.direccion.departamento}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  direccion: {
                    ...formData.direccion,
                    departamento: value,
                  },
                })
              }
              disabled={!editing}
              placeholder="Seleccione un departamento"
            >
              {departments.map((department) => (
                <Option key={department} value={department}>
                  {department}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {editing ? (
            <Form.Item>
              <Button type="primary" icon={<FaSave />} onClick={handleSave}>
                Guardar
              </Button>
            </Form.Item>
          ) : (
            <Form.Item>
              <Button type="default" icon={<FaEdit />} onClick={handleEdit}>
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
