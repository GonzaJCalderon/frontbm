import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../axiosConfig';
import { notification } from 'antd';

// Acción de registro de usuario
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/usuarios/register', userData);

      const { usuario, token, refreshToken } = response.data;

      // Verificación básica
      if (!usuario) {
  console.warn("⚠️ Backend no devolvió token en registro, pero usuario creado correctamente:", response.data);
  return { usuario, token: token || null, refreshToken: refreshToken || null };
}


      // 🧠 Guardar en localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userData', JSON.stringify(usuario));
      localStorage.setItem('userUuid', usuario.uuid);

      return { usuario, token, refreshToken }; // 👈 Esto es lo que recibe tu reducer
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);




// Acción de inicio de sesión con rol
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/usuarios/login', { email, password });

      const { usuario, token: accessToken, refreshToken } = response.data;

      if (!usuario || !accessToken || !refreshToken) {
        throw new Error('La respuesta del servidor no contiene los datos esperados.');
      }

      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userData', JSON.stringify(usuario));
      localStorage.setItem('userUuid', usuario.uuid);

      // console.log('✅ Token guardado en localStorage:', accessToken);

      // 🔁 Aquí el fix:
      return { usuario, token: accessToken, refreshToken };

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ocurrió un error al iniciar sesión.'
      );
    }
  }
);






// Acción de cierre de sesión
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, thunkAPI) => {
    try {
      await api.post('/logout'); // si tenés un endpoint, si no lo podés omitir

      // Elimina TODO lo relacionado al usuario
      localStorage.removeItem('userRole');
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userUuid');
      localStorage.removeItem('userData');

      return;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);





export const solicitarResetPassword = (email) => async (dispatch) => {
  try {
    await api.post('/usuarios/forgot-password', { email });
    notification.success({
      message: 'Correo enviado',
      description: 'Revisa tu email para restablecer la contraseña.',
    });
  } catch (error) {
    notification.error({
      message: 'Error',
      description: error.response?.data?.message || 'No se pudo enviar el correo.',
    });
  }
};

export const resetPassword = (token, newPassword) => async (dispatch) => {
  try {
    await api.post(`/usuarios/reset-password/${token}`, { newPassword });
    notification.success({
      message: 'Contraseña actualizada',
      description: 'Tu contraseña ha sido restablecida con éxito.',
    });
  } catch (error) {
    notification.error({
      message: 'Error',
      description: error.response?.data?.message || 'No se pudo cambiar la contraseña.',
    });
  }
};
