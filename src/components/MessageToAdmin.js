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

  const { success, error } = useSelector((state) => state.messages.send);
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

  await dispatch(sendMessage({
  recipientUuid: null,
  isForAdmins: true,
  content: content.trim(),
}));

// 👇 Simula push al admin recargando notificaciones
window.dispatchEvent(new Event("user-sent-message")); // ⬅️ esto es clave

setContent('');

  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-background min-h-screen font-inter flex flex-col pb-8">
      {/* Header Premium */}
      <header className="bg-primary text-white px-8 py-5 flex justify-between items-center shadow-md mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center p-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all shadow-sm border-none cursor-pointer">
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold font-montserrat tracking-tight m-0 text-white">Chat con el Administrador</h1>
            <p className="text-inverse-primary text-sm font-medium mt-0.5 mb-0">
              Soporte y consultas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => {
            localStorage.removeItem('userData');
            navigate('/login');
          }} className="flex items-center gap-2 px-4 py-2 bg-error text-white rounded-lg hover:bg-red-600 transition-all font-semibold shadow-sm border-none cursor-pointer">
            <FaSignOutAlt className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="max-w-[800px] mx-auto w-full px-4 sm:px-8">
        <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-level-2 border border-outline-variant flex flex-col h-[75vh]">
          {/* Chat Box */}
          <div
            ref={chatRef}
            className="flex-1 bg-gray-50 border border-outline-variant rounded-xl overflow-y-auto px-4 py-4 space-y-4 mb-4 shadow-inner scrollbar-thin scrollbar-thumb-gray-300"
          >
            {loadingMessages && messages.length === 0 ? (
              <p className="text-gray-500 text-center mt-4">Cargando mensajes...</p>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <FaPaperPlane className="text-4xl mb-3 opacity-50" />
                <p>No hay mensajes en esta conversación.</p>
              </div>
            ) : (
              messages
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .map((msg) => (
                  <div
                    key={msg.uuid}
                    className={`flex ${msg.senderUuid === userUuid ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                        msg.senderUuid === userUuid
                          ? 'bg-primary text-white rounded-br-sm'
                          : 'bg-white border border-outline-variant text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      <p className="m-0 text-base">{msg.content}</p>
                      <small className={`block mt-1 text-xs text-right ${msg.senderUuid === userUuid ? 'text-inverse-primary' : 'text-gray-500'}`}>
                        {formatTime(msg.createdAt)}
                      </small>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              placeholder="Escribe tu mensaje..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 border border-outline-variant px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base transition-shadow bg-gray-50 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!content.trim()}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-sm transition-all duration-200 border-none cursor-pointer ${
                content.trim() ? 'bg-primary hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-md' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <FaPaperPlane /> Enviar
            </button>
          </form>

          {/* Estado del envío */}
          {error && <p className="mt-3 text-red-600 text-center font-medium bg-red-50 py-2 rounded-md border border-red-200">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default MessageToAdmin;
