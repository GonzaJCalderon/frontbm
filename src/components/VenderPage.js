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

const departments = [
  'Capital','Godoy Cruz','Junín','Las Heras','Maipú','Guaymallén','Rivadavia','San Martín','La Paz','Santa Rosa','General Alvear',
  'Malargüe','San Carlos','Tupungato','Tunuyán','San Rafael','Lavalle','Luján de Cuyo'
];

const tiposDeBienesIniciales = [
  'bicicleta','TV','equipo de audio','cámara fotográfica','notebook','tablet','teléfono movil'
];

const VenderPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  
  // Paso 1: Form para registrar comprador
  const [formPaso1] = Form.useForm();
  // Paso 2B: Form para crear bien nuevo
  const [formPaso2B] = Form.useForm();
  // Paso 3: Form para confirmar venta
  const [formPaso3] = Form.useForm();

  // Control de steps
  const [step, setStep] = useState(1);
  const [subStep2, setSubStep2] = useState(null);
  
  const [datosPaso1, setDatosPaso1] = useState(null);
  const [datosPaso2B, setDatosPaso2B] = useState(null);
  const [datosPaso3, setDatosPaso3] = useState(null);
  

  // Loading general
  const [loading, setLoading] = useState(false);
  // Para spinner especial
  const [isRegisteringComprador, setIsRegisteringComprador] = useState(false);

  // Datos del comprador
  const [compradorId, setCompradorId] = useState(null);
  
  // Usuario vendedor (de localStorage)
  const usuario = JSON.parse(localStorage.getItem('userData') || '{}');
  const vendedorId = usuario?.uuid;
  
  // Lista de bienes
  const [bienes, setBienes] = useState([]);
  const [bienesFiltrados, setBienesFiltrados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [imeisSeleccionados, setImeisSeleccionados] = useState([]); 

  // Bien seleccionado / creado
  const [bienSeleccionado, setBienSeleccionado] = useState({
    uuid: null,
    tipo: '',
    marca: '',
    modelo: '',
    descripcion: '',
    precio: 0,
    imeis: [],
  });

  // Para 2B (crear bien nuevo)
  const [tiposDeBienes] = useState(tiposDeBienesIniciales);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [nuevaMarca, setNuevaMarca] = useState('');
  const [nuevoModelo, setNuevoModelo] = useState('');
  const [fileList, setFileList] = useState([]);
  const [imeisPaso2B, setImeisPaso2B] = useState([]);

  // Para Paso 3
  const [imeisPaso3, setImeisPaso3] = useState([]);

  // Modal de confirmación
  const [confirmVisible, setConfirmVisible] = useState(false);

  // Bloquear si no hay vendedor logueado
  useEffect(() => {
    if (!vendedorId) {
      message.error('Debe iniciar sesión como vendedor para continuar.');
      navigate('/login');
    }
  }, [vendedorId, navigate]);

  const handleBack = () => {
    if (step === 2) {
        if (datosPaso1) {
            formPaso1.setFieldsValue(datosPaso1); // Restaurar datos del paso 1
        }
        setStep(1);
    } else if (step === 3) {
        if (subStep2 === 'nuevo' && datosPaso2B) {
            formPaso2B.setFieldsValue(datosPaso2B); // Restaurar datos del paso 2B si está en "nuevo"
        }
        setStep(2);
    } else {
        navigate('/user/dashboard'); // Si está en el Paso 1, ir al Dashboard
    }
};



  // Al ir a paso 2, cargar bienes
  useEffect(() => {
    if (step === 2) {
      const cargarBienes = async () => {
        try {
          const response = await dispatch(fetchBienes(vendedorId));
          if (response.success) {
            const bienesConStock = response.data.filter((bien) => bien.stock > 0);
            setBienes(bienesConStock);
            setBienesFiltrados(bienesConStock);
          } else {
            message.error(response.message || 'No se pudieron cargar los bienes.');
          }
        } catch (err) {
          console.error('Error al cargar bienes:', err);
          message.error('Ocurrió un error al cargar los bienes.');
        }
      };
      cargarBienes();
    }
  }, [step, vendedorId, dispatch]);

  // ------------------------
  // Paso 1: Registrar comprador
  // ------------------------
  const validateDNIWithRenaper = async (dni) => {
    try {
      if (!dni) {
        message.error("El DNI es obligatorio.");
        return;
      }
      const { data } = await api.get(`/renaper/${dni}`);
      if (data.success) {
        const persona = data.data.persona;
        formPaso1.setFieldsValue({
          nombre: persona.nombres || "",
          apellido: persona.apellidos || "",
          email: persona.email || "",
          cuit: persona.nroCuil || "",
          direccion: {
            calle: persona.domicilio?.calle || "",
            altura: persona.domicilio?.nroCalle || "",
            barrio: persona.domicilio?.barrio || "",
            departamento: persona.domicilio?.localidad || "",
          },
        });
        message.success("Datos cargados correctamente desde RENAPER.");
      } else {
        message.error(data.message || "Persona no encontrada en RENAPER.");
      }
    } catch (error) {
      console.error("Error al validar el DNI con RENAPER:", error);
      message.error("Error al validar el DNI.");
    }
  };

  const handleFinishPaso1 = async (values) => {
    console.log("Valores paso 1:", values);
    const { nombre, apellido, dni, email, tipo, cuit, direccion } = values;
    try {
      setLoading(true);
      const existingUserResponse = await dispatch(checkExistingUser({ dni, nombre, apellido }));
      console.log("Respuesta usuario existente:", existingUserResponse);

      if (existingUserResponse.existe) {
        setCompradorId(existingUserResponse.usuario.uuid);
        message.success("Comprador identificado correctamente.");
      } else {
        const newUserResponse = await dispatch(registerUsuarioPorTercero({
          dni, email, nombre, apellido, tipo, cuit, direccion
        }));
        console.log("Respuesta registrar nuevo usuario:", newUserResponse);

        if (newUserResponse.uuid) {
          setCompradorId(newUserResponse.uuid);
          message.success("Comprador registrado con éxito.");
        } else {
          throw new Error("No se pudo registrar el comprador.");
        }
      }
      setDatosPaso1(values);
      setStep(2);
    } catch (error) {
      console.error("Error en Paso 1 (comprador):", error.message);
      message.error(error.message || "Error al procesar el comprador.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // Paso 2: Elegir bien existente o nuevo
  // ------------------------
  const handleSelectVentaTipo = (value) => {
    setSubStep2(value);
    // Resetear el bien seleccionado
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
    setImeisPaso2B([]);
  };

  // Buscador en 2A
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

  // Seleccionar Bien existente
  const handleSelectBien = (bien) => {
    setBienSeleccionado({
      ...bien,
      imeis: bien.imeis || [],
    });
    message.info(`Has seleccionado: ${bien.marca} ${bien.modelo}`);
    setStep(3);
  };

  // Paso 2B: Crear Bien nuevo
  const handleFinishPaso2B = async (values) => {
    console.log('Datos Paso 2B (nuevo):', values);
    const { tipo, marca, modelo, bienDescripcion, bienPrecio, imeis } = values;
    try {
      if (tipo.toLowerCase() === 'teléfono movil' && (!imeis || imeis.length === 0)) {
        message.error('Debe ingresar al menos un IMEI.');
        return;
      }
      const bienNuevo = {
        uuid: null,
        tipo,
        marca,
        modelo,
        descripcion: bienDescripcion,
        precio: bienPrecio,
        fileList,
        imeis: tipo.toLowerCase() === 'teléfono movil' ? imeis : [],
      };
      console.log('Bien nuevo temporal:', bienNuevo);
      setBienSeleccionado(bienNuevo);
      message.success('Bien nuevo registrado temporalmente. Continúa al paso 3.');
      setDatosPaso2B(values);
      setStep(3);
    } catch (error) {
      console.error('Error en Paso 2B:', error.response?.data || error.message);
      message.error('No se pudo registrar el bien nuevo.');
    }
  };

  // Manejo de Tipo/Marca/Modelo
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

  // ------------------------
  // Paso 3: Confirmar venta
  // ------------------------
  const handleFinishPaso3 = async (values) => {
    setDatosPaso3(values); 
    const { cantidad, metodoPago } = values;
    console.log('Datos Paso 3:', values);
  
    const ventaData = {
      compradorId,
      vendedorUuid: vendedorId,
      bienUuid: bienSeleccionado.uuid,
      cantidad,
      metodoPago,
      precio: bienSeleccionado.precio,
      imeis: bienSeleccionado.tipo.toLowerCase() === 'teléfono movil' ? imeisSeleccionados : [],
    };
  
    console.log('Datos a enviar venta:', ventaData);
  
    try {
      setLoading(true);
      const response = await dispatch(registrarVenta(ventaData));
      console.log('Respuesta registrar venta:', response);
  
      if (response?.message === 'Venta registrada con éxito.') {
        message.success('Venta registrada con éxito.');
        navigate('/user/dashboard');
      } else {
        throw new Error(response?.message || 'Error al registrar la venta.');
      }
    } catch (error) {
      console.error('Error en Paso 3 (confirmar venta):', error.response?.data || error.message);
      message.error(error.response?.data?.mensaje || 'Error al procesar la venta.');
    } finally {
      setLoading(false);
    }
  };

  // Manejo de cambios en Paso 3
  const handleValuesChangePaso3 = (changedValues) => {
    if (bienSeleccionado?.tipo.toLowerCase() === 'teléfono movil') {
      if ('cantidad' in changedValues) {
        const nuevaCantidad = changedValues.cantidad;
        if (nuevaCantidad > 0) {
          const imeisArray = Array(nuevaCantidad).fill('');
          setImeisPaso3(imeisArray);
          formPaso3.setFieldsValue({ imeis: imeisArray });
        }
      }
    }
  };

  // Para seleccionar IMEIs en Paso 3
  const handleImeisChange = (selectedImeis) => {
    setImeisSeleccionados(selectedImeis);
  };

  // ------------------------
  // Render principal
  // ------------------------
  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto', position: 'relative' }}>
      
      <Title level={2} style={{ textAlign: 'center', marginBottom: 20 }}>
        Formulario para Vender un Bien Mueble
      </Title>
      
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
  <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
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


      {/* ============= PASO 1 ============= */}
      {step === 1 && (
        <>
          <Title level={3} style={{ marginBottom: 10 }}>
            Paso 1
          </Title>
          <div
            style={{
              backgroundColor: '#fff4c2',
              borderRadius: '8px',
              padding: '10px 15px',
              marginBottom: 20,
              boxShadow: '0px 1px 5px rgba(0, 0, 0, 0.1)',
            }}
          >
            Complete los datos del comprador. Ingrese el DNI y espere unos segundos mientras RENAPER verifica la información.
          </div>

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

            <Form.Item
              label="DNI"
              name="dni"
              rules={[
                { required: true, message: "Ingresa el DNI." },
                { pattern: /^\d{7,8}$/, message: "El DNI debe tener 7 u 8 dígitos." },
              ]}
            >
              <Input
                placeholder="Ingresa el DNI"
                onBlur={(e) => {
                  const dni = e.target.value;
                  if (dni) validateDNIWithRenaper(dni);
                }}
              />
            </Form.Item>

            <Form.Item label="Nombre" name="nombre" rules={[{ required: true, message: 'Ingresa el nombre.' }]}>
              <Input placeholder="Nombre completo" />
            </Form.Item>
            <Form.Item label="Apellido" name="apellido" rules={[{ required: true, message: 'Ingresa el apellido.' }]}>
              <Input placeholder="Apellido completo" />
            </Form.Item>
            <Form.Item
              label="Correo Electrónico"
              name="email"
              rules={[
                { required: true, message: 'Ingresa un correo electrónico.' },
                { type: 'email', message: 'Correo inválido.' },
              ]}
            >
              <Input placeholder="Correo Electrónico" />
            </Form.Item>
            <Form.Item
              label="CUIT"
              name="cuit"
              rules={[{ required: true, message: 'Ingresa el CUIT.' }]}
            >
              <Input placeholder="CUIT" />
            </Form.Item>

            <Form.Item
              label="Calle"
              name={['direccion', 'calle']}
              rules={[{ required: true, message: 'Ingresa la calle.' }]}
            >
              <Input placeholder="Calle" />
            </Form.Item>
            <Form.Item
              label="Numeración"
              name={['direccion', 'altura']}
              rules={[{ required: true, message: 'Ingresa la numeración.' }]}
            >
              <Input placeholder="Numeración" />
            </Form.Item>
            <Form.Item label="Barrio (Opcional)" name={['direccion', 'barrio']}>
              <Input placeholder="Barrio" />
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


            <Button type="primary" htmlType="submit" block loading={loading}>
              Siguiente
            </Button>
          </Form>
        </>
      )}

      {/* ============= PASO 2 ============= */}
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

          {/* =========== 2A: Bien Existente =========== */}
          {subStep2 === 'existente' && (() => {
  // Expandir la lista para mostrar 1 card por IMEI, SÓLO si es teléfono
  const bienesExpandidos = bienesFiltrados.flatMap((b) => {
    // Si es TELÉFONO MÓVIL y tiene 'identificadores'
    if (
      b.tipo?.toLowerCase().includes('teléfono') &&
      Array.isArray(b.identificadores) &&
      b.identificadores.length > 0
    ) {
      // Tomamos solo los IMEIs "no vendidos"
      const imeisDisponibles = b.identificadores.filter(
        (det) => det.estado !== 'vendido'  // Ocultar IMEIs vendidos
      );

      // Por cada IMEI disponible, creamos un 'item'
      return imeisDisponibles.map((det) => ({
        ...b,
        stock: 1, // cada IMEI es 1 unidad
        imeiSeleccionado: det.identificador_unico,
        estadoImei: det.estado,
        fotoImei: det.foto, // si tu backend envía 'det.foto'
        // O si no tienes foto individual, podrías reusar b.fotos?.[0]
      }));
    } else {
      // Bien normal => retornamos tal cual (1 item)
      // Ojo: si tu backend ya maneja b.fotos, muéstralas con b.fotos[0]
      // No hay 'estadoImei' aquí
      return [b];
    }
  });

  return (
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
        dataSource={bienesExpandidos}
        renderItem={(item) => {
          // Determinar qué foto mostrar:
          // - Si es teléfono => foto del IMEI (si existe)
          // - Si no => la 1era foto del Bien
          const fotoParaMostrar = item.tipo?.toLowerCase().includes('teléfono')
            ? (item.fotoImei || item.fotos?.[0]) // 1) fotoImei, sino fallback a la general
            : (item.fotos?.[0] || '/placeholder.png'); // Bien normal => su foto principal

          // Determinar la descripción:
          // - Si es teléfono => "IMEI: ... - Estado: ..."
          // - Si no => "Stock: ...", o lo que quieras
          const descripcion = item.tipo?.toLowerCase().includes('teléfono')
            ? `IMEI: ${item.imeiSeleccionado} - Estado: ${item.estadoImei || 'disponible'}`
            : `Stock: ${item.stock || 0}`;

          return (
            <List.Item key={item.imeiSeleccionado || item.uuid}>
              <Card
                hoverable
                cover={
                  <img
                    alt={item.descripcion || 'Bien'}
                    src={fotoParaMostrar}
                    onError={(e) => {
                      e.target.src = '/placeholder.png';
                    }}
                    style={{ height: 150, objectFit: 'cover' }}
                  />
                }
                onClick={() => handleSelectBien(item)}
              >
                <Card.Meta
                  title={`${item.marca} ${item.modelo}`}
                  description={descripcion}
                />
              </Card>
            </List.Item>
          );
        }}
      />
      <p>Haz clic en el bien (o IMEI) para avanzar al Paso 3.</p>
    </div>
  );
})()}


          {/* =========== 2B: Bien Nuevo =========== */}
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
                    setImeisPaso2B([]);
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

      {/* ============= PASO 3 ============= */}
      {step === 3 && (
        <Form
          layout="vertical"
          form={formPaso3}
          onFinish={handleFinishPaso3}
          onValuesChange={handleValuesChangePaso3}
        >
          <Title level={4}>Confirmar Venta</Title>

          {bienSeleccionado?.uuid ? (
            <p>Vas a vender el bien existente: {bienSeleccionado.marca} {bienSeleccionado.modelo}</p>
          ) : (
            <p>Vas a vender un bien NUEVO: {bienSeleccionado.tipo} {bienSeleccionado.marca} {bienSeleccionado.modelo}</p>
          )}
  
          <Form.Item
            label="Cantidad"
            name="cantidad"
            rules={[{
              required: true,
              type: 'number',
              min: 1,
              max: bienSeleccionado?.stock || 1,
              message: 'Debes ingresar una cantidad válida.',
            }]}
          >
            <InputNumber min={1} max={bienSeleccionado?.stock} style={{ width: '100%' }} />
          </Form.Item>
  
          <Form.Item
            label="Precio por unidad"
            name="precio"
            rules={[
              { required: true, message: 'Debes ingresar el precio por unidad.' },
              { type: 'number', min: 0, message: 'El precio debe ser un valor positivo.' },
            ]}
          >
            <InputNumber
              min={0}
              placeholder="Ingresa el precio por unidad"
              style={{ width: '100%' }}
              defaultValue={bienSeleccionado?.precio || 0}
            />
          </Form.Item>

          {bienSeleccionado?.tipo.toLowerCase() === 'teléfono movil' ? (
            <Form.Item
              label="Selecciona los IMEIs a vender"
              name="imeis"
              rules={[{ required: true, message: 'Debes seleccionar al menos un IMEI.' }]}
            >
              <Select
                mode="multiple"
                placeholder="Selecciona IMEIs"
                value={imeisSeleccionados}
                onChange={setImeisSeleccionados}
                // Si backend trae (b.identificadores = [{ identificador_unico:..., estado:...}])
                // Ajusta la 'label' y 'value' como necesites
                options={(bienSeleccionado.identificadores || []).map((detalle) => ({
                  label: detalle, // o detalle.identificador_unico
                  value: detalle, // o detalle.identificador_unico
                }))}
                style={{ width: '100%' }}
              />
            </Form.Item>
          ) : (
            <p style={{ color: 'gray' }}></p>
          )}

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
      
          <Button type="primary" htmlType="submit" block loading={loading} style={{ marginTop: 16 }}>
            Confirmar Venta
          </Button>
        </Form>
      )}

      {/* Modal confirmacion */}
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

      {/* Modal registrando Comprador (opcional) */}
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
