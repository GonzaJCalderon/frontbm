import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../redux/actions/auth';
import Notification from './Notification';
import registerImage from '../assets/registerimg.png';
import api from '../redux/axiosConfig'; // Axios configuration for API calls

const departments = [
  'Capital', 'Godoy Cruz', 'Junín', 'Las Heras', 'Maipú', 'Guaymallén', 'Rivadavia',
  'San Martín', 'La Paz', 'Santa Rosa', 'General Alvear', 'Malargüe', 'San Carlos',
  'Tupungato', 'Tunuyán', 'San Rafael', 'Lavalle', 'Luján de Cuyo',
];

const Register = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    tipo: 'fisica',
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    dni: '',
    razonSocial: '',
    direccionEmpresa: {
      calle: '',
      altura: '',
    },
    direccion: {
      calle: '',
      altura: '',
      barrio: '',
      departamento: '',
    },
    cuit: '',
  });

  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [renaperError, setRenaperError] = useState('');
  const [renaperData, setRenaperData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

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

    if (name === 'password') {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(value)) {
        error = 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.';
      }
    }

    if (name === 'cuit' && value && !/^\d{11}$/.test(value)) {
      error = 'El CUIT debe ser un número de 11 dígitos.';
    }

    if (name === 'dni' && value && !/^\d{7,8}$/.test(value)) {
      error = 'El DNI debe ser un número de 7 u 8 dígitos.';
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (['calle', 'altura', 'barrio', 'departamento'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        direccion: { ...prev.direccion, [name]: value },
      }));
    } else if (['calleEmpresa', 'alturaEmpresa'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        direccionEmpresa: { ...prev.direccionEmpresa, [name.replace('Empresa', '')]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (renaperError || (formData.tipo === 'fisica' && !renaperData)) {
      setNotification({
        message: 'No se puede registrar: Persona no encontrada en Renaper.',
        type: 'error',
      });
      return;
    }

    const userData = {
      ...formData,
      direccion: {
        calle: formData.direccion.calle,
        altura: formData.direccion.altura,
        barrio: formData.direccion.barrio || null,
        departamento: formData.direccion.departamento,
      },
      rolDefinitivo: 'usuario',
    };

    try {
      const resultAction = await dispatch(register(userData));
      if (register.fulfilled.match(resultAction)) {
        setNotification({ message: 'Registro exitoso. Redirigiendo al login...', type: 'success' });
        setTimeout(() => (window.location.href = '/'), 3000);
      } else {
        setNotification({ message: resultAction.payload || 'Error durante el registro.', type: 'error' });
      }
    } catch (error) {
      setNotification({ message: 'Ocurrió un error inesperado.', type: 'error' });
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  useEffect(() => {
    if (renaperData) {
      setFormData((prev) => ({
        ...prev,
        nombre: renaperData.nombres,
        apellido: renaperData.apellidos,
      }));
    }
  }, [renaperData]);

  return (
    <div className="font-sans bg-white min-h-screen md:flex md:items-center md:justify-center">
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto p-6">
        <div className="hidden md:block">
          <img src={registerImage} className="w-full h-auto object-cover" alt="register-image" />
        </div>
        <div className="bg-gray-50 p-8 md:p-12 rounded-lg shadow-lg overflow-auto">
          <h3 className="text-blue-500 text-3xl font-extrabold text-center md:text-left mb-8">Crea una cuenta</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-6">
              <label className="text-gray-800 text-xs block mb-2" htmlFor="tipo">Tipo de Sujeto</label>
              <div className="flex items-center space-x-4">
                <label>
                  <input
                    type="radio"
                    name="tipo"
                    value="fisica"
                    checked={formData.tipo === 'fisica'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Persona Humana
                </label>
                <label>
                  <input
                    type="radio"
                    name="tipo"
                    value="juridica"
                    checked={formData.tipo === 'juridica'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Persona Jurídica
                </label>
              </div>
            </div>

            {formData.tipo === 'juridica' && (
              <>
                <div className="mb-6">
                  <label className="text-gray-800 text-xs block mb-2" htmlFor="razonSocial">Razón Social</label>
                  <input
                    id="razonSocial"
                    type="text"
                    name="razonSocial"
                    value={formData.razonSocial}
                    onChange={handleChange}
                    className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                    placeholder="Ingresa la razón social"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-gray-800 text-xs block mb-2" htmlFor="calleEmpresa">Calle Empresa</label>
                    <input
                      id="calleEmpresa"
                      type="text"
                      name="calleEmpresa"
                      value={formData.direccionEmpresa.calle}
                      onChange={handleChange}
                      className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                      placeholder="Ingresa la calle"
                    />
                  </div>
                  <div>
                    <label className="text-gray-800 text-xs block mb-2" htmlFor="alturaEmpresa">Altura Empresa</label>
                    <input
                      id="alturaEmpresa"
                      type="text"
                      name="alturaEmpresa"
                      value={formData.direccionEmpresa.altura}
                      onChange={handleChange}
                      className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                      placeholder="Ingresa la altura"
                    />
                  </div>
                </div>
              </>
            )}

            {formData.tipo === 'fisica' && (
              <div className="mb-6">
                <label className="text-gray-800 text-xs block mb-2" htmlFor="dni">DNI</label>
                <input
                  id="dni"
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  onBlur={() => validateDNIWithRenaper(formData.dni)}
                  className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                  placeholder="Ingresa tu DNI"
                />
                {renaperError && <p className="text-red-500 text-xs mt-2">{renaperError}</p>}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-gray-800 text-xs block mb-2" htmlFor="nombre">Nombre</label>
                <input
                  id="nombre"
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                  placeholder="Ingresa tu nombre"
                />
              </div>
              <div>
                <label className="text-gray-800 text-xs block mb-2" htmlFor="apellido">Apellido</label>
                <input
                  id="apellido"
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                  placeholder="Ingresa tu apellido"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="text-gray-800 text-xs block mb-2" htmlFor="email">Correo Electrónico</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                placeholder="Ingresa tu correo electrónico"
              />
            </div>

            <div className="mb-6">
              <label className="text-gray-800 text-xs block mb-2" htmlFor="password">Contraseña</label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                placeholder="Ingresa tu contraseña"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-4 inset-y-0 text-blue-500"
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            <div className="mb-6">
              <label className="text-gray-800 text-xs block mb-2" htmlFor="calle">Calle</label>
              <input
                id="calle"
                type="text"
                name="calle"
                value={formData.direccion.calle}
                onChange={handleChange}
                className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                placeholder="Ingresa la calle"
              />
            </div>

            <div className="mb-6">
              <label className="text-gray-800 text-xs block mb-2" htmlFor="altura">Altura</label>
              <input
                id="altura"
                type="text"
                name="altura"
                value={formData.direccion.altura}
                onChange={handleChange}
                className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                placeholder="Ingresa la altura"
              />
            </div>

            <div className="mb-6">
              <label className="text-gray-800 text-xs block mb-2" htmlFor="departamento">Departamento</label>
              <select
                id="departamento"
                name="departamento"
                value={formData.direccion.departamento}
                onChange={handleChange}
                className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
              >
                <option value="">Selecciona un departamento</option>
                {departments.map((dep, index) => (
                  <option key={index} value={dep}>{dep}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
            >
              Registrarse
            </button>
          </form>

          {notification && (
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
