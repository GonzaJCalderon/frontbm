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
      .filter(([_, val]) => val.trim().length >= 2)
      .reduce((acc, [k, v]) => ({ ...acc, [k]: v.trim() }), {});

    if (Object.keys(activeFilters).length > 0) {
      dispatch(searchItems(activeFilters, 'users'));
    } else {
      // Si no hay filtros, tal vez quieras limpiar la búsqueda o recargar
      // dispatch(searchItems({}, 'users'));
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
    `m-1 sm:m-2 flex-1 text-center px-4 py-3 rounded-lg font-montserrat font-semibold cursor-pointer transition-all shadow-sm
    ${activeTab === tab ? 'bg-primary text-white shadow-md' : 'bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'}`;

  const logoSrc =
    'https://res.cloudinary.com/dtx5ziooo/image/upload/v1739288789/logo-png-sin-fondo_lyddzv.png';

  return (
    <div className="bg-background min-h-screen flex flex-col font-inter">
      {/* Header Premium */}
      <header className="bg-primary text-white px-8 py-5 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-4">
          <img src={logoSrc} alt="Logo" className="h-12 w-auto bg-white/10 rounded p-1" />
          <div>
            <h1 className="text-2xl font-bold font-montserrat tracking-tight">
              Bienvenido/a, {user?.nombre} {user?.apellido}
            </h1>
            <p className="text-inverse-primary text-sm font-medium mt-0.5">
              Control de Usuarios y Empresas
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center justify-center p-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all shadow-sm"
            title="Buscar usuarios"
          >
            <FaSearch className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center justify-center p-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all shadow-sm"
          >
            <FaHome className="w-5 h-5" />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center p-3 bg-error text-white rounded-lg hover:bg-error/90 transition-all shadow-sm"
          >
            <FaSignOutAlt className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Campos de Búsqueda */}
      {showSearch && (
        <div className="bg-surface-container-lowest mt-6 mx-8 p-6 rounded-2xl border border-outline-variant shadow-level-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Object.entries(searchFields).map(([field, value]) => (
              <div key={field} className="flex flex-col">
                <label className="text-sm font-semibold text-primary mb-1 uppercase tracking-wide">{field}</label>
                <input
                  type="text"
                  name={field}
                  placeholder={`Buscar por ${field}`}
                  value={value}
                  onChange={handleFieldChange}
                  className="border border-outline-variant px-4 py-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-primary transition-all text-on-surface"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <button
              className="flex items-center text-sm font-bold text-error hover:text-on-error-container transition-colors"
              onClick={clearSearch}
            >
              <FaTimes className="mr-1" /> Cerrar búsqueda
            </button>
          </div>
        </div>
      )}

      {/* Tabs de usuarios */}
      <div className="mt-8 px-8 flex flex-wrap justify-center max-w-6xl mx-auto w-full">
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
