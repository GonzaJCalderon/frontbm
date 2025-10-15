
import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Select, message, Typography, Upload, Modal, Table, Card, Checkbox, Row, Col, Image, Spin, Collapse   } from 'antd';
import { useDispatch,  useSelector } from 'react-redux';
import { fetchBienes,fetchBienesPorEmpresa,  fetchBienesPorUsuario, fetchBienesPorPropietario,  registrarCompra, agregarMarca, agregarModelo,addBien } from '../redux/actions/bienes';
import { checkExistingUser, registerUsuarioPorTercero, fetchRenaperData} from '../redux/actions/usuarios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, LogoutOutlined } from '@ant-design/icons';
import api from '../redux/axiosConfig'; // Instancia de axios configurada
import useInfiniteBienesPorPropietario from '../hooks/useInfiniteBienesPorPropietario';

const { Option } = Select;
const { Title } = Typography;
const { Panel } = Collapse;


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
  const [currentBien, setCurrentBien] = useState(null);
  const [bienesDelVendedor, setBienesDelVendedor] = useState([]);
  const [bienesAComprar, setBienesAComprar] = useState([]);

  const [selectedBienDelVendedor, setSelectedBienDelVendedor] = useState(null);
const [searchBien, setSearchBien] = useState('');
const [imeisDisponibles, setImeisDisponibles] = useState([]); 
const [imeisSeleccionados, setImeisSeleccionados] = useState([]);
const [imeiFotos, setImeiFotos] = useState({});
const [empresaVendedoraUuid, setEmpresaVendedoraUuid] = useState(null);







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
// Agregar log

  const token = localStorage.getItem('authToken');

  const usuario = JSON.parse(localStorage.getItem('userData') || '{}');

  const uuid = JSON.parse(localStorage.getItem('userData') || '{}').uuid; 

  const scrollToStep2 = () => {
    setTimeout(() => {
      const formSection = document.getElementById('form-step-2-scroll');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };
  

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      message.error('Debe iniciar sesión para continuar.');
      navigate('/login');
    }
  }, []);
  
  const {
    bienes: bienesComprador,
    error: errorCargandoBienes,
    isLoading,
    fetchNextPage,
    hasMore,
    resetBienes
  } = useInfiniteBienesPorPropietario(usuario?.empresaUuid || usuario?.uuid);

  
  

  // Agregar un bien al array antes de confirmar la compra
  const agregarBien = (values) => {
    setBienesAComprar(prevBienes => {
      const nuevosBienes = [...prevBienes, values];
// 🛠️ Debug
      return nuevosBienes;
    });
  
    message.success("Bien agregado correctamente. Puedes seguir agregando más o finalizar la compra.");
    formStep2.resetFields();
  };

  // Eliminar un bien antes de confirmar
  const eliminarBien = (index) => {
    setBienesAComprar(bienesAComprar.filter((_, i) => i !== index));
    message.success("Bien eliminado correctamente.");
  };

  const agregarImei = () => {
    setImeis((prevImeis) => [...prevImeis, { imei: '', foto: null }]);
  };
  

  const actualizarImei = (index, value) => {
    setImeis((prevImeis) => {
      if (prevImeis.some((item, i) => item.imei === value && i !== index)) {
        message.error('Este IMEI ya ha sido ingresado.');
        return prevImeis;
      }
      const nuevosImeis = [...prevImeis];
      nuevosImeis[index].imei = value;
      return nuevosImeis;
    });
  };
  
  const verificarImeisConFotos = () => {
    if (tipoSeleccionado === "teléfono movil") {
      if (imeis.length === 0) {
        message.error("Debe ingresar el IMEI (y la foto) para cada teléfono móvil agregado.");
        return false;
      }
      for (let i = 0; i < imeis.length; i++) {
        if (!imeis[i].imei || imeis[i].imei.trim() === "") {
          message.error(`Debe ingresar el IMEI para el teléfono móvil ${i + 1}.`);
          return false;
        }
        // Se asume que "foto" es el objeto File que se asigna cuando se sube la foto
        if (!imeis[i].foto) {
          message.error(`Debe subir la foto para el teléfono móvil ${i + 1}.`);
          return false;
        }
      }
    }
    return true;
  };
  
  
  
  const actualizarFotoImei = (index, file) => {
    setImeis((prevImeis) => {
      const nuevosImeis = [...prevImeis];
      // Guardamos el objeto File completo
      nuevosImeis[index].foto = file;
      return nuevosImeis;
    });
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
        setModelos(response.data.modelos);
        formStep2.setFieldsValue({ modelo: undefined });
      } else {
        setModelos([]);
      }
    } catch (error) {
      message.error('No se pudieron cargar los modelos para esta marca.');
    }
  };
  const validateDNIWithRenaper = async (dni) => {
    try {
      if (!dni) {
        message.error('El DNI es obligatorio.');
        return false;
      }
  
      const persona = await dispatch(fetchRenaperData(dni));
  
      if (!persona) {
        message.error('No se encontraron datos en RENAPER.');
        return false;
      }
  
      // Rellenar con datos del Renaper
     // 📌 Si no hay numeración, forzamos "0"
// 📌 Si no hay numeración, forzamos "0"
const alturaRenaper = persona.domicilio.nroCalle || "0";

formStep1.setFieldsValue({
  nombre: persona.nombres,
  apellido: persona.apellidos,
  cuit: persona.nroCuil,
  direccion: {
    calle: persona.domicilio.calle || '',
    altura: alturaRenaper,
    barrio: persona.domicilio.barrio || '',
    departamento: persona.domicilio.localidad || '',
  },
});

if (!persona.domicilio.nroCalle) {
  message.info("📍 RENAPER no devolvió numeración. Se completó con '0' por defecto.");
}

// ⚠️ Verificar si el departamento es de Mendoza
const departamentoRenaper = persona.domicilio.localidad?.trim() || '';
const esDeMendoza = departments.includes(departamentoRenaper);

if (!esDeMendoza) {
  message.warning(`⚠️ El vendedor no reside en Mendoza (${departamentoRenaper}). Puedes continuar con el registro manualmente.`);
}


  
      // 💡 EXTRA: Consultar si ya está registrado en el sistema
      const checkUserResponse = await dispatch(checkExistingUser({
        dni,
        nombre: persona.nombres,
        apellido: persona.apellidos,
        email: persona.email,
      }));
      console.log("Respuesta de checkExistingUser:", checkUserResponse); // 👈
  
      if (checkUserResponse?.existe && checkUserResponse?.usuario?.email) {
        formStep1.setFieldsValue({
          email: checkUserResponse.usuario.email,
        });
      
        message.info('Este usuario ya existe. Se cargó su email registrado.');
      
        // 🚀 Aquí agregamos la carga de bienes directamente
        setVendedorId(checkUserResponse.usuario.uuid); // Importante para paso 2
        setEmpresaVendedoraUuid(checkUserResponse.usuario.empresa_uuid || checkUserResponse.usuario.uuid);

      
        await cargarBienesDelVendedor({
          tipo: checkUserResponse.usuario.tipo,
          uuidUsuario: checkUserResponse.usuario.uuid,
          uuidEmpresa: checkUserResponse.usuario.empresa_uuid,
        });
      }
      
  
      message.success('Datos cargados correctamente desde RENAPER.');
      return true;
    } catch (error) {
      message.error(error.message || 'Error al validar el DNI con RENAPER.');
      return false;
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
        message.error('No se pudo registrar la marca. Intenta de nuevo.');
    }
  };

  const handleCantidadChange = (value) => {
    if (tipoSeleccionado === "teléfono movil") {
      setImeis((prevImeis) => {
        let nuevosImeis = prevImeis.slice(0, value); // Corta si es menor
        while (nuevosImeis.length < value) {
          nuevosImeis.push({ imei: '', foto: null });
        }
        return nuevosImeis;
      });
    }
  };

  const validarPropiedadDeBienes = () => {
    const bienesInvalidos = bienesAComprar.filter(b => b.uuid && b.propietario_uuid && b.propietario_uuid !== empresaVendedoraUuid);
  
    if (bienesInvalidos.length > 0) {
      message.error("Uno o más bienes seleccionados ya le pertenecen al comprador.");
      return false;
    }
  
    return true;
  };
  
  const cargarBienesDelVendedor = async ({ uuidUsuario, uuidEmpresa }) => {
    try {
      console.log("📦 Buscando bienes del vendedor:");
      console.log("👤 Usuario UUID:", uuidUsuario);
      console.log("🏢 Empresa UUID:", uuidEmpresa);
  
      setSelectedBienDelVendedor(null);
      setImeisSeleccionados([]);
  
      const results = await Promise.all([
        dispatch(fetchBienesPorPropietario(uuidUsuario)),
        uuidEmpresa ? dispatch(fetchBienesPorPropietario(uuidEmpresa)) : Promise.resolve({ data: [] }),
      ]);
  
      const [bienesUsuario, bienesEmpresa] = results;
  
      const todosLosBienes = [
        ...(bienesUsuario?.data || []),
        ...(bienesEmpresa?.data || []),
      ];
  
      console.log("✅ Bienes combinados del vendedor:", todosLosBienes);
  
      const bienesProcesados = todosLosBienes.map(bien => ({
        ...bien,
        stock: bien.stock ?? 0,
        propietario: bien.propietario || 'Desconocido',
        fechaActualizacion: bien.fechaActualizacion || 'Sin fecha',
        detalles: bien.identificadores || [],
        fotos: [
          ...(bien.todasLasFotos || []),
          ...(bien.fotos || []),
          ...(bien.identificadores?.map(i => i.foto).filter(Boolean) || [])
        ],
        
        imeis: (bien.identificadores || []).map(imei => ({
          imei: imei.identificador_unico,
          fotoUrl: imei.foto,
          estado: imei.estado
        }))
      }));
  
      setBienesDelVendedor(bienesProcesados);
    } catch (err) {
      console.error("❌ Error al cargar los bienes del vendedor:", err);
      message.error('Error al cargar los bienes del vendedor.');
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
    }
  };
  


  const onChangeCheckbox = (checkedValues) => {
    const valoresTransformados = checkedValues.map(item => ({
      imei: item.imei,
      fotoUrl: item.fotoUrl,
      fotoOriginal: null,
    }));
  
    setImeisSeleccionados(valoresTransformados);
  
    // 🔥 Actualizar cantidad automáticamente
    formStep2.setFieldsValue({
      bienStock: valoresTransformados.length,
    });
  
    console.log('✅ IMEIs seleccionados transformados:', valoresTransformados);
  };
  
  

  const handleFinishStep1 = async (values) => {
    try {
      const {
        nombre,
        apellido,
        email,
        dni,
        cuit,
        tipo,
        razonSocial,
        direccion,
        dniResponsable,
        nombreResponsable,
        apellidoResponsable,
        cuitResponsable,
        domicilioResponsable,
      } = values;
      
  // ✅ Asegurar tipo válido
const tipoLimpio = tipo === 'persona' ? 'fisica' : tipo;

      if (!dni || !nombre || !apellido || !email) {
        message.error('Por favor, completa todos los campos obligatorios (DNI, Nombre, Apellido, Email).');
        return;
      }
  
      // 🔐 Validar con Renaper antes de continuar
      const validado = await validateDNIWithRenaper(dni);
      
      if (!validado) {
        message.error('No se puede continuar sin validar correctamente el DNI con Renaper.');
        return;
      }

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
        setEmpresaVendedoraUuid(existingUser.empresa_uuid || existingUser.uuid);
  

        await cargarBienesDelVendedor({
          tipo: existingUser.tipo,
          uuidUsuario: existingUser.uuid,
          uuidEmpresa: existingUser.empresa_uuid,
        });
        
        if (existingUser.rolDefinitivo !== 'vendedor') {

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
            }
          } catch (updateError) {
          }
        }

        message.success('Usuario identificado, continuando al siguiente paso.');
        setStep(2); // Continuar al paso 2
        return;
      }

      const newUserResponse = await dispatch(
        registerUsuarioPorTercero({
          nombre,
          apellido,
          email,
          dni,
          cuit,
          tipo: tipoLimpio,
          razonSocial: tipoLimpio === 'juridica' ? razonSocial : null,
          direccion,
          dniResponsable: tipoLimpio === 'juridica' ? dniResponsable : null,
          nombreResponsable: tipoLimpio === 'juridica' ? nombreResponsable : null,
          apellidoResponsable: tipoLimpio === 'juridica' ? apellidoResponsable : null,
          cuitResponsable: tipoLimpio === 'juridica' ? cuitResponsable : null,
          domicilioResponsable: tipoLimpio === 'juridica' ? domicilioResponsable : null,
          rolTemporal: 'vendedor',
        })
      );
      
      
      

      if (newUserResponse?.uuid) {
        setVendedorId(newUserResponse.uuid);
        setEmpresaVendedoraUuid(newUserResponse.empresa_uuid || newUserResponse.uuid);
        message.success('Nuevo usuario registrado, continuando al siguiente paso.');
      
        await cargarBienesDelVendedor({
          tipo: tipoLimpio,
          uuidUsuario: newUserResponse.uuid,
          uuidEmpresa: newUserResponse.empresa_uuid,
        });
        
        setStep(2); // Continuar al paso 2
      } else {
        throw new Error('No se pudo registrar al usuario.');
      }
    } catch (error) {
      message.error(error.message || 'Ocurrió un error en el registro del usuario.');
    }
  };

  const handleFinishStep2 = async (values) => {
    try {
      setLoading(true);
      const precio = parseFloat(values.bienPrecio);
      const cantidad = parseInt(values.bienStock, 10);
  
      if (isNaN(precio) || precio <= 0) {
        message.error('El precio debe ser un número válido mayor a 0.');
        return;
      }
  
      if (isNaN(cantidad) || cantidad <= 0) {
        message.error('La cantidad debe ser mayor a 0.');
        return;
      }
  
      if (tipoSeleccionado === "teléfono movil" && !verificarImeisConFotos()) {
        return;
      }
  
      const esBienExistente = selectedBienDelVendedor?.uuid;
      let bienParaCompra = null;
  
      if (esBienExistente) {
        // Bien del vendedor
        bienParaCompra = {
          uuid: selectedBienDelVendedor.uuid,
          tipo: values.tipo,
          marca: values.marca,
          modelo: values.modelo,
          descripcion: values.bienDescripcion,
          precio,
          cantidad,
          metodoPago: values.metodoPago || 'efectivo',
          imeis: tipoSeleccionado === "teléfono movil"
            ? imeisSeleccionados.map((item) => ({
                imei: item.imei,
                fotoUrl: item.fotoUrl,
                fotoOriginal: item.fotoOriginal || null,
              }))
            : [],
            fotos: tipoSeleccionado !== "teléfono movil"
            ? fileList.map((f) => f.originFileObj instanceof File ? f.originFileObj : f)
            : []
          
          

        };
      } else {
        // Bien nuevo
        const formData = new FormData();
        const esEmpresa = tipoDeSujeto === 'juridica';
        const propietario_uuid = empresaVendedoraUuid;

  
        formData.append('tipo', values.tipo);
        formData.append('marca', values.marca);
        formData.append('modelo', values.modelo);
        formData.append('descripcion', values.bienDescripcion);
        formData.append('precio', precio);
        formData.append('stock', JSON.stringify({ cantidad }));
        formData.append('propietario_uuid', propietario_uuid);
        formData.append('registrado_por_uuid', vendedorId);
        formData.append('overridePermiso', 'true');
  
        if (tipoSeleccionado === "teléfono movil") {
          const imeisParaRegistro = imeis.map((item) => ({ imei: item.imei }));
          formData.append('imei', JSON.stringify(imeisParaRegistro));
  
          imeis.forEach((item, index) => {
            if (item.foto) {
              formData.append(`imeiFoto_${index}`, item.foto);
            }
          });
        } else {
          fileList.forEach((foto, index) => {
            const archivo = foto.originFileObj || foto;
            formData.append(`fotos[${index}]`, archivo);
          });
        }
  
        const bienCreado = await dispatch(addBien(formData));
  
        bienParaCompra = {
          uuid: bienCreado.bien.uuid,
          tipo: bienCreado.bien.tipo,
          marca: bienCreado.bien.marca,
          modelo: bienCreado.bien.modelo,
          descripcion: bienCreado.bien.descripcion,
          precio: bienCreado.bien.precio,
          cantidad,
          metodoPago: values.metodoPago || 'efectivo',
          imeis: tipoSeleccionado === "teléfono movil"
            ? imeis.map((item) => ({
                imei: item.imei,
                fotoUrl: null,
                fotoOriginal: item.foto || null,
              }))
            : [],
            fotos: tipoSeleccionado !== "teléfono movil"
            ? fileList.map((f) => f.originFileObj instanceof File ? f.originFileObj : f)
            : []
          
        };
  
        message.success(`Bien "${bienCreado.bien.tipo} ${bienCreado.bien.marca}" registrado correctamente.`);
      }
  
      setBienesAComprar((prev) => [...prev, bienParaCompra]);
  
      // Reseteo de estados
      formStep2.resetFields();
      setFileList([]);
      setImeis([]);
      setImeisSeleccionados([]);
      setSelectedBienDelVendedor(null);
  
      message.success('Bien agregado a la compra.');
    } catch (error) {
      console.error(error);
      message.error(error.message || 'Error al agregar el bien.');
    } finally {
      setLoading(false);
    }
    
  };
 
  const confirmarCompra = async () => {
    if (bienesAComprar.length === 0) {
      message.error("Debe agregar al menos un bien para completar la compra.");
      return;
    }
  
    try {
      const formData = new FormData();
      setLoading(true);
  
      formData.append("vendedorId", empresaVendedoraUuid);
  
      const esEmpresaCompradora = usuario?.tipo === 'juridica' || usuario?.rolEmpresa === 'responsable';
      const empresaUuid = usuario?.empresaUuid;
  
      const compradorData = esEmpresaCompradora && empresaUuid
        ? { uuid: empresaUuid, tipo: 'empresa' }
        : {
            uuid: usuario?.uuid,
            nombre: usuario?.nombre,
            apellido: usuario?.apellido,
            dni: usuario?.dni,
            email: usuario?.email,
            cuit: usuario?.cuit,
            tipo: 'persona'
          };
  
      formData.append("comprador", JSON.stringify(compradorData));
      formData.append("dniComprador", usuario?.dni);
  
      const bienesJSON = bienesAComprar.map((bien) => ({
        ...bien,
        metodoPago: bien.metodoPago?.trim() || 'efectivo',
      }));
  
      formData.append("bienes", JSON.stringify(bienesJSON));
  
      bienesAComprar.forEach((bien, i) => {
        if (bien.tipo === "teléfono movil") {
          bien.imeis?.forEach((imeiItem, idx) => {
            if (imeiItem.fotoOriginal instanceof File) {
              formData.append(`bienes[${i}][imeiFoto_${idx}]`, imeiItem.fotoOriginal);
            }
          });
        } else {
          (bien.fotos || []).forEach((foto, index) => {
            const archivo = foto.originFileObj || foto;
            if (archivo instanceof File) {
              formData.append(`bienes[${i}][fotos][${index}]`, archivo);
            }
          });
        }
      });
  
      // 👇 CAMBIO INCORPORADO ACÁ
      await dispatch(registrarCompra(formData));
      await dispatch(fetchBienesPorUsuario(usuario.uuid, true)); // 🔄 REFRESCA BIENES DEL COMPRADOR
  
      message.success("Compra completada con éxito.");
      navigate("/user/dashboard");
    } catch (error) {
      console.error("❌ Error al confirmar la compra:", error);
      message.error(error.message || "No se pudo registrar la compra.");
    } finally {
      setLoading(false);
    }
  };
  
  
  
  
  
  
  

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
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

      {/* Paso 1: Datos del vendedor */}
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
{step === 1 && (
  <Form layout="vertical" onFinish={handleFinishStep1} form={formStep1}>
    <Form.Item
      label="Tipo de Sujeto"
      name="tipo"
      rules={[{ required: true, message: 'Por favor, selecciona un tipo de sujeto.' }]}
    >
      <Select
        onChange={(tipo) => {
          formStep1.resetFields([
            'dni',
            'nombre',
            'apellido',
            'email',
            'cuit',
            'direccion',
            'razonSocial',
            'direccionEmpresa',
            'dniResponsable',
            'nombreResponsable',
            'apellidoResponsable',
            'cuitResponsable',
            'domicilioResponsable',
          ]);
          setTipoDeSujeto(tipo);
        }}
      >
        <Option value="fisica">Persona Humana</Option>
        <Option value="juridica">Persona Jurídica</Option>
      </Select>
    </Form.Item>

    {tipoDeSujeto === 'juridica' && (
      <>
        <Form.Item
          label="Razón Social"
          name="razonSocial"
          rules={[{ required: true, message: 'Por favor, ingresa la razón social.' }]}
        >
          <Input placeholder="Razón Social de la empresa" />
        </Form.Item>

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
          <Input placeholder="Numeración de la empresa" />
        </Form.Item>
        <Form.Item
          label="Departamento"
          name={['direccionEmpresa', 'departamento']}
          rules={[{ required: true, message: 'Selecciona un departamento para la empresa.' }]}
        >
          <Select placeholder="Departamento">
            {departments.map((d) => (
              <Option key={d} value={d}>{d}</Option>
            ))}
          </Select>
        </Form.Item>

        <Title level={5} style={{ marginBottom: 10, marginTop: 20 }}>
          Datos del Responsable
        </Title>

        <Form.Item
          label="DNI del Responsable"
          name="dniResponsable"
          rules={[{ required: true, message: 'El DNI del responsable es obligatorio.' }]}
        >
          <Input placeholder="DNI del responsable" />
        </Form.Item>

        <Form.Item
          label="Nombre del Responsable"
          name="nombreResponsable"
          rules={[{ required: true, message: 'El nombre del responsable es obligatorio.' }]}
        >
          <Input placeholder="Nombre del responsable" />
        </Form.Item>

        <Form.Item
          label="Apellido del Responsable"
          name="apellidoResponsable"
          rules={[{ required: true, message: 'El apellido del responsable es obligatorio.' }]}
        >
          <Input placeholder="Apellido del responsable" />
        </Form.Item>

        <Form.Item
          label="CUIT del Responsable"
          name="cuitResponsable"
          rules={[{ required: true, message: 'El CUIT del responsable es obligatorio.' }]}
        >
          <Input placeholder="CUIT del responsable" />
        </Form.Item>

        <Title level={5} style={{ marginBottom: 10, marginTop: 20 }}>
          Domicilio del Responsable
        </Title>

        <Form.Item
          label="Calle"
          name={['domicilioResponsable', 'calle']}
          rules={[{ required: true, message: 'Calle obligatoria' }]}
        >
          <Input placeholder="Calle" />
        </Form.Item>

        <Form.Item
          label="Altura"
          name={['domicilioResponsable', 'altura']}
          rules={[{ required: true, message: 'Altura obligatoria' }]}
        >
          <Input placeholder="Altura" />
        </Form.Item>

        <Form.Item
          label="Departamento"
          name={['domicilioResponsable', 'departamento']}
          rules={[{ required: true, message: 'Departamento obligatorio' }]}
        >
          <Select placeholder="Departamento">
            {departments.map((dep) => (
              <Option key={dep} value={dep}>
                {dep}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </>
    )}

    {/* Común a ambos tipos */}
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

    {/* Dirección de la Persona (si no es jurídica) */}
    {tipoDeSujeto !== 'juridica' && (
      <>
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
          rules={[{ required: true, message: 'Por favor, ingresa la numeración.' }]}
        >
          <Input placeholder="Numeración" />
        </Form.Item>
        <Form.Item label="Barrio" name={['direccion', 'barrio']}>
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
      </>
    )}

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

    <Button type="primary" htmlType="submit" block>
      Siguiente
    </Button>
  </Form>
)}

{step === 2 && bienesDelVendedor.length > 0 && (

<>
  <Title level={4} style={{ marginTop: 20 }}>Bienes del Vendedor</Title>

  <Input.Search
    placeholder="Buscar por tipo, marca, modelo..."
    value={searchBien}
    onChange={(e) => setSearchBien(e.target.value)}
    style={{ marginBottom: 16 }}
  />

  {/* Agrupamos y renderizamos */}
  <Collapse accordion>
    {Object.entries(
     bienesDelVendedor
     .filter(b => b.stock > 0) // ⛔️ Elimina los que tienen stock 0
     .filter(b =>
       (b.tipo?.toLowerCase().includes(searchBien.toLowerCase()) ||
        b.marca?.toLowerCase().includes(searchBien.toLowerCase()) ||
        b.modelo?.toLowerCase().includes(searchBien.toLowerCase()))
     )
   
        .reduce((acc, bien) => {
          if (!acc[bien.tipo]) acc[bien.tipo] = {};
          if (!acc[bien.tipo][bien.marca]) acc[bien.tipo][bien.marca] = [];
          acc[bien.tipo][bien.marca].push(bien);
          return acc;
        }, {})
    ).map(([tipo, marcas]) => (
      <Panel header={tipo.toUpperCase()} key={tipo}>
        <Collapse accordion>
          {Object.entries(marcas).map(([marca, bienesMarca]) => (
            <Panel header={marca} key={marca}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {bienesMarca.map((bien) => (
                  <Card
                    key={bien.uuid}
                    hoverable
                    onClick={() => {
                      setSelectedBienDelVendedor(bien);
                      formStep2.setFieldsValue({
                        tipo: bien.tipo,
                        marca: bien.marca,
                        modelo: bien.modelo,
                        bienDescripcion: bien.descripcion,
                        bienPrecio: bien.precio,
                        bienStock: bien.tipo === "teléfono movil" ? (bien.imeis?.length || 1) : (bien.stock ?? 1),
                      });
                      setTipoSeleccionado(bien.tipo);
                      setImeis([]);
                      message.success(`Bien seleccionado: ${bien.tipo} ${bien.marca} ${bien.modelo}`);
                      scrollToStep2();
                    }}
                    style={{
                      border: selectedBienDelVendedor?.uuid === bien.uuid ? '2px solid #1890ff' : undefined,
                      transition: 'all 0.3s ease',
                    }}
                    cover={bien.fotos?.[0] ? (
                      <img
                        alt="Foto del bien"
                        src={bien.fotos[0]}
                        style={{ height: 200, objectFit: 'cover' }}
                      />
                    ) : null}
                  >
                    <Card.Meta
                      title={`${bien.modelo}`}
                      description={
                        <>
                          <p>{bien.descripcion}</p>
                          <p><strong>Precio:</strong> ${bien.precio}</p>
                          <p><strong>Stock:</strong> {bien.stock ?? 0}</p>

                          {bien.tipo === 'teléfono movil' && bien.imeis && (
                            <Checkbox.Group
                              style={{ width: '100%', marginTop: 10 }}
                              onChange={onChangeCheckbox}
                              value={imeisSeleccionados}
                            >
                              <Row gutter={[8, 8]}>
                                {bien.imeis.map((imeiItem) => (
                                  <Col span={24} key={imeiItem.imei}>
                                    <Checkbox value={imeiItem}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <img
                                          src={imeiItem.fotoUrl}
                                          alt="Foto IMEI"
                                          width={50}
                                          style={{ borderRadius: 4 }}
                                        />
                                        <div>{imeiItem.imei}</div>
                                      </div>
                                    </Checkbox>
                                  </Col>
                                ))}
                              </Row>
                            </Checkbox.Group>
                          )}
                        </>
                      }
                    />
                  </Card>
                ))}
              </div>
            </Panel>
          ))}
        </Collapse>
      </Panel>
    ))}
  </Collapse>
</>


)}

  

{step === 2 && (
    <div id="form-step-2-scroll">
  <Title level={3} style={{ marginBottom: 10 }}>
  Paso 2: Elegí un bien registrado o cargalo manualmente
</Title>
<div
  style={{
    backgroundColor: '#e6f7ff',
    border: '1px solid #91d5ff',
    borderRadius: '8px',
    padding: '10px 15px',
    marginBottom: 20,
    fontSize: 14,
    color: '#004a6f'
  }}
>
  Seleccioná uno de los bienes ya registrados del vendedor. Si no encontrás el bien deseado, podés cargarlo manualmente completando el formulario inferior.
</div>
  <Form layout="vertical" form={formStep2} onFinish={handleFinishStep2}>


    {/* Tipo de Bien */}
    <Form.Item label="Tipo de Bien" name="tipo" rules={[{ required: true, message: 'Selecciona un tipo de bien.' }]}>
      <Select
        onChange={(value) => {
          handleTipoChange(value);
          setTipoSeleccionado(value);
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
    <Form.Item label="Marca" name="marca" rules={[{ required: true, message: 'Selecciona una marca.' }]}>
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
             <Button type="text" onClick={agregarNuevaMarca}>Agregar</Button>


            </div>
          </>
        )}
      >
        {marcas.map((marca) => (
          <Option key={marca} value={marca}>{marca}</Option>
        ))}
      </Select>
    </Form.Item>

    {/* Modelo */}
    <Form.Item label="Modelo" name="modelo" rules={[{ required: true, message: 'Selecciona un modelo.' }]}>
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
          <Button type="text" onClick={agregarNuevoModelo}>Agregar</Button>
        </div>
      </>
    )}
  >
    {modelos.map((modelo) => (
      <Option key={modelo} value={modelo}>{modelo}</Option>
    ))}
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
    onChange={handleCantidadChange} // Aquí usamos la función corregida
  />
</Form.Item>
{tipoSeleccionado !== "teléfono movil" && (
  <Form.Item label="Fotos del Bien">
    <Upload
      name="fotos"
      listType="picture"
      fileList={fileList} // Asegúrate de que fileList esté definido en el state
      onChange={({ fileList: newFileList }) => {
        setFileList(newFileList);
      }}
      beforeUpload={(file) => {
        return false; // Evita la subida automática
      }}
    >
      <Button>Subir Foto</Button>
    </Upload>
  </Form.Item>
)}




{imeis.map((item, index) => (
  <div key={index} style={{ marginBottom: '10px', border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
    <Form.Item label={`IMEI #${index + 1}`}>
      <Input
        placeholder="Ingrese el IMEI"
        value={item.imei}
        onChange={(e) => actualizarImei(index, e.target.value)}
      />
    </Form.Item>

    <Form.Item label="Foto del teléfono">
  <Upload
    listType="picture-card"
    fileList={item.foto ? [{
      uid: `foto-${index}`,
      name: item.foto.name,
      url: URL.createObjectURL(item.foto),
    }] : []}
    onPreview={() => Modal.info({
      title: `Vista previa IMEI #${index + 1}`,
      content: <img alt="Preview" style={{ width: '100%' }} src={URL.createObjectURL(item.foto)} />,
      okText: 'Cerrar',
    })}
    beforeUpload={(file) => {
      actualizarFotoImei(index, file);
      return false; // 🔁 no subir automáticamente
    }}
    onRemove={() => actualizarFotoImei(index, null)}
    showUploadList={{
      showRemoveIcon: true,
      showPreviewIcon: true,
    }}
  >
    {!item.foto && <Button>Subir Foto</Button>}
  </Upload>
</Form.Item>



    <Button type="danger" onClick={() => eliminarImei(index)}>Eliminar</Button>
  </div>
))}


    {/* Precio */}
    <Form.Item label="Precio" name="bienPrecio" rules={[{ required: true, message: 'Ingresa un precio válido.' }]}>
      <InputNumber min={0} placeholder="Precio" style={{ width: '100%' }} />
    </Form.Item>

    {/* Descripción */}
    <Form.Item label="Descripción" name="bienDescripcion" rules={[{ required: true, message: 'Ingrese una descripción.' }]}>
      <Input.TextArea placeholder="Describe el bien" rows={4} />
    </Form.Item>

    {/* Método de Pago */}
    <Form.Item label="Método de Pago" name="metodoPago" rules={[{ required: true, message: 'Selecciona un método de pago.' }]}>
      <Select>
        <Option value="tarjeta">Tarjeta de Crédito</Option>
        <Option value="efectivo">Efectivo</Option>
        <Option value="transferencia">Transferencia Bancaria</Option>
      </Select>
    </Form.Item>

    {/* Botón para agregar bien */}
    <Button
  type="primary"
  onClick={() => formStep2.submit()}
  loading={loading}
  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', marginBottom: '10px' }}
>
  Agregar Bien
</Button>


    {/* Tabla de Bienes Agregados */}
    {bienesAComprar.length > 0 && (
      <div style={{ marginTop: 20 }}>
        <Title level={4}>Bienes Agregados</Title>
        <Table
          dataSource={bienesAComprar}
          columns={[
            { title: 'Tipo', dataIndex: 'tipo', key: 'tipo' },
            { title: 'Marca', dataIndex: 'marca', key: 'marca' },
            { title: 'Modelo', dataIndex: 'modelo', key: 'modelo' },
            { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
            { title: 'Precio', dataIndex: 'precio', key: 'precio', render: (text) => `$${text}` },
            {
              title: 'Acciones',
              key: 'acciones',
              render: (_, record, index) => (
                <Button type="danger" onClick={() => eliminarBien(index)}>Eliminar</Button>
              ),
            },
          ]}
          rowKey={(record, index) => index}
        />
        {loading && (
  <div
    style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(255,255,255,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}
  >
    <Spin size="large" tip="Procesando..." />
  </div>
)}

      </div>
      

)}

    {/* Botón Finalizar Compra */}
    <Button
      type="primary"
      onClick={confirmarCompra}
      block
    >
      Finalizar Compra ({bienesAComprar.length} bienes)
    </Button>
    
  </Form> 

  
  </div>
)}
</div>
);
} 
export default ComprarPage;
