import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { reintentarRegistro } from '../redux/actions/usuarios';
import { notification, Input, Button, Select } from 'antd';
import logo from '../assets/logo-png-sin-fondo.png';
import api from '../redux/axiosConfig';

const { Option } = Select;

const ReintentarRegistro = () => {
  const { uuid } = useParams();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    tipo: 'fisica',
    dni: '',
    nombre: '',
    apellido: '',
    email: '',
    razonSocial: '',
    direccion: {
      calle: '',
      altura: '',
      barrio: '',
      departamento: '',
    },
    cuit: '',
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [renaperError, setRenaperError] = useState('');
  const [renaperData, setRenaperData] = useState(null);

  const departments = [
    'Capital', 'Godoy Cruz', 'Junín', 'Las Heras', 'Maipú', 'Guaymallén', 'Rivadavia',
    'San Martín', 'La Paz', 'Santa Rosa', 'General Alvear', 'Malargüe', 'San Carlos',
    'Tupungato', 'Tunuyán', 'San Rafael', 'Lavalle', 'Luján de Cuyo',
  ];

  const validateDNIWithRenaper = async (dni) => {
    try {
      if (!dni) {
        setRenaperError('El DNI es obligatorio.');
        return;
      }

      const { data } = await api.get(`/renaper/${dni}`);
      if (data.success) {
        const persona = data.data.persona;
        setFormData((prev) => ({
          ...prev,
          nombre: persona.nombres,
          apellido: persona.apellidos,
          direccion: {
            calle: persona.domicilio.calle || '',
            altura: persona.domicilio.nroCalle || '',
            barrio: persona.domicilio.barrio || '',
            departamento: persona.domicilio.localidad || '',
          },
          cuit: persona.nroCuil,
        }));
        setRenaperData(persona);
        setRenaperError('');
      } else {
        setRenaperError(data.message || 'Persona no encontrada en Renaper.');
        setRenaperData(null);
      }
    } catch (error) {
      console.error('Error al validar el DNI con Renaper:', error);
      setRenaperError('Error al validar el DNI.');
    }
  };

  const validateField = (name, value) => {
    let error = '';
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) error = 'Por favor, ingresa un correo electrónico válido.';
    }
    if (name === 'dni') {
      const dniRegex = /^\d{7,8}$/;
      if (!dniRegex.test(value)) error = 'El DNI debe ser un número de 7 u 8 dígitos.';
    }
    if (name === 'cuit') {
      const cuitRegex = /^\d{11}$/;
      if (value && !cuitRegex.test(value)) error = 'El CUIT debe ser un número de 11 dígitos.';
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['calle', 'altura', 'barrio', 'departamento'].includes(name)) {
      setFormData({
        ...formData,
        direccion: { ...formData.direccion, [name]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    validateField(name, value);
  };

  const handleSelectChange = (value) => {
    setFormData({
      ...formData,
      direccion: { ...formData.direccion, departamento: value },
    });
  };

  const handleSubmit = () => {
    const hasErrors = Object.values(errors).some((err) => err);
    if (hasErrors) {
      notification.error({
        message: 'Errores en el formulario',
        description: 'Por favor, corrige los errores antes de enviar.',
      });
      return;
    }

    if (renaperError || (formData.tipo === 'fisica' && !renaperData)) {
      notification.error({
        message: 'Validación de RENAPER fallida',
        description: renaperError || 'Los datos no coinciden con RENAPER.',
      });
      return;
    }

    dispatch(reintentarRegistro(uuid, formData))
      .then(() => {
        notification.success({
          message: 'Registro reenviado',
          description: 'Tu información ha sido enviada nuevamente para su revisión.',
        });
        setFormSubmitted(true);
      })
      .catch((error) => {
        console.error('Error al reenviar los datos:', error);
        notification.error({
          message: 'Error',
          description: error.message || 'Ocurrió un error al reenviar los datos.',
        });
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-blue-500 text-black font-sans">
      <div className="max-w-4xl mx-auto p-6 flex flex-col justify-center items-center h-full">
        <div className="grid md:grid-cols-2 gap-8 w-full">
          <div className="text-center md:text-left md:order-last">
            <img src={logo} alt="Registro de Bienes" className="object-contain w-full h-auto max-h-96" />
            <h1 className="text-4xl font-bold text-blue-100 mt-4 inline-block">
              Sistema Provincial Preventivo de Bienes Muebles Usados
            </h1>
          </div>

          <div className="flex flex-col items-center justify-center md:items-start">
            {formSubmitted ? (
              <div className="text-center">
                <h2 className="text-3xl font-bold text-green-600 mb-4">¡Datos enviados!</h2>
                <p className="text-gray-700">
                  Tu información ha sido enviada nuevamente para su revisión. Te notificaremos tan pronto como sea
                  aprobada.
                </p>
              </div>
            ) : (
              <div className="bg-gray-100 p-6 rounded-lg shadow-md flex flex-col items-center justify-center w-full">
                <h2 className="text-3xl font-bold text-blue-900 mb-4">Actualizar Registro</h2>
                <Input
                  name="dni"
                  placeholder="DNI"
                  value={formData.dni}
                  onChange={handleChange}
                  onBlur={() => validateDNIWithRenaper(formData.dni)}
                  className="mb-4"
                />
                {renaperError && <p className="text-red-500 text-xs mb-4">{renaperError}</p>}
                <Input name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} className="mb-4" />
                <Input name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} className="mb-4" />
                <Input name="email" placeholder="Correo Electrónico" value={formData.email} onChange={handleChange} className="mb-4" />
                <Input name="cuit" placeholder="CUIT" value={formData.cuit} onChange={handleChange} className="mb-4" />
                <Input name="calle" placeholder="Calle" value={formData.direccion.calle} onChange={handleChange} className="mb-4" />
                <Input name="altura" placeholder="Altura" value={formData.direccion.altura} onChange={handleChange} className="mb-4" />
                <Select
                  placeholder="Selecciona un departamento"
                  value={formData.direccion.departamento}
                  onChange={handleSelectChange}
                  className="w-full mb-6"
                >
                  {departments.map((dep) => (
                    <Option key={dep} value={dep}>
                      {dep}
                    </Option>
                  ))}
                </Select>
                <Button
                  type="primary"
                  size="large"
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300"
                  onClick={handleSubmit}
                >
                  Enviar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReintentarRegistro;
