import api from '../axiosConfig';
import {
  SEND_MESSAGE_REQUEST,
  SEND_MESSAGE_SUCCESS,
  SEND_MESSAGE_FAIL,
  GET_MESSAGES_REQUEST,
  GET_MESSAGES_SUCCESS,
  GET_MESSAGES_FAIL,
  DELETE_CONVERSATION_REQUEST,
  DELETE_CONVERSATION_SUCCESS,
  DELETE_CONVERSATION_FAIL,
  MARK_MESSAGES_AS_READ_REQUEST,
  MARK_MESSAGES_AS_READ_SUCCESS,
  MARK_MESSAGES_AS_READ_FAIL,
  ASSIGN_MESSAGE_REQUEST,
  ASSIGN_MESSAGE_SUCCESS,
  ASSIGN_MESSAGE_FAIL,
  GET_UNREAD_MESSAGES,
} from './actionTypes';

// Función para manejar errores en las solicitudes
const handleRequestError = (error) => {
  if (error.response) {
    console.error("❌ Error del servidor:", error.response.data);
    return error.response.data?.message || "Error en la solicitud al servidor.";
  } else if (error.request) {
    console.error("❌ Error de red: No se recibió respuesta del servidor.");
    return "No se pudo conectar con el servidor.";
  } else {
    console.error("❌ Error en configuración:", error.message);
    return "Error en la configuración de la solicitud.";
  }
};


// ✅ Enviar un mensaje
export const sendMessage = ({ recipientUuid, content }) => async (dispatch) => {
  dispatch({ type: SEND_MESSAGE_REQUEST });

  try {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const senderUuid = userData?.uuid;

    if (!senderUuid || !recipientUuid || !content) {
      throw new Error("senderUuid, recipientUuid y content son obligatorios.");
    }

    const response = await api.post('/messages/send', { senderUuid, recipientUuid, content });

    dispatch({ type: SEND_MESSAGE_SUCCESS, payload: response.data });

    dispatch(getUnreadMessages(senderUuid)); // 🔥 Actualizar mensajes no leídos

    return response.data;
  } catch (error) {
    dispatch({ type: SEND_MESSAGE_FAIL, payload: handleRequestError(error) });
  }
};

// ✅ Obtener todos los mensajes
export const getMessages = () => async (dispatch) => {  
  dispatch({ type: GET_MESSAGES_REQUEST });

  try {
    // 🔥 Trae TODOS los mensajes (sin asignar y asignados)
    const response = await api.get(`/messages`);

    console.log("📩 Todos los mensajes obtenidos:", response.data);

    dispatch({ type: GET_MESSAGES_SUCCESS, payload: response.data });
  } catch (error) {
    console.error("❌ Error al obtener mensajes:", error.response?.data || error.message);
    dispatch({ type: GET_MESSAGES_FAIL, payload: error.message });
  }
};




// ✅ Obtener mensajes por usuario
export const getMessagesByUser = (userUuid) => async (dispatch) => {
  dispatch({ type: GET_MESSAGES_REQUEST });

  try {
    if (!userUuid) throw new Error("UUID del usuario no válido.");

    const response = await api.get(`/messages/user/${userUuid}`);
    dispatch({ type: GET_MESSAGES_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: GET_MESSAGES_FAIL, payload: handleRequestError(error) });
  }
};

// ✅ Eliminar una conversación
export const deleteConversation = (userUuid) => async (dispatch) => {
  dispatch({ type: DELETE_CONVERSATION_REQUEST });
  try {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const adminId = userData?.uuid;
    if (!adminId) throw new Error("No se encontró el adminId.");

    await api.delete(`/messages/conversation/${userUuid}`, { data: { adminId } });

    dispatch({ type: DELETE_CONVERSATION_SUCCESS, payload: { userUuid } });
  } catch (error) {
    dispatch({ type: DELETE_CONVERSATION_FAIL, payload: handleRequestError(error) });
  }
};

// ✅ Marcar mensajes como leídos
export const markMessagesAsRead = (userUuid) => async (dispatch) => {
  dispatch({ type: MARK_MESSAGES_AS_READ_REQUEST });

  try {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const adminUuid = userData?.uuid;
    const token = localStorage.getItem("token");

    if (!userUuid || !adminUuid) {
      console.warn("⚠️ No se puede marcar mensajes como leídos. userUuid o adminUuid faltan.");
      return;
    }

    if (!token) {
      console.warn("⚠️ No se encontró token de autenticación.");
      return;
    }

    const response = await api.put(
      `/messages/mark-as-read/${userUuid}`,
      { adminUuid },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("✅ Respuesta de marcar mensajes como leídos:", response.data);

    dispatch({ type: MARK_MESSAGES_AS_READ_SUCCESS, payload: { userUuid, adminUuid } });

    setTimeout(() => {
      dispatch(getUnreadMessages(userUuid));
    }, 500);
  } catch (error) {
    console.error("❌ Error al marcar mensajes como leídos:", error.response?.data || error.message);
    dispatch({ type: MARK_MESSAGES_AS_READ_FAIL, payload: error.message });
  }
};




// ✅ Obtener mensajes no leídos
export const getUnreadMessages = (userUuid) => async (dispatch) => {
  try {
    if (!userUuid) return;

    const response = await api.get(`/messages/unread/${userUuid}`);
    
    dispatch({
      type: GET_UNREAD_MESSAGES, // ✅ Debe estar definido en actionTypes.js
      payload: response.data.unreadMessages || [],
    });

  } catch (error) {
    console.error("Error al obtener mensajes no leídos:", error);
  }
};



// ✅ Asignar un mensaje a un admin
export const assignMessageToAdmin = ({ messageUuid, adminUuid }) => async (dispatch) => {
  dispatch({ type: ASSIGN_MESSAGE_REQUEST });

  try {
    await api.put('/messages/assign', { messageUuid, adminUuid });

    dispatch({ type: ASSIGN_MESSAGE_SUCCESS, payload: { messageUuid, adminUuid } });

    dispatch(getMessages()); // 🔄 Actualizar mensajes en Redux

  } catch (error) {
    dispatch({ type: ASSIGN_MESSAGE_FAIL, payload: error.message });
  }
};


// ✅ Marcar mensajes de usuario como leídos (cuando el admin responde)
export const markUserMessagesAsRead = (userUuid, adminUuid) => async (dispatch) => {
  dispatch({ type: MARK_MESSAGES_AS_READ_REQUEST });

  try {
    await api.put(`/messages/mark-user-read/${userUuid}`, { adminUuid });

    dispatch({ type: MARK_MESSAGES_AS_READ_SUCCESS, payload: { userUuid, adminUuid } });

  } catch (error) {
    dispatch({ type: MARK_MESSAGES_AS_READ_FAIL, payload: handleRequestError(error) });
  }
};

