import { useDispatch } from 'react-redux';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Select, Upload, message, Typography } from 'antd';
import { ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { addBien } from '../redux/actions/bienes';

const { Option } = Select;
const { Title } = Typography;

const RegistrarBienPage = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedMarca, setSelectedMarca] = useState('');
  const [selectedModelo, setSelectedModelo] = useState('');
  const [precio, setPrecio] = useState(null);
  const [descripcion, setDescripcion] = useState('');
  const [stock, setStock] = useState(null);
  const [imeis, setImeis] = useState([]); // Estado para almacenar los IMEIs dinámicos
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const token = localStorage.getItem('token');
  const userUuid = localStorage.getItem('userUuid');

  useEffect(() => {
    if (!token || !userUuid) {
      message.error('Usuario no autenticado. Por favor, inicie sesión.');
      navigate('/login');
    }
  }, [token, userUuid, navigate]);

  // Actualizar los IMEIs dinámicamente cuando cambia el stock
  useEffect(() => {
    if (stock > 0) {
      if (selectedTipo.toLowerCase() === 'teléfono movil') {
        const newImeis = Array(stock).fill(''); // Campos vacíos para que el usuario los llene
        setImeis(newImeis);
      } else {
        // Generar identificadores únicos automáticamente para bienes no telefónicos
        const newIdentificadores = Array(stock)
          .fill('')
          .map(() => `ID-${Math.random().toString(36).substr(2, 9)}`); // Generar IDs únicos
        setImeis(newIdentificadores);
      }
    } else {
      setImeis([]); // Limpiar identificadores si el stock es cero
    }
  }, [selectedTipo, stock]);
  
  const handleImeiChange = (value, index) => {
    const updatedImeis = [...imeis];
    updatedImeis[index] = value;
    setImeis(updatedImeis);
  };

  const handleFinish = async () => {
    // Validación para IMEIs si el tipo es "teléfono móvil"
    if (selectedTipo.toLowerCase() === 'teléfono movil' && imeis.length !== stock) {
      message.error('Debe ingresar un IMEI para cada unidad de stock.');
      return;
    }
  
    if (selectedTipo.toLowerCase() === 'teléfono movil' && imeis.some((imei) => !imei.trim())) {
      message.error('Todos los campos de IMEI deben estar completos.');
      return;
    }
  
    const formData = new FormData();
    formData.append('tipo', selectedTipo);
    formData.append('marca', selectedMarca);
    formData.append('modelo', selectedModelo);
    formData.append('precio', precio);
    formData.append('descripcion', descripcion);
    formData.append('propietario_uuid', userUuid);
    formData.append('stock', JSON.stringify({ cantidad: stock }));
    formData.append('imei', JSON.stringify(imeis)); // Enviar identificadores únicos o IMEIs
  
    fileList.forEach((file) => {
      formData.append('fotos', file.originFileObj || file);
    });
  
    try {
      const response = await dispatch(addBien(formData));
      console.log('Respuesta del backend:', response);
      message.success('Bien registrado exitosamente');
      form.resetFields();
      setFileList([]);
      navigate('/user/dashboard');
    } catch (error) {
      console.error('Error al registrar el bien:', error.message);
      message.error('Error al registrar el bien.');
    }
  };
  
  

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Volver</Button>
        <Button icon={<HomeOutlined />} onClick={() => navigate('/user/dashboard')}>Inicio</Button>
      </div>

      <Title level={3}>Registro de Bienes</Title>

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="bienTipo" label="Tipo de Bien" rules={[{ required: true, message: 'Seleccione el tipo de bien' }]}>
          <Select value={selectedTipo} onChange={setSelectedTipo}>
            {['bicicleta', 'TV', 'equipo de audio', 'cámara fotográfica', 'notebook', 'tablet', 'teléfono movil'].map((tipo) => (
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
          <InputNumber min={1} value={stock} onChange={setStock} style={{ width: '100%' }} />
        </Form.Item>

        {selectedTipo.toLowerCase() === 'teléfono movil' &&
          imeis.map((imei, index) => (
            <Form.Item
              key={index}
              name={`imei_${index}`}
              label={`IMEI #${index + 1}`}
              rules={[{ required: true, message: `Ingrese el IMEI #${index + 1}` }]}
            >
              <Input value={imei} onChange={(e) => handleImeiChange(e.target.value, index)} />
            </Form.Item>
          ))}

        <Form.Item label="Fotos del Bien">
          <Upload
            listType="picture"
            fileList={fileList}
            onChange={({ fileList: newFileList }) => setFileList(newFileList)}
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
