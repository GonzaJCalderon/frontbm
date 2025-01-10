import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchBienDetails, updateBien } from '../redux/actions/bienes';
import { Form, Input, InputNumber, Button, Spin, Typography, notification, Divider, Upload } from 'antd';
import { ArrowLeftOutlined, LogoutOutlined } from '@ant-design/icons';

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
            description: 'Has cerrado sesión correctamente.',
        });
        navigate('/login');
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await dispatch(fetchBienDetails(uuid));
                form.setFieldsValue(data);
                setExistingImages(data.fotos || []);
            } catch (err) {
                setError('No se pudo cargar el bien. Verifica el UUID.');
                notification.error({
                    message: 'Error',
                    description: 'No se pudo cargar el bien. Verifica el UUID.',
                });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [dispatch, uuid, form]);

    const handleSubmit = async (values) => {
        const formData = new FormData();
    
        // Agregar los valores del formulario
        Object.keys(values).forEach((key) => {
            formData.append(key, values[key]);
        });
    
        // Agregar imágenes existentes
        formData.append('existingImages', JSON.stringify(existingImages));
    
        // Agregar nuevas imágenes
        newImages.forEach((file) => {
            formData.append('fotos', file.originFileObj || file); // Asegúrate de usar 'fotos'
        });
        
        try {
            await dispatch(updateBien(uuid, formData)); // Llama a la acción con el FormData
            notification.success({
                message: 'Éxito',
                description: 'El bien se actualizó correctamente.',
            });
            navigate('/lista-bienes');
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'No se pudo actualizar el bien.',
            });
        }
    };
    

    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <Spin size="large" />
                <p>Cargando detalles del bien...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <Typography.Text type="danger">{error}</Typography.Text>
            </div>
        );
    }

    return (
        <div
            style={{
                maxWidth: '800px',
                margin: '50px auto',
                padding: '20px',
                background: '#fff',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                    Volver
                </Button>
                <Button icon={<LogoutOutlined />} onClick={handleLogout} danger>
                    Cerrar Sesión
                </Button>
            </div>

            <Title level={3} style={{ textAlign: 'center', color: '#1890ff' }}>
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
                    stock: { cantidad: 0 },
                }}
            >
                <Form.Item
                    label="Tipo"
                    name="tipo"
                    rules={[{ required: true, message: 'El tipo es obligatorio' }]}
                >
                    <Input placeholder="Ingrese el tipo" />
                </Form.Item>

                <Form.Item
                    label="Descripción"
                    name="descripcion"
                    rules={[{ required: true, message: 'La descripción es obligatoria' }]}
                >
                    <Input.TextArea rows={3} placeholder="Ingrese la descripción" />
                </Form.Item>

                <Form.Item
                    label="Precio"
                    name="precio"
                    rules={[
                        { required: true, message: 'El precio es obligatorio' },
                        { type: 'number', min: 0, message: 'El precio debe ser mayor a 0' },
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Ingrese el precio"
                    />
                </Form.Item>

                <Form.Item
                    label="Marca"
                    name="marca"
                    rules={[{ required: true, message: 'La marca es obligatoria' }]}
                >
                    <Input placeholder="Ingrese la marca" />
                </Form.Item>

                <Form.Item
                    label="Modelo"
                    name="modelo"
                    rules={[{ required: true, message: 'El modelo es obligatorio' }]}
                >
                    <Input placeholder="Ingrese el modelo" />
                </Form.Item>

                <Form.Item
                    label="Cantidad en Stock"
                    name={['stock', 'cantidad']}
                    rules={[
                        { required: true, message: 'La cantidad en stock es obligatoria' },
                        { type: 'number', min: 0, message: 'Debe ser mayor o igual a 0' },
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Ingrese la cantidad en stock"
                    />
                </Form.Item>

                <Form.Item label="Imágenes existentes">
                    <Upload
                        listType="picture-card"
                        fileList={existingImages.map((url) => ({
                            uid: url,
                            name: url.split('/').pop(),
                            status: 'done',
                            url: url,
                        }))}
                        onRemove={(file) => {
                            setExistingImages((prev) => prev.filter((img) => img !== file.url));
                        }}
                        showUploadList={{
                            showRemoveIcon: true,
                        }}
                    />
                </Form.Item>

                <Form.Item label="Agregar nuevas imágenes">
                    <Upload
                        listType="picture"
                        fileList={newImages}
                        onChange={({ fileList: newFileList }) => setNewImages(newFileList)}
                        beforeUpload={() => false}
                    >
                        <Button>Subir Imágenes</Button>
                    </Upload>
                </Form.Item>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                    <Button
                        type="default"
                        onClick={() => navigate('/bienes')}
                        style={{ background: '#f0f0f0', color: '#000' }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        style={{ background: '#1890ff', color: '#fff' }}
                    >
                        Guardar Cambios
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default BienEdit;
