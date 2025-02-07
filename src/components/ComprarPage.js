import axios from 'axios';  
import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Select, message, Typography, Upload, Modal, Table } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBienes, registrarCompra, agregarMarca, agregarModelo } from '../redux/actions/bienes';
import { checkExistingUser, registerUsuarioPorTercero } from '../redux/actions/usuarios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, LogoutOutlined } from '@ant-design/icons';
import api from '../redux/axiosConfig'; // Instancia de axios configurada

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
  const [bienesAComprar, setBienesAComprar] = useState([]);
  const [currentBien, setCurrentBien] = useState(null);

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

  // Agregar un bien al array antes de confirmar la compra
  const agregarBien = (values) => {
    setBienesAComprar(prevBienes => {
      const nuevosBienes = [...prevBienes, values];
      console.log("Bien agregado:", nuevosBienes); // 🛠️ Debug
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
  const handleFinishStep2 = (values) => {
    // Validar precio
    const precio = values.bienPrecio ? parseFloat(values.bienPrecio) : 0;
    if (isNaN(precio) || precio <= 0) {
      message.error('El precio debe ser un número válido mayor a 0.');
      return;
    }
  
    // Validar cantidad
    const cantidad = values.bienStock ? parseInt(values.bienStock, 10) : 0;
    if (isNaN(cantidad) || cantidad <= 0) {
      message.error('La cantidad debe ser un número válido mayor a 0.');
      return;
    }
  
    // Validar IMEIs y fotos (si el tipo es "teléfono movil")
    if (tipoSeleccionado === "teléfono movil" && !verificarImeisConFotos()) {
      return; // Detener si falta alguno de estos datos
    }
  
    // Crear el objeto nuevoBien con los datos validados
    const nuevoBien = {
      tipo: values.tipo || 'desconocido',  // Se asegura de que tipo siempre tenga un valor
      marca: values.marca || 'desconocido',
      modelo: values.modelo || 'desconocido',
      descripcion: values.bienDescripcion || '',
      precio, // Ya convertido y validado
      cantidad, // Ya convertido y validado
      metodoPago: values.metodoPago || 'efectivo',  // Valor predeterminado
      // Si es teléfono movil se usa el estado 'imeis', de lo contrario se asignan las fotos generales
      imeis: tipoSeleccionado === "teléfono movil" ? imeis : [],
      fotos: tipoSeleccionado !== "teléfono movil" ? fileList : []  // <-- Agregado para bienes sin IMEI
    };
    
  
    console.log("✅ Bien agregado correctamente:", nuevoBien);
  
    // Agregar el nuevo bien al listado
    setBienesAComprar((prevBienes) => [...prevBienes, nuevoBien]);
    message.success("Bien agregado correctamente.");
  
    // Reiniciar el formulario para ingresar otro bien
    formStep2.resetFields();
  
    // Si el bien es de tipo "teléfono movil", reiniciar el estado de IMEIs para el siguiente bien
    if (tipoSeleccionado === "teléfono movil") {
      setImeis([]);
    }
  };
  
  const confirmarCompra = async () => {
    // Validar que se haya agregado al menos un bien
    if (bienesAComprar.length === 0) {
      message.error("Debe agregar al menos un bien para completar la compra.");
      return;
    }
  
    // Validar para cada bien de tipo "teléfono movil" que se hayan ingresado sus IMEIS
    for (let i = 0; i < bienesAComprar.length; i++) {
      const bien = bienesAComprar[i];
      if (bien.tipo === "teléfono movil") {
        // Se espera que la cantidad de IMEIS coincida con la cantidad del bien (en este ejemplo, se asume cantidad 1)
        if (!bien.imeis || bien.imeis.length !== parseInt(bien.cantidad, 10)) {
          message.error(`Debe ingresar el IMEI (y la foto) para el teléfono móvil en la posición ${i + 1}.`);
          return;
        }
        // Validar que cada objeto de IMEI tenga un valor y una foto
        const imeiObj = bien.imeis[0];
        if (!imeiObj || !imeiObj.imei || imeiObj.imei.trim() === "") {
          message.error(`Debe ingresar el IMEI para el teléfono móvil en la posición ${i + 1}.`);
          return;
        }
        if (!imeiObj.foto) {
          message.error(`Debe subir la foto para el teléfono móvil en la posición ${i + 1}.`);
          return;
        }
      }
    }
  
    // Validar que los IMEIS sean únicos entre todos los bienes de tipo "teléfono movil"
    let todosImeis = [];
    bienesAComprar.forEach((bien) => {
      if (bien.tipo === "teléfono movil" && bien.imeis) {
        todosImeis.push(bien.imeis[0].imei);
      }
    });
    const imeisUnicos = new Set(todosImeis);
    if (imeisUnicos.size !== todosImeis.length) {
      message.error("No se pueden agregar teléfonos con el mismo IMEI.");
      return;
    }
  
    try {
      const formData = new FormData();
  
      formData.append("vendedorId", vendedorId);
      formData.append("dniComprador", usuario.dni);
  
      bienesAComprar.forEach((bien, i) => {
        // Datos generales del bien
        formData.append(`bienes[${i}][tipo]`, bien.tipo);
        formData.append(`bienes[${i}][marca]`, bien.marca);
        formData.append(`bienes[${i}][modelo]`, bien.modelo);
        formData.append(`bienes[${i}][descripcion]`, bien.descripcion);
        formData.append(`bienes[${i}][precio]`, bien.precio);
        formData.append(`bienes[${i}][cantidad]`, bien.cantidad);
        formData.append(`bienes[${i}][metodoPago]`, bien.metodoPago);
      
        if (bien.tipo === "teléfono movil") {
          // Para teléfonos móviles: enviar el IMEI y su foto
          const imeiObj = bien.imeis[0];
          formData.append(`bienes[${i}][imei]`, imeiObj.imei);
          formData.append(`bienes[${i}][imeiFoto]`, imeiObj.foto);
          console.log(`✅ IMEI asignado al bien ${i}: ${imeiObj.imei}`);
          console.log(`📸 Foto asignada al bien ${i}: ${imeiObj.foto.name}`);
        } else {
          // Para bienes sin IMEI: enviar las fotos generales
          // Se asume que en handleFinishStep2 ya asignaste las fotos a la propiedad 'fotos'
          if (bien.fotos && bien.fotos.length > 0) {
            bien.fotos.forEach((foto, index) => {
              if (foto.originFileObj) {
                console.log(`📸 Añadiendo foto del bien al FormData: ${foto.name}`);
                formData.append(`bienes[${i}][fotos][${index}]`, foto.originFileObj);
              } else {
                console.log(`📸 Añadiendo foto del bien (File directo) al FormData: ${foto.name}`);
                formData.append(`bienes[${i}][fotos][${index}]`, foto);
              }
            });
          }
        }
      });
      
  
      // Depuración: Imprimir el contenido del FormData (opcional)
      for (const pair of formData.entries()) {
        console.log(`📦 Enviando FormData -> ${pair[0]}:`, pair[1]);
      }
  
      // Enviar el FormData al backend
      const response = await api.post('/transacciones/comprar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      console.log("✅ Compra registrada con éxito:", response.data);
      message.success("Compra completada con éxito.");
      navigate("/user/dashboard");
    } catch (error) {
      console.error("❌ Error en registrarCompra:", error);
      message.error(error.message || "No se pudo registrar la compra. Verifique los datos e intente nuevamente.");
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

      {/* Formulario Paso 1 */}
      {step === 1 && (
        <Form layout="vertical" onFinish={handleFinishStep1} form={formStep1}>
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
  <Form layout="vertical" form={formStep2} onFinish={handleFinishStep2}>

    <Title level={3}>Paso 2: Agregar Bien</Title>

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
        console.log("📸 Archivos seleccionados en `fileList`:", newFileList);
        setFileList(newFileList);
      }}
      beforeUpload={(file) => {
        console.log("📤 Foto seleccionada:", file);
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

    <Form.Item label="Foto del IMEI">
    <Upload
  listType="picture"
  beforeUpload={(file) => {
    actualizarFotoImei(index, file);
    return false; // Evita la subida automática
  }}
  showUploadList={true}
>
  <Button>Subir Foto</Button>
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
)}
</div>
);
}
export default ComprarPage;
