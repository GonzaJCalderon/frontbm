import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage, getMessages } from '../redux/actions/messageActions';
import { FaArrowLeft, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const MessageToAdmin = () => {
  const [content, setContent] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Obtener usuario desde localStorage
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const userUuid = userData.uuid || null;
  
  if (!userUuid) {
    console.warn("Advertencia: No se encontró el UUID del usuario en localStorage.");
  }

  // Estados de Redux
  const { loading: sending, success, error } = useSelector((state) => state.messages.send);
  const { loading: loadingMessages, messages } = useSelector((state) => state.messages.list);

  const chatContainerRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const userData = JSON.parse(localStorage.getItem('userData'));
    const senderUuid = userData?.uuid;

    if (!senderUuid) {
      console.error("Error: No se encontró el UUID del usuario autenticado.");
      return;
    }

    dispatch(sendMessage({
      recipientUuid: '1f5cf8cc-937e-4256-84cb-0aac97ae254e', // UUID del administrador
      content,
    }));

    setContent('');
  };

  const handleSendMessage = () => {
    if (!content.trim()) return;
    dispatch(sendMessage({ content }));
    setContent('');
  };
  
  // Cargar mensajes periódicamente
  useEffect(() => {
    dispatch(getMessages());
    const interval = setInterval(() => {
      dispatch(getMessages());
    }, 5000);

    return () => clearInterval(interval);
  }, [dispatch]);

  // Auto-scroll en la lista de mensajes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      {/* Botones de navegación */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="px-3 py-1 bg-blue-100 text-blue-600 rounded"
        >
          <FaArrowLeft className="mr-2" />
          Volver
        </button>
        <button 
          onClick={() => { 
            localStorage.removeItem('userData'); 
            navigate('/login'); 
          }} 
          className="px-3 py-1 bg-pink-100 text-pink-600 rounded"
        >
          <FaSignOutAlt className="mr-2" />
          Cerrar Sesión
        </button>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Chat con el Administrador</h2>

      {/* Lista de mensajes */}
      <div 
        ref={chatContainerRef} 
        className="h-80 overflow-y-auto p-4 bg-gray-50 border border-gray-200 rounded mb-4"
      >
        {(loadingMessages && messages.length === 0) ? (
          <p>Cargando mensajes...</p>
        ) : (
          messages.length === 0 ? (
            <p className="text-gray-500">No hay mensajes.</p>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.uuid} 
                className={`mb-4 flex ${msg.senderUuid === userUuid ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`p-3 rounded-lg max-w-xs break-words ${msg.senderUuid === userUuid ? 'bg-blue-200' : 'bg-green-200'}`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <small className="block mt-1 text-xs text-gray-600">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </small>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* Formulario de envío */}
      <form onSubmit={handleSubmit} className="flex">
        <textarea
          className="w-full p-3 border rounded-l"
          placeholder="Escribe tu mensaje..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="3"
        ></textarea>
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-3 rounded-r"
        >
          {sending ? 'Enviando...' : 'Enviar'}
        </button>
      </form>

      {/* Mensajes de estado */}
      {success && <p className="mt-4 text-green-600">Mensaje enviado correctamente.</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
};

export default MessageToAdmin;
