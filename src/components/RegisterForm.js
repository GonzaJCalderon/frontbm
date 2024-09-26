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
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        email: '',
        address: {
            street: '',
            neighborhood: '',
            department: ''
        },
        dni: '',
        cuit: '',
        userType: 'persona', // 'persona' or 'juridica'
        businessName: '' // For 'persona juridica'
    });

    const [showPassword, setShowPassword] = useState(false);
    const [notification, setNotification] = useState(null);

    const {
        username,
        password,
        firstName,
        lastName,
        email,
        address,
        dni,
        cuit,
        userType,
        businessName
    } = formData;

    const handleChange = e => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const field = name.split('.')[1];
            setFormData({
                ...formData,
                address: {
                    ...formData.address,
                    [field]: value
                }
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
                            <label className="text-gray-800 text-xs block mb-2" htmlFor="userType">
                                Tipo de Sujeto
                            </label>

                            <div className="flex items-center space-x-4">
                                <label>
                                    <input
                                        type="radio"
                                        name="userType"
                                        value="persona"
                                        checked={userType === 'persona'}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    Persona
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="userType"
                                        value="juridica"
                                        checked={userType === 'juridica'}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    Persona Jurídica
                                </label>
                            </div>
                        </div>

                        {userType === 'juridica' && (
                            <div className="mb-6">
                                <label className="text-gray-800 text-xs block mb-2" htmlFor="businessName">
                                    Razón Social
                                </label>
                                <input
                                    id="businessName"
                                    type="text"
                                    name="businessName"
                                    value={businessName}
                                    onChange={handleChange}
                                    className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                                    placeholder="Ingresa la razón social"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="text-gray-800 text-xs block mb-2" htmlFor="firstName">
                                    Nombre
                                </label>
                                <input
                                    id="firstName"
                                    type="text"
                                    name="firstName"
                                    value={firstName}
                                    onChange={handleChange}
                                    className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                                    placeholder="Ingresa tu nombre"
                                />
                            </div>
                            <div>
                                <label className="text-gray-800 text-xs block mb-2" htmlFor="lastName">
                                    Apellido
                                </label>
                                <input
                                    id="lastName"
                                    type="text"
                                    name="lastName"
                                    value={lastName}
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
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
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

                        <div className="mb-6">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="text-gray-800 text-xs block mb-2" htmlFor="address.street">
                                    Calle
                                </label>
                                <input
                                    id="address.street"
                                    type="text"
                                    name="address.street"
                                    value={address.street}
                                    onChange={handleChange}
                                    className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                                    placeholder="Ingresa la calle"
                                />
                            </div>
                            <div>
                                <label className="text-gray-800 text-xs block mb-2" htmlFor="address.neighborhood">
                                    Barrio
                                </label>
                                <input
                                    id="address.neighborhood"
                                    type="text"
                                    name="address.neighborhood"
                                    value={address.neighborhood}
                                    onChange={handleChange}
                                    className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                                    placeholder="Ingresa el barrio"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="text-gray-800 text-xs block mb-2" htmlFor="address.department">
                                Departamento
                            </label>
                            <select
                                id="address.department"
                                name="address.department"
                                value={address.department}
                                onChange={handleChange}
                                className="w-full text-black text-sm border-b border-gray-300 focus:border-blue-500 px-2 py-3 outline-none"
                            >
                                <option value="">Selecciona tú departamento</option>
                                {departments.map((department) => (
                                    <option key={department} value={department}>
                                        {department}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center justify-center mt-8">
                            <button
                                type="submit"
                                className="bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Registrar
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={handleCloseNotification}
                />
            )}
        </div>
    );
};

export default Register;
