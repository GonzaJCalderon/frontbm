import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../axiosConfig';

// Acción de registro de usuario
export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post('/usuarios/register', userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);

// Acción de inicio de sesión con rol
export const login = createAsyncThunk('auth/login', async ({ email, password, rolTemporal }, { rejectWithValue }) => {
    try {
        console.log('Datos enviados al backend:', { email, password, rolTemporal });
        const response = await api.post('/usuarios/login', { email, password, rolTemporal });
        console.log('Respuesta del backend:', response.data); // Verifica la respuesta
        return response.data;
    } catch (error) {
        console.error('Error en la solicitud de login:', error);
        return rejectWithValue(error.response.data.message || error.message);
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
