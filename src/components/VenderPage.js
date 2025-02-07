import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  message,
  Typography,
  Card,
  Radio,
  Upload,
  Table,
} from 'antd';
import {
  ArrowLeftOutlined,
  LogoutOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

// Acciones de Redux
import { fetchBienes, registrarVenta } from '../redux/actions/bienes';
import { checkExistingUser, registerUsuarioPorTercero } from '../redux/actions/usuarios';
import api from '../redux/axiosConfig';

const { Title, Text } = Typography;
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

  // Paso 1: Datos del comprador, Paso 2: Selección/registro de bienes, Paso 3: Confirmación de venta
  const [step, setStep] = useState(1);

  // Paso 1: Formulario de comprador
  const [formBuyer] = Form.useForm();
  const [compradorId, setCompradorId] = useState(null);

  // Paso 2: Bienes a vender
  const [bienesAVender, setBienesAVender] = useState([]);
  const [formGood] = Form.useForm();
  const [subStep2, setSubStep2] = useState(null); // "existente" o "nuevo"

  // Para bienes existentes
  const [bienes, setBienes] = useState([]);
  const [bienesFiltrados, setBienesFiltrados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGood, setSelectedGood] = useState(null);
  const [selectedGoods, setSelectedGoods] = useState([]);
const [tipoNuevo, setTipoNuevo] = useState(null);


  // Paginación para bienes existentes
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [hasMore, setHasMore] = useState(true);
  const [loadingBienes, setLoadingBienes] = useState(false);
  const observer = useRef();

  // Para bienes nuevos:
  // Fotos generales (para bienes sin IMEI)
  const [fileList, setFileList] = useState([]);
  // Para bienes de tipo "teléfono movil": array de objetos { imei, foto }
  const [imeisNuevo, setImeisNuevo] = useState([]);
  const [tiposDeBienes] = useState(tiposDeBienesIniciales);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [nuevaMarca, setNuevaMarca] = useState('');
  const [nuevoModelo, setNuevoModelo] = useState('');

  // Loading global
  const [loading, setLoading] = useState(false);

  // Para mostrar formulario adicional en Paso 3
  const [showAddForm, setShowAddForm] = useState(false);

  // Usuario vendedor obtenido del localStorage
  const usuario = JSON.parse(localStorage.getItem('userData') || '{}');
  const vendedorId = usuario?.uuid;

  useEffect(() => {
    if (!vendedorId) {
      message.error('Debe iniciar sesión como vendedor.');
      navigate('/login');
    }
  }, [vendedorId, navigate]);

  // --- Paso 1: Registro/Identificación del comprador ---
  const handleFinishPaso1 = async (values) => {
    console.log("Valores paso 1:", values);
    const { nombre, apellido, dni, email, tipo, cuit, direccion, razonSocial } = values;
    try {
      setLoading(true);
      const existingUserResponse = await dispatch(checkExistingUser({ dni, nombre, apellido }));
      console.log("Respuesta usuario existente:", existingUserResponse);
      if (existingUserResponse.existe) {
        setCompradorId(existingUserResponse.usuario.uuid);
        message.success("Comprador identificado correctamente.");
      } else {
        const newUserResponse = await dispatch(registerUsuarioPorTercero({
          dni, email, nombre, apellido, tipo, cuit, direccion,
          razonSocial: tipo === 'juridica' ? razonSocial : null,
        }));
        console.log("Respuesta registrar nuevo usuario:", newUserResponse);
        if (newUserResponse.uuid) {
          setCompradorId(newUserResponse.uuid);
          message.success("Comprador registrado con éxito.");
        } else {
          throw new Error("No se pudo registrar el comprador.");
        }
      }
      setStep(2);
    } catch (error) {
      console.error("Error en Paso 1 (comprador):", error.message);
      message.error(error.message || "Error al procesar el comprador.");
    } finally {
      setLoading(false);
    }
  };

  // --- Paso 2: Cargar bienes existentes con paginación ---
  useEffect(() => {
    if (step === 2 && subStep2 === 'existente') {
      const cargarBienes = async () => {
        setLoadingBienes(true);
        try {
          const response = await dispatch(fetchBienes(vendedorId, page, pageSize));
          if (response.success) {
            if (page === 1) {
              setBienes(response.data);
              setBienesFiltrados(response.data);
            } else {
              setBienes(prev => [...prev, ...response.data]);
              setBienesFiltrados(prev => [...prev, ...response.data]);
            }
            if (response.data.length < pageSize) {
              setHasMore(false);
            }
          } else {
            message.error("No se pudieron cargar bienes.");
          }
        } catch (error) {
          message.error("Error al cargar bienes.");
        } finally {
          setLoadingBienes(false);
        }
      };
      cargarBienes();
    }
  }, [step, subStep2, vendedorId, dispatch, page, pageSize]);

  // Función para búsqueda de bienes
  const handleSearchBienes = (val) => {
    setSearchTerm(val);
    if (!val.trim()) {
      setBienesFiltrados(bienes);
    } else {
      const filtered = bienes.filter(b =>
        (b.tipo || '').toLowerCase().includes(val.toLowerCase()) ||
        (b.marca || '').toLowerCase().includes(val.toLowerCase()) ||
        (b.modelo || '').toLowerCase().includes(val.toLowerCase())
      );
      setBienesFiltrados(filtered);
    }
  };

  // Paginación infinita
  const loadMoreBienes = () => {
    setPage(prev => prev + 1);
  };

  const lastBienElementRef = useCallback(node => {
    if (loadingBienes) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreBienes();
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingBienes, hasMore]);

  // --- Funciones para bienes nuevos (tipo, marca, modelo) ---
  const handleTipoChange = async (tipo) => {
    try {
      const r = await api.get(`/bienes/bienes/marcas?tipo=${tipo}`);
      if (r.status === 200 && r.data.marcas) {
        setMarcas(r.data.marcas);
        formGood.setFieldsValue({ marca: undefined, modelo: undefined });
        setModelos([]);
      } else {
        setMarcas([]);
      }
    } catch (err) {
      message.error("Error al cargar marcas.");
    }
  };

  const handleMarcaChange = async (marca) => {
    const tipo = formGood.getFieldValue('tipo');
    if (!tipo || !marca) return;
    try {
      const r = await api.get(`/bienes/bienes/modelos?tipo=${tipo}&marca=${marca}`);
      if (r.status === 200 && r.data.modelos) {
        setModelos(r.data.modelos);
        formGood.setFieldsValue({ modelo: undefined });
      } else {
        setModelos([]);
      }
    } catch (err) {
      message.error("Error al cargar modelos.");
    }
  };

  const agregarNuevaMarca = async () => {
    const marcaTrim = nuevaMarca.trim();
    if (!marcaTrim) return message.warning("La marca no puede estar vacía.");
    const tipo = formGood.getFieldValue('tipo');
    if (!tipo) return message.warning("Selecciona un tipo primero.");
    try {
      const r = await api.post('/bienes/bienes/marcas', { tipo, marca: marcaTrim });
      if (r.status === 201) {
        message.success(`Marca ${marcaTrim} agregada.`);
        setMarcas(prev => [...prev, marcaTrim]);
        formGood.setFieldsValue({ marca: marcaTrim });
        setNuevaMarca('');
      }
    } catch (err) {
      message.error("Error al agregar marca.");
    }
  };

  const agregarNuevoModelo = async () => {
    const modeloTrim = nuevoModelo.trim();
    if (!modeloTrim) return message.warning("El modelo no puede estar vacío.");
    const tipo = formGood.getFieldValue('tipo');
    const marca = formGood.getFieldValue('marca');
    if (!tipo || !marca) return message.warning("Selecciona tipo y marca.");
    try {
      const r = await api.post('/bienes/bienes/modelos', { tipo, marca, modelo: modeloTrim });
      if (r.status === 201) {
        message.success(`Modelo ${modeloTrim} agregado.`);
        setModelos(prev => [...prev, modeloTrim]);
        formGood.setFieldsValue({ modelo: modeloTrim });
        setNuevoModelo('');
      }
    } catch (err) {
      message.error("Error al agregar modelo.");
    }
  };

  // --- Funciones para bienes de tipo "teléfono movil" ---
  const handleCantidadChange = (value) => {
    if (formGood.getFieldValue('tipo')?.toLowerCase() === "teléfono movil") {
      setImeisNuevo(prev => {
        let nuevos = prev.slice(0, value);
        while (nuevos.length < value) {
          nuevos.push({ imei: '', foto: null });
        }
        return nuevos;
      });
    }
  };

  const actualizarImei = (index, value) => {
    setImeisNuevo(prev => {
      const nuevos = [...prev];
      nuevos[index].imei = value;
      return nuevos;
    });
  };
  const actualizarFotoImei = (index, file) => {
    console.log(`📌 Guardando imagen para IMEI en índice ${index}:`, file);
    setImeisNuevo(prev => {
      const nuevos = [...prev];
      nuevos[index].foto = file;
      return nuevos;
    });
  };

  const eliminarImei = (index) => {
    setImeisNuevo(prev => {
      const nuevos = [...prev];
      nuevos.splice(index, 1);
      return nuevos;
    });
  };

  // --- Función para agregar el bien a la venta ---
  const agregarBienAVenta = (values) => {
    let bienesParaAgregar = [];
  
    if (subStep2 === 'existente') {
      if (!selectedGoods || selectedGoods.length === 0) {
        message.error("Debes seleccionar al menos un bien existente.");
        return;
      }
      bienesParaAgregar = selectedGoods.map(bien => ({
        uuid: bien.uuid,
        tipo: bien.tipo,
        marca: bien.marca,
        modelo: bien.modelo,
        descripcion: bien.descripcion,
        precio: values.precio || bien.precio,
        cantidad: values.cantidad || 1,
        metodoPago: values.metodoPago || "efectivo",
        imeis: bien.tipo.toLowerCase().includes("teléfono")
          ? values.imeis.map(imei => ({ imei, foto: null }))
          : [],
        fotos: bien.fotos || [], // Conserva las fotos que vienen del registro
      }));
    } else if (subStep2 === 'nuevo') {
      bienesParaAgregar.push({
        uuid: null,
        tipo: values.tipo,
        marca: values.marca,
        modelo: values.modelo,
        descripcion: values.descripcion,
        precio: values.precio,
        cantidad: values.cantidad,
        metodoPago: values.metodoPago || "efectivo",
        imeis: values.tipo.toLowerCase() === "teléfono movil" ? imeisNuevo : [],
        fotos: fileList.map(file => ({
          url: file.originFileObj,  // Se envía como objeto de archivo
        })),
      });
    }
  
    setBienesAVender(prev => [...prev, ...bienesParaAgregar]);
    message.success("Bien agregado a la venta.");
  
    // Resetear formularios y estados
    formGood.resetFields();
    setFileList([]);
    setImeisNuevo([]);
    setSelectedGoods([]);
    setSelectedGood(null);
  };

  const eliminarBienAVenta = (index) => {
    setBienesAVender(prev => prev.filter((_, i) => i !== index));
    message.success("Bien eliminado.");
  };

  useEffect(() => {
    console.log("Estado actualizado de bienesAVender:", bienesAVender);
  }, [bienesAVender]);

  // --- Función para confirmar la venta ---
  const confirmarVenta = async () => {
    const formData = new FormData();
    formData.append("vendedorUuid", vendedorId);
    formData.append("compradorId", compradorId);
  
    const bienesParaEnviar = bienesAVender.map((bien) => ({
      ...bien,
      imeis: bien.imeis.map((imeiObj) => imeiObj.imei)
    }));
  
    formData.append("ventaData", JSON.stringify(bienesParaEnviar));
  
    bienesAVender.forEach((bien, i) => {
      if (bien.fotos && bien.fotos.length > 0) {
        bien.fotos.forEach((foto, j) => {
          if (foto.originFileObj) {
            formData.append(`venta[${i}][fotos][${j}]`, foto.originFileObj);
          }
        });
      }
  
      if (bien.imeis && bien.imeis.length > 0) {
        bien.imeis.forEach((imeiObj, j) => {
          formData.append(`venta[${i}][imeis][${j}][imei]`, imeiObj.imei);
          const fileToAppend = (imeiObj.foto && imeiObj.foto.originFileObj)
            ? imeiObj.foto.originFileObj
            : imeiObj.foto;
          if (fileToAppend) {
            formData.append(`venta[${i}][imeis][${j}][foto]`, fileToAppend);
          }
        });
      }
    });
  
    console.log("📌 Contenido de FormData antes de enviar:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
  
    try {
      setLoading(true);
      const response = await dispatch(registrarVenta(formData));
      if (response?.message === "Venta registrada correctamente.") {
        message.success("Venta completada con éxito.");
        navigate("/user/dashboard");
      } else {
        throw new Error(response?.message || "Error al registrar la venta.");
      }
    } catch (error) {
      console.error("❌ Error en registrarVenta:", error);
      message.error(error.message || "Error al procesar la venta.");
    } finally {
      setLoading(false);
    }
  };

  // --- Función para validar DNI con RENAPER ---
  const validateDNIWithRenaper = async (dni) => {
    try {
      if (!dni) {
        message.error("El DNI es obligatorio.");
        return;
      }
      const { data } = await api.get(`/renaper/${dni}`);
      if (data.success) {
        const persona = data.data.persona;
        formBuyer.setFieldsValue({
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

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 20 }}>
        Formulario para Vender Múltiples Bienes
      </Title>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => {
          if (step === 1) navigate('/user/dashboard');
          else setStep(step - 1);
        }}>
          Volver
        </Button>
        <Button icon={<LogoutOutlined />} onClick={() => {
          localStorage.removeItem('userData');
          navigate('/home');
        }}>
          Cerrar Sesión
        </Button>
      </div>

      {/* Paso 1: Datos del Comprador */}
      {step === 1 && (
        <>
          <Title level={3}>Paso 1: Datos del Comprador</Title>
          <div style={{
            backgroundColor: '#fff4c2',
            borderRadius: '8px',
            padding: '10px 15px',
            marginBottom: 20,
            boxShadow: '0px 1px 5px rgba(0, 0, 0, 0.1)'
          }}>
            <Text style={{ fontSize: '1rem' }}>
              Complete los datos del comprador. Ingrese el DNI y espere mientras RENAPER verifica la información.
            </Text>
          </div>
          <Form layout="vertical" form={formBuyer} onFinish={handleFinishPaso1}>
            <Form.Item label="Tipo de Persona" name="tipo" rules={[{ required: true, message: 'Selecciona el tipo de persona.' }]}>
              <Select placeholder="Selecciona tipo">
                <Option value="persona">Persona Humana</Option>
                <Option value="juridica">Persona Jurídica</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="DNI"
              name="dni"
              rules={[
                { required: true, message: 'Ingresa el DNI.' },
                { pattern: /^\d{7,8}$/, message: 'El DNI debe tener 7 u 8 dígitos.' },
              ]}
            >
              <Input placeholder="DNI" onBlur={(e) => validateDNIWithRenaper(e.target.value)} />
            </Form.Item>
            <Form.Item label="Nombre" name="nombre" rules={[{ required: true, message: 'Ingresa el nombre.' }]}>
              <Input placeholder="Nombre" />
            </Form.Item>
            <Form.Item label="Apellido" name="apellido" rules={[{ required: true, message: 'Ingresa el apellido.' }]}>
              <Input placeholder="Apellido" />
            </Form.Item>
            <Form.Item label="Correo Electrónico" name="email" rules={[{ required: true, type: 'email', message: 'Ingresa un correo válido.' }]}>
              <Input placeholder="Email" />
            </Form.Item>
            <Form.Item label="CUIT" name="cuit" rules={[{ required: true, message: 'Ingresa el CUIT.' }]}>
              <Input placeholder="CUIT" />
            </Form.Item>
            <Form.Item label="Calle" name={['direccion', 'calle']} rules={[{ required: true, message: 'Ingresa la calle.' }]}>
              <Input placeholder="Calle" />
            </Form.Item>
            <Form.Item label="Numeración" name={['direccion', 'altura']} rules={[{ required: true, message: 'Ingresa la numeración.' }]}>
              <Input placeholder="Numeración" />
            </Form.Item>
            <Form.Item label="Departamento" name={['direccion', 'departamento']} rules={[{ required: true, message: 'Selecciona un departamento.' }]}>
              <Select>
                {departments.map(dep => <Option key={dep} value={dep}>{dep}</Option>)}
              </Select>
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Siguiente
            </Button>
          </Form>
        </>
      )}

      {/* Paso 2: Seleccionar o Registrar Bienes */}
      {step === 2 && (
        <>
          <Title level={3}>Paso 2: Seleccionar o Registrar Bienes</Title>
          <div style={{ marginBottom: 20 }}>
            <Radio.Group value={subStep2} onChange={(e) => {
              setSubStep2(e.target.value);
              formGood.resetFields();
              setSelectedGood(null);
              setPage(1);
              setHasMore(true);
            }}>
              <Radio value="existente">Bien Existente</Radio>
              <Radio value="nuevo">Registrar Bien Nuevo</Radio>
            </Radio.Group>
          </div>
          {/* Bienes Existentes */}
          {subStep2 === 'existente' && (
            <div>
              <Search
                placeholder="Buscar bienes por tipo, marca, modelo..."
                value={searchTerm}
                onChange={(e) => handleSearchBienes(e.target.value)}
                onSearch={handleSearchBienes}
                enterButton={<SearchOutlined />}
                style={{ marginBottom: 16, maxWidth: 300 }}
              />
              <div id="scrollableDiv" style={{ overflow: 'auto', height: '60vh' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                 {bienesFiltrados.map((bien, i) => {
  // Se define la imagen principal usando "todasLasFotos"
  const fotoPrincipal =
    Array.isArray(bien.todasLasFotos) && bien.todasLasFotos.length > 0 && bien.todasLasFotos[0]
      ? bien.todasLasFotos[0]
      : '/placeholder.png';

  return (
    <Card
      key={bien.uuid}
      hoverable
      onClick={() => {
        setSelectedGood(bien);
        setSelectedGoods(prev => [...prev, bien]);
        message.info(`Seleccionaste: ${bien.marca} ${bien.modelo}`);
        // Desplazarse hacia el formulario de completar datos, si existe
        document.getElementById('formCompletarDatos')?.scrollIntoView({ behavior: 'smooth' });
      }}
      style={{ cursor: 'pointer' }}
      ref={i === bienesFiltrados.length - 1 ? lastBienElementRef : null}
    >
      <img
        alt={bien.descripcion || 'Imagen del bien'}
        src={fotoPrincipal}
        style={{ width: '100%', height: 150, objectFit: 'cover' }}
        onError={(e) => {
          e.target.src = '/placeholder.png';
        }}
      />
      <Card.Meta
        title={`${bien.marca} ${bien.modelo}`}
        description={bien.descripcion || bien.tipo}
      />
      {bien.tipo.toLowerCase().includes('teléfono') && bien.identificadores && (
        <div style={{ marginTop: 8, fontSize: 12 }}>
          {(bien.identificadores || []).map((det, idx) => (
            <p key={idx}>IMEI: {det.identificador_unico}</p>
          ))}
        </div>
      )}
    </Card>
  );
})}

                </div>
                {loadingBienes && <p>Espere mientras se cargan los bienes...</p>}
                {!hasMore && <p style={{ textAlign: 'center' }}>No hay más bienes.</p>}
              </div>
              {selectedGood && (
                <div id="formCompletarDatos" style={{ marginTop: 10 }}>
                  <p>Completa los datos para el bien seleccionado: {selectedGood.marca} {selectedGood.modelo}</p>
                  <Form layout="vertical" form={formGood} onFinish={agregarBienAVenta}>
                    <Form.Item label="Cantidad" name="cantidad" rules={[
                      { required: true, message: 'Ingresa la cantidad.' },
                      { type: 'number', min: 1, message: 'Debe ser mayor a 0.' }
                    ]}>
                      <InputNumber min={1} style={{ width: '100%' }} onChange={handleCantidadChange} />
                    </Form.Item>
                    <Form.Item label="Precio por unidad" name="precio" rules={[{ required: true, message: 'Ingresa el precio.' }]}>
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    {selectedGood.tipo.toLowerCase().includes('teléfono') && (
                      <Form.Item label="Selecciona IMEIS a vender" name="imeis" rules={[{ required: true, message: 'Selecciona al menos un IMEI.' }]}>
                        <Select
                          mode="multiple"
                          placeholder="Selecciona IMEIS"
                          style={{ width: '100%' }}
                          options={(selectedGood.identificadores || []).map(det => ({
                            label: det.identificador_unico,
                            value: det.identificador_unico,
                          }))}
                        />
                      </Form.Item>
                    )}
                    <Form.Item label="Método de Pago" name="metodoPago" rules={[{ required: true, message: 'Selecciona un método de pago.' }]}>
                      <Select placeholder="Método de Pago">
                        <Option value="efectivo">Efectivo</Option>
                        <Option value="transferencia">Transferencia</Option>
                        <Option value="tarjeta">Tarjeta</Option>
                      </Select>
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block style={{ marginTop: 16 }}>
                      Agregar Bien
                    </Button>
                  </Form>
                </div>
              )}
            </div>
          )}
          {/* Para registrar un bien nuevo */}
          {subStep2 === 'nuevo' && (
            <Form layout="vertical" form={formGood} onFinish={agregarBienAVenta}>
           <Form.Item
  label="Tipo de Bien"
  name="tipo"
  rules={[{ required: true, message: 'Selecciona un tipo.' }]}
>
  <Select
    placeholder="Tipo"
    onChange={(val) => {
      setTipoNuevo(val); // Actualiza el estado con el tipo seleccionado
      handleTipoChange(val);
      formGood.setFieldsValue({ marca: undefined, modelo: undefined });
      setMarcas([]);
      setModelos([]);
    }}
  >
    {tiposDeBienes.map(t => (
      <Option key={t} value={t}>
        {t}
      </Option>
    ))}
  </Select>
</Form.Item>

              <Form.Item label="Marca" name="marca" rules={[{ required: true, message: 'Selecciona o ingresa una marca.' }]}>
                <Select placeholder="Marca" onChange={(val) => handleMarcaChange(val)}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <div style={{ display: 'flex', padding: 8 }}>
                        <Input value={nuevaMarca} onChange={(e) => setNuevaMarca(e.target.value)} placeholder="Nueva marca" />
                        <Button type="text" onClick={agregarNuevaMarca}>Agregar</Button>
                      </div>
                    </>
                  )}
                >
                  {marcas.map(m => <Option key={m} value={m}>{m}</Option>)}
                </Select>
              </Form.Item>
              <Form.Item label="Modelo" name="modelo" rules={[{ required: true, message: 'Selecciona o ingresa un modelo.' }]}>
                <Select placeholder="Modelo" dropdownRender={(menu) => (
                  <>
                    {menu}
                    <div style={{ display: 'flex', padding: 8 }}>
                      <Input value={nuevoModelo} onChange={(e) => setNuevoModelo(e.target.value)} placeholder="Nuevo modelo" />
                      <Button type="text" onClick={agregarNuevoModelo}>Agregar</Button>
                    </div>
                  </>
                )}>
                  {modelos.map(mod => <Option key={mod} value={mod}>{mod}</Option>)}
                </Select>
              </Form.Item>
              <Form.Item label="Descripción" name="descripcion" rules={[{ required: true, message: 'Ingresa una descripción.' }]}>
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item label="Cantidad" name="cantidad" rules={[
                { required: true, message: 'Ingresa la cantidad.' },
                { type: 'number', min: 1, message: 'La cantidad debe ser mayor a 0.' }
              ]}>
                <InputNumber min={1} style={{ width: '100%' }} onChange={handleCantidadChange} />
              </Form.Item>
              {tipoNuevo?.toLowerCase() !== 'teléfono movil' && (
  <Form.Item label="Fotos del Bien">
    <Upload
      name="fotos"
      listType="picture"
      fileList={fileList}
      onChange={({ fileList: newFileList }) => {
        console.log("Fotos seleccionadas (bien nuevo):", newFileList);
        setFileList(newFileList);
      }}
      beforeUpload={() => false}
    >
      <Button>Subir Fotos</Button>
    </Upload>
  </Form.Item>
)}

              {formGood.getFieldValue('tipo')?.toLowerCase() === 'teléfono movil' && (
                <>
                  <p>Ingresa los IMEIS y sube una foto para cada teléfono:</p>
                  {imeisNuevo.map((item, index) => (
                    <div key={index} style={{ marginBottom: '10px', border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
                      <Form.Item label={`IMEI #${index + 1}`}>
                        <Input
                          placeholder="Ingrese el IMEI"
                          value={item.imei}
                          onChange={(e) => actualizarImei(index, e.target.value)}
                        />
                      </Form.Item>
                      <Form.Item label="Foto del IMEI">
                        <Upload
                          name="imeiFoto"
                          listType="picture"
                          beforeUpload={(file) => {
                            actualizarFotoImei(index, file);
                            return false;
                          }}
                          showUploadList={true}
                        >
                          <Button>Subir Foto IMEI</Button>
                        </Upload>
                      </Form.Item>
                      <Button type="danger" onClick={() => eliminarImei(index)}>Eliminar</Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => setImeisNuevo(prev => [...prev, { imei: '', foto: null }])} style={{ width: '100%', marginTop: 8 }}>
                    Agregar IMEI
                  </Button>
                </>
              )}
              <Form.Item label="Precio" name="precio" rules={[{ required: true, message: 'Ingresa un precio.' }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
              <Button type="primary" htmlType="submit" block style={{ marginTop: 16 }}>
                Agregar Bien
              </Button>
            </Form>
          )}
          {/* Tabla de Bienes Agregados */}
          {bienesAVender.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <Title level={4}>Bienes a Vender</Title>
              <Table
                dataSource={bienesAVender}
                columns={[
                  { title: 'Tipo', dataIndex: 'tipo', key: 'tipo' },
                  { title: 'Marca', dataIndex: 'marca', key: 'marca' },
                  { title: 'Modelo', dataIndex: 'modelo', key: 'modelo' },
                  { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
                  {
                    title: 'Acciones',
                    key: 'acciones',
                    render: (_, record, index) => (
                      <Button type="danger" onClick={() => eliminarBienAVenta(index)}>Eliminar</Button>
                    )
                  }
                ]}
                rowKey={(record, index) => index.toString()}
              />
            </div>
          )}
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={() => setStep(2)}>Volver a Seleccionar Bienes</Button>
            <Button type="primary" onClick={confirmarVenta} disabled={bienesAVender.length === 0}>
              Confirmar Venta
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default VenderPage;
