import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Select, Upload, message, Typography } from 'antd';
import { ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { Title } = Typography;

const RegistrarBienPage = () => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]); // Fotos seleccionadas
    const [selectedTipo, setSelectedTipo] = useState('');
    const [selectedMarca, setSelectedMarca] = useState('');
    const [selectedModelo, setSelectedModelo] = useState('');
    const [precio, setPrecio] = useState(null);
    const [descripcion, setDescripcion] = useState('');
    const [stock, setStock] = useState(null);
    const [imei, setImei] = useState('');
    const navigate = useNavigate();

    // Recuperar token y userUuid del localStorage
    const token = localStorage.getItem('token');
    const userUuid = localStorage.getItem('userUuid'); // Usar la clave consistente

    // Seleccionar la base URL según el entorno
    const baseURL = process.env.REACT_APP_API_URL_LOCAL || process.env.REACT_APP_API_URL_REMOTE;

    // Validar si el usuario está autenticado al cargar el componente
    useEffect(() => {
        if (!token || !userUuid) {
            message.error('Usuario no autenticado. Por favor, inicie sesión.');
            navigate('/login');
        }
    }, [token, userUuid, navigate]);

    const bienesTiposPermitidos = [
        'camara fotografica',
        'equipo de audio',
        'laptop',
        'tablet',
        'TV',
        'teléfono movil',
        'bicicleta',
    ];

    const handleFinish = async () => {
        try {
            console.log('Fotos seleccionadas:', fileList); // Agrega este log
            if (!token || !userUuid) {
                message.error('Usuario no autenticado. Por favor, inicie sesión.');
                return;
            }
    
            const formData = new FormData();
            formData.append('tipo', selectedTipo);
            formData.append('marca', selectedMarca);
            formData.append('modelo', selectedModelo);
            formData.append('precio', precio);
            formData.append('descripcion', descripcion);
            formData.append('propietario_uuid', userUuid);
            formData.append('stock', stock);
    
            if (selectedTipo === 'teléfono movil') {
                formData.append('imei', imei);
            }
    
            fileList.forEach((file) => {
                console.log('Archivo:', file.originFileObj); // Verificar si `originFileObj` existe
                formData.append('fotos', file.originFileObj);
            });
    
            // Usa la base URL dinámica para enviar el formulario
            const response = await axios.post(`${baseURL}/bienes/add`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            message.success('Bien registrado exitosamente');
            form.resetFields();
            setFileList([]);
            navigate('/user/dashboard');
        } catch (error) {
            console.error('Error al registrar el bien:', error.response?.data || error.message);
            message.error('Error al registrar el bien. Por favor, intenta nuevamente.');
        }
    };
    
    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginRight: '10px' }}>
                    Volver
                </Button>
                <Button icon={<HomeOutlined />} onClick={() => navigate('/user/dashboard')} style={{ marginRight: '10px' }}>
                    Inicio
                </Button>
            </div>

            <Title level={3}>Registro de Bienes</Title>

            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item name="bienTipo" label="Tipo de Bien" rules={[{ required: true, message: 'Seleccione el tipo de bien' }]}>
                    <Select value={selectedTipo} onChange={setSelectedTipo}>
                        {bienesTiposPermitidos.map((tipo) => (
                            <Option key={tipo} value={tipo}>
                                {tipo}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item name="bienMarca" label="Marca" rules={[{ required: true, message: 'Ingrese la marca' }]}>
                    <Input value={selectedMarca} onChange={(e) => setSelectedMarca(e.target.value)} />
                </Form.Item>

                <Form.Item name="bienModelo" label="Modelo" rules={[{ required: true, message: 'Ingrese el modelo' }]}>
                    <Input value={selectedModelo} onChange={(e) => setSelectedModelo(e.target.value)} />
                </Form.Item>

                <Form.Item name="descripcion" label="Descripción">
                    <Input.TextArea rows={4} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                </Form.Item>

                <Form.Item name="bienPrecio" label="Precio" rules={[{ required: true, message: 'Ingrese el precio' }]}>
                    <InputNumber min={0} value={precio} onChange={setPrecio} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item name="bienStock" label="Stock" rules={[{ required: true, message: 'Ingrese el stock' }]}>
                    <InputNumber min={0} value={stock} onChange={setStock} style={{ width: '100%' }} />
                </Form.Item>

                {selectedTipo === 'teléfono movil' && (
                    <Form.Item name="imei" label="IMEI" rules={[{ required: true, message: 'Ingrese el IMEI' }]}>
                        <Input value={imei} onChange={(e) => setImei(e.target.value)} />
                    </Form.Item>
                )}

                <Form.Item label="Fotos">
                    <Upload
                        fileList={fileList}
                        onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                        multiple
                        beforeUpload={() => false} // Evita la subida automática
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
