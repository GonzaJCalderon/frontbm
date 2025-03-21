import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../axiosConfig';
import { notification } from 'antd';

// Acción de registro de usuario
export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            console.log('Datos enviados al backend (Redux):', userData); // Depuración
            const response = await api.post('/usuarios/register', userData);
            console.log('Respuesta de la API:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error en la solicitud de registro:', error);
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);


// Acción de inicio de sesión con rol

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
    try {
        console.log('Datos enviados al backend:', { email, password });
        const response = await api.post('/usuarios/login', { email, password });
        console.log('Respuesta del backend:', response.data);

        const { usuario, token } = response.data;

        if (!usuario || !token) {
            throw new Error('La respuesta del servidor no contiene los datos esperados.');
        }

        // Guardar los datos correctos en localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('userUuid', usuario.uuid); // Cambiado de id a uuid
        localStorage.setItem('userData', JSON.stringify(usuario)); // Guardar todo el objeto usuario

        return { usuario, token }; // Devolver los datos esperados
    } catch (error) {
        console.error('Error en la solicitud de login:', error);
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
