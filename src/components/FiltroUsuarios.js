import React, { useState } from 'react';

const FiltroUsuarios = ({ onSearch }) => {
  const [filters, setFilters] = useState({
    nombre: '',
    email: '',
    dni: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  return (
    <div className="flex flex-wrap space-x-2 mb-4">
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
      <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-1 rounded">
        Buscar
      </button>
    </div>
  );
};

export default FiltroUsuarios;
