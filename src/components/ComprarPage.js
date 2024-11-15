import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Select, message, Typography, notification, Radio, Modal, Upload } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBienes, addBien, registrarCompra } from '../redux/actions/bienes';
import { addUsuario, checkExistingUser } from '../redux/actions/usuarios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, HomeOutlined, LogoutOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title } = Typography;

// Utilidad para generar UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const departments = [
  'Capital', 'Godoy Cruz', 'Junín', 'Las Heras', 'Maipú', 'Guaymallén', 'Rivadavia',
  'San Martín', 'La Paz', 'Santa Rosa', 'General Alvear', 'Malargüe', 'San Carlos',
  'Tupungato', 'Tunuyán', 'San Rafael', 'Lavalle', 'Luján de Cuyo'
];

const ComprarPage = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items } = useSelector(state => state.bienes);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    direccion: { calle: '', altura: '', barrio: '', departamento: '' },
    cuit: '',
    dni: '',
    tipo: 'persona',
    razonSocial: '',
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [newBienDetails, setNewBienDetails] = useState([]);
  const [selectedTipo, setSelectedTipo] = useState(null);
  const [selectedMarca, setSelectedMarca] = useState('');
  const [selectedModelo, setSelectedModelo] = useState('');
  const [bienEsNuevo, setBienEsNuevo] = useState('nuevo'); // Estado para manejar bien nuevo o registrado
  const [nuevaMarca, setNuevaMarca] = useState(''); // Nueva marca ingresada por el usuario
  const [nuevoModelo, setNuevoModelo] = useState(''); // Nuevo modelo ingresado por el usuario
  const [selectedMetodoPago, setSelectedMetodoPago] = useState('');


  const bienesTipos = [...new Set(items.map(bien => bien.tipo))];
  const marcasDisponibles = items.filter(bien => bien.tipo === selectedTipo).map(bien => bien.marca);
  const modelosDisponibles = items.filter(bien => bien.tipo === selectedTipo && bien.marca === selectedMarca).map(bien => bien.modelo);

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('userData') || '{}');
    if (usuario && usuario.id) {
      dispatch(fetchBienes(usuario.id));
    }
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['calle', 'altura', 'barrio', 'departamento'].includes(name)) {
      setFormData({ ...formData, direccion: { ...formData.direccion, [name]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFinishStep1 = async () => {
    try {
      const existingUser = await dispatch(checkExistingUser(formData.dni, formData.email));
      if (existingUser && existingUser.usuario) {
        setFormData({
          ...existingUser.usuario,
          direccion: {
            calle: existingUser.usuario.direccion?.calle || '',
            altura: existingUser.usuario.direccion?.numero || '',
            departamento: existingUser.usuario.direccion?.departamento || '',
          }
        });
        setStep(2);
      } else {
        const newUser = await dispatch(addUsuario(formData));
        if (newUser && newUser.usuario) {
          setFormData({
            ...newUser.usuario,
            direccion: {
              calle: newUser.usuario.direccion?.calle,
              altura: newUser.usuario.direccion?.numero,
              departamento: newUser.usuario.direccion?.departamento,
            }
          });
          setStep(2);
        } else {
          message.error('Error en el registro del usuario.');
        }
      }
    } catch (error) {
      message.error(error.message || 'Error en la verificación del usuario.');
    }
  };

  const handleFinishStep2 = async () => {
    const bienData = {
      tipo: selectedTipo,
      marca: selectedMarca || nuevaMarca, // Usa la nueva marca si se ha ingresado
      modelo: selectedModelo || nuevoModelo, // Usa el nuevo modelo si se ha ingresado
      descripcion: form.getFieldValue('bienDescripcion') || '',
      precio: parseFloat(form.getFieldValue('bienPrecio')),
      cantidad: parseInt(form.getFieldValue('bienStock'), 10),
      fotos: fileList.map(file => file.originFileObj),
      vendedorId: formData.id,
      fecha: new Date().toISOString(),
      metodoPago: form.getFieldValue('metodoPago'),
      uuid: generateUUID(),
    };

    try {
      setLoading(true);
      await dispatch(addBien(bienData));
      setNewBienDetails([bienData]);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error al registrar el bien:', error);
      message.error('Error al registrar el bien.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const compradorId = userData ? userData.id : null;

      if (!compradorId) {
        console.error('No se ha encontrado compradorId en localStorage');
        return;
      }

      for (const bien of newBienDetails) {
        const compraData = {
          fecha: bien.fecha,
          precio: bien.precio,
          cantidad: bien.cantidad,
          compradorId,
          vendedorId: formData.id,
          bienId: bien.uuid,
          estado: 'pendiente',
          metodoPago: form.getFieldValue('metodoPago'),
          tipo: bien.tipo,
          marca: bien.marca,
          modelo: bien.modelo,
          descripcion: bien.descripcion,
        };

        await dispatch(registrarCompra(compraData));
      }

      notification.success({
        message: 'Compra Registrada',
        description: 'La compra ha sido registrada con éxito.',
      });

      setIsModalOpen(false);
      navigate('/userdashboard');
    } catch (error) {
      console.error('Error al registrar la compra:', error);
      message.error('Error al registrar la compra.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginRight: '10px' }}>Volver</Button>
        <Button icon={<HomeOutlined />} onClick={() => navigate('/userdashboard')} style={{ marginRight: '10px' }}>Inicio</Button>
        <Button icon={<LogoutOutlined />} onClick={() => { localStorage.removeItem('userData'); navigate('/home'); }} type="primary">Cerrar Sesión</Button>
      </div>

      <Title level={3}>{step === 1 ? 'Paso 1: Datos del Vendedor' : 'Paso 2: Datos del Bien'}</Title>

      {step === 1 && (
        <Form layout="vertical" onFinish={handleFinishStep1}>
          <Form.Item label="Tipo de Sujeto" name="tipo" required>
            <Radio.Group onChange={handleChange} value={formData.tipo}>
              <Radio value="persona">Persona</Radio>
              <Radio value="juridica">Persona Jurídica</Radio>
            </Radio.Group>
          </Form.Item>
          {formData.tipo === 'juridica' && (
            <Form.Item label="Razón Social" name="razonSocial" required>
              <Input placeholder="Razón Social" name="razonSocial" value={formData.razonSocial} onChange={handleChange} />
            </Form.Item>
          )}
          <Form.Item label="Nombre" name="nombre" required>
            <Input placeholder="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} />
          </Form.Item>
          <Form.Item label="Apellido" name="apellido" required>
            <Input placeholder="Apellido" name="apellido" value={formData.apellido} onChange={handleChange} />
          </Form.Item>
          <Form.Item label="Correo Electrónico" name="email" required>
            <Input placeholder="Correo Electrónico" name="email" value={formData.email} onChange={handleChange} />
          </Form.Item>
          <Form.Item label="DNI" name="dni" required>
            <Input placeholder="DNI" name="dni" value={formData.dni} onChange={handleChange} />
          </Form.Item>
          <Form.Item label="CUIT" name="cuit" required>
            <Input placeholder="CUIT" name="cuit" value={formData.cuit} onChange={handleChange} />
          </Form.Item>

          <Title level={4}>Dirección</Title>
          <Form.Item label="Calle" name="calle" required>
            <Input placeholder="Calle" name="calle" value={formData.direccion.calle} onChange={handleChange} />
          </Form.Item>
          <Form.Item label="Altura" name="altura" required>
            <Input placeholder="Altura" name="altura" value={formData.direccion.altura} onChange={handleChange} />
          </Form.Item>
          <Form.Item label="Barrio" name="barrio" required>
            <Input placeholder="Barrio" name="barrio" value={formData.direccion.barrio} onChange={handleChange} />
          </Form.Item>
          <Form.Item label="Departamento" name="departamento" required>
            <Select onChange={(value) => setFormData({ ...formData, direccion: { ...formData.direccion, departamento: value } })} value={formData.direccion.departamento}>
              {departments.map(department => (
                <Option key={department} value={department}>{department}</Option>
              ))}
            </Select>
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>Siguiente</Button>
        </Form>
      )}

{step === 2 && (
  <Form layout="vertical" onFinish={handleFinishStep2}>
    {/* Tipo de Bien */}
    <Form.Item label="Tipo de Bien" name="tipoBien" required>
      <Select
        placeholder="Seleccionar tipo de bien"
        value={selectedTipo}
        onChange={(value) => setSelectedTipo(value)}
      >
        {bienesTipos.map(tipo => (
          <Option key={tipo} value={tipo}>{tipo}</Option>
        ))}
      </Select>
    </Form.Item>

    {/* Marca */}
    <Form.Item label="Marca" name="bienMarca" required>
      <Select
        placeholder="Seleccionar o agregar nueva marca"
        value={selectedMarca || nuevaMarca}
        onChange={setSelectedMarca}
        dropdownRender={menu => (
          <>
            {menu}
            <div style={{ display: 'flex', padding: 8 }}>
              <Input
                style={{ flex: 'auto' }}
                placeholder="Nueva marca"
                value={nuevaMarca}
                onChange={(e) => setNuevaMarca(e.target.value)}
              />
              <Button type="text" onClick={() => message.success('Marca agregada')}>Agregar</Button>
            </div>
          </>
        )}
      >
        {marcasDisponibles.map(marca => (
          <Option key={marca} value={marca}>{marca}</Option>
        ))}
      </Select>
    </Form.Item>

    {/* Modelo */}
    <Form.Item label="Modelo" name="bienModelo" required>
      <Select
        placeholder="Seleccionar o agregar nuevo modelo"
        value={selectedModelo || nuevoModelo}
        onChange={setSelectedModelo}
        dropdownRender={menu => (
          <>
            {menu}
            <div style={{ display: 'flex', padding: 8 }}>
              <Input
                style={{ flex: 'auto' }}
                placeholder="Nuevo modelo"
                value={nuevoModelo}
                onChange={(e) => setNuevoModelo(e.target.value)}
              />
              <Button type="text" onClick={() => message.success('Modelo agregado')}>Agregar</Button>
            </div>
          </>
        )}
      >
        {modelosDisponibles.map(modelo => (
          <Option key={modelo} value={modelo}>{modelo}</Option>
        ))}
      </Select>
    </Form.Item>

    {/* Descripción */}
    <Form.Item label="Descripción" name="bienDescripcion" required>
      <Input.TextArea placeholder="Descripción del bien" />
    </Form.Item>

    {/* Precio */}
    <Form.Item label="Precio" name="bienPrecio" required>
      <InputNumber style={{ width: '100%' }} placeholder="Precio" />
    </Form.Item>

    {/* Stock */}
    <Form.Item label="Stock" name="bienStock" required>
      <InputNumber style={{ width: '100%' }} placeholder="Cantidad" />
    </Form.Item>

    {/* Fotos */}
    <Form.Item label="Fotos" name="bienFotos">
      <Upload
        listType="picture-card"
        fileList={fileList}
        onChange={({ fileList }) => setFileList(fileList)}
        beforeUpload={() => false} // Prevenir el envío del archivo automáticamente
      >
        {fileList.length < 5 && '+ Agregar fotos'}
      </Upload>
    </Form.Item>

    {/* Método de Pago */}
    <Form.Item label="Método de Pago" name="metodoPago" required>
      <Select
        placeholder="Seleccionar método de pago"
        value={selectedMetodoPago}
        onChange={(value) => setSelectedMetodoPago(value)}
      >
        <Option value="tarjeta">Tarjeta de Crédito/Débito</Option>
        <Option value="efectivo">Efectivo</Option>
        <Option value="transferencia">Transferencia Bancaria</Option>
      </Select>
    </Form.Item>

    {/* Botón de envío */}
    <Button type="primary" htmlType="submit" block loading={loading}>Registrar Bien</Button>
  </Form>
)}


      <Modal
        title="Confirmar compra"
        visible={isModalOpen}
        onOk={handleConfirm}
        onCancel={() => setIsModalOpen(false)}
        okText="Confirmar"
        cancelText="Cancelar"
      >
        <p>¿Estás seguro de que deseas realizar la compra de los bienes registrados?</p>
      </Modal>
    </div>
  );
};

export default ComprarPage;
