import React, { useState } from 'react';
import UsuarioList from './UsuarioList'; // Importamos el componente de usuarios aprobados
import SolicitudesPendientes from './SolicitudesPendientes'; // Importamos el componente de solicitudes pendientes
import UsuariosRechazados from './UsuariosRechazados'; // Importamos el componente de usuarios rechazados

const AdminUsuariosDashboard = () => {
    const [activeTab, setActiveTab] = useState('aprobados'); // Controlamos qué tab está activo

    return (
        <div className="p-6 bg-gray-100 min-h-screen flex flex-col">
            <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Administrar Usuarios</h1>
            </header>

            <div className="mt-4 flex flex-wrap justify-center">
                <button
                    className={`m-2 flex-1 sm:flex-initial sm:w-1/3 lg:w-1/4 px-4 py-2 rounded ${activeTab === 'aprobados' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => setActiveTab('aprobados')}
                >
                    Usuarios Aprobados
                </button>
                <button
                    className={`m-2 flex-1 sm:flex-initial sm:w-1/3 lg:w-1/4 px-4 py-2 rounded ${activeTab === 'pendientes' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setActiveTab('pendientes')}
                >
                    Solicitudes Pendientes
                </button>
                <button
                    className={`m-2 flex-1 sm:flex-initial sm:w-1/3 lg:w-1/4 px-4 py-2 rounded ${activeTab === 'rechazados' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => setActiveTab('rechazados')}
                >
                    Usuarios Rechazados
                </button>
            </div>

            <main className="mt-6 flex-grow">
                {activeTab === 'aprobados' && <UsuarioList />}
                {activeTab === 'pendientes' && <SolicitudesPendientes />}
                {activeTab === 'rechazados' && <UsuariosRechazados />}
            </main>
        </div>
    );
};

export default AdminUsuariosDashboard;
