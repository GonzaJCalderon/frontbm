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
  Spin,
  Steps,
  Modal,
  Checkbox,
  Tag, 
  Tooltip, 
} from 'antd';
import {
  ArrowLeftOutlined,
  LogoutOutlined,
  SearchOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import imagenPredeterminada from '../assets/27002.jpg'; 
import { v4 as uuidv4 } from 'uuid'; 

import { useNavigate } from 'react-router-dom';
import { useDispatch,  useSelector,  } from 'react-redux';

// Acciones de Redux
import { fetchBienes,fetchBienesPorEmpresa, registrarVenta, fetchAllBienes,addBien } from '../redux/actions/bienes';
import { checkExistingUser, registerUsuarioPorTercero,  fetchRenaperData } from '../redux/actions/usuarios';
import imeiEjemplo from '../assets/imei-ejemplo.png';



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

const { Step } = Steps;
const VenderPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const renaperState = useSelector(state => state.renaper || {});
  const { loading: renaperLoading, error: renaperError } = renaperState;

  // Paso 1: Datos del comprador, Paso 2: Selección/registro de bienes, Paso 3: Confirimación de venta
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
  const [imeisSeleccionadosExistente, setImeisSeleccionadosExistente] = useState([]);
  const [tipoNuevo, setTipoNuevo] = useState('');
  const isFetchingDni = useRef(false);
  const [emailComprador, setEmailComprador] = useState('');
  const [modalImeiVisible, setModalImeiVisible] = useState(false);






  // Paginación para bienes existentes
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [hasMore, setHasMore] = useState(true);
  const [loadingBienes, setLoadingBienes] = useState(false);
  const observer = useRef();



  // Para bienes nuevos:
  // Fotos generales (para bienes sin IMEI)
  const [fileList, setFileList] = useState([]);
  const [imeisNuevo, setImeisNuevo] = useState([]);
  const [tiposDeBienes] = useState(tiposDeBienesIniciales);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [nuevaMarca, setNuevaMarca] = useState('');
  const [nuevoModelo, setNuevoModelo] = useState('');
  const [totalPrecioIndividual, setTotalPrecioIndividual] = useState(0);
  const [cantidadVisual, setCantidadVisual] = useState(1);


  // Loading global
  const [loading, setLoading] = useState(false);
  const [loadingVenta, setLoadingVenta] = useState(false);




  // Para mostrar formulario adicional en Paso 3
  const [showAddForm, setShowAddForm] = useState(false);

  // Usuario vendedor obtenido del localStorage
  const usuario = JSON.parse(localStorage.getItem('userData') || '{}');

  // 🔥 Determina si vende como empresa
  const vendiendoComoEmpresa = Boolean(usuario?.empresaUuid);
  
  // Esto sigue igual:
  const vendedorId = usuario?.empresaUuid || usuario?.uuid;
  
  
  if (!vendedorId) {
    message.error('Debe iniciar sesión como vendedor.');
    navigate('/login');
  }
  
  const esDeMendoza = (provincia = '') =>
  provincia.trim().toUpperCase().includes('MENDOZA');


  useEffect(() => {
    if (selectedGood) {
      formGood.setFieldsValue({
        tipo: selectedGood.tipo,
        marca: selectedGood.marca,
        modelo: selectedGood.modelo,
        descripcion: selectedGood.descripcion,
        precio: selectedGood.precio,
        cantidad: 1,
      });
  
      // 📦 Mostrar stock disponible
      const stockDisponible = selectedGood.tipo.toLowerCase() === "teléfono movil"
        ? (selectedGood.identificadores?.filter(i => i.estado === 'disponible').length ?? 0)
        : (selectedGood.stock ?? 0);
  
      message.info(`📦 Stock disponible: ${stockDisponible} unidad(es)`);
  
      if (selectedGood.tipo.toLowerCase() === "teléfono movil") {
        const imeisCargados = (selectedGood.identificadores || []).map(det => ({
          imei: det.identificador_unico,
          foto: null,
          precio: selectedGood.precio,
        }));
        setImeisNuevo(imeisCargados);
      }
    }
  }, [selectedGood, formGood]);
  

  useEffect(() => {
    if (
      selectedGood &&
      selectedGood.tipo.toLowerCase() === "teléfono movil"
    ) {
      const nuevaCantidad = imeisSeleccionadosExistente.length;
      setCantidadVisual(nuevaCantidad); // 🔥 Update visual
      formGood.setFieldsValue({ cantidad: nuevaCantidad }); // Update formulario
    }
  }, [imeisSeleccionadosExistente, selectedGood]);
  
  useEffect(() => {
    if (selectedGood) {
      setImeisSeleccionadosExistente([]);
    }
  }, [selectedGood]);
  
  
  

  useEffect(() => {
    if (!vendedorId) {
      message.error('Debe iniciar sesión como vendedor.');
      navigate('/login');
    }
  }, [vendedorId, navigate]);

  // --- Paso 1: Registro/Identificación del comprador ---
  const handleFinishPaso1 = async (values) => {
    const { nombre, apellido, dni, email, tipo, cuit, direccion, razonSocial } = values;
  
    try {
      setLoading(true);
  
      if (compradorId) {
        // Ya tenemos comprador
        if (!email) {
          message.error("Debes ingresar el correo electrónico del comprador.");
          return;
        }
  
        message.success("✅ Comprador listo para continuar.");
        setStep(2);
        return;
      }
  
      // Buscar en base de datos
      const existingUserResponse = await dispatch(checkExistingUser({ dni, nombre, apellido }));
  
      if (existingUserResponse?.existe) {
        const usuarioExistente = existingUserResponse.usuario;
        setCompradorId(usuarioExistente.uuid);
  
        if (usuarioExistente.email) {
          formBuyer.setFieldsValue({ email: usuarioExistente.email });
          setEmailComprador(usuarioExistente.email);
        } else if (!email) {
          message.error("⚠️ El comprador no tiene email en la base. Debes ingresarlo manualmente.");
          return;
        }
  
        message.success("✅ Comprador encontrado en sistema.");
        setStep(2); // Pasar al siguiente paso
        return; // 🔥 NO registrar de nuevo
      }
  
      // Si no existe, registrar
      if (!email) {
        message.error("Debes ingresar el correo electrónico para registrar al nuevo comprador.");
        return;
      }
  
      const newUserResponse = await dispatch(registerUsuarioPorTercero({
        dni,
        nombre,
        apellido,
        email,
        tipo,
        cuit,
        direccion,
        razonSocial: tipo === 'juridica' ? razonSocial : null,
      }));
  
      if (newUserResponse?.uuid) {
        setCompradorId(newUserResponse.uuid);
        message.success("✅ Comprador registrado correctamente.");
        setStep(2);
      } else {
        throw new Error("❌ No se pudo registrar el comprador.");
      }
    } catch (error) {
      console.error(error);
      message.error(error.message || "Error al procesar el comprador.");
    } finally {
      setLoading(false);
    }
  };
  
  
  
  
  
  
  
  useEffect(() => {
    const total = imeisNuevo.reduce((acc, curr) => acc + (Number(curr.precio) || 0), 0);
    setTotalPrecioIndividual(total);
  }, [imeisNuevo]);
  

  // --- Paso 2: Cargar bienes existentes con paginación ---
  useEffect(() => {
    if (step === 2 && subStep2 === "existente") {
      const cargarBienes = async () => {
        setLoadingBienes(true);
        try {
          if (!vendedorId) {
            message.error("❌ No se encontró el vendedor.");
            return;
          }
  
          const vendiendoComoEmpresa = Boolean(usuario?.empresaUuid);

          const response = vendiendoComoEmpresa
            ? await dispatch(fetchBienesPorEmpresa(usuario.empresaUuid))
            : await dispatch(fetchBienes(usuario.uuid));
          


  
          if (!response || typeof response !== 'object') {
            throw new Error("Respuesta de fetchBienes es inválida.");
          }
  
          if (!response.success) {
            throw new Error(response.message || "No se pudieron cargar bienes.");
          }
  
          const bienesDisponibles = response.data.filter(bien => {
            const esTelefono = bien.tipo?.toLowerCase().includes("teléfono movil");
            if (esTelefono) {
              return (bien.identificadores || []).some((i) => i.estado === 'disponible');
            }
            return bien.stock && bien.stock > 0;
          });
          
          
  
          if (bienesDisponibles.length === 0) {
            message.warning("No hay bienes disponibles para vender.");
          }
  
          if (page === 1) {
            setBienes(bienesDisponibles);
            setBienesFiltrados(bienesDisponibles);
          } else {
            setBienes(prev => [...prev, ...bienesDisponibles]);
            setBienesFiltrados(prev => [...prev, ...bienesDisponibles]);
          }
  
  
          if (bienesDisponibles.length < pageSize) {
            setHasMore(false);
          }
        } catch (error) {
          message.error(error.message || "Error al cargar bienes.");
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
  
      if (filtered.length === 0) {
      }
  
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
    setTipoNuevo(tipo);
    try {
      const r = await api.get(`/bienes/marcas?tipo=${tipo}`);
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
      const r = await api.get(`/bienes/modelos?tipo=${tipo}&marca=${marca}`);
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
      const r = await api.post('/bienes/marcas', { tipo, marca: marcaTrim });
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
      const r = await api.post('/bienes/modelos', { tipo, marca, modelo: modeloTrim });
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
          nuevos.push({ imei: '', foto: null, precio: null });
        }
        return nuevos;
      });
    }
  };

  const iconoPorTipo = (tipo) => {
  const map = {
    'bicicleta': '🚲',
    'tv': '📺',
    'equipo de audio': '🔊',
    'cámara fotográfica': '📷',
    'notebook': '💻',
    'tablet': '📱',
    'teléfono movil': '📱'
  };
  return map[tipo?.toLowerCase()] || '📦';
};

  
// Actualizar el IMEI
const actualizarImei = (index, value) => {
  setImeisNuevo(prev => {
    const nuevos = [...prev];
    nuevos[index].imei = value;
    return nuevos;
  });
};

// Actualizar el precio individual
const actualizarPrecioImei = (index, value) => {
  setImeisNuevo(prev => {
    const nuevos = [...prev];
    nuevos[index].precio = value;

    // 🔥 Recalcular el total de precios individuales
    const total = nuevos.reduce((acc, curr) => acc + (Number(curr.precio) || 0), 0);
    setTotalPrecioIndividual(total);

    return nuevos;
  });
};



// Actualizar la foto


const actualizarFotoImei = (index, file) => {
  if (!file) {
    return;
  }

  const updatedImeis = imeisNuevo.map((imei, i) => {
    if (i === index) {
      return { ...imei, foto: file.originFileObj || file };
    }
    return imei;
  });

  setImeisNuevo(updatedImeis);

  // 🔥 Actualiza correctamente bienesAVender desde aquí
  setBienesAVender(prevBienes => prevBienes.map(bien => {
    if (bien.tipo.toLowerCase() === "teléfono movil") {
      return {
        ...bien,
        imeis: updatedImeis, // 🟢 Ahora sí actualiza correctamente
      };
    }
    return bien;
  }));

};



// Función para eliminar un teléfono
const eliminarImei = (index) => {
  setImeisNuevo(prev => {
    const nuevos = [...prev];
    nuevos.splice(index, 1);
    return nuevos;
  });
};

  // --- Función para agregar el bien a la venta ---
// --- Función para agregar el bien a la venta ---
const agregarBienAVenta = (values) => {
  const bienesParaAgregar = [];

  const tipo = values.tipo?.toLowerCase();
  const esTelefono = tipo === "teléfono movil";
  const marca = values.marca;
  const modelo = values.modelo;
  const descripcion = values.descripcion?.trim();

  // 📌 Detectar duplicado en bienesAVender
  const yaExiste = bienesAVender.some((bien) => {
    const bienTipo = bien.tipo?.toLowerCase();
    if (esTelefono) {
      const nuevosImeis = imeisNuevo.map(i => i.imei?.trim()).filter(Boolean);
      const existentesImeis = bien.imeis?.map(i => i.imei?.trim()) || [];
      return (
        bienTipo === tipo &&
        bien.marca === marca &&
        bien.modelo === modelo &&
        nuevosImeis.some(imei => existentesImeis.includes(imei))
      );
    } else {
      return (
        bienTipo === tipo &&
        bien.marca === marca &&
        bien.modelo === modelo &&
        bien.descripcion?.trim() === descripcion
      );
    }
  });

  if (yaExiste) {
    message.warning("⚠️ Ya agregaste un bien similar a la venta.");
    return;
  }

  // 📌 SI EL BIEN ES NUEVO
  if (subStep2 === "nuevo") {
    const imeisFiltrados = imeisNuevo.filter(imei => imei.imei && imei.imei.trim());

    const bienNuevo = {
      uuid: null, // nuevo bien
      tipo: values.tipo,
      marca: values.marca,
      modelo: values.modelo,
      descripcion: values.descripcion,
      cantidad: esTelefono ? imeisFiltrados.length : values.cantidad,
      metodoPago: values.metodoPago || "efectivo",
      imeis: [],
      fotos: [],
    };

   if (esTelefono) {
  bienNuevo.imeis = imeisFiltrados.map((imeiObj) => ({
    imei: imeiObj.imei,
    precio: imeiObj.precio,
    foto: imeiObj.foto ? imeiObj.foto.originFileObj || imeiObj.foto : null,
  }));

  // 🔥 Agregá esto para asegurar que el campo `precio` esté definido (aunque no se use directamente)
  bienNuevo.precio = totalPrecioIndividual;

  // 🔥 Agregá esto si querés conservar fotos a nivel general (por ejemplo, del lote)
  bienNuevo.fotos = imeisFiltrados.map(i => i.foto).filter(Boolean);
}


    bienesParaAgregar.push(bienNuevo);
  }

  // 📌 SI EL BIEN YA ESTÁ REGISTRADO
  if (subStep2 === "existente") {
    if (!selectedGood) {
      message.warning("⚠️ No has seleccionado un bien existente.");
      return;
    }
  
    const tipo = selectedGood.tipo.toLowerCase();
    const cantidadSolicitada = values.cantidad ?? 0;
    
    const stockDisponible = tipo === "teléfono movil"
      ? (selectedGood.identificadores?.filter(i => i.estado === 'disponible').length ?? 0)
      : (selectedGood.stock ?? 0);
  
    if (tipo !== "teléfono movil" && cantidadSolicitada > stockDisponible) {
      message.error(`❌ No hay suficientes unidades disponibles para ${selectedGood.marca} ${selectedGood.modelo}. Se requieren ${cantidadSolicitada}, pero solo hay ${stockDisponible} disponibles.`);
      return;
    }
  
  
    // 🟢 Validación IMEI para teléfonos ya está OK
    if (
      selectedGood.tipo.toLowerCase() === "teléfono movil" &&
      imeisSeleccionadosExistente.length === 0
    ) {
      message.warning("⚠️ Debes seleccionar al menos un IMEI para este teléfono.");
      return;
    }

  
let cantidadFinal = values.cantidad; 
if (selectedGood.tipo.toLowerCase() === "teléfono movil") {
  cantidadFinal = imeisSeleccionadosExistente.length;
}

const bienExistente = {
  uuid: selectedGood.uuid,
  tipo: selectedGood.tipo,
  marca: selectedGood.marca,
  modelo: selectedGood.modelo,
  descripcion: selectedGood.descripcion,
  cantidad: cantidadFinal, 
      metodoPago: values.metodoPago || "efectivo",
      precio: selectedGood.precio,
      imeis: imeisSeleccionadosExistente.map((imei) => ({
        imei,
        precio: selectedGood.precio,
        foto: null,
      })),
      
      fotos: selectedGood.fotos || [],
    };

    bienesParaAgregar.push(bienExistente);
  }

  // 📌 Actualizar el estado principal con todos los bienes
  setBienesAVender(prev => [...prev, ...bienesParaAgregar]);

  message.success("✅ Bien agregado a la venta.");

  // 🔄 Resetear formularios y estados
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
  }, [bienesAVender]);

  // --- Función para confirmar la venta ---
const confirmarVenta = async () => {
  setLoadingVenta(true);

  try {
    const ventaData = [];

    for (let i = 0; i < bienesAVender.length; i++) {
      const bien = bienesAVender[i];
      let bienUuid = bien.uuid;

      // 🧱 Si el bien NO existe todavía (es nuevo)
      if (!bienUuid) {
        const formDataBien = new FormData();
        formDataBien.append('tipo', bien.tipo);
        formDataBien.append('marca', bien.marca);
        formDataBien.append('modelo', bien.modelo);
        formDataBien.append('descripcion', bien.descripcion);
        formDataBien.append('precio', bien.precio || 0);
        formDataBien.append('stock', JSON.stringify({ cantidad: bien.cantidad }));
        formDataBien.append('propietario_uuid', vendedorId);
        formDataBien.append('registrado_por_uuid', vendedorId);

        // 📱 Si es teléfono, procesamos IMEIs y sus fotos
        if (bien.tipo.toLowerCase() === 'teléfono movil') {
          const imeisFormateados = bien.imeis.map((i, idx) => ({
            imei: i.imei,
            precio: i.precio || 0,
            fotoIndex: idx,
          }));
          formDataBien.append('imei', JSON.stringify(imeisFormateados));

          bien.imeis.forEach((imeiObj, idx) => {
            const archivo = imeiObj.foto instanceof File
              ? imeiObj.foto
              : imeiObj.foto?.originFileObj;
            if (archivo) {
              formDataBien.append(`imeiFotos[${idx}]`, archivo);
            }
          });
        }

        // 📷 Agregar fotos generales (para bienes no telefónicos)
        if (bien.fotos && Array.isArray(bien.fotos)) {
          bien.fotos.forEach((foto, idx) => {
            const archivo = foto.originFileObj || foto;
            if (archivo instanceof File) {
formDataBien.append(`venta[${i}][imeis][${idx}][foto]`, archivo);

            }
          });
        }

        // 👁️ Debug
        // console.log("🧪 FormData enviado al backend:");
        for (let pair of formDataBien.entries()) {
          // console.log(pair[0], pair[1]);
        }

        // 🧾 Registrar el bien
        const bienCreadoResponse = await dispatch(addBien(formDataBien));

        if (!bienCreadoResponse?.bien?.uuid) {
          throw new Error("❌ No se pudo registrar el bien.");
        }

        bienUuid = bienCreadoResponse.bien.uuid;

        // 🕒 Esperamos a que aparezcan los identificadores
        let retries = 10;
        let bienConfirmado = false;
        while (retries > 0 && !bienConfirmado) {
          const r = await api.get(`/bienes/buscar/${bienUuid}`);
          const detalles = r?.data?.bien?.identificadores || [];

          if (r.status === 200 && detalles.length >= bien.cantidad) {
            bienConfirmado = true;
            break;
          }

          await new Promise(resolve => setTimeout(resolve, 800));
          retries--;
        }

        if (!bienConfirmado) {
          throw new Error(`❌ El bien ${bien.marca} ${bien.modelo} aún no está disponible con stock completo. Intenta nuevamente.`);
        }

        // 📲 Asociar IMEIs confirmados
        const imeisInsertados = bienCreadoResponse.bien.imeis || [];
        bien.imeis = imeisInsertados.map((d, idx) => ({
          imei: d.imei,
          precio: bien.imeis?.[idx]?.precio || 0,
          foto: bien.imeis?.[idx]?.foto || null,
        }));
      }

      // 📦 Agregar bien a la ventaData
      const imeis = (bien.imeis || []).filter(i => i.imei?.trim());
      ventaData.push({
        uuid: bienUuid,
        tipo: bien.tipo,
        marca: bien.marca,
        modelo: bien.modelo,
        descripcion: bien.descripcion,
        cantidad: bien.cantidad,
        metodoPago: bien.metodoPago || "efectivo",
        precio: bien.precio || 0,
        imeis: imeis.map(i => ({
          imei: i.imei.trim(),
          precio: i.precio || 0,
          foto: i.foto,
        })),
        fotos: bien.fotos || [],
      });
    }
// console.log("📦 ventaData antes de generar FormData:");
// console.log(JSON.stringify(ventaData, null, 2));
    // 🧾 Final FormData de venta
    const formDataVenta = new FormData();
    formDataVenta.append("vendedorUuid", vendedorId);
    formDataVenta.append("compradorId", compradorId);
    formDataVenta.append("ventaData", JSON.stringify(ventaData));

    // 📎 Adjuntar fotos generales e IMEI por venta
    // 📎 Adjuntar fotos generales e IMEI por venta (CORREGIDO)
ventaData.forEach((bien, i) => {
  // ✅ FOTOS GENERALES del bien (fotos_bien_0_0, fotos_bien_0_1...)
  if (bien.fotos && Array.isArray(bien.fotos)) {
    bien.fotos.forEach((foto, j) => {
      const archivo = foto.originFileObj || foto;
      if (archivo instanceof File) {
        formDataVenta.append(`fotos_bien_${i}_${j}`, archivo); // 💥 este nombre es el que espera tu backend
      }
    });
  }

  // ✅ Fotos por IMEI
  bien.imeis?.forEach((imei, k) => {
    const archivo = imei.foto?.originFileObj || imei.foto;
    if (archivo instanceof File) {
      formDataVenta.append(`imeiFoto_${k}`, archivo); // ya lo estás manejando en backend
    }
  });
});

// console.log("🧪 CONTENIDO DE FormData antes de enviar:");

for (let pair of formDataVenta.entries()) {
  const valor = pair[1];

  if (valor instanceof File) {
    /* log eliminado: console.log File info */
  } else {
    // console.log(`📝 ${pair[0]} =`, valor);
  }
}



    // 🚀 Enviar venta al backend
    const response = await dispatch(registrarVenta(formDataVenta));
    // console.log("🔍 Resultado de registrarVenta:", response);

    if (response?.success === true) {
      message.success(response.message || "✅ Venta registrada.");
      navigate("/user/dashboard");
    } else {
      throw new Error(response?.message || "❌ Error al registrar la venta.");
    }

  } catch (error) {
    console.error('❌ Error al confirmar venta:', error);
    const mensajeError = error?.message || "❌ Error al registrar la venta.";
    message.error(mensajeError);
  } finally {
    setLoadingVenta(false);
  }
};



  
  
  const hayImeisDuplicados = imeisNuevo
  .map((i) => i.imei?.trim())
  .filter(Boolean)
  .some((val, idx, arr) => arr.indexOf(val) !== idx);

if (hayImeisDuplicados) {
  return message.error("🚫 Hay IMEIs duplicados. Corrige antes de continuar.");
}

const validateDNIWithRenaper = async (dni) => {
  if (isFetchingDni.current) return;

  try {
    if (!dni) {
      message.error("El DNI es obligatorio.");
      return;
    }

    isFetchingDni.current = true;

    // console.log('🔍 Buscando en RENAPER...');

    // 1. Traemos datos de RENAPER primero
    const persona = await dispatch(fetchRenaperData(dni));

    // console.log('🛂 Datos de RENAPER:', persona);

    if (!persona) {
      message.warning("⚠️ No se encontraron datos en RENAPER.");
      return;
    }

 formBuyer.setFieldsValue({
  nombre: persona.nombres || "",
  apellido: persona.apellidos || "",
  cuit: persona.nroCuil || "",
  direccion: {
    calle: persona.domicilio?.calle || "",
    altura: persona.domicilio?.nroCalle || "0",
    barrio: persona.domicilio?.barrio || "",
    departamento: persona.domicilio?.localidad || "",
  },
  provinciaRenaper: persona.domicilio?.provincia || "",
});



    // 3. Ahora que ya tenemos persona, podemos buscar si existe en el sistema
    // console.log('🔍 Buscando en sistema si el usuario ya existe...');
    const checkUserResponse = await dispatch(checkExistingUser({
      dni,
      nombre: persona.nombres || '',
      apellido: persona.apellidos || '',
      email: persona.email || '',
    }));

    // console.log('🗃️ Respuesta de checkExistingUser:', checkUserResponse);

    if (checkUserResponse?.existe && checkUserResponse?.usuario) {
      const usuarioExistente = checkUserResponse.usuario;

      // console.log('📨 Email recibido del usuario existente:', usuarioExistente.email);

      if (usuarioExistente?.email) {
        formBuyer.setFieldsValue({ email: usuarioExistente.email });
        setEmailComprador(usuarioExistente.email);
        message.info("📧 Email del comprador cargado automáticamente.");
      } else {
        formBuyer.setFieldsValue({ email: "" });
        setEmailComprador('');
        message.warning("⚠️ El comprador existe pero no tiene email registrado.");
      }

      setCompradorId(usuarioExistente.uuid);
    } else {
      formBuyer.setFieldsValue({ email: "" });
      setEmailComprador('');
      setCompradorId(null);

      message.warning("⚠️ El comprador no está registrado. Completa el correo electrónico manualmente.");
    }

    message.success("✅ Datos cargados correctamente desde RENAPER.");
  } catch (error) {
    console.error('❌ Error validando DNI con RENAPER:', error);
    message.error(error.message || "Error al validar el DNI.");
  } finally {
    isFetchingDni.current = false;
  }
};








  return (
    <div className="bg-background min-h-screen font-inter flex flex-col pb-8">
      {/* Header Premium */}
      <header className="bg-primary text-white px-8 py-5 flex justify-between items-center shadow-md mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => {
            if (step === 1) navigate('/user/dashboard');
            else setStep(step - 1);
          }} className="flex items-center justify-center p-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all shadow-sm border-none cursor-pointer">
            <ArrowLeftOutlined style={{ fontSize: '20px' }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold font-montserrat tracking-tight m-0 text-white">Vender Bien Mueble</h1>
            <p className="text-inverse-primary text-sm font-medium mt-0.5 mb-0">
              Vendedor:{' '}
              {vendiendoComoEmpresa ? (
                <span className="bg-white/20 px-2 py-0.5 rounded ml-1 text-white">{usuario.razonSocial || "Empresa"}</span>
              ) : (
                <span className="bg-white/20 px-2 py-0.5 rounded ml-1 text-white">{`${usuario.nombre} ${usuario.apellido}`}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => {
            localStorage.removeItem('userData');
            navigate('/home');
          }} className="flex items-center gap-2 px-4 py-2 bg-error text-white rounded-lg hover:bg-red-600 transition-all font-semibold shadow-sm border-none cursor-pointer">
            <LogoutOutlined /> Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto w-full px-8">
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant mb-8">
          <Steps current={step - 1}>
            <Step title="Datos del Comprador" />
            <Step title="Registro de Bienes" />
          </Steps>
        </div>

      {/* Paso 1: Datos del Comprador */}
      {step === 1 && (
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-level-2 border border-outline-variant">
          <h2 className="text-xl font-bold font-montserrat text-primary mb-6 border-b border-outline-variant pb-2">Paso 1: Datos del Comprador</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg shadow-sm">
            <Text style={{ fontSize: '1rem' }}>
              Complete los datos del comprador. Ingrese el DNI y espere mientras RENAPER verifica la información.
            </Text>
          </div>
          <Form layout="vertical" form={formBuyer} onFinish={handleFinishPaso1}>
          <Form.Item
  label="Tipo de Persona"
  name="tipo"
  rules={[{ required: true, message: 'Selecciona el tipo de persona.' }]}
>
  <Select placeholder="Selecciona tipo">
    <Option value="fisica">Persona Humana</Option>     {/* ← CAMBIADO */}
    <Option value="juridica">Persona Jurídica</Option> {/* ← CAMBIADO */}
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
  <Input
    placeholder="DNI"
    onBlur={(e) => validateDNIWithRenaper(e.target.value)}
  />
</Form.Item>

{/* 🌀 Loader de RENAPER mientras carga */}
{renaperLoading && (
  <div style={{ textAlign: 'center', marginBottom: 10 }}>
    <Spin tip="Consultando RENAPER..." />
  </div>
)}

{/* ❌ Error si algo falla en la consulta */}
{renaperError && (
  <p style={{ color: 'red', textAlign: 'center', marginTop: 5 }}>
    ⚠️ {renaperError}
  </p>
)}


            <Form.Item label="Nombre" name="nombre" rules={[{ required: true, message: 'Ingresa el nombre.' }]}>
              <Input placeholder="Nombre" />
            </Form.Item>
            <Form.Item label="Apellido" name="apellido" rules={[{ required: true, message: 'Ingresa el apellido.' }]}>
              <Input placeholder="Apellido" />
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
           {esDeMendoza(formBuyer.getFieldValue('provinciaRenaper')) ? (
  <Form.Item
    label="Departamento"
    name={['direccion', 'departamento']}
    rules={[{ required: true, message: 'Selecciona un departamento.' }]}
  >
    <Select placeholder="Selecciona un departamento">
      {departments.map(dep => (
        <Option key={dep} value={dep}>{dep}</Option>
      ))}
    </Select>
  </Form.Item>
) : (
  <Form.Item
    label="Departamento (escribí manualmente)"
    name={['direccion', 'departamento']}
    rules={[{ required: true, message: 'Ingresa el departamento.' }]}
  >
    <Input placeholder="Departamento, localidad o ciudad" />
  </Form.Item>
)}
            <Form.Item
  label="Correo Electrónico"
  name="email"
  rules={[{ required: true, type: 'email', message: 'Ingresa un correo válido.' }]}
>
  <Input placeholder="Correo Electrónico" />
</Form.Item>

            <Button type="primary" htmlType="submit" block loading={loading}>
              Siguiente
            </Button>
          </Form>
        </div>
      )}

      {/* Paso 2: Seleccionar o Registrar Bienes */}
      {step === 2 && (
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-level-2 border border-outline-variant">
          <h2 className="text-xl font-bold font-montserrat text-primary mb-6 border-b border-outline-variant pb-2">Paso 2: Seleccionar o Registrar Bienes</h2>
          <div style={{ marginBottom: 20 }}>
            <Radio.Group value={subStep2} onChange={(e) => {
              setSubStep2(e.target.value);
              formGood.resetFields();
              setSelectedGood(null);
              setPage(1);
              setHasMore(true);
            }}>
              <Radio value="existente">Bien Existente</Radio>
              <Radio value="nuevo">Vender bien no registrado anteriormente</Radio>
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
 const fotoPrincipal = Array.isArray(bien.fotos)
 ? bien.fotos[0]
 : typeof bien.fotos === 'string'
   ? (() => {
       try {
         const fotos = JSON.parse(bien.fotos || '[]');
         return Array.isArray(fotos) ? fotos[0] : imagenPredeterminada;
       } catch {
         return imagenPredeterminada;
       }
     })()
   : imagenPredeterminada;


  const stockDisponible = bien.tipo.toLowerCase() === "teléfono movil"
    ? (bien.identificadores?.filter(i => i.estado === "disponible").length || 0)
    : (bien.stock || 0);

  const estaSeleccionado = selectedGood?.uuid === bien.uuid;

  return (
    <Tooltip
      key={bien.uuid}
      title={
        <>
          <div><strong>Marca:</strong> {bien.marca}</div>
          <div><strong>Modelo:</strong> {bien.modelo}</div>
          <div><strong>Precio:</strong> ${bien.precio ?? '-'}</div>
          <div><strong>Descripción:</strong> {bien.descripcion}</div>
        </>
      }
    >
      <Card
        hoverable
        onClick={() => {
          if (stockDisponible > 0) {
            setSelectedGood(bien);
            setSelectedGoods(prev => [...prev, bien]);
            setImeisSeleccionadosExistente([]);
            message.info(`Seleccionaste: ${bien.marca} ${bien.modelo}`);
            setTimeout(() => {
              const formEl = document.getElementById('formCompletarDatos');
              if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          } else {
            message.warning("❌ Este bien no tiene stock disponible.");
          }
        }}
        style={{
          position: 'relative',
          border: estaSeleccionado ? '2px solid #1890ff' : undefined,
          boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease-in-out',
        }}
        ref={i === bienesFiltrados.length - 1 ? lastBienElementRef : null}
      >
        {/* Tag de tipo de bien */}
        <Tag color="blue" style={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}>
          {iconoPorTipo(bien.tipo)} {bien.tipo}
        </Tag>

        {/* Icono check si está seleccionado */}
        {estaSeleccionado && (
          <CheckCircleOutlined
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              fontSize: 20,
              color: '#1890ff',
              zIndex: 10
            }}
          />
        )}

        {/* Imagen */}
        <img
          alt={bien.descripcion || 'Imagen del bien'}
          src={fotoPrincipal}
          style={{
            width: '100%',
            height: 140,
            objectFit: 'contain',
            backgroundColor: '#f9f9f9',
            padding: 10,
            borderRadius: 4,
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = imagenPredeterminada;
          }}
        />

        {/* Info */}
        <div style={{ paddingTop: 10 }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>{bien.marca} {bien.modelo}</div>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>{bien.descripcion || bien.tipo}</div>

          <Tag color={stockDisponible > 0 ? 'green' : 'red'}>
            {stockDisponible > 0 ? `✔ Stock: ${stockDisponible}` : '❌ Sin stock'}
          </Tag>

    {/* ✅ Mostrar y seleccionar IMEIs si es un teléfono */}
{bien.tipo.toLowerCase() === "teléfono movil" && (
  <div style={{ marginTop: 8 }}>
    <Text strong style={{ fontSize: 12 }}>Selecciona IMEIs a vender:</Text>
    <Checkbox.Group
      value={selectedGood?.uuid === bien.uuid ? imeisSeleccionadosExistente : []}
      onChange={(seleccionados) => {
        if (selectedGood?.uuid === bien.uuid) {
          setImeisSeleccionadosExistente(seleccionados);
        }
      }}
    >
      <div style={{ maxHeight: 100, overflowY: 'auto', paddingLeft: 4 }}>
        {bien.identificadores
          ?.filter(i => i.estado === 'disponible')
          .map((imeiObj, idx) => (
            <Checkbox key={idx} value={imeiObj.identificador_unico}>
              <Tooltip title={`IMEI disponible`}>
                <Tag color="blue" style={{ margin: 2 }}>
                  {imeiObj.identificador_unico}
                </Tag>
              </Tooltip>
            </Checkbox>
          ))}
      </div>
    </Checkbox.Group>
  </div>
)}



          {/* Acción rápida */}
          {!estaSeleccionado && stockDisponible > 0 && (
            <Button
              type="link"
              style={{ padding: 0, marginTop: 8 }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedGood(bien);
                setImeisSeleccionadosExistente([]);
                message.success("Bien seleccionado");
              }}
            >
              Seleccionar
            </Button>
          )}
        </div>
      </Card>
    </Tooltip>
  );
})}

  </div>
  {loadingBienes && <p>Espere mientras se cargan los bienes...</p>}
  {!hasMore && <p style={{ textAlign: 'center' }}>No hay más bienes.</p>}
</div>

              {selectedGood && (
                <div id="formCompletarDatos" style={{ marginTop: 10 }}>
                  <p>Completa los datos para el bien seleccionado: {selectedGood.marca} {selectedGood.modelo}</p>
                  {selectedGood && (
  <div style={{ marginBottom: 10 }}>
    <p>
      <strong>Stock disponible:</strong>{' '}
      {
        selectedGood.tipo.toLowerCase() === "teléfono movil"
          ? (selectedGood.identificadores?.filter(i => i.estado === 'disponible').length ?? 0)
          : (selectedGood.stock ?? 0)
      }
    </p>
  </div>
)}

                 
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
      {marcas.map(m => <Option key={m} value={m}>{m}</Option>)}
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
      {modelos.map(mod => <Option key={mod} value={mod}>{mod}</Option>)}
    </Select>
  </Form.Item>

  <Form.Item
    label="Descripción"
    name="descripcion"
    rules={[{ required: true, message: 'Ingresa una descripción.' }]}
  >
    <Input.TextArea rows={3} />
  </Form.Item>

  {selectedGood?.tipo?.toLowerCase() === 'teléfono movil' ? (
  <div style={{ marginBottom: 12 }}>
    <Text strong>Cantidad seleccionada:</Text>{' '}
    <Text type="success">{cantidadVisual}</Text>
  </div>
) : (
  <Form.Item
  label="Cantidad"
  name="cantidad"
  rules={[
    { required: true, message: 'Ingresa la cantidad.' },
    { type: 'number', min: 1, message: 'Debe ser al menos 1.' }
  ]}
>
  <InputNumber
    min={1}
    max={selectedGood?.stock ?? 1} // ⛔️ Limita el máximo
    style={{ width: '100%' }}
    placeholder={`Máximo: ${selectedGood?.stock ?? 1}`}
  />
</Form.Item>

)}







  {/* Si el bien NO es teléfono móvil, mostramos el precio global y las fotos */}
  {tipoNuevo?.toLowerCase() !== 'teléfono movil' && (
    <>
      <Form.Item
        label="Precio"
        name="precio"
        rules={[{ required: true, message: 'Ingresa un precio.' }]}
      >
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item label="Fotos del Bien">
        <Upload
          name="fotos"
          listType="picture"
          fileList={fileList}
          onChange={({ fileList: newFileList }) => {
            setFileList(newFileList);
          }}
          beforeUpload={() => false}
        >
          <Button>Subir Fotos</Button>
        </Upload>
      </Form.Item>
    </>
  )}

  {/* Si el bien es teléfono móvil, ingresamos IMEIs, precio individual y foto para cada unidad */}
  {tipoNuevo?.toLowerCase() === 'teléfono movil' && (
    <>
      <p>Ingresa los IMEIS, el precio y sube una foto para cada teléfono:</p>
      {imeisNuevo.map((item, index) => (
        <div
          key={index}
          style={{
            marginBottom: '10px',
            border: '1px solid #ddd',
            padding: '10px',
            borderRadius: '5px'
          }}
        >
          <Form.Item label={`IMEI #${index + 1}`}>
            <Input
              placeholder="Ingrese el IMEI"
              value={item.imei}
              onChange={(e) => actualizarImei(index, e.target.value)}
            />
          </Form.Item>
          <Form.Item label={`Precio para teléfono #${index + 1}`}>
            <InputNumber
              placeholder="Ingrese precio individual"
              value={item.precio}
              onChange={(value) => actualizarPrecioImei(index, value)}
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label="Foto del teléfono">
  <Upload
    name="imeiFoto"
    listType="picture"
    beforeUpload={(file) => {
// 🔥 Esto debe mostrar un archivo real
      actualizarFotoImei(index, file);
      return false; // 🔥 Detiene la carga automática para manejarla manualmente
    }}
    onChange={(info) => {
// 🔥 Debe mostrar un archivo real
      actualizarFotoImei(index, info.file);
    }}
    showUploadList={true}
  >
    <Button>Subir Foto teléfono</Button>
  </Upload>
</Form.Item>


          <Button type="danger" onClick={() => eliminarImei(index)}>
            Eliminar
          </Button>
        </div>
      ))}
      <Button
        type="dashed"
        onClick={() => setImeisNuevo(prev => [...prev, { imei: '', foto: null, precio: null }])}
        style={{ width: '100%', marginTop: 8 }}
      >
        Agregar IMEI
      </Button>
      {/* Campo de solo lectura que muestra el total calculado */}
   {/* 🔥 Ocultar precio global si es un teléfono móvil y hay precios individuales */}
{tipoNuevo && tipoNuevo.toLowerCase() !== 'teléfono movil' && (
  <Form.Item label="Precio" name="precio" rules={[{ required: true, message: 'Ingresa un precio.' }]}>
    <InputNumber min={0} style={{ width: '100%' }} />
  </Form.Item>
)}



    </>
  )}

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
{/* 🔥 Ocultar el campo de Precio General si el tipo es "teléfono movil" */}
{tipoNuevo && tipoNuevo.toLowerCase() !== 'teléfono movil' && (
  <Form.Item label="Precio" name="precio" rules={[{ required: true, message: 'Ingresa un precio.' }]}>
    <InputNumber min={0} style={{ width: '100%' }} />
  </Form.Item>
)}

{/* 🔥 Mostrar la suma de los precios individuales si es un teléfono móvil */}
{tipoNuevo && tipoNuevo.toLowerCase() === 'teléfono movil' && (
  <Form.Item label="Total Precio Individual">
    <InputNumber value={totalPrecioIndividual} disabled style={{ width: '100%' }} />
  </Form.Item>
)}



              {tipoNuevo?.toLowerCase() !== 'teléfono movil' && (
  <Form.Item label="Fotos del Bien">
    <Upload
      name="fotos"
      listType="picture"
      fileList={fileList}
      onChange={({ fileList: newFileList }) => {
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
  <Button
  type="link"
  style={{ paddingLeft: 0 }}
  onClick={() => setModalImeiVisible(true)}
>
  ¿Cómo obtener el IMEI?
</Button>

    <p>Ingresa los IMEIS, el precio y sube una foto para cada teléfono:</p>
    {imeisNuevo.map((item, index) => (
      <div
        key={index}
        style={{
          marginBottom: '10px',
          border: '1px solid #ddd',
          padding: '10px',
          borderRadius: '5px'
        }}
      >
        <Form.Item label={`IMEI #${index + 1}`}>
          <Input
            placeholder="Ingrese el IMEI"
            value={item.imei}
            onChange={(e) => actualizarImei(index, e.target.value)}
          />
        </Form.Item>
        <Form.Item label={`Precio para teléfono #${index + 1}`}>
          <InputNumber
            placeholder="Ingrese precio individual"
            value={item.precio}
            onChange={(value) => actualizarPrecioImei(index, value)}
            min={0}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item label="Foto del teléfono">
          <Upload
            name="imeiFoto"
            listType="picture"
            beforeUpload={(file) => {
              actualizarFotoImei(index, file);
              return false;
            }}
            showUploadList={true}
          >
            <Button>Subir Foto teléfono</Button>
          </Upload>
        </Form.Item>
        <Button type="danger" onClick={() => eliminarImei(index)}>
          Eliminar
        </Button>
      </div>
    ))}
    {/* <Button
      type="dashed"
      onClick={() => setImeisNuevo(prev => [...prev, { imei: '', foto: null, precio: null }])}
      style={{ width: '100%', marginTop: 8 }}
    >
      Agregar IMEI
    </Button> */}
  </>
)}

              <Button type="primary" htmlType="submit" block style={{ marginTop: 16 }}>
                Agregar Bien
              </Button>
            </Form>
          )}
          {/* Tabla de Bienes Agregados */}
          {bienesAVender.length > 0 && (
    <div style={{ marginTop: 20 }}>
  <Title level={4}>
    Bienes a Vender ({bienesAVender.length}) ✅
  </Title>

  <Table
  dataSource={bienesAVender}
  columns={[
    { 
      title: 'Tipo', 
      dataIndex: 'tipo',
      render: (text) => `${iconoPorTipo(text)} ${text}`
    },
    { title: 'Marca', dataIndex: 'marca' },
    { title: 'Modelo', dataIndex: 'modelo' },
    { title: 'Cantidad', dataIndex: 'cantidad' },
    {
      title: 'IMEIs',
      dataIndex: 'imeis',
      render: (imeis) => {
        if (!imeis || imeis.length === 0) return '-';
        return imeis.map(i => i.imei).join(', ');
      }
    },
    {
      title: 'Acciones',
      render: (_, __, index) => (
        <Button danger onClick={() => eliminarBienAVenta(index)}>Eliminar</Button>
      )
    }
  ]}
  pagination={false}
  rowKey={(_, index) => index}
/>
            </div>
          )}
     <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
{/* 🔥 Mostrar total de precios individuales si es un teléfono móvil */}
{tipoNuevo && tipoNuevo.toLowerCase() === 'teléfono movil' && (
  <Form.Item label="Total Precio Individual">
    <InputNumber value={totalPrecioIndividual} disabled style={{ width: '100%' }} />
  </Form.Item>
)}
  {/* 🔥 Loader de Ant Design mientras se procesa la venta */}
  {loadingVenta && (
    <div style={{ textAlign: "center", marginBottom: "20px" }}>
      <Spin size="large" tip="⏳ Procesando la venta... por favor espera..." />
    </div>
  )}

  {/* Botón para confirmar la venta */}
  {bienesAVender.length === 0 && (
  <p style={{ color: "red", textAlign: "center" }}>
    ⚠️ No hay bienes agregados a la venta.
  </p>
)}
<Button
  type="primary"
  danger
  icon={<CheckCircleOutlined />}
  onClick={() => {
    Modal.confirm({
      title: '¿Confirmar venta?',
      content: 'Estás a punto de registrar esta venta. ¿Deseás continuar?',
      okText: 'Sí, vender',
      cancelText: 'Cancelar',
      onOk: () => confirmarVenta(),
    });
  }}
  disabled={bienesAVender.length === 0 || loadingVenta}
>
  Confirmar Venta
</Button>
<Modal
  open={modalImeiVisible}
  onCancel={() => setModalImeiVisible(false)}
  footer={null}
  title="¿Cómo obtener el IMEI?"
>
  <p>
    El <strong>IMEI</strong> (International Mobile Equipment Identity) es un número único que identifica a tu dispositivo móvil.
  </p>
  <ul>
    <li>📞 Marcá <code>*#06#</code> y aparecerá automáticamente.</li>
    <li>📦 También se encuentra en la caja o en la etiqueta detrás de la batería (si es removible).</li>
    <li>⚙️ En Android: <strong>Ajustes &gt; Acerca del teléfono</strong>.</li>
    <li>🍏 En iPhone: <strong>Ajustes &gt; General &gt; Información</strong>.</li>
  </ul>

  <div style={{ marginTop: 16, textAlign: 'center' }}>
    <img
      src={imeiEjemplo}
      alt="Ejemplo de cómo ver IMEI en Android"
      style={{ maxWidth: '100%', maxHeight: 350, borderRadius: 8 }}
    />
    <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>Ejemplo: IMEI visible en un teléfono Android</p>
  </div>
</Modal>
</div>
        </div>
      )}
      </div>
    </div>
  );
};

export default VenderPage;
