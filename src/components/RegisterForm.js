import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../redux/actions/auth';
import Notification from './Notification';
import registerImage from '../assets/registerimg.png';

const departments = [
  'Capital', 'Godoy Cruz', 'Junín', 'Las Heras', 'Maipú', 'Guaymallén', 'Rivadavia',
  'San Martín', 'La Paz', 'Santa Rosa', 'General Alvear', 'Malargüe', 'San Carlos',
  'Tupungato', 'Tunuyán', 'San Rafael', 'Lavalle', 'Luján de Cuyo'
];

const Register = () => {
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth || {});
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    direccion: {
      calle: '',
      altura: '',
      barrio: '',
      departamento: '',
    },
    cuit: '',
    dni: '',
    tipo: 'fisica',
    razonSocial: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    calle: '',
    altura: '',
    cuit: '',
    dni: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);
  

  const validateField = (name, value) => {
    let error = ''; // Declarar error como una variable local
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const disposableDomains = ['tempmail.com', 'mailinator.com', 'yopmail.com']; // Dominios desechables
      if (!emailRegex.test(value)) {
        error = 'Por favor, ingresa un correo electrónico válido.';
      } else if (disposableDomains.some((domain) => value.toLowerCase().endsWith(`@${domain}`))) {
        error = 'Por favor, utiliza un correo electrónico legítimo.';
      }
    }
  
    if (name === 'password') {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(value)) {
        error =
          'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.';
      }
    }
  
    if (name === 'calle' && value.trim() === '') error = 'La calle es obligatoria.';
    if (name === 'altura' && !/^\d+$/.test(value)) error = 'La altura debe ser un número.';
    if (name === 'cuit') {
      const cuitRegex = /^\d{11}$/;
      if (value && !cuitRegex.test(value)) error = 'El CUIT debe ser un número de 11 dígitos.';
    }
    if (name === 'dni') {
      const dniRegex = /^\d{7,8}$/;
      if (!dniRegex.test(value)) error = 'El DNI debe ser un número de 7 u 8 dígitos.';
    }
  
    setErrors((prev) => ({ ...prev, [name]: error })); // Actualizar errores en el estado
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

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validar campos obligatorios en dirección
    const { calle, altura, departamento } = formData.direccion;
    if (!calle || !altura || !departamento) {
      setNotification({
        message: 'Por favor, completa todos los campos obligatorios en la dirección (calle, altura y departamento).',
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
  
    console.log('Datos enviados al backend:', userData);
  
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
  const handleCloseNotification = () => setNotification(null);

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
              {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email}</p>}
            </div>

            <div className="mb-6">
              <label className="text-gray-800 text-xs block mb-2" htmlFor="password">Contraseña</label>
              <div className="relative">
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
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-2">{errors.password}</p>}
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
              {errors.calle && <p className="text-red-500 text-xs mt-2">{errors.calle}</p>}
            </div>

            <div className="mb-6">
              <label className="text-gray-800 text-xs block mb-2" htmlFor="altura">Numeración</label>
              <input
                id="altura"
                type="text"
                name="altura"
                value={formData.direccion.altura}
                onChange={handleChange}
                className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                placeholder="Ingresa la numeración"
              />
              {errors.altura && <p className="text-red-500 text-xs mt-2">{errors.altura}</p>}
            </div>

            <div className="mb-6">
              <label className="text-gray-800 text-xs block mb-2" htmlFor="barrio">Barrio</label>
              <input
                id="barrio"
                type="text"
                name="barrio"
                value={formData.direccion.barrio}
                onChange={handleChange}
                className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                placeholder="Ingresa el barrio"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-gray-800 text-xs block mb-2" htmlFor="cuit">CUIT</label>
                <input
                  id="cuit"
                  type="text"
                  name="cuit"
                  value={formData.cuit}
                  onChange={handleChange}
                  className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                  placeholder="Ingresa tu CUIT"
                />
                {errors.cuit && <p className="text-red-500 text-xs mt-2">{errors.cuit}</p>}
              </div>
              <div>
                <label className="text-gray-800 text-xs block mb-2" htmlFor="dni">DNI</label>
                <input
                  id="dni"
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                  placeholder="Ingresa tu DNI"
                />
                {errors.dni && <p className="text-red-500 text-xs mt-2">{errors.dni}</p>}
              </div>
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
              onClose={handleCloseNotification}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
