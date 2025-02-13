// src/redux/actions/messageActions.js
import api from '../axiosConfig';
import axios from '../axiosConfig';
import { message, notification } from 'antd';
import prepareFormData from '../../utils/prepareFormData'; // Ajusta la ruta si es necesario

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
  MARK_MESSAGES_AS_READ,
} from './actionTypes';



// Función para manejar errores en las solicitudes
const handleRequestError = (error) => {
  if (error.response) {
    console.error('Error del servidor:', error.response.data);
    return error.response.data.message || 'Error al procesar la solicitud en el servidor.';
  } else if (error.request) {
    console.error('Error de red:', error.request);
    return 'No se recibió respuesta del servidor.';
  } else {
    console.error('Error en configuración:', error.message);
    return `Error en la solicitud: ${error.message}`;
  }
};

// Acción para enviar un mensaje
export const sendMessage = ({ recipientUuid, content }) => async (dispatch, getState) => {
  dispatch({ type: SEND_MESSAGE_REQUEST });

  try {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const senderUuid = userData?.uuid;

    if (!senderUuid || !recipientUuid || !content) {
      throw new Error("senderUuid, recipientUuid y content son obligatorios.");
    }

    const response = await api.post('/messages/send', { senderUuid, recipientUuid, content });

    dispatch({ type: SEND_MESSAGE_SUCCESS, payload: response.data });

    // Obtener el UUID del usuario autenticado y actualizar la cantidad de mensajes no leídos
    dispatch(fetchUnreadMessages(senderUuid));

    return response.data;
  } catch (error) {
    dispatch({ type: SEND_MESSAGE_FAIL, payload: "Error al enviar mensaje." });
  }
};





// Acción para obtener la lista de mensajes
export const getMessages = () => async (dispatch) => {
  dispatch({ type: GET_MESSAGES_REQUEST });

  try {
    const response = await api.get('/messages');

    console.log("Mensajes globales recibidos:", response.data); // Debugging

    dispatch({ type: GET_MESSAGES_SUCCESS, payload: response.data });

    return response.data;
  } catch (error) {
    const errorMessage = handleRequestError(error);
    dispatch({ type: GET_MESSAGES_FAIL, payload: errorMessage });

    console.error("Error al obtener mensajes:", errorMessage); // Debugging
  }
};


// Función auxiliar para obtener datos de un usuario por UUID
const fetchUserData = async (userUuid) => {
  try {
    const response = await api.get(`/usuarios/${userUuid}`);
    return response.data; // Devuelve el objeto del usuario
  } catch (error) {
    console.error("Error obteniendo datos del usuario:", error);
    return null; // Si falla, retorna null
  }
};

// Acción para obtener los mensajes de un usuario específico
export const getMessagesByUser = (userUuid) => async (dispatch) => {
  dispatch({ type: GET_MESSAGES_REQUEST });

  try {
    if (!userUuid || userUuid === "undefined") {
      throw new Error("Error: UUID del usuario a consultar no es válido.");
    }

    console.log(`Obteniendo mensajes del usuario seleccionado: ${userUuid}`);

    const response = await api.get(`/messages/user/${userUuid}`);
    let messages = response.data;

    // Verificar si los mensajes incluyen datos del remitente
    for (let msg of messages) {
      if (!msg.sender || !msg.sender.nombre || !msg.sender.apellido) {
        const userData = await fetchUserData(msg.senderUuid);
        if (userData) {
          msg.sender = userData; // Asignar el usuario al mensaje
        } else {
          msg.sender = { nombre: "Desconocido", apellido: "" };
        }
      }
    }

    dispatch({ type: GET_MESSAGES_SUCCESS, payload: messages });
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    dispatch({ type: GET_MESSAGES_FAIL, payload: "Error al obtener mensajes del usuario." });
  }
};

export const deleteConversation = (userUuid) => async (dispatch) => {
  dispatch({ type: DELETE_CONVERSATION_REQUEST });
  try {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const adminId = userData?.uuid;
    if (!adminId) throw new Error("No se encontró el adminId.");

    const response = await api.delete(`/messages/conversation/${userUuid}`, {
      headers: { 'Content-Type': 'application/json' },
      data: { adminId }
    });
    

    dispatch({
      type: DELETE_CONVERSATION_SUCCESS,
      payload: { userUuid, data: response.data }
    });
  } catch (error) {
    const errorMessage = handleRequestError(error);
    dispatch({ type: DELETE_CONVERSATION_FAIL, payload: errorMessage });
  }
};

// src/redux/actions/messageActions.js
// src/redux/actions/messageActions.js
export const markMessagesAsRead = (userUuid) => async (dispatch) => {
  dispatch({ type: MARK_MESSAGES_AS_READ_REQUEST });
  try {
    await api.put(`/messages/mark-as-read/${userUuid}`);
    dispatch({
      type: MARK_MESSAGES_AS_READ_SUCCESS,
      payload: userUuid, // Enviamos el UUID del usuario cuyos mensajes fueron leídos
    });
  } catch (error) {
    console.error("Error al marcar mensajes como leídos:", error);
    dispatch({
      type: MARK_MESSAGES_AS_READ_FAIL,
      payload: error.response?.data?.message || "Error al marcar mensajes como leídos",
    });
  }
};

// Acción para obtener mensajes no leídos
export const fetchUnreadMessages = (userUuid) => async (dispatch) => {
  try {
    if (!userUuid) return;

    const response = await api.get(`/messages/unread/${userUuid}`);
    dispatch({ type: GET_MESSAGES_SUCCESS, payload: response.data.count });

  } catch (error) {
    dispatch({ type: GET_MESSAGES_FAIL, payload: "Error al obtener mensajes no leídos." });
  }
};
