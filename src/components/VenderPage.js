import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Select, message, Typography, notification, Radio } from 'antd';
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

const VenderPage = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector(state => state.bienes);
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

  const [bienesDinamicos, setBienesDinamicos] = useState([]);
  const [selectedTipo, setSelectedTipo] = useState(null);
  const [selectedMarca, setSelectedMarca] = useState('');
  const [selectedModelo, setSelectedModelo] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [step, setStep] = useState(1);

  const bienesTipos = [...new Set(items.map(bien => bien.tipo))];
  const marcasDisponibles = items.filter(bien => bien.tipo === selectedTipo).map(bien => bien.marca);
  const modelosDisponibles = items.filter(bien => bien.tipo === selectedTipo && bien.marca === selectedMarca).map(bien => bien.modelo);

  useEffect(() => {
    if (usuario && usuario.id) {
      dispatch(fetchBienes(usuario.id));
    }
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['calle', 'altura', 'barrio', 'departamento'].includes(name)) {
      setFormData({ ...formData, direccion: { ...formData.direccion, [name]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFinishStep1 = async () => {
    try {
      const existingUser = await dispatch(checkExistingUser(formData.dni, formData.email));
      if (existingUser && existingUser.usuario) {
        setFormData({
          ...existingUser.usuario,
          compradorId: existingUser.usuario.id,
          direccion: {
            calle: existingUser.usuario.direccion?.calle || '',
            altura: existingUser.usuario.direccion?.numero || '',
            departamento: existingUser.usuario.direccion?.departamento || '',
          }
        });
        setStep(2);
      } else {
        const newUser = await dispatch(addUsuario(formData));
        if (newUser && newUser.usuario) {
          setFormData({
            ...newUser.usuario,
            compradorId: newUser.usuario.id,
            direccion: {
              calle: newUser.usuario.direccion?.calle,
              altura: newUser.usuario.direccion?.numero,
              departamento: newUser.usuario.direccion?.departamento,
            }
          });
          setStep(2);
        } else {
          message.error('Error en el registro del usuario.');
        }
      }
    } catch (error) {
      message.error(error.message || 'Error en la verificación del usuario.');
    }
  };
  
  const handleCantidadChange = (value) => {
    const nuevosBienes = Array.from({ length: value }, (_, index) => ({
      id: `bien-${index}`,
      precio: null,
      descripcion: '',
      bienNumero: index + 1,
      tipo: selectedTipo,
      marca: selectedMarca,
      modelo: selectedModelo,
    }));
    setBienesDinamicos(nuevosBienes);
  };

  const handlePrecioChange = (index, value) => {
    const nuevosBienes = [...bienesDinamicos];
    nuevosBienes[index].precio = value;
    setBienesDinamicos(nuevosBienes);
  };

  const handleFinishStep2 = async () => {
    if (!formData.compradorId) {
      return message.error('No se pudo obtener el ID del comprador. Intente nuevamente.');
    }
  
    const bienesData = bienesDinamicos.map(bien => ({
      bienId: items.find(b => b.modelo === selectedModelo && b.marca === selectedMarca)?.uuid,
      compradorId: formData.compradorId,
      vendedorId: usuario.id,
      precio: bien.precio,
      cantidad: 1,
      metodoPago,
      descripcion: items.find(b => b.modelo === selectedModelo && b.marca === selectedMarca)?.descripcion || 'Sin descripción',
      tipo: selectedTipo,
      marca: selectedMarca,
      modelo: selectedModelo,
    }));
  
    if (bienesData.some(bien => !bien.precio)) {
      return message.error('Por favor, ingresa un precio para todos los bienes.');
    }
  
    try {
      await Promise.all(bienesData.map(ventaData => dispatch(registrarVenta(ventaData))));
      notification.success({ message: 'Venta Registrada', description: 'La venta ha sido registrada con éxito.' });
      navigate('/userdashboard');
    } catch (error) {
      console.error('Error al registrar la venta:', error);
      message.error('Error al registrar la venta. Intenta nuevamente.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={3}>{step === 1 ? 'Paso 1: Datos del Comprador' : 'Paso 2: Datos del Bien'}</Title>

      {step === 1 ? (
        <Form layout="vertical" onFinish={handleFinishStep1}>
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
            <Input placeholder="Altura" name="altura" value={formData.direccion.altura} onChange={handleChange} />
          </Form.Item>
          <Form.Item label="Barrio" name="barrio">
            <Input placeholder="Barrio" name="barrio" value={formData.direccion.barrio} onChange={handleChange} />
          </Form.Item>
          <Form.Item label="Departamento" name="departamento" required>
            <Select placeholder="Selecciona un departamento" value={formData.direccion.departamento} onChange={(value) => handleChange({ target: { name: 'departamento', value } })}>
              {departments.map(dep => <Option key={dep} value={dep}>{dep}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="CUIT" name="cuit" required>
            <Input placeholder="CUIT" name="cuit" value={formData.cuit} onChange={handleChange} />
          </Form.Item>
          <Form.Item label="DNI" name="dni" required>
            <Input placeholder="DNI" name="dni" value={formData.dni} onChange={handleChange} />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>Siguiente</Button>
        </Form>
      ) : (
        <Form layout="vertical" onFinish={handleFinishStep2}>
          <Form.Item label="Tipo de Bien">
            <Select value={selectedTipo} onChange={setSelectedTipo} placeholder="Seleccionar tipo">
              {bienesTipos.map(tipo => <Option key={tipo} value={tipo}>{tipo}</Option>)}
            </Select>
          </Form.Item>
          {selectedTipo && (
            <Form.Item label="Marca">
              <Select value={selectedMarca} onChange={setSelectedMarca} placeholder="Seleccionar marca">
                {marcasDisponibles.map(marca => <Option key={marca} value={marca}>{marca}</Option>)}
              </Select>
            </Form.Item>
          )}
          {selectedMarca && (
            <Form.Item label="Modelo">
              <Select value={selectedModelo} onChange={setSelectedModelo} placeholder="Seleccionar modelo">
                {modelosDisponibles.map(modelo => <Option key={modelo} value={modelo}>{modelo}</Option>)}
              </Select>
            </Form.Item>
          )}
          <Form.Item label="Cantidad">
            <InputNumber min={1} max={10} onChange={handleCantidadChange} value={bienesDinamicos.length} />
          </Form.Item>
          {bienesDinamicos.map((bien, index) => (
            <Form.Item key={bien.id} label={`Precio para Bien #${bien.bienNumero}`}>
              <InputNumber placeholder="Precio" onChange={(value) => handlePrecioChange(index, value)} />
            </Form.Item>
          ))}
          <Form.Item label="Método de Pago">
            <Select value={metodoPago} onChange={setMetodoPago} placeholder="Seleccionar método de pago">
              <Option value="efectivo">Efectivo</Option>
              <Option value="transferencia">Transferencia</Option>
              <Option value="tarjeta">Tarjeta</Option>
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Confirmar Venta</Button>
        </Form>
      )}
    </div>
  );
};

export default VenderPage;
