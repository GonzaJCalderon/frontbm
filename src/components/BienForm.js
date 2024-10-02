import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Select, Upload, message, notification, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { addBien, fetchBienes } from '../redux/actions/bienes';
import { ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { Title } = Typography;

// Genera un UUID
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

// Obtiene datos del usuario desde localStorage
const getUserData = () => {
    const userData = localStorage.getItem('userData');
    if (userData) {
        try {
            return JSON.parse(userData);
        } catch (error) {
            console.error('Error al parsear userData:', error);
            return null;
        }
    }
    return null;
};

const RegistrarBienPage = () => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [selectedTipo, setSelectedTipo] = useState(null);
    const [selectedMarca, setSelectedMarca] = useState('');
    const [selectedModelo, setSelectedModelo] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items } = useSelector(state => state.bienes);

    const bienesTipos = [...new Set(items.map(bien => bien.tipo))];

    useEffect(() => {
        const usuario = getUserData();
        if (usuario && usuario.id) {
            dispatch(fetchBienes(usuario.id));
        } else {
            console.error('No se pudo obtener el ID del usuario');
        }
    }, [dispatch]);

    const handleFinish = async () => {
        try {
            const usuario = getUserData();
            const vendedorId = usuario ? usuario.id : null;

            if (!vendedorId || !selectedTipo || !selectedMarca || !selectedModelo) {
                message.warning('Por favor complete todos los campos obligatorios.');
                return;
            }

            // Verifica si el bien ya está registrado
            const bienExistente = items.find(b => b.modelo === selectedModelo && b.marca === selectedMarca && b.tipo === selectedTipo);
            const formData = new FormData();
            formData.append('uuid', generateUUID());
            formData.append('tipo', selectedTipo);
            formData.append('marca', selectedMarca);
            formData.append('modelo', selectedModelo);
            formData.append('descripcion', form.getFieldValue('bienDescripcion') || '');
            formData.append('precio', form.getFieldValue('bienPrecio') || 0);
            formData.append('stock', 1); // Asignar un stock inicial de 1
            formData.append('vendedorId', vendedorId);
            formData.append('fecha', new Date().toISOString());

            // Adjuntar las fotos
            fileList.forEach(file => {
                formData.append('fotos', file.originFileObj);
            });

            if (bienExistente) {
                // Actualiza la cantidad de stock
                const cantidadActualizada = (bienExistente.stock || 0) + 1; // Incrementa el stock en 1
                const bienActualizado = {
                    ...bienExistente,
                    stock: cantidadActualizada,
                    descripcion: form.getFieldValue('bienDescripcion') || bienExistente.descripcion,
                    fotos: fileList.length ? fileList.map(file => file.originFileObj) : bienExistente.fotos,
                };

                console.log('Updated Bien Data to be sent:', bienActualizado);
                await dispatch(addBien(bienActualizado)); // Modificar el action de Redux para manejar la actualización
                notification.success({
                    message: 'Cantidad Actualizada',
                    description: `La cantidad del bien "${bienExistente.descripcion}" se ha actualizado a ${cantidadActualizada}.`,
                });
            } else {
                await dispatch(addBien(formData));
                notification.success({
                    message: 'Bien Registrado',
                    description: 'El bien nuevo ha sido registrado exitosamente.',
                });
            }

            navigate('/userdashboard');
        } catch (error) {
            message.error('Error al registrar el bien. Inténtalo de nuevo.');
            console.error('Error de registro:', error);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginRight: '10px' }}>
                    Volver
                </Button>
                <Button icon={<HomeOutlined />} onClick={() => navigate('/userdashboard')} style={{ marginRight: '10px' }}>
                    Inicio
                </Button>
            </div>

            <Title level={3}>Registro de Bienes</Title>

            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item
                    name="bienTipo"
                    label="Tipo de Bien"
                    rules={[{ required: true, message: 'Por favor seleccione el tipo de bien' }]}
                >
                    <Select onChange={setSelectedTipo}>
                        {bienesTipos.map((tipo, index) => (
                            <Option key={index} value={tipo}>{tipo}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="bienMarca"
                    label="Marca"
                    rules={[{ required: true, message: 'Por favor ingrese la marca' }]}
                >
                    <Input onChange={(e) => setSelectedMarca(e.target.value)} />
                </Form.Item>

                <Form.Item
                    name="bienModelo"
                    label="Modelo"
                    rules={[{ required: true, message: 'Por favor ingrese el modelo' }]}
                >
                    <Input onChange={(e) => setSelectedModelo(e.target.value)} />
                </Form.Item>

                <Form.Item
                    name="bienDescripcion"
                    label="Descripción"
                >
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item
                    name="bienPrecio"
                    label="Precio"
                    rules={[{ required: true, message: 'Por favor ingrese el precio' }]}
                >
                    <InputNumber min={0} />
                </Form.Item>

                <Form.Item label="Fotos">
                    <Upload
                        fileList={fileList}
                        onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                        multiple
                        beforeUpload={() => false}
                    >
                        <Button>Subir Fotos</Button>
                    </Upload>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                        Registrar Bien
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default RegistrarBienPage;
