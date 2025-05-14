import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchUsuarioDetails } from '../redux/actions/usuarios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, notification } from 'antd';
import { ArrowLeftOutlined, LogoutOutlined } from '@ant-design/icons';

const UsuarioDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(fetchUsuarioDetails({ uuid: id }))

      .then((response) => setUsuario(response))
      .catch((err) => {
        const errorMessage = err.message || 'Error al obtener los detalles del usuario.';
        setError(errorMessage);
        notification.error({
          message: 'Error',
          description: errorMessage,
        });
      });
  }, [dispatch, id]);

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!usuario) {
    return <div className="text-center">Cargando datos del usuario...</div>;
  }

  const {
    nombre,
    apellido,
    email,
    dni,
    direccion,
    rolDefinitivo,
    razonSocial,
    fechaAprobacion,
  } = usuario || {};
  const { calle, altura, barrio, departamento } = direccion || {};

  // Construcción del enlace y la URL del iframe de Google Maps
  const addressString = `${calle || ''} ${altura || ''}, ${barrio || ''}, ${departamento || ''}`;
  const googleMapsURL = `https://www.google.com/maps?q=${encodeURIComponent(addressString)}&output=embed`;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate('/usuarios')}>
          Volver
        </Button>
        <Button type="primary" icon={<LogoutOutlined />} onClick={() => navigate('/home')}>
          Cerrar Sesión
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-4">Detalles del Usuario</h1>

      <div className="bg-white p-4 rounded shadow-md">
        <p><strong>Nombre:</strong> {nombre || 'No disponible'}</p>
        <p><strong>Apellido:</strong> {apellido || 'No disponible'}</p>
        <p><strong>Email:</strong> {email || 'No disponible'}</p>
        <p><strong>DNI:</strong> {dni || 'No disponible'}</p>
        <p><strong>Razón Social:</strong> {razonSocial || 'No disponible'}</p>
        <p><strong>Rol:</strong> {rolDefinitivo || 'No disponible'}</p>
        <p>
          <strong>Dirección:</strong>{' '}
          {direccion ? (
            <a href={`https://www.google.com/maps?q=${encodeURIComponent(addressString)}`} target="_blank" rel="noopener noreferrer">
              {addressString}
            </a>
          ) : (
            'No disponible'
          )}
        </p>
        <p>
          <strong>Fecha de Aprobación:</strong>{' '}
          {fechaAprobacion ? new Date(fechaAprobacion).toLocaleDateString() : 'No disponible'}
        </p>
      </div>

      {direccion && (
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-2">Ubicación en el Mapa</h2>
          <iframe
            title="Google Maps"
            src={googleMapsURL}
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
};

export default UsuarioDetails;
