import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userDataString = localStorage.getItem('userData');
  const token = localStorage.getItem('authToken');

  // Si no hay token o no hay userData, redirigir al login
  if (!token || !userDataString) {
    return <Navigate to="/login" replace />;
  }

  try {
    const userData = JSON.parse(userDataString);
    
    // Si se especifican roles permitidos, verificar que el usuario tenga uno de ellos
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(userData.rol)) {
        // Redirigir a su dashboard correspondiente según su rol
        if (userData.rol === 'admin' || userData.rol === 'administrador') {
          return <Navigate to="/admin/dashboard" replace />;
        } else {
          return <Navigate to="/user/dashboard" replace />;
        }
      }
    }

    // Si tiene permiso, renderizar el componente hijo
    return children;
  } catch (error) {
    console.error("Error validando la sesión:", error);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
