import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  sendMessage,
  getMessagesByUser,
  markAllAsRead
} from '../redux/actions/messageActions';
import { FaArrowLeft, FaSignOutAlt, FaPaperPlane } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const MessageToAdmin = () => {
  const [content, setContent] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const chatRef = useRef(null);

  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const userUuid = userData.uuid;

  const { loading: sending, success, error } = useSelector((state) => state.messages.send);
  const { loading: loadingMessages, messages } = useSelector((state) => state.messages.list);

  // Scroll automático
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Cargar y refrescar mensajes periódicamente
  useEffect(() => {
    if (!userUuid) return;

    dispatch(getMessagesByUser(userUuid));
    dispatch(markAllAsRead({ from: userUuid, to: userUuid }));

    const interval = setInterval(() => {
      dispatch(getMessagesByUser(userUuid));
    }, 5000);

    return () => clearInterval(interval);
  }, [dispatch, userUuid]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    dispatch(sendMessage({
      recipientUuid: null,
      isForAdmins: true,
      content: content.trim(),
    }));

    setContent('');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between bg-blue-100 p-3 rounded-md mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center text-blue-600 font-medium hover:underline">
          <FaArrowLeft className="mr-2" /> Volver
        </button>
        <button
          onClick={() => {
            localStorage.removeItem('userData');
            navigate('/login');
          }}
          className="flex items-center text-pink-600 font-medium hover:underline"
        >
          <FaSignOutAlt className="mr-2" /> Cerrar Sesión
        </button>
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">Chat con el Administrador</h2>

      {/* Chat Box */}
      <div
        ref={chatRef}
        className="bg-gray-50 border border-gray-200 rounded-md h-80 overflow-y-auto px-4 py-2 space-y-4 mb-4"
      >
        {loadingMessages && messages.length === 0 ? (
          <p className="text-gray-500">Cargando mensajes...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-500">No hay mensajes en esta conversación.</p>
        ) : (
          messages
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map((msg) => (
              <div
                key={msg.uuid}
                className={`flex ${msg.senderUuid === userUuid ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-lg text-sm shadow-md ${
                    msg.senderUuid === userUuid
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-green-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p>{msg.content}</p>
                  <small className="block mt-1 text-xs text-gray-600 text-right">
                    {formatTime(msg.createdAt)}
                  </small>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="flex">
        <input
          type="text"
          placeholder="Escribe tu mensaje..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 border px-3 py-2 rounded-l-md focus:outline-none"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
        >
          <FaPaperPlane />
        </button>
      </form>

      {/* Estado del envío */}
      {success && <p className="mt-3 text-green-600">Mensaje enviado correctamente.</p>}
      {error && <p className="mt-3 text-red-600">{error}</p>}
    </div>
  );
};

export default MessageToAdmin;
