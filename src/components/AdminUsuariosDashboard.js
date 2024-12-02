import React, { useState } from 'react';
import UsuarioList from './UsuarioList';
import SolicitudesPendientes from './SolicitudesPendientes';
import UsuariosRechazados from './UsuariosRechazados';

const AdminUsuariosDashboard = () => {
    const [activeTab, setActiveTab] = useState('aprobados');

    const tabClass = (tab) => `
        m-2 flex-1 sm:flex-initial sm:w-1/3 lg:w-1/4 px-4 py-2 rounded
        ${activeTab === tab ? 'bg-blue-600 text-white border-b-4 border-blue-800' : 'bg-gray-200'}
    `;

    return (
        <div className="p-6 bg-gray-100 min-h-screen flex flex-col">
            <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Administrar Usuarios</h1>
            </header>

            <div className="mt-4 flex flex-wrap justify-center">
                <button className={tabClass('aprobados')} onClick={() => setActiveTab('aprobados')}>
                    Usuarios Aprobados
                </button>
                <button className={tabClass('pendientes')} onClick={() => setActiveTab('pendientes')}>
                    Solicitudes Pendientes
                </button>
                <button className={tabClass('rechazados')} onClick={() => setActiveTab('rechazados')}>
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
