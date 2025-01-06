import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Select, message, Typography, Upload, Modal } from 'antd';
import { useDispatch } from 'react-redux';
import { fetchBienes, registrarVenta } from '../redux/actions/bienes';
import { checkExistingUser, addUsuario } from '../redux/actions/usuarios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, LogoutOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title } = Typography;

const departments = [
  'Capital', 'Godoy Cruz', 'Junín', 'Las Heras', 'Maipú', 'Guaymallén', 'Rivadavia',
  'San Martín', 'La Paz', 'Santa Rosa', 'General Alvear', 'Malargüe', 'San Carlos',
  'Tupungato', 'Tunuyán', 'San Rafael', 'Lavalle', 'Luján de Cuyo',
];

const tiposDeBienes = [
  'TV', 'Bicicleta', 'Tablet', 'Teléfono Móvil', 'Cámara Fotográfica', 'Equipo de Audio', 'Notebook'
];


const VenderPage = () => {
  const [formStep1] = Form.useForm();
  const [formStep2] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bienes, setBienes] = useState([]);
  const [compradorId, setCompradorId] = useState(null);

  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [imeis, setImeis] = useState([]);
  const usuario = JSON.parse(localStorage.getItem('userData') || '{}');
  const vendedorId = usuario?.uuid; // UUID del usuario autenticado
  




  useEffect(() => {
    if (!vendedorId) {
      message.error('Debe iniciar sesión como vendedor para continuar.');
      navigate('/login');
    }
  }, [vendedorId, navigate]);

  useEffect(() => {
    const cargarBienes = async () => {
      try {
        const response = await dispatch(fetchBienes(vendedorId));
        if (response.success) {
          setBienes(response.data);
        } else {
          message.error('No se pudieron cargar los bienes.');
        }
      } catch (error) {
        console.error('Error al cargar los bienes:', error);
        message.error('Ocurrió un error al cargar los bienes.');
      }
    };

    cargarBienes();
  }, [dispatch, vendedorId]);

  const handleTipoChange = (tipo) => {
    // Filtrar las marcas según el tipo seleccionado
    const marcasDisponibles = bienes
      .filter((bien) => bien.tipo === tipo)
      .map((bien) => bien.marca);
    setMarcas([...new Set(marcasDisponibles)]); // Eliminar duplicados
    setModelos([]);
    formStep2.setFieldsValue({ marca: undefined, modelo: undefined, bienId: undefined });
  };
  
  const handleMarcaChange = (marca) => {
    // Filtrar los modelos según la marca seleccionada
    const tipoSeleccionado = formStep2.getFieldValue('tipo');
    const modelosDisponibles = bienes
      .filter((bien) => bien.tipo === tipoSeleccionado && bien.marca === marca)
      .map((bien) => bien.modelo);
    setModelos([...new Set(modelosDisponibles)]); // Eliminar duplicados
    formStep2.setFieldsValue({ modelo: undefined, bienId: undefined });
  };
  
  const handleModeloChange = (modelo) => {
    // Obtener el UUID del bien según el tipo, marca y modelo seleccionados
    const tipoSeleccionado = formStep2.getFieldValue('tipo');
    const marcaSeleccionada = formStep2.getFieldValue('marca');
    const bienSeleccionado = bienes.find(
      (bien) => bien.tipo === tipoSeleccionado && bien.marca === marcaSeleccionada && bien.modelo === modelo
    );
  
    if (bienSeleccionado) {
      formStep2.setFieldsValue({ bienId: bienSeleccionado.uuid });
    } else {
      message.warning('No se encontró el bien seleccionado.');
    }
  };
  

  const handleCantidadChange = (cantidad) => {
    const tipoSeleccionado = formStep2.getFieldValue('tipo');
    if (tipoSeleccionado === 'Teléfono Móvil') {
      const nuevosImeis = Array.from({ length: cantidad }, () => '');
      setImeis(nuevosImeis);
    }
  };

  const handleImeiChange = (value, index) => {
    const nuevosImeis = [...imeis];
    nuevosImeis[index] = value;
    setImeis(nuevosImeis);
  };
  
  const handleFinishStep1 = async (values) => {
    setLoading(true);
    try {
      // Verificar si el comprador ya existe
      const existingUserResponse = await dispatch(checkExistingUser({ dni: values.dni, email: values.email }));
      if (existingUserResponse?.existe) {
        setCompradorId(existingUserResponse.usuario.uuid);
        message.success('El comprador ya está registrado y ha sido identificado.');
      } else {
        // Registrar un nuevo comprador
        const newUserResponse = await dispatch(addUsuario(values));
        if (newUserResponse?.uuid) {
          setCompradorId(newUserResponse.uuid);
          // Mostrar un mensaje informando sobre el correo enviado
          message.success('Comprador registrado con éxito. Revisa tu correo para completar el registro.');
        } else {
          throw new Error('No se pudo registrar al comprador.');
        }
      }
      setStep(2); // Pasar al paso 2
    } catch (error) {
      console.error('Error en el registro del comprador:', error);
      message.error('No se pudo procesar el comprador.');
    } finally {
      setLoading(false);
    }
  };
  
  
  
  const handleFinishStep2 = async (values) => {
    setLoading(true);
    try {
      if (!compradorId) {
        throw new Error('El comprador no está identificado.');
      }
  
      const ventaData = {
        compradorId,
        vendedorUuid: vendedorId,
        bienUuid: values.bienId,
        cantidad: values.cantidad,
        metodoPago: values.metodoPago,
        imeis: imeis.filter((imei) => imei.trim()),
      };
  
      console.log('Datos de venta que se envían al backend:', ventaData);
  
      const response = await dispatch(registrarVenta(ventaData));
  
      // Validar la respuesta del servidor
      if (response?.transaccion?.uuid) {
        console.log('Venta registrada con éxito:', response.transaccion);
        message.success('Venta registrada con éxito.');
        navigate('/user/dashboard');
      } else {
        throw new Error(response?.message || 'No se pudo registrar la venta.');
      }
    } catch (error) {
      console.error('Error al registrar la venta:', error.message);
      message.error(error.message || 'Ocurrió un error al registrar la venta.');
    } finally {
      setLoading(false);
    }
  };
  
  
  

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Volver
        </Button>
        <Button
          icon={<LogoutOutlined />}
          onClick={() => {
            localStorage.removeItem('userData');
            navigate('/home');
          }}
        >
          Cerrar Sesión
        </Button>
      </div>

      <Title level={3}>{step === 1 ? 'Paso 1: Datos del Comprador' : 'Paso 2: Datos del Bien'}</Title>

      {step === 1 && (
    <Form layout="vertical" onFinish={handleFinishStep1} form={formStep1}>
    {/* Tipo de Persona */}
    <Form.Item
      label="Tipo de Persona"
      name="tipo"
      rules={[{ required: true, message: 'Por favor, selecciona el tipo de persona.' }]}
    >
      <Select
        placeholder="Selecciona el tipo de persona"
        onChange={(tipo) => formStep1.setFieldsValue({ tipo })}
      >
        <Option value="persona">Persona Humana</Option>
        <Option value="juridica">Persona Jurídica</Option>
      </Select>
    </Form.Item>
  
    {/* Razón Social y CUIT (solo para persona jurídica) */}
    {formStep1.getFieldValue('tipo') === 'juridica' && (
      <>
        <Form.Item
          label="Razón Social"
          name="razonSocial"
          rules={[{ required: true, message: 'Por favor, ingresa la razón social.' }]}
        >
          <Input placeholder="Razón Social" />
        </Form.Item>
        <Form.Item
          label="CUIT"
          name="cuit"
          rules={[{ required: true, message: 'Por favor, ingresa el CUIT.' }]}
        >
          <Input placeholder="CUIT" />
        </Form.Item>
      </>
    )}
  
    {/* Nombre */}
    <Form.Item
      label="Nombre"
      name="nombre"
      rules={[{ required: true, message: 'Por favor, ingresa el nombre.' }]}
    >
      <Input placeholder="Nombre" />
    </Form.Item>
  
    {/* Apellido */}
    <Form.Item
      label="Apellido"
      name="apellido"
      rules={[{ required: true, message: 'Por favor, ingresa el apellido.' }]}
    >
      <Input placeholder="Apellido" />
    </Form.Item>
  
    {/* Correo Electrónico */}
    <Form.Item
      label="Correo Electrónico"
      name="email"
      rules={[
        { required: true, message: 'Por favor, ingresa un correo electrónico.' },
        { type: 'email', message: 'Por favor, ingresa un correo electrónico válido.' },
      ]}
    >
      <Input placeholder="Correo Electrónico" />
    </Form.Item>
  
    {/* Dirección */}
    <Form.Item
      label="Calle"
      name={['direccion', 'calle']}
      rules={[{ required: true, message: 'Por favor, ingresa la calle.' }]}
    >
      <Input placeholder="Calle" />
    </Form.Item>
  
    <Form.Item
      label="Altura"
      name={['direccion', 'altura']}
      rules={[{ required: true, message: 'Por favor, ingresa la altura.' }]}
    >
      <Input placeholder="Altura" />
    </Form.Item>
  
    {/* Barrio opcional */}
    <Form.Item label="Barrio (Opcional)" name={['direccion', 'barrio']}>
      <Input placeholder="Barrio" />
    </Form.Item>
  
    {/* Departamento */}
    <Form.Item
      label="Departamento"
      name={['direccion', 'departamento']}
      rules={[{ required: true, message: 'Por favor, selecciona un departamento.' }]}
    >
      <Select placeholder="Selecciona un departamento">
        {departments.map((department) => (
          <Option key={department} value={department}>
            {department}
          </Option>
        ))}
      </Select>
    </Form.Item>
  
    {/* DNI */}
    <Form.Item
      label="DNI"
      name="dni"
      rules={[{ required: true, message: 'Por favor, ingresa el DNI.' }]}
    >
      <Input placeholder="DNI" />
    </Form.Item>
  
    <Button type="primary" htmlType="submit" block loading={loading}>
      Siguiente
    </Button>
  </Form>
  
      )}

{step === 2 && (
        <Form layout="vertical" onFinish={handleFinishStep2} form={formStep2}>
        <Form.Item
          label="Tipo de Bien"
          name="tipo"
          rules={[{ required: true, message: 'Por favor, selecciona un tipo de bien.' }]}
        >
          <Select onChange={handleTipoChange}>
            {tiposDeBienes.map((tipo) => (
              <Option key={tipo} value={tipo}>
                {tipo}
              </Option>
            ))}
          </Select>
        </Form.Item>
      
        <Form.Item
          label="Marca"
          name="marca"
          rules={[{ required: true, message: 'Por favor, selecciona una marca.' }]}
        >
          <Select onChange={handleMarcaChange} disabled={!marcas.length}>
            {marcas.map((marca) => (
              <Option key={marca} value={marca}>
                {marca}
              </Option>
            ))}
          </Select>
        </Form.Item>
      
        <Form.Item
          label="Modelo"
          name="modelo"
          rules={[{ required: true, message: 'Por favor, selecciona un modelo.' }]}
        >
          <Select onChange={handleModeloChange} disabled={!modelos.length}>
            {modelos.map((modelo) => (
              <Option key={modelo} value={modelo}>
                {modelo}
              </Option>
            ))}
          </Select>
        </Form.Item>
      
        {/* Campo oculto para almacenar el UUID del bien */}
        <Form.Item name="bienId" hidden rules={[{ required: true, message: 'El bien seleccionado es inválido.' }]}>
          <Input />
        </Form.Item>
      
        <Form.Item
          label="Cantidad"
          name="cantidad"
          rules={[{ required: true, type: 'number', min: 1, message: 'Por favor, ingresa una cantidad válida.' }]}
        >
          <InputNumber min={1} onChange={handleCantidadChange} style={{ width: '100%' }} />
        </Form.Item>
      
        {formStep2.getFieldValue('tipo') === 'Teléfono Móvil' &&
          imeis.map((imei, index) => (
            <Form.Item
              key={index}
              label={`IMEI ${index + 1}`}
              rules={[{ required: true, message: 'Por favor, ingresa un IMEI válido.' }]}
            >
              <Input value={imei} onChange={(e) => handleImeiChange(e.target.value, index)} />
            </Form.Item>
          ))}
      
        <Form.Item
          label="Método de Pago"
          name="metodoPago"
          rules={[{ required: true, message: 'Por favor, selecciona un método de pago.' }]}
        >
          <Select>
            <Option value="efectivo">Efectivo</Option>
            <Option value="transferencia">Transferencia</Option>
            <Option value="tarjeta">Tarjeta</Option>
          </Select>
        </Form.Item>
      
        <Button type="primary" htmlType="submit" block loading={loading}>
          Registrar Venta
        </Button>
      </Form>
      
      )}
    </div>
  );
};

export default VenderPage;