import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Select, Upload, message, Typography } from 'antd';
import { ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';        // Si lo necesitas adicional a tu setup
import api from '../redux/axiosConfig'; // Supuesto helper que wrappea axios, ajústalo según tu proyecto
import { addBien } from '../redux/actions/bienes'; 
import imeiEjemploImg from '../assets/imei-ejemplo.png'; // Ajusta la ruta si estás en una subcarpeta


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
  const [identificadoresUnicos, setIdentificadoresUnicos] = useState([]);
  const [loadingRegistro, setLoadingRegistro] = useState(false);



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
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const token = localStorage.getItem('authToken');
  const userUuid = userData.uuid; // siempre UUID del usuario autenticado
const propietarioUuid = userData.empresaUuid || userData.uuid;

  // -------------------------
  // Modal: mostrar imagen de IMEI
  // -------------------------
  const [isModalVisible, setIsModalVisible] = useState(false);

  const openModal = () => {
    setIsModalVisible(true); // Abre el modal
  };

  const closeModal = () => {
    setIsModalVisible(false); // Cierra el modal
  };


  

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

  const agregarIdentificador = () => {
    setIdentificadoresUnicos(prev => [...prev, '']);
  };
  
  const actualizarIdentificador = (index, value) => {
    const nuevos = [...identificadoresUnicos];
    nuevos[index] = value;
    setIdentificadoresUnicos(nuevos);
  };
  
  const eliminarIdentificador = (index) => {
    setIdentificadoresUnicos(prev => prev.filter((_, i) => i !== index));
  };
  

  // -------------------------
  // Al dar "submit" al formulario
  // -------------------------
  const handleFinish = async () => {
    setLoadingRegistro(true); // 👈 Mostrar loading
    message.loading({ content: 'Espere mientras registramos el bien...', key: 'registroBien', duration: 0 });
  
try {
  if (selectedTipo.toLowerCase() === 'teléfono movil') {
    if (!stock || imeis.length !== stock) {
      message.destroy('registroBien');
      setLoadingRegistro(false);
      return message.error('Debe haber un IMEI (y precio) por cada unidad de stock.');
    }
    for (let i = 0; i < imeis.length; i++) {
      if (!imeis[i].imei.trim() || !imeis[i].precio) {
        message.destroy('registroBien');
        setLoadingRegistro(false);
        return message.error(`El IMEI #${i + 1} debe tener un precio.`);
      }

      // ⚠️ Validar imagen
      if (!imeis[i].foto) {
        message.destroy('registroBien');
        setLoadingRegistro(false);
        return message.warning(`Debes adjuntar una foto para el IMEI #${i + 1}.`);
      }
    }
  } else {
    // ⚠️ Validar al menos una imagen en bienes que no son teléfono
    if (fileList.length === 0) {
      message.destroy('registroBien');
      setLoadingRegistro(false);
      return message.warning('Debes adjuntar al menos una imagen del bien.');
    }
  }


  
      const formData = new FormData();
      formData.append('tipo', selectedTipo);
      formData.append('marca', form.getFieldValue('bienMarca'));
      formData.append('modelo', form.getFieldValue('bienModelo'));
      formData.append('descripcion', descripcion);
      formData.append('propietario_uuid', propietarioUuid);
      formData.append('registrado_por_uuid', userUuid);
  
      if (selectedTipo.toLowerCase() === 'teléfono movil') {
        const precioTotal = imeis.reduce((acc, curr) => acc + (Number(curr.precio) || 0), 0);
        formData.append('precio', precioTotal);
      } else {
        formData.append('precio', precio || 0);
      }
  
      formData.append('stock', JSON.stringify({ cantidad: stock }));
  
      if (selectedTipo.toLowerCase() === 'teléfono movil') {
        formData.append('imei', JSON.stringify(imeis));
        imeis.forEach((item, index) => {
          if (item.foto) {
            formData.append(`imeiFoto_${index}`, item.foto.originFileObj || item.foto);
          }
        });
      } else {
        formData.append('imei', JSON.stringify([]));
      }
  
      if (selectedTipo.toLowerCase() !== 'teléfono movil') {
        fileList.forEach((file, index) => {
          formData.append(`fotos_bien_0_${index}`, file.originFileObj || file);
        });
      }
  
      await dispatch(addBien(formData));
      message.success({ content: '✅ Bien registrado exitosamente.', key: 'registroBien', duration: 2 });
  
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
  
      navigate('/user/dashboard');
    } catch (error) {
      console.error(error);
      message.error({ content: '❌ Error al registrar el bien.', key: 'registroBien' });
    } finally {
      setLoadingRegistro(false); // 👈 Ocultar loading
    }
  };
  
  
  const esDelegado = !!userData.empresaUuid;

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

    {esDelegado && (
      <div style={{ marginBottom: 16, backgroundColor: '#fff7e6', padding: 12, border: '1px solid #faad14', borderRadius: 8 }}>
        Estás cargando bienes en representación de la empresa <strong>{userData.razonSocial || 'Tu Empresa'}</strong>
      </div>
    )}

    <Title level={3}>Registro de Bienes</Title>
    <Title level={3}>Cargar nuevo bien</Title>
    <p>Utilizá este formulario para registrar un bien individual en tu inventario.</p>

    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      scrollToFirstError
      validateTrigger={['onBlur', 'onSubmit']} // UX friendly
    >
      {/* Tipo de Bien */}
      <Form.Item
        name="bienTipo"
        label="Tipo de Bien"
        rules={[{ required: true, message: 'Seleccione el tipo de bien' }]}
      >
        <Select
          placeholder="Seleccione tipo"
          onChange={(value) => {
            setSelectedTipo(value);
            handleTipoChange(value);
            form.setFieldsValue({ bienTipo: value });
          }}
        >
          {['bicicleta', 'TV', 'equipo de audio', 'cámara fotográfica', 'notebook', 'tablet', 'teléfono movil'].map((tipo) => (
            <Select.Option key={tipo} value={tipo}>
              {tipo}
            </Select.Option>
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
          placeholder="Seleccione o agregue una marca"
          onChange={handleMarcaChange}
          dropdownRender={(menu) => (
            <>
              {menu}
              <div style={{ display: 'flex', gap: 8, padding: 8 }}>
                <Input
                  placeholder="Nueva marca"
                  value={nuevaMarca}
                  onChange={(e) => setNuevaMarca(e.target.value)}
                />
                <Button type="link" onClick={agregarNuevaMarca}>Agregar</Button>
              </div>
            </>
          )}
        >
          {marcas.map((marca) => (
            <Select.Option key={marca} value={marca}>
              {marca}
            </Select.Option>
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
          placeholder="Seleccione o agregue un modelo"
          onChange={(value) => form.setFieldsValue({ bienModelo: value })}
          dropdownRender={(menu) => (
            <>
              {menu}
              <div style={{ display: 'flex', gap: 8, padding: 8 }}>
                <Input
                  placeholder="Nuevo modelo"
                  value={nuevoModelo}
                  onChange={(e) => setNuevoModelo(e.target.value)}
                />
                <Button type="link" onClick={agregarNuevoModelo}>Agregar</Button>
              </div>
            </>
          )}
        >
          {modelos.map((modelo) => (
            <Select.Option key={modelo} value={modelo}>
              {modelo}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {/* Descripción */}
      <Form.Item name="descripcion" label="Descripción">
        <Input.TextArea
          rows={4}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción detallada del bien"
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

      {/* Precio general */}
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

      {/* IMEIs para teléfonos */}
      {selectedTipo.toLowerCase() === 'teléfono movil' && imeis.length > 0 && (
        <div style={{ border: '1px dashed #ccc', padding: 16, borderRadius: 8 }}>
          <Title level={5}>Detalle de IMEIs</Title>
          {imeis.map((item, index) => (
            <div key={index} style={{
              marginBottom: '20px',
              background: '#fafafa',
              border: '1px solid #eee',
              padding: '15px',
              borderRadius: '8px'
            }}>
              <p><strong>IMEI #{index + 1}</strong></p>
              <Form.Item label="Número de IMEI">
                <Input
                  value={item.imei}
                  onChange={(e) => handleImeiChange(index, 'imei', e.target.value)}
                  placeholder="Ingrese el IMEI"
                  maxLength={15} // Limitar a 15 caracteres
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
              <Form.Item label="Foto del dispositivo">
                <Upload
                  listType="picture"
                  fileList={item.foto ? [{ uid: `imei-${index}`, name: `foto-${index}.jpg`, status: 'done', url: URL.createObjectURL(item.foto) }] : []}
                  beforeUpload={(file) => {
                    handleImeiChange(index, 'foto', file);
                    return false;
                  }}
                  onRemove={() => handleImeiChange(index, 'foto', null)}
                  showUploadList={{ showRemoveIcon: true }}
                >
                  <Button>Subir Foto</Button>
                </Upload>
              </Form.Item>
              <Button type="link" danger onClick={() => eliminarImei(index)}>Eliminar IMEI</Button>
            </div>
          ))}
          <p><strong>Total acumulado:</strong> ${totalPrecioIndividual}</p>

          {/* Mostrar ayuda para obtener el IMEI */}
        <p style={{ marginTop: '8px' }}>
  <Button type="link" onClick={openModal} style={{ padding: 0 }}>
    ¿Cómo obtener mi IMEI?
  </Button>
</p>

          {/* Modal */}
          <div className={`modal ${isModalVisible ? 'modal-open' : ''}`}>
            <div className="modal-content">
              <span className="close" onClick={closeModal}>&times;</span>
              <h2>¿Cómo obtener el IMEI?</h2>
              <p>Marca <strong>*#06#</strong> en tu teléfono y aparecerá en pantalla.</p>
   <img src={imeiEjemploImg} alt="Ejemplo de cómo ver el IMEI en el celular" />

            </div>
          </div>

        </div>
      )}

      {/* Fotos generales */}
      {selectedTipo.toLowerCase() !== 'teléfono movil' && (
        <Form.Item label="Fotos del Bien">
          <Upload
            listType="picture"
            fileList={fileList}
            onChange={({ fileList: newList }) => setFileList(newList)}
            beforeUpload={() => false}
          >
            <Button>Subir Imágenes</Button>
          </Upload>
        </Form.Item>
      )}

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          style={{ width: '100%' }}
          loading={loadingRegistro}
          disabled={loadingRegistro}
        >
          Registrar Bien
        </Button>
      </Form.Item>
    </Form>
    <style>
{`
  .modal {
    display: none;
    position: fixed;
    z-index: 9999;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    justify-content: center;
    align-items: center;
  }

  .modal-open {
    display: flex;
  }

  .modal-content {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    max-width: 300px;
    width: 90%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    text-align: center;
    position: relative;
    animation: fadeIn 0.3s ease-in-out;
  }

  .modal-content img {
    max-width: 100%;
    height: auto;
    margin-top: 10px;
    border-radius: 6px;
  }

  .close {
    position: absolute;
    top: 8px;
    right: 12px;
    font-size: 20px;
    font-weight: bold;
    color: #999;
    cursor: pointer;
    transition: color 0.2s;
  }

  .close:hover {
    color: #333;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`}
</style>

  </div>
);

};

export default RegistrarBienPage;
