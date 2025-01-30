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
  'bicicleta', 'TV', 'equipo de audio', 'cámara fotográfica', 'notebook', 'tablet', 'teléfono movil'
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
  const [tipoDeSujeto, setTipoDeSujeto] = useState(null);
  const [imeis, setImeis] = useState([]); // Estado para los IMEIs y fotos de cada teléfono
  const [tipoSeleccionado, setTipoSeleccionado] = useState("");


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

  const agregarImei = () => {
    setImeis([...imeis, { imei: '', foto: null }]);
  };
  
  const actualizarImei = (index, value) => {
    const nuevosImeis = [...imeis];
    nuevosImeis[index].imei = value;
    setImeis(nuevosImeis);
  };
  
  const actualizarFotoImei = (index, file) => {
    const nuevosImeis = [...imeis];
    nuevosImeis[index].foto = file;
    setImeis(nuevosImeis);
  };
  
  const eliminarImei = (index) => {
    const nuevosImeis = [...imeis];
    nuevosImeis.splice(index, 1);
    setImeis(nuevosImeis);
  };

  const handleCompraExitosa = async (formData) => {
    try {
      await dispatch(registrarCompra(formData));
      await dispatch(fetchBienes(uuid));  // Refrescar los bienes después de la compra
    } catch (error) {
      console.error("❌ Error al procesar la compra:", error);
    }
  };
  
  
  const handleTipoChange = async (tipo) => {
    setTipoSeleccionado(tipo);
    if (!tipo) {
      message.warning('Selecciona un tipo para cargar las marcas.');
      return;
    }
  
    try {
      const response = await api.get(`/bienes/bienes/marcas?tipo=${tipo}`);
      if (response.status === 200 && response.data.marcas) {
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


const validateDNIWithRenaper = async (dni) => {
  try {
    if (!dni) {
      message.error('El DNI es obligatorio.');
      return;
    }

    const { data } = await api.get(`/renaper/${dni}`);
    if (data.success) {
      const persona = data.data.persona;

      // Establece automáticamente los datos obtenidos del Renaper
      formStep1.setFieldsValue({
        nombre: persona.nombres,
        apellido: persona.apellidos,
        cuit: persona.nroCuil,
        direccion: {
          calle: persona.domicilio.calle || '',
          altura: persona.domicilio.nroCalle || '',
          barrio: persona.domicilio.barrio || '',
          departamento: persona.domicilio.localidad || '',
        },
      });

      message.success('Datos cargados correctamente desde Renaper.');
    } else {
      message.error(data.message || 'Persona no encontrada en Renaper.');
    }
  } catch (error) {
    console.error('Error al validar el DNI con Renaper:', error);
    message.error('Error al validar el DNI.');
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

    // Validación previa para asegurarse de que los campos obligatorios estén completos
    if (!dni || !nombre || !apellido || !email) {
      message.error('Por favor, completa todos los campos obligatorios (DNI, Nombre, Apellido, Email).');
      return;
    }

    console.log('Datos enviados en el paso 1:', values);

    // Verificar si el usuario ya está registrado
    const existingUserResponse = await dispatch(
      checkExistingUser({
        dni,
        nombre,
        apellido,
      })
    );

    if (existingUserResponse?.existe) {
      const existingUser = existingUserResponse.usuario;

      // Asignar el UUID del usuario registrado
      setVendedorId(existingUser.uuid);

      if (existingUser.rolDefinitivo !== 'vendedor') {
        console.log('El usuario existe pero no es vendedor, actualizando rol...');

        // Intentar actualizar el rol del usuario existente
        try {
          const updateResponse = await dispatch(
            registerUsuarioPorTercero({
              uuid: existingUser.uuid,
              rolTemporal: 'vendedor', // Este rol se asigna para que pueda continuar
              ...values,
            })
          );

          if (updateResponse.error) {
            console.warn('No se pudo actualizar el rol del usuario, pero el flujo continuará.');
          }
        } catch (updateError) {
          console.error('Error actualizando el rol del usuario:', updateError.message);
        }
      }

      message.success('Usuario identificado, continuando al siguiente paso.');
      setStep(2); // Continuar al paso 2
      return;
    }

    // Registrar un nuevo usuario si no existe
    console.log('Registrando un nuevo usuario...');
    const newUserResponse = await dispatch(
      registerUsuarioPorTercero({
        nombre,
        apellido,
        email,
        dni,
        cuit,
        tipo,
        razonSocial: tipo === 'juridica' ? razonSocial : null,
        direccion,
        rolTemporal: 'vendedor', // Registrar como vendedor de forma temporal
      })
    );

    if (newUserResponse?.uuid) {
      setVendedorId(newUserResponse.uuid);
      message.success('Nuevo usuario registrado, continuando al siguiente paso.');
      setStep(2); // Continuar al paso 2
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
    const formData = new FormData();
    formData.append('tipo', values.tipo);
    formData.append('marca', values.marca);
    formData.append('modelo', values.modelo);
    formData.append('descripcion', values.bienDescripcion);
    formData.append('precio', parseFloat(values.bienPrecio));
    formData.append('cantidad', parseInt(values.bienStock, 10));
    formData.append('metodoPago', values.metodoPago);
    formData.append('vendedorId', vendedorId);
    formData.append('dniComprador', JSON.parse(localStorage.getItem('userData')).dni || '');

    if (values.tipo !== "teléfono movil") {
      // ✅ Subir fotos generales SOLO si el bien NO es un teléfono móvil
      fileList.forEach((file) => {
        formData.append('fotos', file.originFileObj);
      });
    }

    // ✅ Agregar IMEIs con sus fotos al formData
    imeis.forEach((item, index) => {
      formData.append(`imeis[${index}][imei]`, item.imei);
      if (item.foto) {
        formData.append(`imeis[${index}][foto]`, item.foto); // Se sube foto individual de cada IMEI
      }
    });

    console.log('📤 Enviando a backend:', formData);

    const result = await dispatch(registrarCompra(formData));
    if (result.message === 'Compra registrada con éxito.') {
      message.success(result.message);
      navigate('/user/dashboard');
    } else {
      throw new Error(result.message || 'Error al registrar la compra.');
    }
  } catch (error) {
    console.error('❌ Error en registrar el bien:', error);
    message.error(error.message || 'No se pudo registrar el bien.');
  }
};






return (
  <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
    {/* Título Principal */}
    <Title level={2} style={{ textAlign: 'center', marginBottom: 20 }}>
      Formulario para Comprar un Bien Mueble
    </Title>

    {/* Barra Superior */}
    <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
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

    {/* Paso 1: Resaltado */}
    {step === 1 && (
      <>
        <Title level={3} style={{ marginBottom: 10 }}>
          Paso 1: Datos del vendedor
        </Title>
        <div
          style={{
            backgroundColor: '#fff4c2', // Amarillo suave
            borderRadius: '8px',
            padding: '10px 15px',
            marginBottom: 20,
            boxShadow: '0px 1px 5px rgba(0, 0, 0, 0.1)',
          }}
        >
          Complete los datos del vendedor. Ingrese el DNI y espere unos segundos mientras el RENAPER
          (Registro Nacional de las Personas) verifica la información ingresada.
        </div>
      </>
    )}

    {/* Formulario Paso 1 */}
    {step === 1 && (
     <Form
     layout="vertical"
     onFinish={handleFinishStep1}
     form={formStep1}
   >
     {/* Selección del tipo de sujeto */}
     <Form.Item
       label="Tipo de Sujeto"
       name="tipo"
       rules={[{ required: true, message: 'Por favor, selecciona un tipo de sujeto.' }]}
     >
       <Select
         onChange={(tipo) => {
           formStep1.resetFields(['dni', 'nombre', 'apellido', 'email', 'cuit', 'direccion', 'razonSocial', 'direccionEmpresa']);
           setTipoDeSujeto(tipo); // Estado para controlar el tipo seleccionado
         }}
       >
         <Option value="persona">Persona Humana</Option>
         <Option value="juridica">Persona Jurídica</Option>
       </Select>
     </Form.Item>
   
     {tipoDeSujeto === 'juridica' && (
       <>
         {/* Razón Social */}
         <Form.Item
           label="Razón Social"
           name="razonSocial"
           rules={[{ required: true, message: 'Por favor, ingresa la razón social.' }]}
         >
           <Input placeholder="Razón Social de la empresa" />
         </Form.Item>
   
         {/* Dirección de la Empresa */}
         <Title level={5} style={{ marginBottom: 10, marginTop: 20 }}>
           Dirección de la Empresa
         </Title>
         <Form.Item
           label="Calle"
           name={['direccionEmpresa', 'calle']}
           rules={[{ required: true, message: 'Por favor, ingresa la calle de la empresa.' }]}
         >
           <Input placeholder="Calle de la empresa" />
         </Form.Item>
         <Form.Item
           label="Numeración"
           name={['direccionEmpresa', 'altura']}
           rules={[{ required: true, message: 'Por favor, ingresa la numeración de la empresa.' }]}
         >
           <Input placeholder=" Numeración de la empresa" />
         </Form.Item>
       </>
     )}
   
     {/* Campo de DNI */}
     <Form.Item
    label="DNI"
    name="dni"
    rules={[
      { required: true, message: 'El DNI es obligatorio.' },
      { pattern: /^\d{7,8}$/, message: 'El DNI debe tener 7 u 8 dígitos.' },
    ]}
  >
    <Input
      placeholder="Ingresa el DNI"
      onBlur={(e) => validateDNIWithRenaper(e.target.value)}
    />
  </Form.Item>

  <Form.Item
    label="Nombre"
    name="nombre"
    rules={[{ required: true, message: 'El nombre es obligatorio.' }]}
  >
    <Input placeholder="Nombre completo" />
  </Form.Item>

  <Form.Item
    label="Apellido"
    name="apellido"
    rules={[{ required: true, message: 'El apellido es obligatorio.' }]}
  >
    <Input placeholder="Apellido completo" />
  </Form.Item>

     <Form.Item
       label="CUIT"
       name="cuit"
       rules={[{ required: true, message: 'Por favor, ingresa tu CUIT.' }]}
     >
       <Input placeholder="CUIT" />
     </Form.Item>
   
     {/* Dirección de la Persona */}
     <Title level={5} style={{ marginBottom: 10, marginTop: 20 }}>
       Dirección de la Persona
     </Title>
     <Form.Item
       label="Calle"
       name={['direccion', 'calle']}
       rules={[{ required: true, message: 'Por favor, ingresa la calle.' }]}
     >
       <Input placeholder="Calle" />
     </Form.Item>
     <Form.Item
       label="Numeración"
       name={['direccion', 'altura']}
       rules={[{ required: true, message: 'Por favor, ingresa la numeracion.' }]}
     >
       <Input placeholder="Numeración" />
     </Form.Item>
     <Form.Item
       label="Barrio"
       name={['direccion', 'barrio']}
     >
       <Input placeholder="Barrio" />
     </Form.Item>
     <Form.Item
       label="Departamento"
       name={['direccion', 'departamento']}
       rules={[{ required: true, message: 'Por favor, selecciona un departamento.' }]}
     >
       <Select>
         {departments.map((department) => (
           <Option key={department} value={department}>
             {department}
           </Option>
         ))}
       </Select>
     </Form.Item>
     <Form.Item
       label="Correo Electrónico"
       name="email"
       rules={[
         { required: true, message: 'Por favor, ingresa tu correo electrónico.' },
         { type: 'email', message: 'Por favor, ingresa un correo electrónico válido.' },
       ]}
     >
       <Input placeholder="Correo Electrónico" />
     </Form.Item>
   
     {/* Botón para continuar */}
     <Button type="primary" htmlType="submit" block>
       Siguiente
     </Button>
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
  <InputNumber
    min={1}
    placeholder="Cantidad"
    style={{ width: '100%' }}
    onChange={(value) => {
      if (tipoSeleccionado === "teléfono movil") {
        // Solo ajustar IMEIs si es un teléfono móvil
        const nuevaCantidad = value || 0;
        setImeis((prevImeis) => {
          const nuevosImeis = [...prevImeis];
          while (nuevosImeis.length < nuevaCantidad) {
            nuevosImeis.push({ imei: '', foto: null });
          }
          while (nuevosImeis.length > nuevaCantidad) {
            nuevosImeis.pop();
          }
          return nuevosImeis;
        });
      }
    }}
  />
</Form.Item>



{/* IMEIs y Fotos - Sección dentro del Formulario */}
{imeis.length > 0 && tipoSeleccionado === "teléfono movil" && (
  <>
    <Title level={5} style={{ marginBottom: 10, marginTop: 20 }}>Registra los IMEIs y sus Fotos</Title>
    {imeis.map((item, index) => (
      <div key={index} style={{ marginBottom: '10px', border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
        <Form.Item
          label={`IMEI #${index + 1}`}
          rules={[{ required: true, message: 'Por favor, ingresa un IMEI válido.' }]}
        >
          <Input
            placeholder="Ingrese el IMEI"
            value={item.imei}
            onChange={(e) => actualizarImei(index, e.target.value)}
          />
        </Form.Item>

        <Form.Item label={`Foto del IMEI #${index + 1}`}>
  <Upload
    listType="picture"
    beforeUpload={(file) => {
      actualizarFotoImei(index, file);
      return false; // Evita la subida automática
    }}
    showUploadList={true} // ✅ Ahora se verá la lista de imágenes subidas
  >
    <Button>Subir Foto</Button>
  </Upload>
  {item.foto && <p>{item.foto.name}</p>}
</Form.Item>

        <Button type="danger" onClick={() => eliminarImei(index)}>Eliminar</Button>
      </div>
    ))}
  </>
)}




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
  {/* Fotos generales SOLO si NO es un teléfono móvil */}
{tipoSeleccionado !== "teléfono movil" && fileList.length === 0 && (
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
)}



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
