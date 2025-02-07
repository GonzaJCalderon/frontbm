// src/components/AdminMessages.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMessages, getMessagesByUser, sendMessage, deleteConversation, markMessagesAsRead } from '../redux/actions/messageActions';
import { FaInbox, FaPaperPlane, FaSearch, FaTrash, FaEdit, FaHome, FaSignOutAlt, FaArrowLeft} from 'react-icons/fa';

const AdminMessages = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userUuid } = useParams(); // UUID del usuario con el que se está chateando
  const messageInputRef = useRef(null);

  // Estado global de mensajes en Redux
  const { loading, messages, error } = useSelector((state) => state.messages.list);

  // Obtener el usuario (administrador) autenticado desde localStorage
  const adminData = JSON.parse(localStorage.getItem('userData'));
  const adminUuid = adminData?.uuid;

  // Estado local para el input de mensaje a enviar
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!adminUuid || !userUuid) return;
  
    dispatch(getMessagesByUser(userUuid));
  
    // ✅ Llamamos a la acción para marcar como leídos
    dispatch(markMessagesAsRead(userUuid));
  
  }, [dispatch, userUuid, adminUuid]);

  // Filtrar mensajes según pestaña "inbox" (mensajes recibidos) o "sent" (enviados)
  // En este componente, al tratarse de la conversación, se muestran todos.
  const conversationMessages = messages.filter(
    (msg) =>
      (msg.senderUuid === adminUuid && msg.recipientUuid === userUuid) ||
      (msg.senderUuid === userUuid && msg.recipientUuid === adminUuid)
  ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // Función para navegar a Home (dashboard del admin)
  const handleHome = () => {
    navigate('/admin/dashboard');
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/login');
  };

  // Función para enviar mensaje
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    dispatch(sendMessage({
      senderUuid: adminUuid,
      recipientUuid: userUuid,
      content: newMessage.trim(),
    }));
    setNewMessage('');
  };

  // Función para eliminar la conversación con el usuario actual
  const handleDeleteConversation = (e) => {
    e.stopPropagation();
    if (!userUuid) return;
    dispatch(deleteConversation(userUuid))
      .then(() => {
        // Una vez eliminada la conversación, puedes redirigir al buzón de mensajes
        navigate('/inbox');
      });
  };

  // Función para enfocar el input (acción de "responder")
  const handleResponse = (e) => {
    e.stopPropagation();
    messageInputRef.current?.focus();
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Encabezado con botones de Volver, Home y Cerrar Sesión */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          {/* BOTÓN DE VOLVER */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center px-4 py-2 bg-blue-200 hover:bg-blue-300 rounded"
          >
            <FaArrowLeft className="mr-2" /> Volver
          </button>
  
          {/* BOTÓN DE HOME */}
          <button
            onClick={handleHome}
            className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            <FaHome className="mr-2" /> Home
          </button>
        </div>
  
        {/* BOTÓN DE CERRAR SESIÓN */}
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 bg-red-200 hover:bg-red-300 rounded"
        >
          <FaSignOutAlt className="mr-2" /> Cerrar Sesión
        </button>
      </div>
  
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Conversación</h1>
  

      {/* Listado de mensajes */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        {loading ? (
          <p>Cargando mensajes...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : conversationMessages.length === 0 ? (
          <p className="text-gray-600">No se encontraron mensajes en esta conversación.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {conversationMessages.map((msg) => (
              <li
                key={msg.uuid}
                className="py-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-gray-800">
                      {msg.senderUuid === adminUuid
                        ? 'Yo'
                        : msg.sender?.nombre || 'Usuario'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-gray-600 mt-1">{msg.content}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Botones de acción para la conversación */}
      <div className="flex justify-end items-center space-x-4 mb-4">
        <button
          onClick={handleResponse}
          className="flex items-center text-blue-500 hover:text-blue-700"
        >
          <FaEdit className="mr-1" /> Responder
        </button>
        <button
          onClick={handleDeleteConversation}
          className="flex items-center text-red-500 hover:text-red-700"
        >
          <FaTrash className="mr-1" /> Eliminar Conversación
        </button>
      </div>

      {/* Área para enviar mensaje */}
      <div className="flex items-center space-x-2">
        <input
          ref={messageInputRef}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none"
        />
        <button
          onClick={handleSendMessage}
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          <FaPaperPlane className="mr-2" /> Enviar
        </button>
      </div>
    </div>
  );
};

export default AdminMessages;
