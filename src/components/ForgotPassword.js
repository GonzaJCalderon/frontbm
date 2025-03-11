import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../redux/axiosConfig'; // Ajusta la ruta según tu proyecto

const ForgotPassword = ({ onBackClick }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setEmail(e.target.value);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('Por favor, ingresa tu correo electrónico.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/usuarios/forgot-password', { email });
            toast.success(response.data.message || 'Se ha enviado un enlace a tu correo.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al enviar el enlace.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full p-6 flex flex-col items-center">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <h3 className="text-gray-800 text-2xl font-bold mb-4 text-center">Recuperar Contraseña</h3>
                <p className="text-gray-600 text-sm text-center mb-6">
                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </p>

                <form onSubmit={handleSubmit}>
                    <label className="text-gray-800 text-[15px] mb-2 block">Correo Electrónico</label>
                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={handleChange}
                        required
                        className="w-full text-sm text-gray-800 bg-gray-100 focus:bg-transparent px-4 py-3.5 rounded-md outline-blue-600 mb-4"
                        placeholder="Ingresa tu email"
                    />

                    <button
                        type="submit"
                        className="w-full py-3 px-6 text-sm tracking-wide rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                        disabled={loading}
                    >
                        {loading ? 'Enviando...' : 'Enviar Enlace'}
                    </button>
                </form>

                {/* Botón para volver al login */}
                <p className="text-sm text-center mt-4">
                    <button onClick={onBackClick} className="text-blue-600 hover:underline">
                        Volver al inicio de sesión
                    </button>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
