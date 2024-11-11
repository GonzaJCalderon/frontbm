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
      departamento: '', // El departamento debe estar dentro del objeto direccion
    },
    cuit: '',
    dni: '',
    tipo: 'persona', // 'persona' o 'juridica'
    razonSocial: '', // Para 'persona juridica'
  });
  

  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);

  const {
    nombre,
    apellido,
    email,
    password,
    direccion,
    cuit,
    dni,
    tipo,
    razonSocial,
    departamento // Agregar el nuevo campo aquí
  } = formData;

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'calle' || name === 'altura' || name === 'barrio' || name === 'departamento') {
      setFormData({
        ...formData,
        direccion: { ...formData.direccion, [name]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Datos del formulario enviados:', formData);

    try {
      const resultAction = await dispatch(register(formData));

      if (register.fulfilled.match(resultAction)) {
        setNotification({
          message: 'Registro exitoso',
          type: 'success',
        });
      } else {
        setNotification({
          message: resultAction.payload || 'Registro fallido',
          type: 'error',
        });
      }
    } catch (error) {
      setNotification({
        message: error.message || 'Error inesperado',
        type: 'error',
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  return (
    <div className="font-sans bg-white min-h-screen md:flex md:items-center md:justify-center">
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto p-6">
        <div className="hidden md:block">
          <img
            src={registerImage}
            className="w-full h-auto object-cover"
            alt="register-image"
          />
        </div>
        <div className="bg-gray-50 p-8 md:p-12 rounded-lg shadow-lg overflow-auto">
          <h3 className="text-blue-500 text-3xl font-extrabold text-center md:text-left mb-8">
            Crea una cuenta
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-6">
              <label className="text-gray-800 text-xs block mb-2" htmlFor="tipo">
                Tipo de Sujeto
              </label>

              <div className="flex items-center space-x-4">
                <label>
                  <input
                    type="radio"
                    name="tipo"
                    value="persona"
                    checked={tipo === 'persona'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Persona
                </label>
                <label>
                  <input
                    type="radio"
                    name="tipo"
                    value="juridica"
                    checked={tipo === 'juridica'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Persona Jurídica
                </label>
              </div>
            </div>

            {tipo === 'juridica' && (
              <div className="mb-6">
                <label className="text-gray-800 text-xs block mb-2" htmlFor="razonSocial">
                  Razón Social
                </label>
                <input
                  id="razonSocial"
                  type="text"
                  name="razonSocial"
                  value={razonSocial}
                  onChange={handleChange}
                  className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                  placeholder="Ingresa la razón social"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-gray-800 text-xs block mb-2" htmlFor="nombre">
                  Nombre
                </label>
                <input
                  id="nombre"
                  type="text"
                  name="nombre"
                  value={nombre}
                  onChange={handleChange}
                  className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                  placeholder="Ingresa tu nombre"
                />
              </div>
              <div>
                <label className="text-gray-800 text-xs block mb-2" htmlFor="apellido">
                  Apellido
                </label>
                <input
                  id="apellido"
                  type="text"
                  name="apellido"
                  value={apellido}
                  onChange={handleChange}
                  className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                  placeholder="Ingresa tu apellido"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="text-gray-800 text-xs block mb-2" htmlFor="email">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={handleChange}
                className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                placeholder="Ingresa tu correo electrónico"
              />
            </div>

            <div className="mb-6">
              <label className="text-gray-800 text-xs block mb-2" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={handleChange}
                  className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                  placeholder="Ingresa tu contraseña"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M4.93 4.93l14.14 14.14"></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="mb-6">
  <label className="text-gray-800 text-xs block mb-2" htmlFor="calle">
    Calle
  </label>
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
  <label className="text-gray-800 text-xs block mb-2" htmlFor="altura">
    Altura
  </label>
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
  <label className="text-gray-800 text-xs block mb-2" htmlFor="barrio">
    Barrio
  </label>
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

{/* Departamento */}
<div className="mb-6">
  <label className="text-gray-800 text-xs block mb-2" htmlFor="departamento">
    Departamento
  </label>
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
                <label className="text-gray-800 text-xs block mb-2" htmlFor="cuit">
                  CUIT
                </label>
                <input
                  id="cuit"
                  type="text"
                  name="cuit"
                  value={cuit}
                  onChange={handleChange}
                  className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                  placeholder="Ingresa tu CUIT"
                />
              </div>
              <div>
                <label className="text-gray-800 text-xs block mb-2" htmlFor="dni">
                  DNI
                </label>
                <input
                  id="dni"
                  type="text"
                  name="dni"
                  value={dni}
                  onChange={handleChange}
                  className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                  placeholder="Ingresa tu DNI"
                />
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
