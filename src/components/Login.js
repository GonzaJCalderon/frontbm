import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../redux/actions/auth';
import { toast } from 'react-toastify';
import loginImage from '../assets/loginimg.png';

const Login = ({ onRegisterClick }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
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
                    // Guardar los datos en localStorage
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('userUuid', usuario.uuid);
                    localStorage.setItem('userData', JSON.stringify(usuario));
    
                    console.log('Redirigiendo según el rol definitivo:', usuario.rolDefinitivo);
    
                    // Redirige al tablero de administrador para ambos roles, admin y moderador
                    if (usuario.rolDefinitivo === 'admin' || usuario.rolDefinitivo === 'moderador') {
                        navigate('/admin/dashboard');
                    } else {
                        navigate('/user/dashboard');
                    }
                } else {
                    toast.error('No se pudieron obtener los datos del usuario.');
                }
            } else {
                const errorMessage = resultAction.error?.message || 'Error al iniciar sesión.';
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error('Error en el login:', error);
            toast.error('Ocurrió un error inesperado. Intenta nuevamente.');
        }
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
                                    onClick={onRegisterClick}
                                    className="text-blue-600 font-semibold hover:underline ml-1 whitespace-nowrap"
                                >
                                    Regístrate aquí
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
        </div>
    );
};

export default Login;
