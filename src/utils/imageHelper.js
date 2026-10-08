import api from '../redux/axiosConfig';

export const getFullImageUrl = (url) => {
  // Usamos una imagen en base64 para evitar errores de red o CSP si via.placeholder.com está bloqueado
  if (!url) return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150"><rect width="100%" height="100%" fill="%23cccccc"/><text x="50%" y="50%" font-size="16" text-anchor="middle" fill="%23666666" dy=".3em">Sin Foto</text></svg>';
  
  const encodeSafe = (str) => {
    try {
      return encodeURI(decodeURI(str));
    } catch (e) {
      return encodeURI(str);
    }
  };

  const baseURL = api.defaults.baseURL || 'https://sistemas.seguridad.mendoza.gov.ar/regbimbak';
  // Si baseURL ya tiene /api al final, se lo sacamos para acceder a /uploads
  const backendServerURL = baseURL.replace(/\/api$/, '');

  try {
    if (url.startsWith('http')) {
      const urlObj = new URL(url);
      if (urlObj.port === '5005' || urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1' || urlObj.hostname.startsWith('10.100.1.')) {
        // En lugar de devolver una ruta relativa /uploads/..., devolvemos la ruta absoluta al backend
        const pathname = urlObj.pathname.startsWith('/') ? urlObj.pathname : `/${urlObj.pathname}`;
        return encodeSafe(`${backendServerURL}${pathname}`);
      }
    } else if (url.startsWith('/uploads')) {
      return encodeSafe(`${backendServerURL}${url}`);
    }
  } catch (e) {
    // Ignore invalid URL parsing errors
  }

  return encodeSafe(url);
};
