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
    return error.response.data?.message || "Error en la solicitud al servidor.";
  } else if (error.request) {
    return "No se pudo conectar con el servidor.";
  } else {
    return "Error en la configuración de la solicitud.";
  }
};


// ✅ Enviar un mensaje
// Acción corregida
export const sendMessage = ({ recipientUuid = null, content, isForAdmins = false }) => async (dispatch) => {
  dispatch({ type: SEND_MESSAGE_REQUEST });

  try {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const senderUuid = userData?.uuid;

    if (!senderUuid || !content) {
      throw new Error("senderUuid y content son obligatorios.");
    }

    const response = await api.post('/messages/send', {
      senderUuid,
      recipientUuid,
      assignedAdminUuid: null, // explícitamente null (opcional pero recomendado)
      isForAdmins,
      content,
    });

    dispatch({ type: SEND_MESSAGE_SUCCESS, payload: response.data });
    dispatch(getUnreadMessages(senderUuid));

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


    dispatch({ type: GET_MESSAGES_SUCCESS, payload: response.data });
  } catch (error) {
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


// ✅ Opcional: helper para autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const markMessagesAsRead = (userUuid) => async (dispatch) => {
  dispatch({ type: MARK_MESSAGES_AS_READ_REQUEST });

  try {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const adminUuid = userData?.uuid;

    if (!userUuid || !adminUuid) {
      throw new Error("Faltan UUIDs de usuario o administrador.");
    }

    const response = await api.put(
      `/messages/mark-as-read/${userUuid}`,
      { adminUuid },
      { headers: getAuthHeaders() }
    );

    dispatch({
      type: MARK_MESSAGES_AS_READ_SUCCESS,
      payload: { userUuid, adminUuid },
    });

    // 🔄 Opcional: actualizar mensajes no leídos con delay
    setTimeout(() => {
      dispatch(getUnreadMessages(userUuid));
    }, 500);

    return response.data; // ✅ Si lo querés usar luego
  } catch (error) {
    const message =
      error?.response?.data?.message || error.message || 'Error al marcar como leídos.';
    dispatch({ type: MARK_MESSAGES_AS_READ_FAIL, payload: message });
    throw error; // ✅ Por si lo querés manejar en el componente
  }
};





// ✅ Obtener mensajes no leídos
export const getUnreadMessages = (userUuid) => async (dispatch) => {
  try {
    if (!userUuid) return [];

    const response = await api.get(`/messages/unread/${userUuid}`, {
      headers: getAuthHeaders()
    });

    const mensajes = response.data?.unreadMessages || [];

    dispatch({
      type: GET_UNREAD_MESSAGES,
      payload: mensajes,
    });

    return mensajes;
  } catch (error) {
    console.error("❌ Error en getUnreadMessages:", error);
    return [];
  }
};



export const clearUnreadMessages = () => ({
  type: GET_UNREAD_MESSAGES,
  payload: [],
});




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
await api.put(`/messages/mark-as-read-user/${userUuid}`, { adminUuid });


    dispatch({ type: MARK_MESSAGES_AS_READ_SUCCESS, payload: { userUuid, adminUuid } });

  } catch (error) {
    dispatch({ type: MARK_MESSAGES_AS_READ_FAIL, payload: handleRequestError(error) });
  }
};

// ✅ Asignar automáticamente mensajes globales sin leer al admin (cuando abre Inbox)
export const assignUnreadToAdmin = (adminUuid) => async (dispatch) => {
  try {
    if (!adminUuid) {
      console.warn("⚠️ Falta el UUID del admin para assignUnreadToAdmin");
      return;
    }

    const token = localStorage.getItem("token");
    const response = await api.put(
      "/messages/assign-unread",
      { adminUuid },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // console.log("🧾 assignUnreadToAdmin OK:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error en assignUnreadToAdmin:", error);
    return null;
  }
};


export const markAllAsRead = ({ from, to }) => async (dispatch) => {
  try {
    if (!from || !to) return;

    // 🧠 Caso 1: el admin está leyendo mensajes del usuario
    if (from !== to) {
      await dispatch(markUserMessagesAsRead(from, to)); // from = user, to = admin
    } 
    // 🧠 Caso 2: el usuario está leyendo sus propios mensajes recibidos
    else {
      await dispatch(markMessagesAsRead(from));
    }

    dispatch(clearUnreadMessages()); // Limpieza inmediata del badge

  } catch (error) {
    console.error("❌ Error en markAllAsRead:", error);
  }
};

export const sendReplyToUser = ({ recipientUuid, content }) => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post('/messages/reply', {
      recipientUuid,
      content
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    dispatch({
      type: SEND_MESSAGE_SUCCESS,
      payload: response.data,
    });

    dispatch(getMessages()); // 🔄 actualiza lista si es necesario

    return response.data;
  } catch (error) {
    console.error("❌ Error al enviar respuesta:", error);
    dispatch({
      type: SEND_MESSAGE_FAIL,
      payload: error.message || 'Error al enviar respuesta',
    });
    throw error;
  }
};

