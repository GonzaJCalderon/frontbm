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
  GET_UNREAD_MESSAGES // ✅ Importamos la acción correctamente
} from '../actions/actionTypes';

const initialState = {
  send: {
    loading: false,
    success: false,
    error: null,
    messageData: null,
  },
  list: {
    loading: false,
    messages: [],
    error: null,
  },
  unread: [], // ✅ Agregamos el estado para mensajes no leídos
};

const messageReducer = (state = initialState, action) => {

  switch (action.type) { 
    case SEND_MESSAGE_REQUEST:
      return {
        ...state,
        send: { ...state.send, loading: true, error: null, success: false },
      };

    case SEND_MESSAGE_SUCCESS:
      return {
        ...state,
        send: {
          ...state.send,
          loading: false,
          success: true,
          messageData: action.payload,
        },
      };

    case SEND_MESSAGE_FAIL:
      return {
        ...state,
        send: {
          ...state.send,
          loading: false,
          error: action.payload,
          success: false,
        },
      };
      case GET_MESSAGES_REQUEST:
        return {
          ...state,
          list: { ...state.list, loading: true, error: null },
        };
      
      case GET_MESSAGES_SUCCESS:
        return {
          ...state,
          list: {
            ...state.list,
            loading: false,
            messages: Array.isArray(action.payload) ? action.payload : [],
            error: null,
          },
        };
      
      case GET_MESSAGES_FAIL:
        return {
          ...state,
          list: { ...state.list, loading: false, messages: [], error: action.payload },
        };
      

    case DELETE_CONVERSATION_SUCCESS: {
      const deletedUserUuid = action.payload.userUuid;
      return {
        ...state,
        list: {
          ...state.list,
          loading: false,
          messages: state.list.messages.filter(
            (msg) =>
              msg.senderUuid !== deletedUserUuid &&
              msg.recipientUuid !== deletedUserUuid
          ),
        },
      };
    }

    case DELETE_CONVERSATION_FAIL:
      return {
        ...state,
        list: { ...state.list, loading: false, error: action.payload },
      };

    case MARK_MESSAGES_AS_READ_REQUEST:
      return {
        ...state,
        list: { ...state.list, loading: true },
      };

      case MARK_MESSAGES_AS_READ_SUCCESS:
        return {
          ...state,
          list: {
            ...state.list,
            messages: state.list.messages.map(msg =>
              msg.senderUuid === action.payload.userUuid 
              && msg.recipientUuid === action.payload.adminUuid
                ? { ...msg, isRead: true }
                : msg
            ),
          },
          unread: [], // 🔥 Limpiamos los mensajes no leídos después de marcarlos como leídos
        };
      
      

    case MARK_MESSAGES_AS_READ_FAIL:
      return {
        ...state,
        list: { ...state.list, loading: false, error: action.payload },
      };

     
      case GET_UNREAD_MESSAGES:
      

        return {
          ...state,
          unread: Array.isArray(action.payload) ? action.payload : [],
          
        };
      

    default:
      return state;
  }
};

export default messageReducer;
