import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Select, message, Typography, notification, Radio, Modal, Upload } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBienes, addBien, registrarCompra, actualizarStockPorParametros } from '../redux/actions/bienes';
import { addUsuario, checkExistingUser } from '../redux/actions/usuarios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, HomeOutlined, LogoutOutlined, UploadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title } = Typography;

// Utilidad para generar UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const departments = [
  'Capital', 'Godoy Cruz', 'Junín', 'Las Heras', 'Maipú', 'Guaymallén', 'Rivadavia',
  'San Martín', 'La Paz', 'Santa Rosa', 'General Alvear', 'Malargüe', 'San Carlos',
  'Tupungato', 'Tunuyán', 'San Rafael', 'Lavalle', 'Luján de Cuyo', ''
];
const tiposDeBienes = [
  'bicicleta', 'TV', 'equipo de audio', 
  'cámara fotográfica', 'laptop', 'tablet', 'teléfono'
];


const ComprarPage = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items = [] } = useSelector((state) => state.bienes);
  // Default a lista vacía

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    direccion: { calle: '', altura: '', barrio: '', departamento: '' },
    cuit: '',
    dni: '',
    tipo: 'persona',
    razonSocial: '',
    id: null // Asegurar que id esté presente en el estado inicial
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [newBienDetails, setNewBienDetails] = useState([]);
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedMarca, setSelectedMarca] = useState('');
  const [selectedModelo, setSelectedModelo] = useState('');


  const [nuevaMarca, setNuevaMarca] = useState('');
  const [nuevoModelo, setNuevoModelo] = useState('');
  const [selectedMetodoPago, setSelectedMetodoPago] = useState('');

  // Obtener tipos de bienes, marcas y modelos disponibles
  const bienesTipos = items?.length > 0
  ? [...new Set(items.filter((bien) => bien && bien.tipo).map((bien) => bien.tipo))]
  : [];

  const marcasDisponibles = items?.length > 0 && selectedTipo
  ? items.filter((bien) => bien?.tipo === selectedTipo).map((bien) => bien.marca)
  : [];


const marcasUnicas = [...new Set(marcasDisponibles)];

const modelosDisponibles = items?.length > 0 && selectedTipo && selectedMarca
? items.filter((bien) => bien?.tipo === selectedTipo && bien?.marca === selectedMarca).map((bien) => bien.modelo)
: [];

  

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList); // Actualizar el estado de fileList
  };

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('userData') || '{}');
    if (usuario && usuario.id) {
      dispatch(fetchBienes(usuario.id));
    }
  }, [dispatch]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (['calle', 'altura', 'barrio', 'departamento'].includes(name)) {
      setFormData((prevData) => ({
        ...prevData,
        direccion: {
          ...prevData.direccion,
          [name]: value || '', // Asegura un valor predeterminado
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value || '', // Asegura un valor predeterminado
      }));
    }
  };

  const handleFinishStep1 = async () => {
    try {
      // Verificamos si el usuario ya existe con DNI y email
      const existingUser = await dispatch(checkExistingUser(formData.dni, formData.email));
      if (existingUser && existingUser.usuario) {
        setFormData(prevData => ({
          ...prevData,
          ...existingUser.usuario,
          direccion: {
            ...prevData.direccion,
            ...existingUser.usuario.direccion,
          },
          id: existingUser.usuario.id, 
        }));
        setStep(2);
        message.success('Usuario encontrado, procediendo con la compra.');
      } else {
        const newUser = await dispatch(addUsuario(formData));
        if (newUser && newUser.usuario) {
          setFormData(prevData => ({
            ...prevData,
            ...newUser.usuario,
            direccion: {
              ...prevData.direccion,
              ...newUser.usuario.direccion,
            },
            id: newUser.usuario.id,
          }));
          setStep(2);
          message.success('Usuario registrado correctamente, procediendo con la compra.');
        } else {
          message.error('Error en el registro del usuario.');
        }
      }
    } catch (error) {
      console.error('Error en handleFinishStep1:', error);
      message.error(`Error en la verificación del usuario: ${error.message}`);
    }
  };
  
  const handleFinishStep2 = async () => {
    try {
      setLoading(true);
  
      const tipo = selectedTipo;
      const marca = selectedMarca || nuevaMarca;
      const modelo = selectedModelo || nuevoModelo; // Asegúrate de definir modelo aquí
      const descripcion = form.getFieldValue('bienDescripcion') || '';
      const precio = parseFloat(form.getFieldValue('bienPrecio'));
      const cantidad = parseInt(form.getFieldValue('bienStock'), 10);
      const metodoPago = selectedMetodoPago;
      const userData = JSON.parse(localStorage.getItem('userData')) || {};
      const compradorId = userData.id;
      const vendedorId = formData.id;
      const imei = tipo === 'teléfono' ? form.getFieldValue('imei') : null;
  
      if (!tipo || !marca || !modelo || isNaN(precio) || isNaN(cantidad) || !metodoPago) {
        message.error('Por favor, complete todos los campos obligatorios.');
        return;
      }
  
      const compraData = {
        tipo,
        marca,
        modelo,
        descripcion,
        precio,
        cantidad,
        metodoPago,
        vendedorId,
        compradorId,
        imei,
      };
  
      // Enviar datos al backend
      const response = await dispatch(registrarCompra(compraData));
  
      if (response?.success || response?.mensaje.includes('Compra registrada con éxito')) {
        // Mostrar notificación de éxito
        notification.success({
          message: 'Compra exitosa',
          description: `La compra del bien "${modelo}" se registró correctamente.`,
          duration: 3,
        });
  
        // Redirigir al dashboard después de mostrar el mensaje
        setTimeout(() => {
          navigate('/userdashboard');
        }, 3000);
      } else {
        throw new Error(response?.mensaje || 'Error desconocido.');
      }
    } catch (error) {
      console.error('Error en handleFinishStep2:', error);
      if (error.message.includes('Compra registrada con éxito')) {
        notification.success({
          message: 'Compra exitosa',
          description: `La compra del bien se registró correctamente.`,
          duration: 3,
        });
        setTimeout(() => {
          navigate('/userdashboard');
        }, 3000);
      } else {
        message.error(error.message || 'Error al procesar la compra.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  
  
 
  

  const handleConfirm = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData || !userData.id) {
        message.error('Usuario no autenticado. Por favor, inicie sesión.');
        return;
      }
  
      for (const bien of newBienDetails) {
        try {
          const compraData = {
            bienId: bien.id, // Asumiendo que este ID viene del backend
            compradorId: userData.id,
            vendedorId: bien.vendedorId, // Esto debe venir con el bien seleccionado
            precio: bien.precio,
            cantidad: bien.cantidad,
            metodoPago: bien.metodoPago,
          };
  
          // Registrar compra en el backend
          const response = await dispatch(registrarCompra(compraData));
          if (response.success) {
            message.success(`Compra registrada: ${bien.modelo}`);
          } else {
            throw new Error(response.error || 'Error desconocido');
          }
        } catch (error) {
          console.error(`Error al procesar la compra del bien ${bien.modelo}:`, error);
          message.error(`Error en el bien ${bien.modelo}: ${error.message}`);
        }
      }
  
      notification.success({ message: 'Todas las compras han sido procesadas con éxito.' });
      navigate('/userdashboard');
    } catch (error) {
      console.error('Error general al registrar la compra:', error);
      message.error('Error al registrar la compra. Por favor, inténtelo de nuevo.');
    }
  };
  
  

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginRight: '10px' }}>Volver</Button>
        <Button icon={<HomeOutlined />} onClick={() => navigate('/userdashboard')} style={{ marginRight: '10px' }}>Inicio</Button>
        <Button icon={<LogoutOutlined />} onClick={() => { localStorage.removeItem('userData'); navigate('/home'); }} type="primary">Cerrar Sesión</Button>
      </div>

      <Title level={3}>{step === 1 ? 'Paso 1: Datos del Vendedor' : 'Paso 2: Datos del Bien'}</Title>

      {step === 1 && (
        <Form layout="vertical" onFinish={handleFinishStep1}>
        <Form.Item label="Tipo de Sujeto" name="tipo" required>
  <Radio.Group
    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
    value={formData.tipo || 'persona'}
  >
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
          <Form.Item label="DNI" name="dni" required>
            <Input placeholder="DNI" name="dni" value={formData.dni} onChange={handleChange} />
          </Form.Item>
          <Form.Item label="CUIT" name="cuit" required>
            <Input placeholder="CUIT" name="cuit" value={formData.cuit} onChange={handleChange} />
          </Form.Item>

          <Title level={4}>Dirección</Title>
          <Form.Item label="Calle" name="calle" required>
            <Input placeholder="Calle" name="calle" value={formData.direccion.calle} onChange={handleChange} />
          </Form.Item>
          <Form.Item label="Altura" name="altura" required>
            <Input placeholder="Altura" name="altura" value={formData.direccion.altura} onChange={handleChange} />
          </Form.Item>
          <Form.Item label="Barrio" name="barrio" required>
            <Input placeholder="Barrio" name="barrio" value={formData.direccion.barrio} onChange={handleChange} />
          </Form.Item>
          <Form.Item label="Departamento" name="departamento" required>
            <Select onChange={(value) => setFormData({ ...formData, direccion: { ...formData.direccion, departamento: value } })} value={formData.direccion.departamento}>
              {departments.map(department => (
                <Option key={department} value={department}>{department}</Option>
              ))}
            </Select>
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>Siguiente</Button>
        </Form>
      )}

{step === 2 && (
  <Form form={form} layout="vertical" onFinish={handleFinishStep2}>
  {/* Tipo de Bien */}
  <Form.Item label="Tipo de Bien" name="tipoBien" required>
  <Select
  placeholder="Seleccionar tipo de bien"
  value={selectedTipo || undefined}
  onChange={(value) => setSelectedTipo(value)}
>
  {tiposDeBienes.map((tipo) => (
    <Option key={tipo} value={tipo}>{tipo}</Option>
  ))}
</Select>

  </Form.Item>

  {/* IMEI para teléfonos */}
  {selectedTipo === 'teléfono' && (
      <Form.Item
          label="IMEI"
          name="imei"
          rules={[
              { required: true, message: 'El IMEI es obligatorio para teléfonos.' },
              { pattern: /^\d{15}$/, message: 'El IMEI debe tener exactamente 15 dígitos.' }
          ]}
      >
          <Input placeholder="Ingrese el IMEI del teléfono" />
      </Form.Item>
  )}

  {/* Marca */}
  <Form.Item label="Marca" name="bienMarca" required>
  <Select
    placeholder="Seleccionar o agregar nueva marca"
    value={selectedMarca || nuevaMarca}
    onChange={setSelectedMarca}
    dropdownRender={(menu) => (
        <>
            {menu}
            <div style={{ display: 'flex', padding: 8 }}>
                <Input
                    style={{ flex: 'auto' }}
                    placeholder="Nueva marca"
                    value={nuevaMarca}
                    onChange={(e) => setNuevaMarca(e.target.value)}
                />
                <Button type="text" onClick={() => message.success('Marca agregada')}>Agregar</Button>
            </div>
        </>
    )}
>
{marcasUnicas.map((marca) => (
    <Option key={marca} value={marca}>{marca}</Option>
))}

</Select>

  </Form.Item>

  {/* Modelo */}
  <Form.Item label="Modelo" name="bienModelo" required>
      <Select
          placeholder="Seleccionar o agregar nuevo modelo"
          value={selectedModelo || nuevoModelo}
          onChange={setSelectedModelo}
          dropdownRender={(menu) => (
              <>
                  {menu}
                  <div style={{ display: 'flex', padding: 8 }}>
                      <Input
                          style={{ flex: 'auto' }}
                          placeholder="Nuevo modelo"
                          value={nuevoModelo}
                          onChange={(e) => setNuevoModelo(e.target.value)}
                      />
                      <Button type="text" onClick={() => message.success('Modelo agregado')}>Agregar</Button>
                  </div>
              </>
          )}
      >
          {modelosDisponibles.map((modelo) => (
              <Option key={modelo} value={modelo}>{modelo}</Option>
          ))}
      </Select>
  </Form.Item>

  {/* Descripción */}
  <Form.Item label="Descripción" name="bienDescripcion" required>
      <Input.TextArea placeholder="Descripción del bien" />
  </Form.Item>

  {/* Precio */}
  <Form.Item label="Precio" name="bienPrecio" required>
      <InputNumber style={{ width: '100%' }} placeholder="Precio" />
  </Form.Item>

  {/* Stock */}
  <Form.Item label="Stock" name="bienStock" required>
      <InputNumber style={{ width: '100%' }} placeholder="Cantidad" />
  </Form.Item>

  {/* Fotos */}
  <Form.Item label="Fotos del Bien" name="fotos">
      <Upload
          action={null}
          listType="picture-card"
          fileList={fileList}
          onChange={handleFileChange}
          beforeUpload={() => false} // Evita subida automática
      >
          <Button icon={<UploadOutlined />}>Subir Archivos</Button>
      </Upload>
  </Form.Item>

  {/* Método de Pago */}
  <Form.Item label="Método de Pago" name="metodoPago" required>
      <Select
          placeholder="Seleccionar método de pago"
          value={selectedMetodoPago}
          onChange={(value) => setSelectedMetodoPago(value)}
      >
          <Option value="tarjeta">Tarjeta de Crédito/Débito</Option>
          <Option value="efectivo">Efectivo</Option>
          <Option value="transferencia">Transferencia Bancaria</Option>
      </Select>
  </Form.Item>

  {/* Botón de envío */}
  <Button type="primary" htmlType="submit" block loading={loading}>Registrar Bien</Button>
</Form>

)}


      <Modal
        title="Confirmar compra"
        visible={isModalOpen}
        onOk={handleConfirm}
        onCancel={() => setIsModalOpen(false)}
        okText="Confirmar"
        cancelText="Cancelar"
      >
        <p>¿Estás seguro de que deseas realizar la compra de los bienes registrados?</p>
      </Modal>
    </div>
  );
};

export default ComprarPage;
