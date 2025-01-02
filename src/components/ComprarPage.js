import axios from 'axios'; 
import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Select, message, Typography, Upload, Modal } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBienes, registrarCompra,agregarMarca, agregarModelo } from '../redux/actions/bienes';
import { checkExistingUser, registerUsuarioPorTercero } from '../redux/actions/usuarios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, LogoutOutlined } from '@ant-design/icons'
import api from '../redux/axiosConfig'; // Importa la instancia configurada


;

const { Option } = Select;
const { Title } = Typography;

const departments = [
  'Capital', 'Godoy Cruz', 'Junín', 'Las Heras', 'Maipú', 'Guaymallén', 'Rivadavia',
  'San Martín', 'La Paz', 'Santa Rosa', 'General Alvear', 'Malargüe', 'San Carlos',
  'Tupungato', 'Tunuyán', 'San Rafael', 'Lavalle', 'Luján de Cuyo'
];

const tiposDeBienesIniciales = [
  'bicicleta', 'TV', 'equipo de audio', 'cámara fotográfica', 'laptop', 'tablet', 'teléfono movil'
];

const ComprarPage = () => {
  const [formStep1] = Form.useForm();
  const [formStep2] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [tiposDeBienes] = useState(tiposDeBienesIniciales);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const handleCancel = () => {
    setIsVisible(false); // Cierra el Modal
  };
  const showModal = () => {
    setIsVisible(true); // Abre el Modal
  };

  const [vendedorId, setVendedorId] = useState(null);
  
  // Estado para manejar nuevas marcas y modelos
  const [nuevaMarca, setNuevaMarca] = useState('');
  const [nuevoModelo, setNuevoModelo] = useState('');
  const [error, setError] = useState(null); // Define el estado para manejar errores
  const [bienes, setBienes] = useState([]); // Si también necesitas manejar los bienes directamente
  console.log('Bienes desde Redux:', bienes); // Agregar log


  const token = localStorage.getItem('authToken');
console.log('Token de autenticación:', token);

  const usuario = JSON.parse(localStorage.getItem('userData') || '{}');

  const uuid = JSON.parse(localStorage.getItem('userData') || '{}').uuid;

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      message.error('Debe iniciar sesión para continuar.');
      navigate('/login');
    }
  }, []);
  
  useEffect(() => {
    const cargarBienes = async () => {
      if (!uuid) {
        console.error('El UUID del usuario no está disponible.');
        return;
      }
  
      try {
        const response = await dispatch(fetchBienes(uuid));
        console.log('Respuesta de fetchBienes:', response);
  
        if (!response.success) {
          console.error('Error desde el backend:', response.error);
          setError(response.error); 
          return;
        }
  
        console.log('Bienes cargados:', response.data);
        setBienes(response.data); 
      } catch (error) {
        console.error('Error en la llamada fetchBienes:', error);
        setError('Error al cargar los bienes.');
      }
    };
  
    cargarBienes();
  }, [dispatch, uuid]);
  
  ;
  const handleTipoChange = async (tipo) => {
    if (!tipo) {
        message.warning('Selecciona un tipo para cargar las marcas.');
        return;
    }

    try {
        const response = await api.get(`/bienes/bienes/marcas?tipo=${tipo}`);
        if (response.status === 200 && response.data.marcas) {
            console.log('Marcas cargadas:', response.data.marcas);
            setMarcas(response.data.marcas);
            formStep2.setFieldsValue({ marca: undefined });
        } else {
            setMarcas([]);
        }
    } catch (error) {
        console.error('Error al cargar las marcas:', error);
        message.error('No se pudieron cargar las marcas para este tipo.');
    }
};

const handleMarcaChange = async (marca) => {
  const tipoSeleccionado = formStep2.getFieldValue('tipo');
  if (!tipoSeleccionado || !marca) {
      setModelos([]);
      return;
  }

  try {
      const response = await api.get(`/bienes/bienes/modelos?tipo=${tipoSeleccionado}&marca=${marca}`);
      if (response.status === 200 && response.data.modelos) {
          console.log('Modelos cargados:', response.data.modelos);
          setModelos(response.data.modelos);
          formStep2.setFieldsValue({ modelo: undefined });
      } else {
          setModelos([]);
      }
  } catch (error) {
      console.error('Error al cargar los modelos:', error);
      message.error('No se pudieron cargar los modelos para esta marca.');
  }
};

  
  
  
  
const agregarNuevaMarca = async () => {
  if (!nuevaMarca.trim()) {
      message.warning('La marca no puede estar vacía.');
      return;
  }

  const tipoSeleccionado = formStep2.getFieldValue('tipo');
  if (!tipoSeleccionado) {
      message.warning('Selecciona un tipo de bien antes de agregar una marca.');
      return;
  }

  try {
      const response = await api.post('/bienes/bienes/marcas', {
          tipo: tipoSeleccionado,
          marca: nuevaMarca.trim(),
      });

      if (response.status === 201) {
          message.success(`Marca "${nuevaMarca}" registrada con éxito.`);
          setMarcas((prevMarcas) => [...prevMarcas, nuevaMarca.trim()]);
          formStep2.setFieldsValue({ marca: nuevaMarca.trim() });
          setNuevaMarca('');
      }
  } catch (error) {
      console.error('Error al registrar la marca:', error);
      message.error('No se pudo registrar la marca. Intenta de nuevo.');
  }
};

  
const agregarNuevoModelo = async () => {
  if (!nuevoModelo.trim()) {
      message.warning('El modelo no puede estar vacío.');
      return;
  }

  const tipoSeleccionado = formStep2.getFieldValue('tipo');
  const marcaSeleccionada = formStep2.getFieldValue('marca');

  if (!tipoSeleccionado || !marcaSeleccionada) {
      message.warning('Selecciona un tipo y una marca antes de agregar un modelo.');
      return;
  }

  try {
      const response = await api.post('/bienes/bienes/modelos', {
          tipo: tipoSeleccionado,
          marca: marcaSeleccionada,
          modelo: nuevoModelo.trim(),
      });

      console.log('Respuesta al agregar modelo:', response.data); // Agregar log

      if (response.status === 201) {
          message.success(`Modelo "${nuevoModelo}" registrado con éxito.`);
          setModelos((prevModelos) => [...prevModelos, nuevoModelo.trim()]);
          formStep2.setFieldsValue({ modelo: nuevoModelo.trim() });
          setNuevoModelo('');
      }
  } catch (error) {
      if (error.response?.status === 409) {
          message.error('El modelo ya existe.');
      } else {
          message.error('No se pudo registrar el modelo. Intenta de nuevo.');
      }
      console.error('Error al registrar el modelo:', error);
  }
};

  const handleFinishStep1 = async (values) => {
    try {
        const { nombre, apellido, email, dni, cuit, tipo, razonSocial, direccion } = values;

        // Verificar si el usuario ya está registrado
        const existingUserResponse = await dispatch(checkExistingUser({ dni, email }));
        
        if (existingUserResponse?.existe) {
            const existingUser = existingUserResponse.usuario;

            if (existingUser.rolDefinitivo !== 'vendedor') {
                // Actualizar el rol si no es vendedor
                const updateResponse = await dispatch(registerUsuarioPorTercero({
                    uuid: existingUser.uuid,
                    rolTemporal: 'vendedor',
                    ...values,
                }));

                if (updateResponse.error) {
                    throw new Error(updateResponse.error);
                }
            }

            setVendedorId(existingUser.uuid); // Asignar el UUID del usuario existente
            message.success('Usuario identificado como vendedor.');
            setStep(2);
            return;
        }

        // Registrar un nuevo usuario como vendedor
        const newUserResponse = await dispatch(registerUsuarioPorTercero({
            nombre,
            apellido,
            email,
            dni,
            cuit,
            tipo,
            razonSocial: tipo === 'juridica' ? razonSocial : null,
            direccion,
            rolTemporal: 'vendedor',
        }));

        if (newUserResponse?.uuid) {
            setVendedorId(newUserResponse.uuid); // Asignar el UUID del nuevo usuario
            message.success('Usuario registrado como vendedor con éxito.');
            setStep(2);
        } else {
            throw new Error('No se pudo registrar al usuario.');
        }
    } catch (error) {
        console.error('Error en el paso 1:', error.message || error);
        message.error(error.message || 'Ocurrió un error en el registro del usuario.');
    }
};
const handleFinishStep2 = async (values) => {
  try {
    const compradorDni = JSON.parse(localStorage.getItem('userData')).dni || '';

    const formData = new FormData();
    formData.append('tipo', values.tipo);
    formData.append('marca', values.marca);
    formData.append('modelo', values.modelo);
    formData.append('descripcion', values.bienDescripcion);
    formData.append('precio', parseFloat(values.bienPrecio));
    formData.append('cantidad', parseInt(values.bienStock, 10));
    formData.append('metodoPago', values.metodoPago);
    formData.append('vendedorId', vendedorId);
    formData.append('dniComprador', compradorDni);

    fileList.forEach((file) => {
      formData.append('fotos', file.originFileObj);
    });

    console.log('Datos enviados al backend:', formData);

    const result = await dispatch(registrarCompra(formData));
    if (result && result.message === 'Compra registrada con éxito.') {
      message.success(result.message);
      navigate('/user/dashboard');
    } else {
      throw new Error(result.message || 'Error al registrar la compra.');
    }
  } catch (error) {
    console.error('Error en registrar el bien:', error);
    message.error(error.message || 'No se pudo registrar el bien.');
  }
};


  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Volver</Button>
        <Button icon={<LogoutOutlined />} onClick={() => { localStorage.removeItem('userData'); navigate('/home'); }}>Cerrar Sesión</Button>
      </div>

      <Title level={3}>{step === 1 ? 'Paso 1: Datos del Vendedor' : 'Paso 2: Datos del Bien'}</Title>
      
      {step === 1 && (
        <Form
          layout="vertical"
          onFinish={handleFinishStep1}
          form={formStep1}
        >
          <Form.Item label="Tipo de Sujeto" name="tipo" rules={[{ required: true, message: 'Por favor, selecciona un tipo de sujeto.' }]}>
            <Select>
              <Option value="persona">Persona</Option>
              <Option value="juridica">Persona Jurídica</Option>
            </Select>
          </Form.Item>

          {formStep1.getFieldValue('tipo') === 'juridica' && (
            <Form.Item label="Razón Social" name="razonSocial" rules={[{ required: true, message: 'Por favor, ingresa la razón social.' }]}>
              <Input placeholder="Razón Social" />
            </Form.Item>
          )}

          <Form.Item label="Nombre" name="nombre" rules={[{ required: true, message: 'Por favor, ingresa tu nombre.' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Apellido" name="apellido" rules={[{ required: true, message: 'Por favor, ingresa tu apellido.' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Correo Electrónico" name="email" rules={[
            { required: true, message: 'Por favor, ingresa tu correo electrónico.' },
            { type: 'email', message: 'Por favor, ingresa un correo electrónico válido.' }
          ]}>
            <Input />
          </Form.Item>
          <Form.Item label="DNI" name="dni" rules={[{ required: true, message: 'Por favor, ingresa tu DNI.' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="CUIT" name="cuit" rules={[{ required: true, message: 'Por favor, ingresa tu CUIT.' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Calle" name={['direccion', 'calle']} rules={[{ required: true, message: 'Por favor, ingresa la calle.' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Altura" name={['direccion', 'altura']} rules={[{ required: true, message: 'Por favor, ingresa la altura.' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Barrio" name={['direccion', 'barrio']}>
            <Input />
          </Form.Item>
          <Form.Item label="Departamento" name={['direccion', 'departamento']} rules={[{ required: true, message: 'Por favor, selecciona un departamento.' }]}>
            <Select>
              {departments.map((department) => (
                <Option key={department} value={department}>{department}</Option>
              ))}
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>Siguiente</Button>
        </Form>
      )}
{step === 2 && (
  <Form layout="vertical" onFinish={handleFinishStep2} form={formStep2}>
    {/* Tipo de Bien */}
    <Form.Item label="Tipo de Bien" name="tipo" rules={[{ required: true, message: 'Por favor, selecciona un tipo de bien.' }]}>
    <Select
  onChange={(value) => {
    handleTipoChange(value); // Cargar marcas basadas en el tipo
    setMarcas([]);
    setModelos([]);
    formStep2.setFieldsValue({ marca: undefined, modelo: undefined });
  }}
>

        {tiposDeBienes.map((tipo) => (
          <Option key={tipo} value={tipo}>{tipo}</Option>
        ))}
      </Select>
    </Form.Item>

    {/* Marca */}
    <Form.Item label="Marca" name="marca" rules={[{ required: true, message: 'Por favor, selecciona una marca.' }]}>
      <Select
        placeholder="Selecciona o agrega una nueva marca"
        onChange={(marca) => handleMarcaChange(marca)}
        dropdownRender={(menu) => (
          <>
            {menu}
            <div style={{ display: 'flex', padding: 8 }}>
              <Input
                value={nuevaMarca}
                onChange={(e) => setNuevaMarca(e.target.value)}
                placeholder="Nueva marca"
              />
              <Button type="text" onClick={agregarNuevaMarca}>
                Agregar
              </Button>
            </div>
          </>
        )}
      >
        {marcas.length > 0 ? (
          marcas.map((marca) => (
            <Option key={marca} value={marca}>
              {marca}
            </Option>
          ))
        ) : (
          <Option disabled>No hay marcas disponibles</Option>
        )}
      </Select>
    </Form.Item>

    {/* Modelo */}
    <Form.Item label="Modelo" name="modelo" rules={[{ required: true, message: 'Por favor, selecciona un modelo.' }]}>
      <Select
        placeholder="Selecciona o agrega un nuevo modelo"
        dropdownRender={(menu) => (
          <>
            {menu}
            <div style={{ display: 'flex', padding: 8 }}>
              <Input
                value={nuevoModelo}
                onChange={(e) => setNuevoModelo(e.target.value)}
                placeholder="Nuevo modelo"
              />
              <Button type="text" onClick={agregarNuevoModelo}>
                Agregar
              </Button>
            </div>
          </>
        )}
      >
        {modelos.length > 0 ? (
          modelos.map((modelo) => (
            <Option key={modelo} value={modelo}>
              {modelo}
            </Option>
          ))
        ) : (
          <Option disabled>No hay modelos disponibles</Option>
        )}
      </Select>
    </Form.Item>

{/* Cantidad */}
<Form.Item
  label="Cantidad"
  name="bienStock"
  rules={[
    { required: true, message: 'Por favor, ingresa una cantidad válida.' },
    { type: 'number', min: 1, message: 'La cantidad debe ser mayor a 0.' },
  ]}
>
  <InputNumber min={1} placeholder="Cantidad" style={{ width: '100%' }} />
</Form.Item>


    {/* Precio */}
    <Form.Item label="Precio" name="bienPrecio" rules={[{ required: true, message: 'Por favor, ingresa un precio válido.' }]}>
      <InputNumber min={0} placeholder="Precio" style={{ width: '100%' }} />
    </Form.Item>

    {/* Descripción */}
    <Form.Item label="Descripción" name="bienDescripcion" rules={[{ required: true, message: 'Por favor, ingrese una descripción.' }]}>
      <Input.TextArea placeholder="Describe el bien que estás registrando" rows={4} />
    </Form.Item>

    {/* Método de Pago */}
    <Form.Item label="Método de Pago" name="metodoPago" rules={[{ required: true, message: 'Por favor, selecciona un método de pago.' }]}>
      <Select>
        <Option value="tarjeta">Tarjeta de Crédito</Option>
        <Option value="efectivo">Efectivo</Option>
        <Option value="transferencia">Transferencia Bancaria</Option>
      </Select>
    </Form.Item>

    {/* Fotos */}
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

    {/* Botón de Envío */}
    <Button type="primary" htmlType="submit" block loading={loading}>
      Continuar
    </Button>
  </Form>
)}

<Modal
  title="Confirmar Compra"
  open={isVisible}
  onOk={() => {
    formStep2.submit();
    setIsVisible(false);
  }}
  onCancel={handleCancel}
  okText="Confirmar"
  cancelText="Cancelar"
>
  <p>¿Estás seguro de registrar esta compra?</p>
</Modal>




    </div>
  );
};

export default ComprarPage;
