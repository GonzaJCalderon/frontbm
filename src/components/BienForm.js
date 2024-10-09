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
    const [precio, setPrecio] = useState('');
    const [stock, setStock] = useState('');

    const bienesTipos = [...new Set(items.map(bien => bien.tipo))];

    useEffect(() => {
        const usuario = getUserData();
        if (usuario && usuario.id) {
            dispatch(fetchBienes(usuario.id));
        } else {
            console.error('No se pudo obtener el ID del usuario');
        }
    }, [dispatch]);

    const handleFinish = async (formData) => {
        try {
            const usuario = getUserData();
            const vendedorId = usuario ? usuario.id : null;

            if (!vendedorId || !selectedTipo || !selectedMarca || !selectedModelo) {
                message.warning('Por favor complete todos los campos obligatorios.');
                return;
            }

            const precioNumero = parseFloat(precio);
            const stockNumero = parseInt(stock);

            if (isNaN(precioNumero) || isNaN(stockNumero)) {
                message.warning('El precio y el stock deben ser números válidos.');
                return;
            }

            const formDataToSend = new FormData();

            formDataToSend.append('uuid', generateUUID());
            formDataToSend.append('tipo', selectedTipo);
            formDataToSend.append('marca', selectedMarca);
            formDataToSend.append('modelo', selectedModelo);
            formDataToSend.append('descripcion', form.getFieldValue('bienDescripcion') || '');
            formDataToSend.append('precio', precioNumero);
            formDataToSend.append('stock', stockNumero);
            formDataToSend.append('vendedorId', vendedorId);
            formDataToSend.append('fecha', new Date().toISOString());

            if (fileList.length > 0) {
                fileList.forEach(file => {
                    formDataToSend.append('fotos[]', file.originFileObj);
                });
            }

            console.log('FormData antes de enviar:', Object.fromEntries(formDataToSend.entries()));

            let bienExistente = items.find(bien => 
                bien.modelo === selectedModelo &&
                bien.marca === selectedMarca &&
                bien.tipo === selectedTipo
            );

            if (bienExistente) {
                const cantidadActualizada = (bienExistente.stock || 0) + 1;
                const bienActualizado = {
                    ...bienExistente,
                    stock: cantidadActualizada,
                    descripcion: form.getFieldValue('bienDescripcion') || bienExistente.descripcion,
                    fotos: fileList.length ? fileList.map(file => file.originFileObj) : bienExistente.fotos,
                };

                await dispatch(addBien(bienActualizado));
                notification.success({
                    message: 'Cantidad Actualizada',
                    description: `La cantidad del bien "${bienExistente.descripcion}" se ha actualizado a ${cantidadActualizada}.`,
                });
            } else {
                await dispatch(addBien(formDataToSend));
                notification.success({
                    message: 'Bien Registrado',
                    description: 'El bien nuevo ha sido registrado exitosamente.',
                });
            }

            navigate('/userdashboard');
        } catch (error) {
            console.error('Error al registrar el bien:', error);
            
            if (error.response && error.response.data) {
                // Manejar errores específicos del servidor
                console.error('Datos de error:', error.response.data);
                
                // Mostrar mensaje de error personalizado
                message.error(error.response.data.message || 'Ocurrió un error al registrar el bien.');
            } else {
                // Manejar errores generales
                message.error('Ha ocurrido un error al intentar registrar el bien. Inténtelo de nuevo.');
            }
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
                    <InputNumber min={0} onChange={(value) => setPrecio(value.toString())} />
                </Form.Item>

                <Form.Item
                    name="bienStock"
                    label="Stock"
                    rules={[{ required: true, message: 'Por favor ingrese el stock' }]}
                >
                    <InputNumber min={0} onChange={(value) => setStock(value.toString())} />
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
