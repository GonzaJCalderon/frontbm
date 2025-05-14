import React, { useState, useEffect } from 'react';
import {
  FaEdit,
  FaSave,
  FaSignOutAlt,
  FaArrowLeft,
  FaKey,
} from 'react-icons/fa';
import {
  Button,
  Input,
  Form,
  Typography,
  notification,
  Card,
  Avatar,
  Select,
  Row,
  Col,
} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { updateUser, logout } from '../redux/actions/usuarios'; // sólo para update & logout
import { useDispatch } from 'react-redux';

const { Title } = Typography;
const { Option } = Select;

const departments = [
  'Capital', 'Godoy Cruz', 'Junín', 'Las Heras', 'Maipú', 'Guaymallén', 'Rivadavia',
  'San Martín', 'La Paz', 'Santa Rosa', 'General Alvear', 'Malargüe', 'San Carlos',
  'Tupungato', 'Tunuyán', 'San Rafael', 'Lavalle', 'Luján de Cuyo',
];

const UserProfile = () => {
  const dispatch = useDispatch();

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

  const [editing, setEditing] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('userData'));

      if (!storedUser) throw new Error('Usuario no encontrado');

      setFormData({
        id: storedUser.uuid || '',
        nombre: storedUser.nombre || '',
        apellido: storedUser.apellido || '',
        dni: storedUser.dni || '',
        email: storedUser.email || '',
        contraseña: '********',
        direccion: {
          calle: storedUser.direccion?.calle || '',
          altura: storedUser.direccion?.altura || '',
          barrio: storedUser.direccion?.barrio || '',
          departamento: storedUser.direccion?.departamento || '',
        },
      });
    } catch (err) {
      console.error('Error cargando datos:', err);
      notification.error({
        message: 'Error',
        description: 'No se pudo cargar la información del usuario.',
      });
    }
  }, []);

  const handleEdit = () => setEditing(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      ...(name in prev.direccion
        ? { direccion: { ...prev.direccion, [name]: value } }
        : { [name]: value }),
    }));
  };

  const handleCancel = () => {
    const storedUser = JSON.parse(localStorage.getItem('userData')) || {};
    setFormData({
      id: storedUser.uuid || '',
      nombre: storedUser.nombre || '',
      apellido: storedUser.apellido || '',
      dni: storedUser.dni || '',
      email: storedUser.email || '',
      contraseña: '********',
      direccion: {
        calle: storedUser.direccion?.calle || '',
        altura: storedUser.direccion?.altura || '',
        barrio: storedUser.direccion?.barrio || '',
        departamento: storedUser.direccion?.departamento || '',
      },
    });
    setEditing(false);
    setNewPassword('');
    setShowPasswordField(false);
  };

  const handleSave = async () => {
    const { id: uuid } = formData;

    if (!uuid) {
      notification.error({
        message: 'Error',
        description: 'No se pudo identificar al usuario.',
      });
      return;
    }

    setLoading(true);

    const updatedData = {
      email: formData.email,
      newPassword: newPassword || undefined,
      direccion: formData.direccion,
    };

    try {
      const updatedUser = await dispatch(updateUser(uuid, updatedData));

      setFormData({
        ...formData,
        ...updatedUser,
        direccion: updatedUser.direccion || formData.direccion,
        contraseña: '********',
      });

      localStorage.setItem('userData', JSON.stringify({
        ...updatedUser,
        direccion: updatedUser.direccion || {},
        dni: formData.dni, // DNI no se modifica, lo conservamos
      }));

      notification.success({
        message: 'Éxito',
        description: 'Datos actualizados correctamente!',
      });

      setEditing(false);
      setNewPassword('');
      setShowPasswordField(false);
    } catch (error) {
      // ya notificado
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="user-profile" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Card
        style={{ width: '100%', maxWidth: '700px', textAlign: 'center' }}
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

        <Form layout="vertical">
          <Title level={4}>Datos personales</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Nombre">
                <Input name="nombre" value={formData.nombre} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Apellido">
                <Input name="apellido" value={formData.apellido} disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="DNI">
                <Input name="dni" value={formData.dni} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Email">
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </Form.Item>
            </Col>
          </Row>

          <Title level={4}>Seguridad</Title>
          <Form.Item label="Contraseña actual">
            <Input.Password name="contraseña" value={formData.contraseña} disabled />
          </Form.Item>

          {editing && !showPasswordField && (
            <Button icon={<FaKey />} type="dashed" style={{ marginBottom: 12 }} onClick={() => setShowPasswordField(true)}>
              Cambiar contraseña
            </Button>
          )}

          {editing && showPasswordField && (
            <Form.Item label="Nueva contraseña">
              <Input.Password name="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </Form.Item>
          )}

          <Title level={4}>Dirección</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Calle">
                <Input name="calle" value={formData.direccion.calle} onChange={handleChange} disabled={!editing} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Numeración">
                <Input name="altura" value={formData.direccion.altura} onChange={handleChange} disabled={!editing} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Barrio">
                <Input name="barrio" value={formData.direccion.barrio} onChange={handleChange} disabled={!editing} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Departamento">
                <Select
                  value={formData.direccion.departamento}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      direccion: { ...prev.direccion, departamento: value },
                    }))
                  }
                  disabled={!editing}
                  placeholder="Seleccione un departamento"
                >
                  {departments.map((dep) => (
                    <Option key={dep} value={dep}>
                      {dep}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {editing ? (
            <Form.Item>
              <Button type="primary" icon={<FaSave />} onClick={handleSave} loading={loading}>
                Guardar
              </Button>
              <Button style={{ marginLeft: 10 }} onClick={handleCancel}>
                Cancelar
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
