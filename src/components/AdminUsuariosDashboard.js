import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaHome, FaSearch, FaTimes } from 'react-icons/fa';
import UsuarioList from './UsuarioList';
import SolicitudesPendientes from './SolicitudesPendientes';
import UsuariosRechazados from './UsuariosRechazados';
import InfoEmpresas from './InfoEmpresas';
import { searchItems } from '../redux/actions/search';

const AdminUsuariosDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [searchFields, setSearchFields] = useState({
    nombre: '',
    apellido: '',
    email: '',
    dni: '',
    cuit: '',
    direccion: ''
  });

  const [showSearch, setShowSearch] = useState(false);
  const [activeTab, setActiveTab] = useState('aprobados');

  const { loading, usuarios, error } = useSelector(state => state.search);
  const storedUser = JSON.parse(localStorage.getItem('userData') || '{}');
  const user = useSelector(state => state.auth.user) || storedUser;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    const updatedFields = { ...searchFields, [name]: value };
    setSearchFields(updatedFields);

    const activeFilters = Object.entries(updatedFields)
      .filter(([_, val]) => val.trim().length > 2)
      .map(([k, v]) => `${k}=${encodeURIComponent(v.trim())}`)
      .join('&');

    if (activeFilters) {
      dispatch(searchItems(activeFilters, 'users'));
    }
  };

  const clearSearch = () => {
    setSearchFields({
      nombre: '',
      apellido: '',
      email: '',
      dni: '',
      cuit: '',
      direccion: ''
    });
    setShowSearch(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/home');
  };

  const tabClass = (tab) =>
    `m-1 sm:m-2 flex-1 text-center px-4 py-2 rounded font-medium cursor-pointer transition-all
    ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 hover:bg-gray-300'}`;

  const logoSrc =
    'https://res.cloudinary.com/dtx5ziooo/image/upload/v1739288789/logo-png-sin-fondo_lyddzv.png';

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <img src={logoSrc} alt="Logo" className="h-10 w-auto" />
          <h1 className="text-xl font-bold">
            Bienvenido/a, {user?.nombre} {user?.apellido}
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <FaSearch
            className="w-5 h-5 cursor-pointer"
            onClick={() => setShowSearch(!showSearch)}
            title="Buscar usuarios"
          />
          <button
            onClick={() => navigate('/home')}
            className="flex items-center px-3 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
          >
            <FaHome className="mr-1" /> Inicio
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            <FaSignOutAlt className="mr-1" /> Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Campos de Búsqueda */}
      {showSearch && (
        <div className="bg-white mt-4 p-4 rounded-lg border shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(searchFields).map(([field, value]) => (
              <input
                key={field}
                type="text"
                name={field}
                placeholder={`Buscar por ${field}`}
                value={value}
                onChange={handleFieldChange}
                className="border px-3 py-2 rounded w-full"
              />
            ))}
          </div>
          <div className="flex justify-end mt-2">
            <button
              className="flex items-center text-sm text-red-600 hover:text-red-800"
              onClick={clearSearch}
            >
              <FaTimes className="mr-1" /> Cerrar búsqueda
            </button>
          </div>
        </div>
      )}

      {/* Tabs de usuarios */}
      <div className="mt-6 flex flex-wrap justify-center">
        <button className={tabClass('aprobados')} onClick={() => setActiveTab('aprobados')}>
          ✅ Usuarios Aprobados
        </button>
        <button className={tabClass('pendientes')} onClick={() => setActiveTab('pendientes')}>
          ⏳ Solicitudes Pendientes
        </button>
        <button className={tabClass('rechazados')} onClick={() => setActiveTab('rechazados')}>
          ❌ Usuarios Rechazados
        </button> 
        <button className={tabClass('empresas')} onClick={() => setActiveTab('empresas')}>
  🏢 Empresas Registradas
</button>

      </div>

      {/* Cuerpo de resultado */}
      <div className="mt-6 flex-grow overflow-x-auto">
        <div className="min-w-full max-w-screen-lg mx-auto">
          {loading && <p className="text-center text-blue-600">Cargando usuarios...</p>}
    {error && (
  <p className="text-center text-red-600">
    {typeof error === 'string'
      ? error
      : error.message || JSON.stringify(error)}
  </p>
)}

          {activeTab === 'aprobados' && Array.isArray(usuarios) && <UsuarioList usuarios={usuarios} />}
{activeTab === 'aprobados' && !Array.isArray(usuarios) && (
  <p className="text-center text-red-600">
    {usuarios?.message || 'No se pudieron cargar los usuarios.'}
  </p>
)}
          {activeTab === 'pendientes' && <SolicitudesPendientes />}
          {activeTab === 'rechazados' && <UsuariosRechazados />}
   {activeTab === 'empresas' && Array.isArray(usuarios) && <InfoEmpresas usuarios={usuarios} />}
{activeTab === 'empresas' && !Array.isArray(usuarios) && (
  <p className="text-center text-red-600">
    {usuarios?.message || 'No se pudieron cargar las empresas.'}
  </p>
)}


        </div>
      </div>
    </div>
  );
};

export default AdminUsuariosDashboard;
