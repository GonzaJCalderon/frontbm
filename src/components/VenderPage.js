import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Spin, message, Modal, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBienes } from '../redux/actions/bienes';
import { registrarVenta } from '../redux/actions/stockActions';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, HomeOutlined, LogoutOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title } = Typography;

const VenderForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [stockItems, setStockItems] = useState([]);
  const [filteredStockItems, setFilteredStockItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [buyerType, setBuyerType] = useState('fisica');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState(null);
  const [search, setSearch] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading: stockLoading, error, success, items } = useSelector(state => state.bienes);

  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem('userData'))?.userId;
    if (userId) {
      dispatch(fetchBienes(userId));
    }
  }, [dispatch]);

  useEffect(() => {
    if (items) {
      setStockItems(items);
      setFilteredStockItems(items);
    }
  }, [items]);

  useEffect(() => {
    if (search) {
      const filtered = stockItems.filter(item =>
        item.descripcion.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredStockItems(filtered);
    } else {
      setFilteredStockItems(stockItems);
    }
  }, [search, stockItems]);

  const handleFinish = (values) => {
    if (!selectedItem) {
      message.error('Por favor, selecciona un bien.');
      return;
    }
    setFormValues(values);
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    setLoading(true);
    dispatch(registrarVenta({
      bienId: selectedItem,
      cantidad: quantity,
      comprador: {
        tipo: buyerType,
        nombre: formValues.compradorNombre,
        email: formValues.compradorEmail,
        dniCuit: formValues.compradorDniCuit,
        direccion: formValues.compradorDireccion,
      },
    }));
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (success) {
      message.success('Venta registrada con éxito.');
      form.resetFields();
      setSelectedItem(null); // Reset selected item after success
    } else if (error) {
      message.error('Error al registrar la venta.');
    }
    setLoading(false);
  }, [success, error]);

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
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

      <Title level={2} style={{ textAlign: 'center' }}>Formulario de Venta</Title>
      {(loading || stockLoading) && <Spin />}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          cantidad: 1,
          compradorTipo: 'fisica',
        }}
        style={{ maxWidth: '100%' }}
      >
        <Form.Item
          name="bien"
          label="¿Qué bien vas a vender?"
          rules={[{ required: true, message: 'Selecciona un bien.' }]}
        >
          <Select
            placeholder="Selecciona un bien"
            value={selectedItem} // Asegúrate de que el valor del Select sea el correcto
            onChange={value => {
              setSelectedItem(value);
              form.setFieldsValue({ bien: value }); // Actualiza el valor del formulario
            }}
            showSearch
            filterOption={false}
            onSearch={value => setSearch(value)}
            notFoundContent={search ? 'No se encontraron resultados' : 'No hay bienes disponibles'}
          >
            {filteredStockItems.map(item => (
              <Option key={item.id} value={item.id}>
                {item.descripcion} {item.stock === null ? "(Único)" : `(Stock: ${item.stock})`}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="cantidad"
          label="Cantidad de bienes a vender"
          rules={[{ required: true, message: 'Ingresa la cantidad.' }]}
        >
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
          />
        </Form.Item>

        <Form.Item
          name="compradorTipo"
          label="Tipo de comprador"
          rules={[{ required: true, message: 'Selecciona el tipo de comprador.' }]}
        >
          <Select
            placeholder="Selecciona el tipo de comprador"
            onChange={value => setBuyerType(value)}
          >
            <Option value="fisica">Persona Física</Option>
            <Option value="juridica">Persona Jurídica</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="compradorNombre"
          label="Nombre del comprador"
          rules={[{ required: true, message: 'Ingresa el nombre del comprador.' }]}
        >
          <Input placeholder="Nombre del comprador" />
        </Form.Item>

        <Form.Item
          name="compradorEmail"
          label="Email del comprador"
          rules={[{ required: true, type: 'email', message: 'Ingresa un email válido.' }]}
        >
          <Input placeholder="Email del comprador" />
        </Form.Item>

        <Form.Item
          name="compradorDniCuit"
          label={buyerType === 'fisica' ? 'DNI' : 'CUIT'}
          rules={[{ required: true, message: 'Ingresa el DNI o CUIT del comprador.' }]}
        >
          <Input placeholder={buyerType === 'fisica' ? 'DNI del comprador' : 'CUIT del comprador'} />
        </Form.Item>

        <Form.Item
          name="compradorDireccion"
          label="Dirección del comprador"
        >
          <Input placeholder="Dirección del comprador" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading || stockLoading}>
            Registrar Venta
          </Button>
        </Form.Item>
      </Form>

      <Modal
        title="Confirmar Venta"
        open={isModalOpen}
        onOk={handleConfirm}
        onCancel={() => setIsModalOpen(false)}
        okText="Confirmar y Enviar"
        cancelText="Cancelar"
      >
        <h3>Datos del Bien</h3>
        <p><strong>Descripción:</strong> {stockItems.find(item => item.id === selectedItem)?.descripcion || 'No encontrado'}</p>
        <p><strong>Cantidad:</strong> {quantity}</p>

        <h3>Datos del Comprador</h3>
        <p><strong>Nombre:</strong> {formValues?.compradorNombre}</p>
        <p><strong>Email:</strong> {formValues?.compradorEmail}</p>
        <p><strong>DNI/CUIT:</strong> {formValues?.compradorDniCuit}</p>
        <p><strong>Dirección:</strong> {formValues?.compradorDireccion}</p>
      </Modal>
    </div>
  );
};

export default VenderForm;
