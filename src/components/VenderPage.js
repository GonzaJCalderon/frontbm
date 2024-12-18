import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Select, message, Typography, notification, Radio, Alert, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBienes, registrarVenta } from '../redux/actions/bienes';
import { addUsuario, checkExistingUser } from '../redux/actions/usuarios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, HomeOutlined, LogoutOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title } = Typography;

const departments = [
  'Capital', 'Godoy Cruz', 'Junín', 'Las Heras', 'Maipú', 'Guaymallén', 'Rivadavia',
  'San Martín', 'La Paz', 'Santa Rosa', 'General Alvear', 'Malargüe', 'San Carlos',
  'Tupungato', 'Tunuyán', 'San Rafael', 'Lavalle', 'Luján de Cuyo'
];

// Tipos permitidos
const allowedTipos = ['cámara fotográfica', 'TV', 'equipo de audio', 'laptop', 'tablet', 'teléfono móvil', 'Bicicleta'];

const VenderPage = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((state) => state.bienes);
  const usuario = JSON.parse(localStorage.getItem('userData') || '{}');
  


  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    direccion: { calle: '', altura: '', barrio: '', departamento: '' },
    cuit: '',
    dni: '',
    tipo: 'persona',
    razonSocial: '',
  });

  const [selectedTipo, setSelectedTipo] = useState(null);
  const [selectedMarca, setSelectedMarca] = useState('');
  const [selectedModelo, setSelectedModelo] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [imeis, setImeis] = useState([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);

  // Filtrar tipos de bienes permitidos
  const tiposDisponibles = allowedTipos;
  // Eliminar marcas repetidas
  const marcasDisponibles = Array.from(
    new Set(items.filter((bien) => bien.tipo === selectedTipo).map((bien) => bien.marca))
  );
  const modelosDisponibles = Array.from(
    new Set(items.filter((bien) => bien.tipo === selectedTipo && bien.marca === selectedMarca).map((bien) => bien.modelo))
  );
  

  useEffect(() => {
    if (usuario && usuario.id) {
      dispatch(fetchBienes(usuario.id));
    }
  }, [dispatch]);

  const handleCantidadChange = (value) => {
    setCantidad(value);
    setImeis(Array(value).fill('')); // Inicializar array de IMEIs
  };
  
  const handleImeiChange = (value, index) => {
    const newImeis = [...imeis];
    newImeis[index] = value;
    setImeis(newImeis);
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['calle', 'altura', 'barrio', 'departamento'].includes(name)) {
      setFormData({ ...formData, direccion: { ...formData.direccion, [name]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFinishStep1 = async () => {
    if (!formData.direccion.altura) {
      message.error('El campo "Altura" es obligatorio.');
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const existingUser = await dispatch(checkExistingUser(formData.dni, formData.email, formData.nombre, formData.apellido, formData.cuit, usuario.dni));
      if (existingUser && existingUser.usuario) {
        setFormData({
          ...formData,
          compradorId: existingUser.usuario.id,
          direccion: {
            calle: existingUser.usuario.direccion?.calle || '',
            altura: existingUser.usuario.direccion?.altura || '',
            departamento: existingUser.usuario.direccion?.departamento || '',
          },
        });
        setStep(2);
      } else {
        const newUser = await dispatch(addUsuario(formData));
        if (newUser && newUser.usuario) {
          setFormData({
            ...formData,
            compradorId: newUser.usuario.id,
            direccion: {
              calle: newUser.usuario.direccion?.calle,
              altura: newUser.usuario.direccion?.altura,
              departamento: newUser.usuario.direccion?.departamento,
            },
          });
          setStep(2);
        } else {
          throw new Error('Error en el registro del usuario.');
        }
      }
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      setError(error.message || 'Error al registrar usuario.');
    } finally {
      setLoading(false);
    }
  };
  
  
  
  const handleFinishStep2 = async () => {
    if (!formData.compradorId) {
      return message.error('No se pudo obtener el ID del comprador. Intente nuevamente.');
    }
  
    // Verificar que el comprador y el vendedor no sean la misma persona comparando DNI
    if (formData.dni === usuario.dni) {
      return message.error('No puedes vender a ti mismo.');
    }
  
    // Validar IMEIs para teléfonos móviles
    if (selectedTipo === 'teléfono móvil' && imeis.some((imei) => !imei || imei.length !== 15)) {
      return message.error('Debe ingresar un IMEI válido de 15 dígitos para cada teléfono móvil.');
    }
  
    const ventaData = {
      bienId: items.find((b) => b.modelo === selectedModelo && b.marca === selectedMarca)?.uuid,
      compradorId: formData.compradorId,
      vendedorId: usuario.id,
      precio: form.getFieldValue('precio'),
      cantidad: form.getFieldValue('cantidad'),
      metodoPago,
      descripcion: items.find((b) => b.modelo === selectedModelo && b.marca === selectedMarca)?.descripcion || 'Sin descripción',
      tipo: selectedTipo,
      marca: selectedMarca,
      modelo: selectedModelo,
      imei: selectedTipo === 'teléfono móvil' ? imeis : null, // Actualizar con array de IMEIs
    };
  
    try {
      await dispatch(registrarVenta(ventaData));
      notification.success({ message: 'Venta Registrada', description: 'La venta ha sido registrada con éxito.' });
      navigate('/userdashboard');
    } catch (error) {
      console.error('Error al registrar la venta:', error);
      message.error('Error al registrar la venta. Intenta nuevamente.');
    }
  };
  

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Botones de navegación */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Volver</Button>
        <Button icon={<HomeOutlined />} onClick={() => navigate('/userdashboard')}>Inicio</Button>
        <Button
          icon={<LogoutOutlined />}
          type="primary"
          danger
          onClick={() => {
            localStorage.removeItem('userData');
            navigate('/home');
          }}
        >
          Cerrar Sesión
        </Button>
      </div>
  
      <Title level={3}>{step === 1 ? 'Paso 1: Datos del Comprador' : 'Paso 2: Datos del Bien'}</Title>
  
      {error && <Alert message="Error" description={error} type="error" showIcon style={{ marginBottom: 20 }} />}
  
      {loading ? (
        <Spin tip="Cargando..." />
      ) : (
        <Form layout="vertical" form={form} onFinish={step === 1 ? handleFinishStep1 : handleFinishStep2}>

  {step === 1 ? (
    <>
      <Form.Item label="Tipo de Sujeto" name="tipo" required>
        <Radio.Group onChange={handleChange} value={formData.tipo}>
          <Radio value="persona">Persona</Radio>
          <Radio value="juridica">Persona Jurídica</Radio>
        </Radio.Group>
      </Form.Item>
      {formData.tipo === 'juridica' && (
        <Form.Item label="Razón Social" name="razonSocial" required>
          <Input placeholder="Razón Social" name="razonSocial" value={formData.razonSocial} onChange={handleChange} />
        </Form.Item>
      )}
      <Form.Item label="Nombre" name="nombre" required>
        <Input placeholder="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} />
      </Form.Item>
      <Form.Item label="Apellido" name="apellido" required>
        <Input placeholder="Apellido" name="apellido" value={formData.apellido} onChange={handleChange} />
      </Form.Item>
      <Form.Item label="Correo Electrónico" name="email" required>
        <Input placeholder="Correo Electrónico" name="email" value={formData.email} onChange={handleChange} />
      </Form.Item>
      <Form.Item label="Calle" name="calle" required>
        <Input placeholder="Calle" name="calle" value={formData.direccion.calle} onChange={handleChange} />
      </Form.Item>
      <Form.Item label="Altura" name="altura" required>
        <Input
          placeholder="Altura"
          name="altura"
          value={formData.direccion.altura || ''}
          onChange={handleChange}
        />
      </Form.Item>
      <Form.Item label="Barrio" name="barrio">
        <Input placeholder="Barrio" name="barrio" value={formData.direccion.barrio} onChange={handleChange} />
      </Form.Item>
      <Form.Item label="Departamento" name="departamento" required>
        <Select
          placeholder="Selecciona un departamento"
          value={formData.direccion.departamento}
          onChange={(value) => handleChange({ target: { name: 'departamento', value } })}
        >
          {departments.map((dep) => (
            <Option key={dep} value={dep}>{dep}</Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="CUIT" name="cuit" required>
        <Input placeholder="CUIT" name="cuit" value={formData.cuit} onChange={handleChange} />
      </Form.Item>
      <Form.Item label="DNI" name="dni" required>
        <Input placeholder="DNI" name="dni" value={formData.dni} onChange={handleChange} />
      </Form.Item>

      <Button type="primary" htmlType="submit" block>Siguiente</Button>
    </>
  ) : (
    <>
      <Form.Item label="Tipo de Bien">
        <Select value={selectedTipo} onChange={setSelectedTipo} placeholder="Seleccionar tipo">
          {tiposDisponibles.map((tipo) => (
            <Option key={tipo} value={tipo}>{tipo}</Option>
          ))}
        </Select>
      </Form.Item>
     
      {selectedTipo === 'teléfono móvil' && imeis.map((imei, index) => (
  <Form.Item
    key={index}
    label={`IMEI ${index + 1}`}
    name={`imei_${index}`}
    rules={[
      { required: true, message: 'El IMEI es obligatorio para teléfonos móviles.' },
      { pattern: /^\d{15}$/, message: 'El IMEI debe tener exactamente 15 dígitos.' },
    ]}
  >
    <Input
      placeholder="Ingrese el IMEI del teléfono móvil"
      value={imei}
      onChange={(e) => handleImeiChange(e.target.value, index)}
    />
  </Form.Item>
))}

      <Form.Item label="Marca">
        <Select value={selectedMarca} onChange={setSelectedMarca} placeholder="Seleccionar marca">
          {marcasDisponibles.map((marca) => (
            <Option key={marca} value={marca}>{marca}</Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="Modelo">
        <Select value={selectedModelo} onChange={setSelectedModelo} placeholder="Seleccionar modelo">
          {modelosDisponibles.map((modelo) => (
            <Option key={modelo} value={modelo}>{modelo}</Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
  label="Precio"
  name="precio"
  rules={[
    { required: true, message: 'El precio es obligatorio.' },
    { type: 'number', min: 0.01, message: 'El precio debe ser mayor a 0.' },
  ]}
>
  <InputNumber placeholder="Precio" style={{ width: '100%' }} />
</Form.Item>

<Form.Item
  label="Cantidad"
  name="cantidad"
  rules={[
    { required: true, message: 'La cantidad es obligatoria.' },
    { type: 'number', min: 1, message: 'La cantidad debe ser al menos 1.' },
  ]}
>
  <InputNumber min={1} placeholder="Cantidad" style={{ width: '100%' }} onChange={handleCantidadChange} />
</Form.Item>


      <Form.Item label="Método de Pago">
        <Select value={metodoPago} onChange={setMetodoPago} placeholder="Seleccionar método de pago">
          <Option value="efectivo">Efectivo</Option>
          <Option value="transferencia">Transferencia</Option>
          <Option value="tarjeta">Tarjeta</Option>
        </Select>
      </Form.Item>
      <Button type="primary" htmlType="submit" block>Confirmar Venta</Button>
    </>
  )}
</Form>
)}
</div>
);
};

export default VenderPage;