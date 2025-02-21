import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Select, Upload, message, Typography } from 'antd';
import { ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';        // Si lo necesitas adicional a tu setup
import api from '../redux/axiosConfig'; // Supuesto helper que wrappea axios, ajústalo según tu proyecto
import { addBien } from '../redux/actions/bienes'; 

const { Option } = Select;
const { Title } = Typography;

const RegistrarBienPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // -------------------------
  // Estados generales
  // -------------------------
  const [fileList, setFileList] = useState([]);        // Para fotos (no teléfono)
  const [descripcion, setDescripcion] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [precio, setPrecio] = useState(null);
  const [stock, setStock] = useState(null);

  // -------------------------
  // Manejo de marcas y modelos
  // -------------------------
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [nuevaMarca, setNuevaMarca] = useState('');
  const [nuevoModelo, setNuevoModelo] = useState('');

  // -------------------------
  // Manejo de IMEIs (para teléfono)
  // (array de objetos: { imei, precio, foto })
  // -------------------------
  const [imeis, setImeis] = useState([]);

  // -------------------------
  // Cálculo de total si es teléfono
  // -------------------------
  const [totalPrecioIndividual, setTotalPrecioIndividual] = useState(0);

  // Para identificar al propietario
  const token = localStorage.getItem('token');
  const userUuid = localStorage.getItem('userUuid');

  // -------------------------
  // Verificar autenticación
  // -------------------------
  useEffect(() => {
    if (!token || !userUuid) {
      message.error('Usuario no autenticado. Por favor, inicie sesión.');
      navigate('/home');
    }
  }, [token, userUuid, navigate]);

  // -------------------------
  // Cada vez que cambie la lista IMEIs, recalcular total
  // -------------------------
  useEffect(() => {
    const total = imeis.reduce((acc, curr) => acc + (Number(curr.precio) || 0), 0);
    setTotalPrecioIndividual(total);
  }, [imeis]);

  // -------------------------
  // Al cambiar "stock", regeneramos array de IMEIs si es teléfono
  // Si es otro tipo, no hacemos nada especial (solo un stock).
  // -------------------------
  useEffect(() => {
    if (!stock || stock < 1) {
      setImeis([]);
      return;
    }

    if (selectedTipo.toLowerCase() === 'teléfono movil') {
      // Generamos "stock" elementos en el array
      setImeis((prevImeis) => {
        // Si ya teníamos datos previos, los conservamos hasta 'stock' 
        const nuevos = [...prevImeis].slice(0, stock);
        while (nuevos.length < stock) {
          nuevos.push({ imei: '', precio: 0, foto: null });
        }
        return nuevos;
      });
    } else {
      // Si no es teléfono, no es necesario crear IMEIs
      setImeis([]);
    }
  }, [selectedTipo, stock]);

  // -------------------------
  // Cargar marcas al seleccionar tipo
  // -------------------------
  const handleTipoChange = async (tipo) => {
    setSelectedTipo(tipo);
    setPrecio(null);     // resetea precio global
    setImeis([]);        // limpia imeis si cambia a no teléfono

    // Reinicia campos
    form.setFieldsValue({ marca: null, modelo: null });
    setMarcas([]);
    setModelos([]);
    
    try {
      // Llamada a tu backend para obtener las marcas:
      // Ajusta la ruta a tu API real 
      const response = await api.get(`/bienes/bienes/marcas?tipo=${tipo}`);
      if (response.status === 200 && response.data.marcas) {
        setMarcas(response.data.marcas);
      } else {
        setMarcas([]);
      }
    } catch (err) {
      message.error("Error al cargar marcas del servidor.");
    }
  };

  // -------------------------
  // Cargar modelos al seleccionar marca
  // -------------------------
  const handleMarcaChange = async (marca) => {
    // Reset del modelo
    form.setFieldsValue({ modelo: null });
    setModelos([]);

    try {
      const tipo = form.getFieldValue('bienTipo');
      if (!tipo || !marca) return;

      // Llamada a tu backend para obtener modelos:
      const response = await api.get(`/bienes/bienes/modelos?tipo=${tipo}&marca=${marca}`);
      if (response.status === 200 && response.data.modelos) {
        setModelos(response.data.modelos);
      } else {
        setModelos([]);
      }
    } catch (err) {
      message.error("Error al cargar modelos del servidor.");
    }
  };

  // -------------------------
  // Agregar nueva marca a la BD y setearla
  // -------------------------
  const agregarNuevaMarca = async () => {
    const marca = nuevaMarca.trim();
    if (!marca) return message.warning("La marca no puede estar vacía.");

    const tipo = form.getFieldValue('bienTipo');
    if (!tipo) return message.warning("Selecciona un tipo primero.");

    try {
      // Ajustar llamada a tu backend real:
      const response = await api.post('/bienes/bienes/marcas', { tipo, marca });
      if (response.status === 201) {
        message.success(`Marca "${marca}" agregada.`);
        // Actualizamos la lista de marcas 
        setMarcas(prev => [...prev, marca]);
        // Asignamos esa marca en el form
        form.setFieldsValue({ bienMarca: marca });
        setNuevaMarca('');
      }
    } catch (err) {
      message.error("Error al agregar la marca al servidor.");
    }
  };

  // -------------------------
  // Agregar nuevo modelo a la BD y setearlo
  // -------------------------
  const agregarNuevoModelo = async () => {
    const modelo = nuevoModelo.trim();
    if (!modelo) return message.warning("El modelo no puede estar vacío.");

    const tipo = form.getFieldValue('bienTipo');
    const marca = form.getFieldValue('bienMarca');
    if (!tipo || !marca) return message.warning("Selecciona tipo y marca.");

    try {
      // Ajustar llamada a tu backend real:
      const response = await api.post('/bienes/bienes/modelos', { tipo, marca, modelo });
      if (response.status === 201) {
        message.success(`Modelo "${modelo}" agregado.`);
        // Actualizamos la lista de modelos
        setModelos(prev => [...prev, modelo]);
        // Asignamos ese modelo en el form
        form.setFieldsValue({ bienModelo: modelo });
        setNuevoModelo('');
      }
    } catch (err) {
      message.error("Error al agregar el modelo al servidor.");
    }
  };

  // -------------------------
  // Manejo de cambios en el array "imeis"
  // -------------------------
  const handleImeiChange = (index, field, value) => {
    setImeis(prev => {
      const nuevos = [...prev];
      nuevos[index][field] = value;
      return nuevos;
    });
  };

  // Eliminar un IMEI en particular
  const eliminarImei = (index) => {
    setImeis(prev => {
      const nuevos = [...prev];
      nuevos.splice(index, 1);
      return nuevos;
    });
  };

  // -------------------------
  // Al dar "submit" al formulario
  // -------------------------
  const handleFinish = async () => {
    try {
      // Validaciones: si es teléfono y no hay IMEIs o stock
      if (selectedTipo.toLowerCase() === 'teléfono movil') {
        if (!stock || imeis.length !== stock) {
          return message.error('Debe haber un IMEI (y precio) por cada unidad de stock.');
        }
        // Verificar que no haya IMEIs vacíos
        for (let i = 0; i < imeis.length; i++) {
          if (!imeis[i].imei.trim()) {
            return message.error(`El IMEI #${i + 1} está vacío. Por favor, complétalo.`);
          }
        }
      }

      // Preparamos FormData
      const formData = new FormData();
      formData.append('tipo', selectedTipo);
      formData.append('marca', form.getFieldValue('bienMarca'));
      formData.append('modelo', form.getFieldValue('bienModelo'));
      formData.append('descripcion', descripcion);
      formData.append('propietario_uuid', userUuid);

      // Si es teléfono, el precio total se maneja como suma de IMEIs (cada uno con su precio)
      // Si es otro tipo, es un precio global
      if (selectedTipo.toLowerCase() === 'teléfono movil') {
        formData.append('precio', '0'); // Ej: podemos mandar 0 o el total, depende del backend
      } else {
        formData.append('precio', precio);
      }

      // Stock 
      formData.append('stock', JSON.stringify({ cantidad: stock }));

      // IMEIs (con precio y foto), o ID autogenerados si no es teléfono 
      if (selectedTipo.toLowerCase() === 'teléfono movil') {
        // Enviamos en JSON la info de IMEIs
        // Cada IMEI podría tener su precio, etc.
        // También se envían fotos en formData individualmente
        formData.append('imei', JSON.stringify(imeis));

        // Adjuntar cada foto con un campo distinto
        // (una alternativa es mandar todas bajo un mismo nombre 'imeiFotos[]', pero
        //  eso requiere adaptar tu backend)
        imeis.forEach((item, index) => {
          if (item.foto) {
            formData.append(`imeiFoto_${index}`, item.foto.originFileObj || item.foto);
          }
        });
      } else {
        // En caso de bienes que no son teléfonos, mandamos un array de IDs o nada
        // Generamos identificadores aleatorios
        const newIDs = Array(stock)
          .fill('')
          .map(() => `ID-${Math.random().toString(36).substr(2, 9)}`);
        formData.append('imei', JSON.stringify(newIDs)); // Reutilizamos el campo "imei"
      }

      // Fotos del bien (no teléfono)
      if (selectedTipo.toLowerCase() !== 'teléfono movil') {
        fileList.forEach((file, index) => {
          formData.append('fotos', file.originFileObj || file);
        });
      }

      // Llamamos acción Redux
      await dispatch(addBien(formData));
      message.success('Bien registrado exitosamente.');

      // Reseteamos formulario
      form.resetFields();
      setFileList([]);
      setImeis([]);
      setSelectedTipo('');
      setPrecio(null);
      setStock(null);
      setDescripcion('');
      setMarcas([]);
      setModelos([]);
      setNuevaMarca('');
      setNuevoModelo('');
      setTotalPrecioIndividual(0);

      // Redirigir adonde necesites
      navigate('/user/dashboard');
    } catch (error) {
      console.error('Error al registrar el bien:', error);
      message.error('Error al registrar el bien.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Botones de cabecera */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Volver
        </Button>
        <Button icon={<HomeOutlined />} onClick={() => navigate('/user/dashboard')}>
          Inicio
        </Button>
      </div>

      <Title level={3}>Registro de Bienes</Title>
      <p>Aquí podas registrar tus bienes de manera individual</p>

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        {/* Tipo de Bien */}
        <Form.Item
          name="bienTipo"
          label="Tipo de Bien"
          rules={[{ required: true, message: 'Seleccione el tipo de bien' }]}
        >
          <Select
            placeholder="Seleccione tipo"
            value={selectedTipo}
            onChange={(value) => {
              form.setFieldsValue({ bienTipo: value });
              handleTipoChange(value);
            }}
          >
            {['bicicleta', 'TV', 'equipo de audio', 'cámara fotográfica', 'notebook', 'tablet', 'teléfono movil'].map((tipo) => (
              <Option key={tipo} value={tipo}>
                {tipo}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Marca */}
        <Form.Item
          name="bienMarca"
          label="Marca"
          rules={[{ required: true, message: 'Ingrese la marca' }]}
        >
          <Select
            placeholder="Seleccione o ingrese una marca"
            onChange={handleMarcaChange}
            dropdownRender={(menu) => (
              <>
                {menu}
                <div style={{ display: 'flex', gap: 5, padding: 8 }}>
                  <Input
                    placeholder="Nueva marca"
                    value={nuevaMarca}
                    onChange={(e) => setNuevaMarca(e.target.value)}
                  />
                  <Button type="primary" onClick={agregarNuevaMarca}>
                    Agregar
                  </Button>
                </div>
              </>
            )}
          >
            {marcas.map((marca) => (
              <Option key={marca} value={marca}>
                {marca}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Modelo */}
        <Form.Item
          name="bienModelo"
          label="Modelo"
          rules={[{ required: true, message: 'Ingrese el modelo' }]}
        >
          <Select
            placeholder="Seleccione o ingrese un modelo"
            onChange={(value) => form.setFieldsValue({ bienModelo: value })}
            dropdownRender={(menu) => (
              <>
                {menu}
                <div style={{ display: 'flex', gap: 5, padding: 8 }}>
                  <Input
                    placeholder="Nuevo modelo"
                    value={nuevoModelo}
                    onChange={(e) => setNuevoModelo(e.target.value)}
                  />
                  <Button type="primary" onClick={agregarNuevoModelo}>
                    Agregar
                  </Button>
                </div>
              </>
            )}
          >
            {modelos.map((modelo) => (
              <Option key={modelo} value={modelo}>
                {modelo}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Descripción */}
        <Form.Item name="descripcion" label="Descripción">
          <Input.TextArea
            rows={4}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </Form.Item>

        {/* Stock */}
        <Form.Item
          name="bienStock"
          label="Cantidad"
          rules={[{ required: true, message: 'Ingrese el stock' }]}
        >
          <InputNumber
            min={1}
            style={{ width: '100%' }}
            value={stock}
            onChange={(value) => setStock(value)}
          />
        </Form.Item>

        {/* 
          Si NO es teléfono, mostramos "Precio Global"
          Si ES teléfono, ocultamos este campo y usamos precios individuales en los IMEIs
        */}
        {selectedTipo.toLowerCase() !== 'teléfono movil' && (
          <Form.Item
            name="bienPrecio"
            label="Precio"
            rules={[{ required: true, message: 'Ingrese el precio' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              value={precio}
              onChange={(value) => setPrecio(value)}
            />
          </Form.Item>
        )}

        {/* 
          Si ES teléfono, mostramos la lista de IMEIs 
          con precio individual y foto 
        */}
        {selectedTipo.toLowerCase() === 'teléfono movil' && imeis.length > 0 && (
          <div style={{ border: '1px dashed #ccc', padding: 10, marginBottom: 16 }}>
            <Title level={5}>Detalle de Teléfonos (IMEI)</Title>
            {imeis.map((item, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '10px',
                  border: '1px solid #ddd',
                  padding: '10px',
                  borderRadius: '5px',
                }}
              >
                <p style={{ fontWeight: 'bold' }}>IMEI #{index + 1}</p>
                <Form.Item label="Número de IMEI">
                  <Input
                    value={item.imei}
                    onChange={(e) => handleImeiChange(index, 'imei', e.target.value)}
                    placeholder="Ingrese IMEI"
                  />
                </Form.Item>
                <Form.Item label="Precio Individual">
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    value={item.precio}
                    onChange={(val) => handleImeiChange(index, 'precio', val)}
                  />
                </Form.Item>
                <Form.Item label="Foto">
                  <Upload
                    listType="picture"
                    beforeUpload={(file) => {
                      handleImeiChange(index, 'foto', file);
                      return false; // Evita carga automática
                    }}
                  >
                    <Button>Subir Foto Teléfono</Button>
                  </Upload>
                </Form.Item>
                <Button type="danger" onClick={() => eliminarImei(index)}>
                  Eliminar IMEI
                </Button>
              </div>
            ))}

            {/* Mostrar la suma total de precios individuales */}
            <p style={{ fontWeight: 'bold' }}>
              Total de precios individuales: ${totalPrecioIndividual}
            </p>
          </div>
        )}

        {/* Si NO es teléfono, fotos generales del bien */}
        {selectedTipo.toLowerCase() !== 'teléfono movil' && (
          <Form.Item label="Fotos del Bien">
            <Upload
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

        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            Registrar Bien
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RegistrarBienPage;
