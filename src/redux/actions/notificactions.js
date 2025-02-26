import axios from 'axios';

// Definir tipos de acción
import {SET_NOTIFICATIONS, CLEAR_NOTIFICATIONS, MARK_NOTIFICATIONS_AS_READ} from './actionTypes';

// Acción para establecer las notificaciones
export const setNotifications = (notifications) => ({
    type: SET_NOTIFICATIONS,
    payload: notifications
});

// Acción para limpiar todas las notificaciones (cuando se abre la bandeja de mensajes)
export const clearNotifications = () => ({
    type: CLEAR_NOTIFICATIONS
});

// Acción para marcar notificaciones como leídas en la API y actualizar Redux
export const markNotificationsAsRead = () => async (dispatch) => {
    try {
        // Aquí puedes hacer una llamada a la API para actualizar las notificaciones como leídas en el backend
        await axios.put('/api/notifications/mark-as-read');

        // Una vez que se actualizan en el backend, también limpiamos en Redux
        dispatch({
            type: MARK_NOTIFICATIONS_AS_READ
        });
    } catch (error) {
        console.error('Error al marcar notificaciones como leídas:', error);
    }
};
