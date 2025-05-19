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

  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!usuario) return <div className="text-center">Cargando datos del usuario...</div>;

  const {
    nombre,
    apellido,
    email,
    dni,
    direccion,
    rolDefinitivo,
    razonSocial,
    fechaAprobacion,
    empresa,
    rolEmpresa,
  } = usuario;

  const { calle, altura, barrio, departamento } = direccion || {};
  const addressString = `${calle || ''} ${altura || ''}, ${barrio || ''}, ${departamento || ''}`;
  const googleMapsURL = `https://www.google.com/maps?q=${encodeURIComponent(addressString)}&output=embed`;

  // Dirección empresa
  const empresaDireccion = empresa?.direccion || {};
  const empresaAddressString = `${empresaDireccion.calle || ''} ${empresaDireccion.altura || ''}, ${empresaDireccion.departamento || ''}`;
  const empresaMapsURL = empresaAddressString
    ? `https://www.google.com/maps?q=${encodeURIComponent(empresaAddressString)}&output=embed`
    : null;

  // Mostrar correctamente Razón Social (si tiene propia o de empresa asociada)
  const razonSocialFinal = razonSocial || empresa?.razonSocial || null;

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
        <p><strong>Rol:</strong> {rolDefinitivo || 'No disponible'}</p>
        <p><strong>Rol en Empresa:</strong> {rolEmpresa || 'No aplica'}</p>
        <p><strong>Razón Social:</strong> {razonSocialFinal || 'No disponible'}</p>
        {rolEmpresa && empresa?.razonSocial && (
          <p><strong>{rolEmpresa.charAt(0).toUpperCase() + rolEmpresa.slice(1)} de:</strong> {empresa.razonSocial}</p>
        )}
        <p>
          <strong>Dirección:</strong>{' '}
          {direccion ? (
            <a
              href={`https://www.google.com/maps?q=${encodeURIComponent(addressString)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {addressString}
            </a>
          ) : 'No disponible'}
        </p>
        <p>
          <strong>Fecha de Aprobación:</strong>{' '}
          {fechaAprobacion ? new Date(fechaAprobacion).toLocaleDateString() : 'No disponible'}
        </p>
      </div>

      {direccion && (
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-2">Ubicación del Usuario</h2>
          <iframe
            title="Ubicación del Usuario"
            src={googleMapsURL}
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          />
        </div>
      )}

      {empresa && (
        <div className="mt-10 bg-white p-4 rounded shadow-md">
          <h2 className="text-xl font-bold mb-4">Empresa Asociada</h2>
          <p><strong>Razón Social:</strong> {empresa.razonSocial}</p>
          <p><strong>CUIT:</strong> {empresa.cuit}</p>
          <p><strong>Email:</strong> {empresa.email}</p>
          <p><strong>Estado:</strong> {empresa.estado}</p>
          <p><strong>Fecha de Registro:</strong> {new Date(empresa.createdAt).toLocaleDateString()}</p>
          <p>
            <strong>Dirección:</strong>{' '}
            {empresa.direccion ? (
              <a
                href={`https://www.google.com/maps?q=${encodeURIComponent(empresaAddressString)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {empresaAddressString}
              </a>
            ) : 'No disponible'}
          </p>

          {empresaMapsURL && (
            <div className="mt-4">
              <h3 className="text-lg font-bold mb-2">Ubicación de la Empresa</h3>
              <iframe
                title="Ubicación de la Empresa"
                src={empresaMapsURL}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UsuarioDetails;
