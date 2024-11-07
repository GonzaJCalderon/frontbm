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

  useEffect(() => {
    if (usuario && usuario.id) {
      dispatch(fetchBienes(usuario.id));
    } else {
      console.error('No se pudo obtener el ID del usuario');
    }
  }, [dispatch]);

  const handleSelectBien = (bien) => {
    setBienesDinamicos(prev => [...prev, bien]);
  };

  const handleCantidadChange = (value) => {
    const nuevosBienes = Array.from({ length: value }, (_, index) => {
      return {
        id: generateUUID(),
        precio: null,
        descripcion: '',
        fotos: [],
        bienNumero: index + 1,
        tipo: selectedTipo,
        marca: selectedMarca,
        modelo: selectedModelo,
      };
    });
    setBienesDinamicos(nuevosBienes);
  };

  const handlePrecioChange = (index, value) => {
    const nuevosBienes = [...bienesDinamicos];
    nuevosBienes[index].precio = value;
    setBienesDinamicos(nuevosBienes);
  };

  const handleFinishStep1 = async (values) => {
    // Validar que todos los campos obligatorios estén completos
    const { compradorNombre, compradorApellido, compradorEmail, compradorDniCuit, compradorDireccion } = values;
  
    // Verificar que los campos obligatorios no estén vacíos
    if (!compradorNombre || !compradorApellido || !compradorEmail || !compradorDniCuit) {
      message.error('Por favor, completa todos los campos obligatorios.');
      return;
    }
  
    // Verificar si la dirección está completa
    console.log('Datos de la dirección:', compradorDireccion); // Verifica qué valores se están enviando
  
    if (!compradorDireccion || !compradorDireccion.calle || !compradorDireccion.numero || !compradorDireccion.ciudad) {
      message.error('Por favor, ingresa todos los campos de la dirección.');
      return;
    }
  
    const compradorData = {
      firstName: compradorNombre.trim(),
      lastName: compradorApellido.trim(),
      email: compradorEmail.trim(),
      dniCuit: compradorDniCuit.trim(),
      direccion: {
        calle: compradorDireccion.calle.trim(),
        numero: compradorDireccion.numero.toString().trim(),
        ciudad: compradorDireccion.ciudad.trim(),
      },
      password: 'default_password', // Contraseña predeterminada
    };
  
    console.log('Datos enviados:', compradorData);
  
    try {
      // Verificar si el usuario ya existe
      const existingUser = await dispatch(checkExistingUser(compradorData.dniCuit, compradorData.email));
  
      if (existingUser && existingUser.usuario) {
        // Si el usuario existe, actualizar el formulario con los datos existentes
        const updatedFormValues = {
          compradorNombre: existingUser.usuario.nombre || '',
          compradorApellido: existingUser.usuario.apellido || '',
          compradorEmail: existingUser.usuario.email || '',
          compradorDniCuit: existingUser.usuario.dni || '',
          compradorDireccion: {
            calle: existingUser.usuario.direccion?.calle || '',
            numero: existingUser.usuario.direccion?.numero || '',
            ciudad: existingUser.usuario.direccion?.ciudad || '',
          },
          compradorId: existingUser.usuario.id || '',
        };
        setFormValues(updatedFormValues);
        setStep(2);
      } else {
        // Si el usuario no existe, enviar los datos para registrar el nuevo usuario
        const response = await dispatch(addUsuario(compradorData));
        if (response && response.usuario) {
          // Si la creación fue exitosa, actualizar los valores del formulario con los nuevos datos
          const updatedFormValues = {
            compradorNombre: response.usuario.nombre,
            compradorApellido: response.usuario.apellido,
            compradorEmail: response.usuario.email,
            compradorDniCuit: response.usuario.dni,
            compradorDireccion: {
              calle: response.usuario.direccion?.calle,
              numero: response.usuario.direccion?.numero,
              ciudad: response.usuario.direccion?.ciudad,
            },
            compradorId: response.usuario.id,
          };
          setFormValues(updatedFormValues);
          setStep(2);
        } else {
          message.error('Error inesperado al crear el usuario. Intenta nuevamente.');
        }
      }
    } catch (error) {
      message.error(error.response?.data?.mensaje || 'Error al verificar o registrar el usuario.');
    }
  };
  
  
  
  

  const handleFinishStep2 = async () => {
    const compradorId = formValues.compradorId;

    if (!compradorId) {
      console.error('No se ha encontrado compradorId en el estado');
      return;
    }

    const bienesData = [];

    for (const bien of bienesDinamicos) {
      const bienOriginal = items.find(b => b.modelo === selectedModelo && b.marca === selectedMarca);

      if (bienOriginal) {
        if (!bien.precio) {
          message.error(`Por favor, ingresa un precio para el Bien ${bien.bienNumero}`);
          return;
        }

        bienesData.push({
          bienId: bienOriginal.uuid,
          compradorId,
          vendedorId: usuario.id,
          precio: bien.precio,
          cantidad: 1,
          metodoPago: metodoPago,
          descripcion: bienOriginal.descripcion.trim() || 'Sin descripción',
          tipo: bienOriginal.tipo,
          marca: bienOriginal.marca,
          modelo: bienOriginal.modelo,
          imei: null,
        });
      } else {
        message.error(`Bien con modelo ${selectedModelo} y marca ${selectedMarca} no encontrado.`);
        return;
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
        <Form form={form} layout="vertical" onFinish={handleFinishStep1} initialValues={formValues}>
          <Form.Item name="compradorNombre" label="Nombre Completo" rules={[{ required: true, message: 'Por favor ingrese el nombre del comprador' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="compradorApellido" label="Apellido" rules={[{ required: true, message: 'Por favor ingrese el apellido del comprador' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="compradorEmail" label="Correo Electrónico" rules={[{ required: true, message: 'Por favor ingrese el correo electrónico del comprador' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="compradorDniCuit" label="DNI / CUIT" rules={[{ required: true, message: 'Por favor ingrese el DNI o CUIT del comprador' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Dirección del Comprador">
  <Input.Group compact>
    <Form.Item
      name={['compradorDireccion', 'calle']}  // Asegúrate de usar la sintaxis correcta
      style={{ width: '50%' }}
      rules={[{ required: true, message: 'Por favor ingresa la calle' }]}
    >
      <Input placeholder="Calle" />
    </Form.Item>
    <Form.Item
      name={['compradorDireccion', 'numero']}  // Asegúrate de usar la sintaxis correcta
      style={{ width: '50%' }}
      rules={[{ required: true, message: 'Por favor ingresa el número de la calle' }]}
    >
      <InputNumber placeholder="Número" style={{ width: '100%' }} />
    </Form.Item>
  </Input.Group>
  <Form.Item
    name={['compradorDireccion', 'ciudad']}  // Asegúrate de usar la sintaxis correcta
    rules={[{ required: true, message: 'Por favor ingresa la ciudad' }]}
  >
    <Input placeholder="Ciudad" />
  </Form.Item>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Siguiente
            </Button>
          </Form.Item>
        </Form>
      )}

      {step === 2 && (
        <div>
          <Title level={4}>Seleccionar un Bien para la Venta</Title>
          <Form form={form} layout="vertical" onFinish={handleFinishStep2}>
            <Form.Item label="Tipo de Bien">
              <Select
                onChange={setSelectedTipo}
                value={selectedTipo}
                placeholder="Seleccione el tipo de bien"
                style={{ width: '100%' }}
              >
                {bienesTipos.map(tipo => <Option key={tipo} value={tipo}>{tipo}</Option>)}
              </Select>
            </Form.Item>
            {selectedTipo && (
              <Form.Item label="Marca">
                <Select
                  onChange={setSelectedMarca}
                  value={selectedMarca}
                  placeholder="Seleccione la marca"
                  style={{ width: '100%' }}
                >
                  {marcasDisponibles.map(marca => <Option key={marca} value={marca}>{marca}</Option>)}
                </Select>
              </Form.Item>
            )}
            {selectedMarca && (
              <Form.Item label="Modelo">
                <Select
                  onChange={setSelectedModelo}
                  value={selectedModelo}
                  placeholder="Seleccione el modelo"
                  style={{ width: '100%' }}
                >
                  {modelosDisponibles.map(modelo => <Option key={modelo} value={modelo}>{modelo}</Option>)}
                </Select>
              </Form.Item>
            )}
            {selectedModelo && (
              <div>
                <Button onClick={() => handleSelectBien({ tipo: selectedTipo, marca: selectedMarca, modelo: selectedModelo })}>
                  Agregar Bien
                </Button>
                <Form.Item label="Cantidad">
                  <InputNumber
                    min={1}
                    max={10}
                    onChange={handleCantidadChange}
                    style={{ width: '100%' }}
                    value={bienesDinamicos.length}
                  />
                </Form.Item>

                {bienesDinamicos.map((bien, index) => (
                  <div key={bien.id} style={{ marginBottom: '10px' }}>
                    <div>
                      <span>Bien #{bien.bienNumero}</span>
                      <InputNumber
                        value={bien.precio}
                        onChange={(value) => handlePrecioChange(index, value)}
                        placeholder="Precio"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                ))}

                <Form.Item label="Método de Pago">
                  <Select
                    value={metodoPago}
                    onChange={setMetodoPago}
                    style={{ width: '100%' }}
                    placeholder="Selecciona el método de pago"
                  >
                    <Option value="efectivo">Efectivo</Option>
                    <Option value="transferencia">Transferencia</Option>
                    <Option value="tarjeta">Tarjeta</Option>
                  </Select>
                </Form.Item>

                <Button type="primary" htmlType="submit" block loading={loading}>
                  Confirmar Venta
                </Button>
              </div>
            )}
          </Form>
        </div>
      )}
    </div>
  );
};

export default VenderPage;
