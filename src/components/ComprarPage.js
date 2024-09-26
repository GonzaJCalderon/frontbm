import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Select, message, Modal, Typography, Upload, notification } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBienes, addBien, registrarCompra } from '../redux/actions/bienes';
import { addUsuario } from '../redux/actions/usuarios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, HomeOutlined, LogoutOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title } = Typography;

// Función para generar UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const getUserData = () => {
  const userData = localStorage.getItem('userData');
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error al parsear userData:', error);
      return null;
    }
  }
  return null;
};

const ComprarPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [fileList, setFileList] = useState([]);
  const [action, setAction] = useState('nuevo'); // Default action to 'nuevo'
  const [selectedTipo, setSelectedTipo] = useState(null);
  const [selectedMarca, setSelectedMarca] = useState('');
  const [selectedModelo, setSelectedModelo] = useState('');
  const [compradorId, setCompradorId] = useState('');
  const [bienesDinamicos, setBienesDinamicos] = useState([]); // Estado para manejar los bienes
  const [newBienDetails, setNewBienDetails] = useState([]); // Datos para el modal
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector(state => state.bienes);

  // Filtrar bienes por tipo
  const bienesTipos = [...new Set(items.map(bien => bien.tipo))];

  // Filtrar marcas basadas en el tipo seleccionado
  const marcasDisponibles = items
    .filter(bien => bien.tipo === selectedTipo)
    .map(bien => bien.marca);

  // Filtrar modelos basados en la marca seleccionada
  const modelosDisponibles = items
    .filter(bien => bien.tipo === selectedTipo && bien.marca === selectedMarca)
    .map(bien => bien.modelo);

  useEffect(() => {
    const usuario = getUserData();
    if (usuario && usuario.id) {
      setCompradorId(usuario.id);
      dispatch(fetchBienes(usuario.id));
    } else {
      console.error('No se pudo obtener el ID del usuario');
    }
  }, [dispatch]);

  // Función para manejar el cambio en la cantidad de bienes
  const handleCantidadChange = (value) => {
    const nuevosBienes = Array.from({ length: value }, (_, index) => ({
      id: generateUUID(),
      precio: null,
      descripcion: '',
      fotos: [],
      bienNumero: index + 1,
    }));
    setBienesDinamicos(nuevosBienes);
  };

  // Manejar cambios en los formularios de los bienes dinámicos
  const handleBienChange = (index, field, value) => {
    const nuevosBienes = [...bienesDinamicos];
    nuevosBienes[index][field] = value;
    setBienesDinamicos(nuevosBienes);
  };

  // Manejar los archivos subidos para cada bien
  const handleFileChange = (index, { fileList: newFileList }) => {
    const nuevosBienes = [...bienesDinamicos];
    nuevosBienes[index].fotos = newFileList;
    setBienesDinamicos(nuevosBienes);
  };

  const handleFinishStep1 = async (values) => {
    const newUser = {
      firstName: values.vendedorNombre.trim(),
      lastName: values.vendedorApellido.trim(),
      email: values.vendedorEmail.trim(),
      dniCuit: values.vendedorDniCuit.trim(),
      address: values.vendedorDireccion.trim(),
      password: 'default_password',
    };

    try {
      const response = await dispatch(addUsuario(newUser));
      if (response && response.usuario) {
        const updatedFormValues = {
          vendedorNombre: response.usuario.nombre,
          vendedorApellido: response.usuario.apellido,
          vendedorEmail: response.usuario.email,
          vendedorDniCuit: response.usuario.dni,
          vendedorDireccion: response.usuario.direccion,
          vendedorId: response.usuario.id,
        };

        setFormValues(updatedFormValues);
        setStep(2);
      } else {
        message.error('Error inesperado en la respuesta del servidor. Verifica la estructura.');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Error al registrar el usuario.');
    }
  };
  const handleFinishStep2 = async () => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('userData'));
  
    if (!userData) {
        return notification.error({
            message: 'Error',
            description: 'No se ha encontrado el comprador en el localStorage.',
        });
    }
  
    const compradorId = userData.id;
  
    const bienesData = bienesDinamicos.map(bien => ({
        id: bien.id,
        descripcion: bien.descripcion, // Asegúrate de que este campo se esté pasando correctamente
        precio: bien.precio,
        tipo: selectedTipo,
        marca: selectedMarca,
        modelo: selectedModelo,
        fotos: bien.fotos.map(file => file.originFileObj),
        vendedorId: formValues.vendedorId,
        vendedorNombre: formValues.vendedorNombre,
        vendedorEmail: formValues.vendedorEmail,
        vendedorDniCuit: formValues.vendedorDniCuit,
        vendedorDireccion: formValues.vendedorDireccion,
        fecha: new Date().toISOString(),
        metodoPago: form.getFieldValue('metodoPago'),
        cantidad: bien.cantidad || 1 // Asegúrate de que la cantidad se esté asignando
    }));
  
    try {
        // Registrar los bienes
        for (const bien of bienesData) {
            await dispatch(addBien(bien));
        }
  
        setNewBienDetails(bienesData);
        setIsModalOpen(true);
    } catch (error) {
        message.error(error.response?.data?.message || 'Error al registrar el bien.');
    }
};

const handleConfirm = async () => {
    if (!newBienDetails || newBienDetails.length === 0) {
        console.error('No hay detalles de bienes para registrar');
        return;
    }
  
    const userData = JSON.parse(localStorage.getItem('userData'));
    const compradorId = userData ? userData.id : null;
  
    if (!compradorId) {
        console.error('No se ha encontrado compradorId en localStorage');
        return;
    }
  
    try {
        for (const bien of newBienDetails) {
            const compraData = {
                fecha: bien.fecha || new Date().toISOString(),
                precio: bien.precio,
                cantidad: bien.cantidad || 1,
                compradorId: compradorId,
                vendedorId: bien.vendedorId,
                bienId: bien.id,
                estado: bien.estado || 'pendiente',
                metodoPago: form.getFieldValue('metodoPago') || bien.metodoPago,
                tipo: bien.tipo,
                marca: bien.marca,
                modelo: bien.modelo,
                descripcion: bien.descripcion // Asegúrate de que la descripción se incluya aquí
            };
  
            console.log('Datos enviados a registrarCompra:', compraData);
            await dispatch(registrarCompra(compraData));
        }
  
        notification.success({
            message: 'Compra Registrada',
            description: 'La compra ha sido registrada con éxito.',
        });
  
        setIsModalOpen(false);
        navigate('/userdashboard');
    } catch (error) {
        console.error('Error al registrar los bienes:', error);
        message.error('Error al registrar los bienes. Por favor, inténtalo de nuevo.');
    }
};



  const handleChangeAction = (value) => {
    setAction(value);
    form.resetFields(['bienStock', 'bienDescripcion', 'bienPrecio', 'metodoPago']);
    setFileList([]);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginRight: '10px' }}
        >
          Volver
        </Button>
        <Button
          icon={<HomeOutlined />}
          onClick={() => navigate('/userdashboard')}
          style={{ marginRight: '10px' }}
        >
          Inicio
        </Button>
        <Button
          icon={<LogoutOutlined />}
          onClick={() => {
            localStorage.removeItem('userData');
            navigate('/home');
          }}
          type="primary"
        >
          Cerrar Sesión
        </Button>
      </div>

      <Title level={3}>{step === 1 ? 'Paso 1: Datos del Vendedor' : 'Paso 2: Datos del Bien'}</Title>

      {step === 1 && (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinishStep1}
        >
          <Form.Item
            name="vendedorNombre"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingrese el nombre del vendedor' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="vendedorApellido"
            label="Apellido"
            rules={[{ required: true, message: 'Por favor ingrese el apellido del vendedor' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="vendedorEmail"
            label="Email"
            rules={[{ required: true, message: 'Por favor ingrese el email del vendedor' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="vendedorDniCuit"
            label="DNI/CUIT"
            rules={[{ required: true, message: 'Por favor ingrese el DNI/CUIT del vendedor' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="vendedorDireccion"
            label="Dirección"
            rules={[{ required: true, message: 'Por favor ingrese la dirección del vendedor' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Siguiente
            </Button>
          </Form.Item>
        </Form>
      )}

      {step === 2 && (
        <>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinishStep2}
          >
            <Form.Item
              name="accion"
              label="Acción"
              rules={[{ required: true, message: 'Por favor seleccione si el bien es nuevo o registrado' }]}
            >
              <Select onChange={handleChangeAction}>
                <Option value="nuevo">Nuevo</Option>
                <Option value="registrado">Registrado</Option>
              </Select>
            </Form.Item>

            {action === 'nuevo' && (
              <>
                <Form.Item
                  name="bienTipo"
                  label="Tipo de Bien"
                  rules={[{ required: true, message: 'Por favor seleccione el tipo de bien' }]}
                >
                  <Select onChange={setSelectedTipo}>
                    <Option value="bicicleta">Bicicleta</Option>
                    <Option value="camaraFotografica">Cámara Fotográfica</Option>
                    <Option value="tv">TV</Option>
                    <Option value="equipoAudio">Equipo de Audio</Option>
                    <Option value="telefonoMovil">Teléfono Móvil</Option>
                    <Option value="tablet">Tablet</Option>
                    <Option value="laptop">Laptop</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="bienMarca"
                  label="Marca"
                  rules={[{ required: true, message: 'Por favor seleccione la marca' }]}
                >
                  <Input value={selectedMarca} onChange={e => setSelectedMarca(e.target.value)} />
                </Form.Item>
                <Form.Item
                  name="bienModelo"
                  label="Modelo"
                  rules={[{ required: true, message: 'Por favor ingrese el modelo' }]}
                >
                  <Input value={selectedModelo} onChange={e => setSelectedModelo(e.target.value)} />
                </Form.Item>
                <Form.Item
                  name="bienStock"
                  label="Cantidad"
                  rules={[{ required: true, message: 'Por favor ingrese la cantidad' }]}
                >
                  <InputNumber min={1} onChange={handleCantidadChange} />
                </Form.Item>
              </>
            )}

            {action === 'registrado' && (
              <>
                <Form.Item
                  name="bienTipo"
                  label="Tipo de Bien"
                  rules={[{ required: true, message: 'Por favor seleccione el tipo de bien' }]}
                >
                  <Select onChange={setSelectedTipo}>
                    <Option value="bicicleta">Bicicleta</Option>
                    <Option value="camaraFotografica">Cámara Fotográfica</Option>
                    <Option value="tv">TV</Option>
                    <Option value="equipoAudio">Equipo de Audio</Option>
                    <Option value="telefonoMovil">Teléfono Móvil</Option>
                    <Option value="tablet">Tablet</Option>
                    <Option value="laptop">Laptop</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="bienMarca"
                  label="Marca"
                  rules={[{ required: true, message: 'Por favor seleccione la marca' }]}
                >
                  <Select onChange={setSelectedMarca}>
                    {marcasDisponibles.map(marca => (
                      <Option key={marca} value={marca}>{marca}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="bienModelo"
                  label="Modelo"
                  rules={[{ required: true, message: 'Por favor seleccione el modelo' }]}
                >
                  <Select onChange={setSelectedModelo}>
                    {modelosDisponibles.map(modelo => (
                      <Option key={modelo} value={modelo}>{modelo}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="bienStock"
                  label="Cantidad"
                  rules={[{ required: true, message: 'Por favor ingrese la cantidad' }]}
                >
                  <InputNumber min={1} onChange={handleCantidadChange} />
                </Form.Item>
              </>
            )}

            {bienesDinamicos.map((bien, index) => (
              <div key={bien.id} style={{ border: '1px solid #d9d9d9', padding: '10px', marginBottom: '10px' }}>
                <Title level={4}>Bien #{bien.bienNumero}</Title>
                <Form.Item
                  label="Precio"
                  rules={[{ required: true, message: 'Por favor ingrese el precio' }]}
                >
                  <InputNumber
                    min={0}
                    prefix="$"
                    value={bien.precio}
                    onChange={(value) => handleBienChange(index, 'precio', value)}
                  />
                </Form.Item>
                <Form.Item
                  label="Descripción"
                >
                  <Input.TextArea
                    value={bien.descripcion}
                    onChange={e => handleBienChange(index, 'descripcion', e.target.value)}
                  />
                </Form.Item>
                <Form.Item
                  label="Fotos"
                >
                  <Upload
                    listType="picture"
                    fileList={bien.fotos}
                    onChange={(info) => handleFileChange(index, info)}
                    beforeUpload={() => false}
                  >
                    <Button>Subir Fotos</Button>
                  </Upload>
                </Form.Item>
              </div>
            ))}

            <Form.Item
              name="metodoPago"
              label="Método de Pago"
              rules={[{ required: true, message: 'Por favor seleccione un método de pago' }]}
            >
              <Select>
                <Option value="efectivo">Efectivo</Option>
                <Option value="tarjeta">Tarjeta de Crédito/Débito</Option>
                <Option value="transferencia">Transferencia Bancaria</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Registrar Compra
              </Button>
              <Button type="default" onClick={() => setStep(1)} style={{ marginLeft: '10px' }}>
                Volver
              </Button>
            </Form.Item>
          </Form>
        </>
      )}

      <Modal
        title="Confirmación de Compra"
        visible={isModalOpen}
        onOk={handleConfirm}
        onCancel={() => setIsModalOpen(false)}
        okText="Confirmar"
        cancelText="Cancelar"
      >
        <p><strong>Se registrarán los siguientes bienes:</strong></p>
        {newBienDetails.map((bien, index) => (
          <div key={bien.id}>
            <p><strong>Bien #{index + 1}</strong></p>
            <p><strong>Tipo:</strong> {bien.tipo}</p>
            <p><strong>Marca:</strong> {bien.marca}</p>
            <p><strong>Modelo:</strong> {bien.modelo}</p>
            <p><strong>Descripción:</strong> {bien.descripcion}</p>
            <p><strong>Cantidad:</strong> {bienesDinamicos.length}</p>
            <p><strong>Precio:</strong> ${bien.precio}</p>
            <p><strong>Fotos:</strong></p>
            <ul>
              {bien.fotos.map(file => (
                <li key={file.uid}>{file.name}</li>
              ))}
            </ul>
          </div>
        ))}
        <p><strong>Método de Pago:</strong> {form.getFieldValue('metodoPago')}</p>
      </Modal>
    </div>
  );
};

export default ComprarPage;
