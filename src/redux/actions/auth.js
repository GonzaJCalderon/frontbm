import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../axiosConfig';
import { notification } from 'antd';

// Acción de registro de usuario
export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
// Depuración
            const response = await api.post('/usuarios/register', userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);


// Acción de inicio de sesión con rol

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await api.post('/usuarios/login', { email, password });

    const { usuario, token, refreshToken } = response.data;

    if (!usuario || !token || !refreshToken) {
      throw new Error('La respuesta del servidor no contiene los datos esperados.');
    }

    // Guardar los datos correctos en localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('refreshToken', refreshToken); // ✅ AGREGALO
    localStorage.setItem('userUuid', usuario.uuid);
    localStorage.setItem('userData', JSON.stringify(usuario));

    return { usuario, token, refreshToken }; // ✅ AGREGALO
  } catch (error) {
    return rejectWithValue(
      error.response?.data?.message || 'Ocurrió un error al iniciar sesión.'
    );
  }
});





// Acción de cierre de sesión
export const logout = createAsyncThunk(
    'auth/logout',
    async (_, thunkAPI) => {
        try {
            await api.post('/logout'); // Cambia a usar la instancia de api
            // Elimina el rol del usuario de localStorage
            localStorage.removeItem('userRole');
            localStorage.removeItem('token');
            localStorage.removeItem('userToken');
            localStorage.removeItem('userData');
            return;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data.message || error.message);
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
