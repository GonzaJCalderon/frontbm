import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { reenviarRegistro } from '../redux/actions/usuarios';
import { notification, Input, Button, Select } from 'antd';
import logo from '../assets/logo-png-sin-fondo.png';

const { Option } = Select;

const ReintentarRegistro = () => {
  const { uuid } = useParams();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    dni: '',
    tipo: 'fisica',
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

  const departments = [
    'Capital',
    'Godoy Cruz',
    'Junín',
    'Las Heras',
    'Maipú',
    'Guaymallén',
    'Rivadavia',
    'San Martín',
    'La Paz',
    'Santa Rosa',
    'General Alvear',
    'Malargüe',
    'San Carlos',
    'Tupungato',
    'Tunuyán',
    'San Rafael',
    'Lavalle',
    'Luján de Cuyo',
  ];

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

    dispatch(reenviarRegistro(uuid, formData))
      .then(() => {
        notification.success({
          message: 'Registro reenviado',
          description: 'Tu información ha sido enviada nuevamente para su revisión.',
        });
        setFormSubmitted(true);
      })
      .catch((error) => {
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
    Registro de Bienes Muebles Usados
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
                <p className="text-sm text-gray-600 mb-6 text-center">
                  Por favor, actualiza tu información para completar tu registro.
                </p>
                <div className="mb-4">
                  <label className="text-gray-800 text-xs block mb-2" htmlFor="tipo">
                    Tipo de Sujeto
                  </label>
                  <div className="flex items-center space-x-4">
                    <label>
                      <input
                        type="radio"
                        name="tipo"
                        value="fisica"
                        checked={formData.tipo === 'fisica'}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                        className="mr-2"
                      />
                      Persona Física
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="tipo"
                        value="juridica"
                        checked={formData.tipo === 'juridica'}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                        className="mr-2"
                      />
                      Persona Jurídica
                    </label>
                  </div>
                </div>

                {formData.tipo === 'juridica' && (
                  <Input
                    name="razonSocial"
                    placeholder="Razón Social"
                    value={formData.razonSocial}
                    onChange={handleChange}
                    className="mb-4"
                  />
                )}

                <Input
                  name="nombre"
                  placeholder="Nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="mb-4"
                />
                <Input
                  name="apellido"
                  placeholder="Apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className="mb-4"
                />
                <Input
                  name="dni"
                  placeholder="DNI"
                  value={formData.dni}
                  onChange={handleChange}
                  className="mb-4"
                />
                <Input
                  name="email"
                  placeholder="Correo Electrónico"
                  value={formData.email}
                  onChange={handleChange}
                  className="mb-4"
                />
                <Input
                  name="cuit"
                  placeholder="CUIT (opcional para personas físicas)"
                  value={formData.cuit}
                  onChange={handleChange}
                  className="mb-4"
                />
                <Input
                  name="calle"
                  placeholder="Calle"
                  value={formData.direccion.calle}
                  onChange={handleChange}
                  className="mb-4"
                />
                <Input
                  name="altura"
                  placeholder="Altura"
                  value={formData.direccion.altura}
                  onChange={handleChange}
                  className="mb-4"
                />
                <Input
                  name="barrio"
                  placeholder="Barrio (opcional)"
                  value={formData.direccion.barrio}
                  onChange={handleChange}
                  className="mb-4"
                />
                <Select
                  placeholder="Selecciona un departamento"
                  value={formData.direccion.departamento}
                  onChange={handleSelectChange}
                  className="w-full mb-6"
                >
                  {departments.map((dep, index) => (
                    <Option key={index} value={dep}>
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