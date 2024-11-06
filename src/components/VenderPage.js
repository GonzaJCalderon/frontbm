import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Select, message, Modal, Typography, notification } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBienes, registrarVenta } from '../redux/actions/bienes';
import { addUsuario, checkExistingUser } from '../redux/actions/usuarios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, HomeOutlined, LogoutOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title } = Typography;

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

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

const VenderPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [bienesDinamicos, setBienesDinamicos] = useState([]);
  const [selectedTipo, setSelectedTipo] = useState(null);
  const [selectedMarca, setSelectedMarca] = useState('');
  const [selectedModelo, setSelectedModelo] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector(state => state.bienes);
  const usuario = getUserData();

  const bienesTipos = [...new Set(items.map(bien => bien.tipo))];
  const marcasDisponibles = items.filter(bien => bien.tipo === selectedTipo).map(bien => bien.marca);
  const modelosDisponibles = items.filter(bien => bien.tipo === selectedTipo && bien.marca === selectedMarca).map(bien => bien.modelo);
  const [selectedBienes, setSelectedBienes] = useState([]);
 


  useEffect(() => {
    if (usuario && usuario.id) {
      dispatch(fetchBienes(usuario.id));
    } else {
      console.error('No se pudo obtener el ID del usuario');
    }
  }, [dispatch]);

  const handleSelectBien = (bien) => {
    setSelectedBienes((prev) => [...prev, bien]);
  };
  

  const handleCantidadChange = (value) => {
    const nuevosBienes = Array.from({ length: value }, (_, index) => {
        return {
            id: generateUUID(), // Puedes cambiar esto si el ID viene del bien original
            precio: null,
            descripcion: '', // Inicializa con vacío
            fotos: [],
            bienNumero: index + 1,
            tipo: selectedTipo,
            marca: selectedMarca,
            modelo: selectedModelo,
            // Si tienes un IMEI, puedes agregarlo aquí si es necesario
        };
    });
    setBienesDinamicos(nuevosBienes);
};

  

  const handlePrecioChange = (index, value) => {
    const nuevosBienes = [...bienesDinamicos];
    nuevosBienes[index].precio = value;  // Actualizar el precio del bien correspondiente
    setBienesDinamicos(nuevosBienes);
  };

  const handleFinishStep1 = async (values) => {
    const compradorData = {
      firstName: values.compradorNombre.trim(),
      lastName: values.compradorApellido.trim(),
      email: values.compradorEmail.trim(),
      dniCuit: values.compradorDniCuit.trim(),
      address: values.compradorDireccion.trim(),
      password: 'default_password',
    };
  
    try {
      // Verificar si el usuario ya existe
      const existingUser = await dispatch(checkExistingUser(compradorData.dniCuit, compradorData.email));
      
      if (existingUser && existingUser.usuario) {
        // Si el usuario existe, avanzamos al siguiente paso sin crear uno nuevo
        const updatedFormValues = {
          compradorNombre: existingUser.usuario.nombre,
          compradorApellido: existingUser.usuario.apellido,
          compradorEmail: existingUser.usuario.email,
          compradorDniCuit: existingUser.usuario.dni,
          compradorDireccion: existingUser.usuario.direccion,
          compradorId: existingUser.usuario.id,
        };
        setFormValues(updatedFormValues);
        setStep(2);
      } else {
        // Si el usuario no existe, intenta crear uno nuevo
        const response = await dispatch(addUsuario(compradorData));
        if (response && response.usuario) {
          const updatedFormValues = {
            compradorNombre: response.usuario.nombre,
            compradorApellido: response.usuario.apellido,
            compradorEmail: response.usuario.email,
            compradorDniCuit: response.usuario.dni,
            compradorDireccion: response.usuario.direccion,
            compradorId: response.usuario.id,
          };
          setFormValues(updatedFormValues);
          setStep(2);
        } else {
          message.error('Error inesperado en la respuesta del servidor. Verifica la estructura.');
        }
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Error al verificar o registrar el usuario.');
    }
  };
  

  const handleFinishStep2 = async () => {
    const compradorId = formValues.compradorId;
  
    if (!compradorId) {
      console.error('No se ha encontrado compradorId en el estado');
      return;
    }
  
    // Crear un array para almacenar los datos de cada bien
    const bienesData = [];
  
    // Recorrer los bienes dinámicos para preparar los datos
    for (const bien of bienesDinamicos) {
        // Buscar el bien original para obtener la descripción
        const bienOriginal = items.find(b => b.modelo === selectedModelo && b.marca === selectedMarca);

        if (bienOriginal) {
            bienesData.push({
                bienId: bienOriginal.uuid,  // Aquí usamos el UUID correcto
                compradorId,
                vendedorId: usuario.id,
                precio: bien.precio,
                cantidad: 1,  // Asumiendo que la cantidad es 1, como en tu JSON de ejemplo
                metodoPago: metodoPago,
                descripcion: bienOriginal.descripcion.trim() || 'Sin descripción',  // Usa la descripción del bien
                tipo: bienOriginal.tipo,  // Asegúrate de que esto sea correcto
                marca: bienOriginal.marca,
                modelo: bienOriginal.modelo,
                imei: null,  // Si el IMEI no es necesario, puedes dejarlo como null
            });
        } else {
            message.error(`Bien con ID ${bien.id} no encontrado.`);
        }
    }
  
    const allPricesValid = bienesData.every(bien => bien.precio != null);
    if (!allPricesValid) {
      message.error('Por favor, asegúrate de ingresar un precio para todos los bienes.');
      return;
    }
  
    try {
      await Promise.all(
        bienesData.map(async (ventaData) => {
          console.log('Datos de venta que se envían al backend:', ventaData);
          await dispatch(registrarVenta(ventaData));
        })
      );
  
      notification.success({
        message: 'Venta Registrada',
        description: 'La venta ha sido registrada con éxito.',
      });
  
      setIsModalOpen(false);
      navigate('/userdashboard');
    } catch (error) {
      console.error('Error al registrar la venta:', error);
      message.error('Error al registrar la venta. Por favor, inténtalo de nuevo.');
    }
};

  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginRight: '10px' }}>Volver</Button>
        <Button icon={<HomeOutlined />} onClick={() => navigate('/userdashboard')} style={{ marginRight: '10px' }}>Inicio</Button>
        <Button icon={<LogoutOutlined />} onClick={() => { localStorage.removeItem('userData'); navigate('/home'); }} type="primary">Cerrar Sesión</Button>
      </div>

      <Title level={3}>{step === 1 ? 'Paso 1: Datos del Comprador' : 'Paso 2: Datos del Bien'}</Title>

      {step === 1 && (
        <Form form={form} layout="vertical" onFinish={handleFinishStep1}>
          <Form.Item name="compradorNombre" label="Nombre" rules={[{ required: true, message: 'Por favor ingrese el nombre del comprador' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="compradorApellido" label="Apellido" rules={[{ required: true, message: 'Por favor ingrese el apellido del comprador' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="compradorEmail" label="Email" rules={[{ required: true, message: 'Por favor ingrese el email del comprador' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="compradorDniCuit" label="DNI/CUIT" rules={[{ required: true, message: 'Por favor ingrese el DNI/CUIT del comprador' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="compradorDireccion" label="Dirección" rules={[{ required: true, message: 'Por favor ingrese la dirección del comprador' }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>Continuar</Button>
          </Form.Item>
        </Form>
      )}

      {step === 2 && (
        <Form layout="vertical" onFinish={handleFinishStep2}>
          <Form.Item label="Tipo de Bien">
            <Select onChange={setSelectedTipo} placeholder="Selecciona un tipo">
              {bienesTipos.map((tipo, index) => (
                <Option key={index} value={tipo}>{tipo}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Marca">
            <Select onChange={setSelectedMarca} disabled={!selectedTipo} placeholder="Selecciona una marca">
              {marcasDisponibles.map((marca, index) => (
                <Option key={index} value={marca}>{marca}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Modelo">
            <Select onChange={setSelectedModelo} disabled={!selectedMarca} placeholder="Selecciona un modelo">
              {modelosDisponibles.map((modelo, index) => (
                <Option key={index} value={modelo}>{modelo}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Método de Pago">
            <Select onChange={setMetodoPago} placeholder="Selecciona un método de pago">
              <Option value="tarjeta">Tarjeta</Option>
              <Option value="efectivo">Efectivo</Option>
              <Option value="transferencia">Transferencia</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Cantidad" rules={[{ required: true }]}>
            <InputNumber min={1} max={10} onChange={handleCantidadChange} />
          </Form.Item>

          {bienesDinamicos.map((bien, index) => (
            <div key={bien.id} style={{ marginBottom: '10px' }}>
              <Form.Item label={`Precio del Bien ${bien.bienNumero}`}>
                <InputNumber 
                  min={0} 
                  onChange={(value) => handlePrecioChange(index, value)} 
                  placeholder="Ingresa el precio"
                />
              </Form.Item>
            </div>
          ))}

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>Registrar Venta</Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export default VenderPage;
