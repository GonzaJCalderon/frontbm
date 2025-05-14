import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { resetPassword } from '../redux/actions/auth';
import logo from '../assets/logo-png-sin-fondo.png';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(resetPassword(token, newPassword));
  };

  const handleBackClick = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-blue-500 font-sans">
      <div className="max-w-4xl mx-auto p-6 flex flex-col items-center justify-center h-full">
        <div className="bg-gray-100 p-8 rounded-lg shadow-md w-full md:w-1/2">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Logo" className="w-32 h-auto" />
          </div>
          <h2 className="text-2xl font-extrabold text-center text-blue-900 mb-6">Restablecer Contraseña</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Nueva Contraseña:</label>
              <input
                type="password"
                className="w-full p-3 border rounded"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
            >
              Cambiar Contraseña
            </button>
            <button
              type="button"
              onClick={handleBackClick}
              className="w-full py-3 mt-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition duration-300"
            >
              Volver
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
