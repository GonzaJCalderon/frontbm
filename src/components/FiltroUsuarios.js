import React, { useState } from 'react';

const FiltroUsuarios = ({ onSearch }) => {
  const [filters, setFilters] = useState({
    nombre: '',
    email: '',
    dni: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    const hasInput = Object.values(filters).some((val) => val.trim() !== '');
    if (!hasInput) return;

    onSearch(filters);
  };

  const handleClear = () => {
    const cleared = { nombre: '', email: '', dni: '' };
    setFilters(cleared);
    onSearch(cleared); // También se puede usar para resetear resultados
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <input
        type="text"
        name="nombre"
        placeholder="Nombre"
        value={filters.nombre}
        onChange={handleChange}
        className="border px-2 py-1 rounded"
      />
      <input
        type="text"
        name="email"
        placeholder="Email"
        value={filters.email}
        onChange={handleChange}
        className="border px-2 py-1 rounded"
      />
      <input
        type="text"
        name="dni"
        placeholder="DNI"
        value={filters.dni}
        onChange={handleChange}
        className="border px-2 py-1 rounded"
      />
      <button
        onClick={handleSearch}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
      >
        Buscar
      </button>
      <button
        onClick={handleClear}
        className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-1 rounded"
      >
        Limpiar
      </button>
    </div>
  );
};

export default FiltroUsuarios;
