import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const SeleccionarRol = () => {
    const [role, setRole] = useState('');
    const navigate = useNavigate();

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
    };

    const handleContinue = () => {
        if (role) {
            Cookies.set('userRole', role, { expires: 7 });
            navigate('/bienes');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-2xl font-bold mb-4">Selecciona tu rol</h2>
            <div className="flex space-x-4 mb-6">
                <button
                    type="button"
                    className={`py-2 px-4 border rounded ${role === 'comprador' ? 'border-blue-600 text-blue-800' : 'border-gray-300'}`}
                    onClick={() => handleRoleSelect('comprador')}
                >
                    Comprador
                </button>
                <button
                    type="button"
                    className={`py-2 px-4 border rounded ${role === 'vendedor' ? 'border-blue-600 text-blue-600' : 'border-gray-300'}`}
                    onClick={() => handleRoleSelect('vendedor')}
                >
                    Vendedor
                </button>
            </div>
            <button
                type="button"
                className="py-2 px-4 bg-blue-600 text-white rounded"
                onClick={handleContinue}
                disabled={!role}
            >
                Continuar
            </button>
        </div>
    );
};

export default SeleccionarRol;
