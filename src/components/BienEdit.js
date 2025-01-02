import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchBienDetails, updateBien } from '../redux/actions/bienes';
import { Form, Input, InputNumber, Button, Spin, Typography, notification, Divider } from 'antd';

const { Title } = Typography;

const BienEdit = () => {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('Fetching bien details for UUID:', uuid);
                const data = await dispatch(fetchBienDetails(uuid));
                console.log('Bien details received:', data);
                form.setFieldsValue(data); // Cargar los datos en el formulario
            } catch (err) {
                console.error('Error al cargar los detalles del bien:', err);
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
        try {
            console.log('Actualizando bien con valores:', values);
            await dispatch(updateBien(uuid, values));
            notification.success({
                message: 'Éxito',
                description: 'El bien se actualizó correctamente.',
            });
            navigate('/lista-bienes');
        } catch (error) {
            console.error('Error al actualizar el bien:', error);
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
            <div style={{ textAlign: 'center',                marginTop: '50px' }}>
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
                propietario_uuid: null,
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

