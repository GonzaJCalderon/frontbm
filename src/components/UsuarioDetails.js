// src/components/UsuarioDetails.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getUserIdFromCookies } from '../utils/cookieutils'; // Asegúrate de que la ruta sea correcta

const UsuarioDetalles = () => {
    const [usuario, setUsuario] = useState(null);
    const [error, setError] = useState(null);

    const userId = getUserIdFromCookies(); // Ahora está importada

    useEffect(() => {
        if (userId) {
            axios.get(`http://localhost:5000/usuarios/${userId}`)
                .then(response => {
                    setUsuario(response.data);
                })
                .catch(err => {
                    setError(err);
                });
        } else {
            setError('User ID is not defined');
        }
    }, [userId]);

    if (error) return <div>Error: {error.message}</div>;
    if (!usuario) return <div>Cargando...</div>;

    return (
        <div>
            <h2>{usuario.nombre}</h2>
            <p>Email: {usuario.email}</p>
            {/* Más detalles del usuario */}
        </div>
    );
};

export default UsuarioDetalles;
