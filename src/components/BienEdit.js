import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchBienDetails, updateBien } from '../redux/actions/bienes';
import {
  Form,
  Input,
  InputNumber,
  Button,
  Spin,
  Typography,
  notification,
  Divider,
  Upload
} from 'antd';
import { ArrowLeftOutlined, LogoutOutlined, UploadOutlined } from '@ant-design/icons';

const { Title } = Typography;

const BienEdit = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const handleLogout = () => {
    localStorage.clear();
    notification.success({
      message: 'Sesión cerrada',
      description: 'Has cerrado sesión correctamente.'
    });
    navigate('/login');
  };

  useEffect(() => {
    const loadBien = async () => {
      try {
        const data = await dispatch(fetchBienDetails(uuid));
        form.setFieldsValue(data);
        setExistingImages(data.fotos || []);
      } catch (err) {
        setError('No se pudo cargar el bien. Verifica el UUID.');
        notification.error({
          message: 'Error',
          description: 'No se pudo cargar el bien.'
        });
      } finally {
        setLoading(false);
      }
    };
    loadBien();
  }, [dispatch, uuid, form]);

  const handleSubmit = async (values) => {
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      if (key === 'stock') {
        formData.append('stock', value?.cantidad || 0);
      } else {
        formData.append(key, value);
      }
    });

    formData.append('existingImages', JSON.stringify(existingImages));
    newImages.forEach((file) => {
      formData.append('fotos', file.originFileObj || file);
    });

    try {
      await dispatch(updateBien(uuid, formData));
      notification.success({
        message: 'Actualización exitosa',
        description: 'El bien fue actualizado correctamente.'
      });
      navigate('/lista-bienes');
    } catch (err) {
      notification.error({
        message: 'Error',
        description: 'No se pudo actualizar el bien.'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Spin size="large" />
        <p className="mt-4 text-gray-600">Cargando bien...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-20">
        <Typography.Text type="danger">{error}</Typography.Text>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <div className="flex justify-between mb-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Volver
        </Button>
        <Button icon={<LogoutOutlined />} danger onClick={handleLogout}>
          Cerrar Sesión
        </Button>
      </div>

      <Title level={3} className="text-center text-blue-600">
        Editar Bien
      </Title>
      <Divider />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          tipo: '',
          descripcion: '',
          precio: 0,
          marca: '',
          modelo: '',
          stock: { cantidad: 0 }
        }}
      >
        <Form.Item label="Tipo" name="tipo" rules={[{ required: true, message: 'Ingrese el tipo' }]}>
          <Input placeholder="Ej: Teléfono Móvil" />
        </Form.Item>

        <Form.Item
          label="Descripción"
          name="descripcion"
          rules={[{ required: true, message: 'Ingrese una descripción' }]}
        >
          <Input.TextArea rows={3} placeholder="Descripción del bien" />
        </Form.Item>

        <Form.Item
          label="Precio ($)"
          name="precio"
          rules={[
            { required: true, message: 'El precio es obligatorio' },
            { type: 'number', min: 0, message: 'Debe ser mayor o igual a 0' }
          ]}
        >
          <InputNumber style={{ width: '100%' }} placeholder="Precio" />
        </Form.Item>

        <Form.Item
          label="Marca"
          name="marca"
          rules={[{ required: true, message: 'Ingrese la marca' }]}
        >
          <Input placeholder="Ej: Samsung, LG..." />
        </Form.Item>

        <Form.Item
          label="Modelo"
          name="modelo"
          rules={[{ required: true, message: 'Ingrese el modelo' }]}
        >
          <Input placeholder="Ej: Galaxy A52" />
        </Form.Item>

        <Form.Item
          label="Cantidad en Stock"
          name={['stock', 'cantidad']}
          rules={[
            { required: true, message: 'Ingrese cantidad en stock' },
            { type: 'number', min: 0, message: 'Debe ser 0 o mayor' }
          ]}
        >
          <InputNumber style={{ width: '100%' }} placeholder="Unidades disponibles" />
        </Form.Item>

        <Form.Item label="Imágenes existentes">
          <Upload
            listType="picture-card"
            fileList={existingImages.map((url) => ({
              uid: url,
              name: url.split('/').pop(),
              status: 'done',
              url
            }))}
            showUploadList={{ showRemoveIcon: true }}
            onRemove={(file) => {
              setExistingImages((prev) => prev.filter((img) => img !== file.url));
            }}
          />
        </Form.Item>

        <Form.Item label="Agregar nuevas imágenes">
          <Upload
            listType="picture"
            fileList={newImages}
            beforeUpload={() => false}
            onChange={({ fileList }) => setNewImages(fileList)}
          >
            <Button icon={<UploadOutlined />}>Subir Imágenes</Button>
          </Upload>
        </Form.Item>

        <div className="flex justify-between mt-6">
          <Button onClick={() => navigate('/lista-bienes')}>Cancelar</Button>
          <Button type="primary" htmlType="submit">
            Guardar Cambios
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default BienEdit;
