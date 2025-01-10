import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  message,
  Typography,
  List,
  Card,
  Radio,
  Upload,
  Modal,
  Spin
} from 'antd';
import {
  ArrowLeftOutlined,
  LogoutOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

// Acciones de Redux
import {
  fetchBienes,
  registrarVenta,
  addBien
} from '../redux/actions/bienes';

import {
  checkExistingUser,
  registerUsuarioPorTercero
} from '../redux/actions/usuarios';

import api from '../redux/axiosConfig'; // Tu instancia axios configurada

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

// Listas de ejemplo
const departments = [
  'Capital', 'Godoy Cruz', 'Junín', 'Las Heras', 'Maipú', 'Guaymallén',
  'Rivadavia', 'San Martín', 'La Paz', 'Santa Rosa', 'General Alvear',
  'Malargüe', 'San Carlos', 'Tupungato', 'Tunuyán', 'San Rafael',
  'Lavalle', 'Luján de Cuyo'
];


const tiposDeBienesIniciales = [
  'bicicleta', 'TV', 'equipo de audio', 'cámara fotográfica',
  'notebook', 'tablet', 'teléfono movil'
];


const VenderPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ----- Paso 1: Form para registrar comprador
  const [formPaso1] = Form.useForm();

  // ----- Paso 2B: Form para crear bien nuevo
  const [formPaso2B] = Form.useForm();

  // ----- Paso 3: Form para confirmar venta (cantidad, pago, IMEIs)
  const [formPaso3] = Form.useForm();

  // Control de steps:
  // 1 => Registrar comprador
  // 2 => Elegir bien existente o nuevo
  // 3 => Confirmar venta
  const [step, setStep] = useState(1);

  // Sub-step del paso 2
  // null => no ha elegido
  // 'existente' => vender un bien ya existente
  // 'nuevo' => crear un bien nuevo
  const [subStep2, setSubStep2] = useState(null);

  // Loading general
  const [loading, setLoading] = useState(false);

  // Para mostrar spinner especial en la pantalla (por ejemplo al crear comprador)
  const [isRegisteringComprador, setIsRegisteringComprador] = useState(false);

  // Datos del comprador
  const [compradorId, setCompradorId] = useState(null);

  // Usuario vendedor
  const usuario = JSON.parse(localStorage.getItem('userData') || '{}');
  const vendedorId = usuario?.uuid;

  // Lista de bienes del vendedor (para Paso 2A)
  const [bienes, setBienes] = useState([]);
  const [bienesFiltrados, setBienesFiltrados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [imeisSeleccionados, setImeisSeleccionados] = useState([]);

  const handleImeisChange = (selectedImeis) => {
    setImeisSeleccionados(selectedImeis);
  };
  
  const renderImeisDisponibles = () => {
    if (bienSeleccionado?.tipo.toLowerCase() === 'teléfono movil') {
      const imeisDisponibles = bienSeleccionado?.identificadores || []; // Asume que `identificadores` contiene los IMEIs disponibles.
      return (
        <Form.Item
          label="Selecciona los IMEIs a vender"
          name="imeis"
          rules={[
            {
              required: true,
              message: 'Debes seleccionar al menos un IMEI.',
            },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Selecciona IMEIs"
            value={imeisSeleccionados}
            onChange={(selectedImeis) => setImeisSeleccionados(selectedImeis)}
            options={imeisDisponibles.map((imei) => ({ label: imei, value: imei }))}
            style={{ width: '100%' }}
          />
        </Form.Item>
      );
    }
    return null;
  };
  
  

  // Bien seleccionado (o creado), si 'uuid = null' => es nuevo
  const [bienSeleccionado, setBienSeleccionado] = useState({
    uuid: null,
    tipo: '',
    marca: '',
    modelo: '',
    descripcion: '',
    precio: 0,
    imeis: [],
  });

  // Datos para crear bien nuevo
  const [tiposDeBienes] = useState(tiposDeBienesIniciales);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [nuevaMarca, setNuevaMarca] = useState('');
  const [nuevoModelo, setNuevoModelo] = useState('');

  // Fotos (si se crea un bien nuevo)
  const [fileList, setFileList] = useState([]);

  // Estados para almacenar los IMEIs dinámicos en Paso 2B y Paso 3
  const [imeisPaso2B, setImeisPaso2B] = useState([]);
  const [imeisPaso3, setImeisPaso3] = useState([]);

  // Modal de confirmación (opcional)
  const [confirmVisible, setConfirmVisible] = useState(false);

  // 1. Proteger la ruta si no hay vendedor logueado
  useEffect(() => {
    if (!vendedorId) {
      message.error('Debe iniciar sesión como vendedor para continuar.');
      navigate('/login');
    }
  }, [vendedorId, navigate]);

  useEffect(() => {
    if (step === 2) {
      const cargarBienes = async () => {
        try {
          const response = await dispatch(fetchBienes(vendedorId));
          if (response.success) {
            const bienesConStock = response.data.filter((bien) => bien.stock > 0); // Filtra bienes con stock > 0
            setBienes(bienesConStock);
            setBienesFiltrados(bienesConStock);
          } else {
            message.error('No se pudieron cargar los bienes.');
          }
        } catch (err) {
          console.error('Error al cargar bienes:', err);
          message.error('Ocurrió un error al cargar los bienes.');
        }
      };
      cargarBienes();
    }
  }, [step, vendedorId, dispatch]);
  

  // ------------------- PASO 1: Registrar/identificar comprador -------------------
  const handleFinishPaso1 = async (values) => {
    try {
      setLoading(true);
      setIsRegisteringComprador(true); // Muestra overlay de carga

      const { nombre, apellido, email, dni, cuit, tipo, razonSocial, direccion } = values;

      // 1. Verificar si existe
      const existingUserResponse = await dispatch(
        checkExistingUser({ dni, email })
      );
      if (existingUserResponse?.existe) {
        const existingUser = existingUserResponse.usuario;
        // Ajustar rol si no es "comprador"
        if (existingUser.rolDefinitivo !== 'comprador') {
          await dispatch(
            registerUsuarioPorTercero({
              uuid: existingUser.uuid,
              rolTemporal: 'comprador',
              ...values,
            })
          );
        }
        setCompradorId(existingUser.uuid);
        message.success('Comprador identificado correctamente.');
      } else {
        // 2. Registrar nuevo
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
            rolTemporal: 'comprador',
          })
        );
        if (newUserResponse?.uuid) {
          setCompradorId(newUserResponse.uuid);
          message.success('Comprador registrado con éxito.');
        } else {
          throw new Error('No se pudo registrar al comprador.');
        }
      }

      setStep(2);
    } catch (error) {
      console.error('Error en Paso 1:', error);
      message.error(error.response?.data?.mensaje || error.message || 'No se pudo procesar el comprador.');
    } finally {
      setLoading(false);
      setIsRegisteringComprador(false);
    }
  };

  // ------------------- PASO 2: Elegir bien existente o nuevo -------------------
  const handleSelectVentaTipo = (value) => {
    setSubStep2(value);
    setBienSeleccionado({
      uuid: null,
      tipo: '',
      marca: '',
      modelo: '',
      descripcion: '',
      precio: 0,
      imeis: [],
    });
    formPaso2B.resetFields();
    setFileList([]);
    setImeisPaso2B([]); // Resetear IMEIs en Paso 2B
  };

  // 2A: Buscador
  const handleSearchBienes = (val) => {
    setSearchTerm(val);
    if (!val.trim()) {
      setBienesFiltrados(bienes);
    } else {
      const filtered = bienes.filter(
        (b) =>
          (b.tipo || '').toLowerCase().includes(val.toLowerCase()) ||
          (b.marca || '').toLowerCase().includes(val.toLowerCase()) ||
          (b.modelo || '').toLowerCase().includes(val.toLowerCase()) ||
          (b.descripcion || '').toLowerCase().includes(val.toLowerCase())
      );
      setBienesFiltrados(filtered);
    }
  };

  const handleSelectBien = (bien) => {
    setBienSeleccionado({
      ...bien,
      imeis: bien.imeis || [], // Asegura que 'imeis' siempre sea un arreglo
    });
    message.info(`Has seleccionado: ${bien.marca} ${bien.modelo}`);
    // Paso 3
    setStep(3);
  };

  // 2B: Crear un bien nuevo
  const handleFinishPaso2B = (values) => {
    const { imeis } = values;

    // Validar IMEIs si es teléfono móvil
    if (values.tipo.toLowerCase() === 'teléfono movil') {
      if (!imeis || imeis.length === 0) {
        message.error('Debe ingresar al menos un IMEI.');
        return;
      }

      const imeisLimpios = imeis.map((imei) => imei.trim());
      if (imeisLimpios.some((imei) => imei === '')) {
        message.error('Todos los campos de IMEI deben estar completos.');
        return;
      }
    }

    const nuevoBien = {
      uuid: null,
      tipo: values.tipo,
      marca: values.marca,
      modelo: values.modelo,
      descripcion: values.bienDescripcion,
      precio: values.bienPrecio,
      fileList,
      imeis: values.tipo.toLowerCase() === 'teléfono movil' ? values.imeis : [],
    };

    setBienSeleccionado(nuevoBien);
    message.info('Bien nuevo listo. Ahora define cantidad, método de pago, etc.');
    setStep(3);
  };

  // Manejo de Tipo/Marca/Modelo en Paso 2B
  const handleTipoChange = async (tipo) => {
    try {
      const r = await api.get(`/bienes/bienes/marcas?tipo=${tipo}`);
      if (r.status === 200 && r.data.marcas) {
        setMarcas(r.data.marcas);
        formPaso2B.setFieldsValue({ marca: undefined, modelo: undefined });
        setModelos([]);
      } else {
        setMarcas([]);
      }
    } catch (err) {
      console.error(err);
      message.error('No se pudieron cargar las marcas.');
    }
  };

  const handleMarcaChange = async (marca) => {
    const tipo = formPaso2B.getFieldValue('tipo');
    if (!tipo || !marca) return;
    try {
      const r = await api.get(`/bienes/bienes/modelos?tipo=${tipo}&marca=${marca}`);
      if (r.status === 200 && r.data.modelos) {
        setModelos(r.data.modelos);
        formPaso2B.setFieldsValue({ modelo: undefined });
      } else {
        setModelos([]);
      }
    } catch (err) {
      console.error(err);
      message.error('No se pudieron cargar los modelos.');
    }
  };

  const agregarNuevaMarca = async () => {
    const marcaTrim = nuevaMarca.trim();
    if (!marcaTrim) return message.warning('La marca está vacía.');
    const tipo = formPaso2B.getFieldValue('tipo');
    if (!tipo) return message.warning('Selecciona un tipo primero.');
    try {
      const r = await api.post('/bienes/bienes/marcas', { tipo, marca: marcaTrim });
      if (r.status === 201) {
        message.success(`Marca "${marcaTrim}" agregada.`);
        setMarcas((prev) => [...prev, marcaTrim]);
        formPaso2B.setFieldsValue({ marca: marcaTrim });
        setNuevaMarca('');
      }
    } catch (err) {
      console.error(err);
      message.error('No se pudo registrar la marca.');
    }
  };

  const agregarNuevoModelo = async () => {
    const modeloTrim = nuevoModelo.trim();
    if (!modeloTrim) return message.warning('El modelo está vacío.');
    const tipo = formPaso2B.getFieldValue('tipo');
    const marca = formPaso2B.getFieldValue('marca');
    if (!tipo || !marca) return message.warning('Selecciona tipo y marca primero.');
    try {
      const r = await api.post('/bienes/bienes/modelos', { tipo, marca, modelo: modeloTrim });
      if (r.status === 201) {
        message.success(`Modelo "${modeloTrim}" agregado.`);
        setModelos((prev) => [...prev, modeloTrim]);
        formPaso2B.setFieldsValue({ modelo: modeloTrim });
        setNuevoModelo('');
      }
    } catch (err) {
      console.error(err);
      message.error('No se pudo registrar el modelo.');
    }
  };

  // ------------------- PASO 3: Confirmar venta -------------------
  // Si el bien es nuevo (bienSeleccionado.uuid === null), lo creamos primero en /bienes/add
  const handleFinishPaso3 = async (values) => {
    try {
      setLoading(true);
  
      // Obtener el precio del bien seleccionado
      const precio = bienSeleccionado.precio;
  
      const ventaData = {
        compradorId,
        vendedorUuid: vendedorId,
        bienUuid: bienSeleccionado.uuid,
        cantidad: values.cantidad,
        metodoPago: values.metodoPago,
        precio, // Asegúrate de incluir el precio
        imeis: bienSeleccionado.tipo.toLowerCase() === 'teléfono movil' ? imeisSeleccionados : [],
      };
  
      console.log('Datos que se enviarán al backend:', ventaData); // Confirmar datos enviados
      const response = await dispatch(registrarVenta(ventaData));
      if (response?.message === 'Venta registrada con éxito.') {
        message.success('Venta registrada con éxito.');
        navigate('/user/dashboard');
      } else {
        throw new Error(response?.message || 'Error al registrar la venta.');
      }
    } catch (error) {
      console.error('Error en Paso 3:', error);
      message.error(error.message || 'Ocurrió un error al registrar la venta.');
    } finally {
      setLoading(false);
    }
  };
  
  

  // Manejo de cambios en Paso 3 para generar IMEIs si es teléfono movil
  const handleValuesChangePaso3 = (changedValues, allValues) => {
    // Solo generamos IMEIs si el tipo es "teléfono movil"
    if (bienSeleccionado?.tipo.toLowerCase() === 'teléfono movil') {
      // Verificamos si se cambió el campo "cantidad"
      if ('cantidad' in changedValues) {
        const nuevaCantidad = changedValues.cantidad;
        if (nuevaCantidad > 0) {
          // Generar un array con "nuevaCantidad" posiciones vacías
          const imeisArray = Array(nuevaCantidad).fill('');
          setImeisPaso3(imeisArray);
          formPaso3.setFieldsValue({ imeis: imeisArray });
        }
      }
    }
  };

  // ------------------- PASO 3: Renderizar IMEIs -------------------
  const renderImeisPaso3 = () => {
    if (bienSeleccionado?.tipo.toLowerCase() === 'teléfono movil') {
      return renderImeisDisponibles();
    }
  
    return (
      <p style={{ color: 'gray' }}>
      
      </p>
    );
  };
  
  

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto', position: 'relative' }}>
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

      {/* Títulos de los pasos */}
      {step === 1 && <Title level={3}>Paso 1: Datos del Comprador</Title>}
      {step === 2 && <Title level={3}>Paso 2: Seleccionar/Crear Bien</Title>}
      {step === 3 && <Title level={3}>Paso 3: Confirmar Venta</Title>}

      {/* ================== PASO 1 ================== */}
      {step === 1 && (
        <Form layout="vertical" form={formPaso1} onFinish={handleFinishPaso1}>
          <Form.Item
            label="Tipo de Persona"
            name="tipo"
            rules={[{ required: true, message: 'Selecciona el tipo de persona.' }]}
          >
            <Select placeholder="Selecciona tipo">
              <Option value="persona">Persona Humana</Option>
              <Option value="juridica">Persona Jurídica</Option>
            </Select>
          </Form.Item>

          {formPaso1.getFieldValue('tipo') === 'juridica' && (
            <>
              <Form.Item
                label="Razón Social"
                name="razonSocial"
                rules={[{ required: true, message: 'Ingresa la razón social.' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="CUIT"
                name="cuit"
                rules={[{ required: true, message: 'Ingresa el CUIT.' }]}
              >
                <Input />
              </Form.Item>
            </>
          )}

          <Form.Item
            label="Nombre"
            name="nombre"
            rules={[{ required: true, message: 'Ingresa el nombre.' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Apellido"
            name="apellido"
            rules={[{ required: true, message: 'Ingresa el apellido.' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Correo Electrónico"
            name="email"
            rules={[
              { required: true, message: 'Ingresa un correo electrónico.' },
              { type: 'email', message: 'Correo inválido.' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Calle"
            name={['direccion', 'calle']}
            rules={[{ required: true, message: 'Ingresa la calle.' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Altura"
            name={['direccion', 'altura']}
            rules={[{ required: true, message: 'Ingresa la altura.' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Barrio (Opcional)" name={['direccion', 'barrio']}>
            <Input />
          </Form.Item>
          <Form.Item
            label="Departamento"
            name={['direccion', 'departamento']}
            rules={[{ required: true, message: 'Selecciona un departamento.' }]}
          >
            <Select>
              {departments.map((dep) => (
                <Option key={dep} value={dep}>
                  {dep}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="DNI"
            name="dni"
            rules={[{ required: true, message: 'Ingresa el DNI.' }]}
          >
            <Input />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>
            Siguiente
          </Button>
        </Form>
      )}

      {/* ================== PASO 2 ================== */}
      {step === 2 && (
        <>
          <Radio.Group
            onChange={(e) => handleSelectVentaTipo(e.target.value)}
            value={subStep2}
            style={{ marginBottom: 20 }}
          >
            <Radio value="existente">Vender Bien Existente</Radio>
            <Radio value="nuevo">Registrar Bien Nuevo</Radio>
          </Radio.Group>

          {!subStep2 && <p>Selecciona una opción para continuar.</p>}

          {/* ============= 2A: Bien Existente ============= */}
          {subStep2 === 'existente' && (
            <div>
              <Title level={4}>Selecciona un Bien Existente</Title>
              <Search
                placeholder="Buscar por tipo, marca, modelo..."
                value={searchTerm}
                onChange={(e) => handleSearchBienes(e.target.value)}
                onSearch={handleSearchBienes}
                enterButton={<SearchOutlined />}
                style={{ marginBottom: 16, maxWidth: 300 }}
              />
              <List
                grid={{ gutter: 16, column: 2 }}
                dataSource={bienesFiltrados}
                renderItem={(bien) => (
                  <List.Item key={bien.uuid}>
                    <Card
                      hoverable
                      cover={
                        <img
                          alt={bien.descripcion || 'Bien'}
                          src={bien.fotos?.[0] || '/placeholder.png'}
                          style={{ height: 150, objectFit: 'cover' }}
                        />
                      }
                      onClick={() => handleSelectBien(bien)}
                    >
                      <Card.Meta
                        title={`${bien.marca} ${bien.modelo}`}
                        description={`Tipo: ${bien.tipo} - Stock: ${bien.stock}`}
                      />
                    </Card>
                  </List.Item>
                )}
              />
              <p>Haz clic en el bien para avanzar al Paso 3.</p>
            </div>
          )}

          {/* ============= 2B: Bien Nuevo ============= */}
          {subStep2 === 'nuevo' && (
            <Form layout="vertical" form={formPaso2B} onFinish={handleFinishPaso2B}>
              <Title level={4}>Registrar un Bien Nuevo</Title>

              <Form.Item
                label="Tipo de Bien"
                name="tipo"
                rules={[{ required: true, message: 'Selecciona un tipo.' }]}
              >
                <Select
                  placeholder="Tipo"
                  onChange={(val) => {
                    handleTipoChange(val);
                    formPaso2B.setFieldsValue({ marca: undefined, modelo: undefined });
                    setMarcas([]);
                    setModelos([]);
                    setImeisPaso2B([]); // Resetear IMEIs al cambiar el tipo
                  }}
                >
                  {tiposDeBienes.map((t) => (
                    <Option key={t} value={t}>
                      {t}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Marca"
                name="marca"
                rules={[{ required: true, message: 'Selecciona o ingresa una marca.' }]}
              >
                <Select
                  placeholder="Marca"
                  onChange={(val) => handleMarcaChange(val)}
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
                  {marcas.map((m) => (
                    <Option key={m} value={m}>
                      {m}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Modelo"
                name="modelo"
                rules={[{ required: true, message: 'Selecciona o ingresa un modelo.' }]}
              >
                <Select
                  placeholder="Modelo"
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
                  {modelos.map((mod) => (
                    <Option key={mod} value={mod}>
                      {mod}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Precio"
                name="bienPrecio"
                rules={[{ required: true, message: 'Ingresa un precio.' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                label="Descripción"
                name="bienDescripcion"
                rules={[{ required: true, message: 'Ingresa una descripción.' }]}
              >
                <Input.TextArea rows={3} />
              </Form.Item>

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

              {/* IMEIs para teléfono móvil */}
              {formPaso2B.getFieldValue('tipo')?.toLowerCase() === 'teléfono movil' && (
                <>
                  <p>Ingresa IMEIs para este nuevo teléfono (uno por cada unidad que registrarás en el inventario):</p>
                  {imeisPaso2B.map((imei, index) => (
                    <Form.Item
                      key={index}
                      label={`IMEI #${index + 1}`}
                      name={['imeis', index]}
                      rules={[
                        { required: true, message: `Ingrese el IMEI #${index + 1}` },
                        { len: 15, message: 'El IMEI debe tener 15 dígitos.' },
                        { pattern: /^\d+$/, message: 'El IMEI debe contener solo números.' },
                      ]}
                    >
                      <Input
                        placeholder="123456789012345"
                        maxLength={15}
                      />
                    </Form.Item>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => {
                      setImeisPaso2B([...imeisPaso2B, '']);
                      formPaso2B.setFieldsValue({ imeis: [...imeisPaso2B, ''] });
                    }}
                    style={{ width: '100%', marginTop: 8 }}
                  >
                    Agregar IMEI
                  </Button>
                </>
              )}

              <Button type="primary" htmlType="submit" block loading={loading} style={{ marginTop: 16 }}>
                Siguiente (Ir al Paso 3)
              </Button>
            </Form>
          )}
        </>
      )}

      {/* ================== PASO 3 ================== */}
      {step === 3 && (
 <Form
 layout="vertical"
 form={formPaso3}
 onFinish={handleFinishPaso3}
 onValuesChange={handleValuesChangePaso3}
>
 <Title level={4}>Confirmar Venta</Title>

 {/* Detalles del bien */}
 {bienSeleccionado?.uuid ? (
   <p>
     Vas a vender el bien existente: {bienSeleccionado.marca} {bienSeleccionado.modelo}
   </p>
 ) : (
   <p>
     Vas a vender un bien NUEVO: {bienSeleccionado?.tipo} {bienSeleccionado?.marca} {bienSeleccionado?.modelo}
   </p>
 )}

 {/* Campo para la cantidad */}
 <Form.Item
   label="Cantidad"
   name="cantidad"
   rules={[
     {
       required: true,
       type: 'number',
       min: 1,
       max: bienSeleccionado?.stock || 1,
       message: 'Debes ingresar una cantidad válida.',
     },
   ]}
 >
   <InputNumber min={1} max={bienSeleccionado?.stock} style={{ width: '100%' }} />
 </Form.Item>

 {/* Campo para el precio */}
 <Form.Item
   label="Precio por unidad"
   name="precio"
   rules={[
     {
       required: true,
       message: 'Debes ingresar el precio por unidad.',
     },
     {
       type: 'number',
       min: 0,
       message: 'El precio debe ser un valor positivo.',
     },
   ]}
 >
   <InputNumber
     min={0}
     placeholder="Ingresa el precio por unidad"
     style={{ width: '100%' }}
     defaultValue={bienSeleccionado?.precio || 0}
   />
 </Form.Item>

 {/* Renderizar IMEIs */}
 {renderImeisPaso3()}

 {/* Método de Pago */}
 <Form.Item
   label="Método de Pago"
   name="metodoPago"
   rules={[{ required: true, message: 'Selecciona un método de pago.' }]}
 >
   <Select placeholder="Selecciona método de pago">
     <Option value="efectivo">Efectivo</Option>
     <Option value="transferencia">Transferencia</Option>
     <Option value="tarjeta">Tarjeta</Option>
   </Select>
 </Form.Item>

 {/* Botón para confirmar */}
 <Button type="primary" htmlType="submit" block loading={loading} style={{ marginTop: 16 }}>
   Confirmar Venta
 </Button>
</Form>


)}



      {/* MODAL de confirmación (opcional) */}
      <Modal
        title="Confirmar Venta"
        open={confirmVisible}
        onOk={() => {
          formPaso3.submit();
          setConfirmVisible(false);
        }}
        onCancel={() => setConfirmVisible(false)}
      >
        <p>¿Estás seguro de finalizar la venta?</p>
      </Modal>

      {/* MODAL/Super Overlay para registrar Comprador (PASO 1) */}
      <Modal
        open={isRegisteringComprador}
        footer={null}
        closable={false}
        centered
      >
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Spin size="large" />
          <p style={{ marginTop: 10 }}>
            Por favor, espera unos segundos mientras registramos al comprador...
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default VenderPage;
