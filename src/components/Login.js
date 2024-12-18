// Login.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../redux/actions/auth';
import Notification from './Notification';
import loginImage from '../assets/loginimg.png';

const Login = ({ onRegisterClick }) => {  // Acepta una función para mostrar el registro
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });
    const [notification, setNotification] = useState(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, user, error } = useSelector((state) => state.auth);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        setFormData({
            ...formData,
            [name]: newValue,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { email, password } = formData;
    
        try {
            const resultAction = await dispatch(login({ email, password }));
    
            if (login.fulfilled.match(resultAction)) {
                const { usuario, token } = resultAction.payload || {};
    
                if (usuario && token) {
                    // Guarda los datos en localStorage
                    localStorage.setItem('token', token);
                    localStorage.setItem('userData', JSON.stringify(usuario));
    
                    // Redirige según el rolDefinitivo del usuario
                    switch (usuario.rolDefinitivo) {
                        case 'administrador':
                            navigate('/admin/dashboard');
                            break;
                        case 'moderador': 
                            navigate('/admin/dashboard');
                            break;
                        case 'usuario':
                            navigate('/userdashboard');
                            break;
                        default:
                            navigate('/userdashboard');
                            break;
                    }
                } else {
                    setNotification({
                        message: 'Datos de usuario no válidos.',
                        type: 'error'
                    });
                }
            } else {
                const errorMessage = resultAction.error ? resultAction.error.message : 'Login failed';
                setNotification({
                    message: errorMessage,
                    type: 'error'
                });
            }
        } catch (error) {
            setNotification({
                message: error.message || 'Login failed',
                type: 'error'
            });
        }
    };

    const handleCloseNotification = () => {
        setNotification(null);
    };

    return (
        <div className="font-sans">
            <div className="grid lg:grid-cols-3 md:grid-cols-2 items-center gap-4 h-full min-h-screen">
                <div className="max-md:order-1 lg:col-span-2 md:h-screen w-full bg-[#000842] md:rounded-tr-xl md:rounded-br-xl lg:p-12 p-8 flex justify-center items-center">
                    <img
                        src={loginImage}
                        className="lg:w-[70%] w-full h-auto object-contain mx-auto"
                        alt="login-image"
                    />
                </div>
                <div className="w-full p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-8">
                            <h3 className="text-gray-800 text-3xl font-extrabold">Ingresar</h3>
                            <p className="text-sm mt-4 text-gray-800">
                                ¿No tienes una cuenta?{' '}
                                <button
                                  type="button"
                                  onClick={onRegisterClick}  // Llama a la función de cambio de estado aquí
                                  className="text-blue-600 font-semibold hover:underline ml-1 whitespace-nowrap"
                                >
                                    Registrate aquí
                                </button>
                            </p>
                        </div>
                        <div>
                            <label className="text-gray-800 text-[15px] mb-2 block">Email</label>
                            <div className="relative flex items-center">
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full text-sm text-gray-800 bg-gray-100 focus:bg-transparent px-4 py-3.5 rounded-md outline-blue-600"
                                    placeholder="Ingresa tu email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="text-gray-800 text-[15px] mb-2 block">Contraseña</label>
                            <div className="relative flex items-center">
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full text-sm text-gray-800 bg-gray-100 focus:bg-transparent px-4 py-3.5 rounded-md outline-blue-600"
                                    placeholder="Ingresa tu contraseña"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="mt-8">
                            <button type="submit" className="w-full py-3 px-6 text-sm tracking-wide rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                                Ingresar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={handleCloseNotification}
                />
            )}
        </div>
    );
};

export default Login;
