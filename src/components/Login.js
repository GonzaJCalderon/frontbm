import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../redux/actions/auth';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import loginImage from '../assets/loginimg.png';

const Login = ({ onRegisterClick, onForgotPasswordClick }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);


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

    console.log("result directo:", typeof resultAction);

    if (resultAction.type === 'auth/login/fulfilled') {
      const { usuario, token, refreshToken } = resultAction.payload;

      console.log("Voy a guardar token en localStorage:", token);

      // 🚨 Guarda siempre como "authToken"
      localStorage.setItem('authToken', token);
      sessionStorage.setItem('authToken', token);

      console.log("se guardó en localStorage:", localStorage.getItem("authToken"));

      // ✅ Guarda refreshToken y datos del usuario (sin cambios)
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userUuid', usuario.uuid);
      localStorage.setItem('userData', JSON.stringify({
        uuid: usuario.uuid,
        rol: usuario.rolDefinitivo,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        dni: usuario.dni || '',
        direccion: usuario.direccion || {
          calle: '',
          altura: '',
          barrio: '',
          departamento: '',
        },
        empresaUuid: usuario.empresaUuid || null,
        razonSocial: usuario.razonSocial || null,
        tipo: usuario.tipo || null,
        rolEmpresa: usuario.rolEmpresa || null,
      }));

      console.log('🧠 Rol del usuario:', usuario.rolDefinitivo);
      console.log('📛 Tipo de usuario:', usuario.tipo);
      console.log('🏢 Empresa asociada:', usuario.empresaUuid);
      console.log('🧾 Datos completos del usuario:', usuario);

      if (usuario.rolDefinitivo === 'admin' || usuario.rolDefinitivo === 'moderador') {
        navigate('/admin/dashboard');
      } else if (usuario.rolEmpresa === 'delegado') {
        navigate('/user/dashboard');
      } else if (usuario.tipo === 'juridica') {
        navigate('/user/dashboard');
      } else if (usuario.rolDefinitivo === 'usuario') {
        navigate('/user/dashboard');
      } else {
        navigate('/home');
      }
    } else {
      toast.error('No se pudieron obtener los datos del usuario.');
      const errorMessage = resultAction.error?.message || 'Error al iniciar sesión.';
      toast.error(errorMessage);
    }

  } catch (error) {
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
    type={showPassword ? 'text' : 'password'}
    required
    className="w-full text-sm text-gray-800 bg-gray-100 focus:bg-transparent px-4 py-3.5 rounded-md outline-blue-600 pr-12"
    placeholder="Ingresa tu contraseña"
    value={formData.password}
    onChange={handleChange}
  />
 <button
  type="button"
  className="absolute right-3 text-gray-600"
  onClick={() => setShowPassword(!showPassword)}
>
  {showPassword ? <FaEyeSlash /> : <FaEye />}
</button>

</div>

                        </div>

                        {/* ✅ Botón "¿Olvidaste tu contraseña?" */}
                        <div className="mt-3 text-sm text-center">
                            <button
                                type="button"
                                onClick={onForgotPasswordClick}
                                className="text-blue-600 hover:underline"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
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
