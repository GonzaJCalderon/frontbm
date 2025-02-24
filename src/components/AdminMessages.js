import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMessagesByUser, sendMessage, markMessagesAsRead, getMessages } from '../redux/actions/messageActions';
import { getUserByUuid } from '../redux/actions/usuarios'; // ✅ Importamos la nueva acción
import { FaArrowLeft, FaPaperPlane } from 'react-icons/fa';

const AdminMessages = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userUuid } = useParams();
  const chatContainerRef = useRef(null);

  // Obtener el admin autenticado
  const adminData = JSON.parse(localStorage.getItem('userData')) || {};
  const adminUuid = adminData?.uuid;

  // Estado para almacenar el nombre del usuario y mensajes
  const [userName, setUserName] = useState("Usuario");
  const [localMessages, setLocalMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Obtener mensajes desde Redux
  const { loading, messages, error } = useSelector((state) => state.messages.list);

  useEffect(() => {
    if (!userUuid || !adminUuid) return;

    // ✅ 1. Obtener los mensajes del usuario
    dispatch(getMessagesByUser(userUuid)).then((response) => {
      if (response?.payload?.length > 0) {
        setLocalMessages(response.payload);
      }
    });

    // ✅ 2. Obtener el usuario por su UUID y actualizar el nombre en la barra
    dispatch(getUserByUuid(userUuid)).then((user) => {
      if (user) {
        setUserName(`${user.nombre} ${user.apellido}`);
      }
    });

    dispatch(markMessagesAsRead(userUuid, adminUuid));
  }, [dispatch, userUuid, adminUuid]);

  useEffect(() => {
    if (messages?.length > 0) {
      setLocalMessages((prevMessages) => {
        const mergedMessages = [...prevMessages, ...messages];
        return mergedMessages.filter((msg, index, self) =>
          index === self.findIndex((m) => m.uuid === msg.uuid) // ✅ Evita duplicados
        );
      });
    }
  }, [messages]);

  // Auto-scroll al final del chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [localMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userUuid || !adminUuid) return;

    const tempMessage = {
      uuid: `temp-${Date.now()}`,
      senderUuid: adminUuid,
      recipientUuid: userUuid,
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
    };

    setLocalMessages((prevMessages) => [...prevMessages, tempMessage]);

    await dispatch(sendMessage({
      senderUuid: adminUuid,
      recipientUuid: userUuid,
      content: newMessage.trim(),
    }));

    dispatch(getMessagesByUser(userUuid));
    dispatch(getMessages());
    setNewMessage('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 🔥 Barra superior con el nombre real del usuario */}
      <div className="flex items-center justify-between bg-blue-500 text-white p-4 rounded-t-lg shadow-md">
        <button onClick={() => navigate(-1)} className="flex items-center">
          <FaArrowLeft className="mr-2" /> Volver
        </button>
        <h1 className="text-xl font-bold">{userName}</h1> {/* ✅ Nombre del usuario correcto */}
        <div></div>
      </div>

      {/* 🔥 Lista de mensajes */}
      <div ref={chatContainerRef} className="bg-gray-100 p-4 rounded-b-lg shadow-md h-96 overflow-y-auto">
        {loading ? (
          <p>Cargando mensajes...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : localMessages.length === 0 ? (
          <p className="text-gray-600">No hay mensajes en esta conversación.</p>
        ) : (
          <ul className="space-y-3">
            {localMessages
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // ✅ Ordena cronológicamente
              .map((msg) => (
                <li key={msg.uuid} className={`flex ${msg.senderUuid === adminUuid ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 max-w-xs rounded-lg shadow-md text-sm ${
                    msg.senderUuid === adminUuid
                      ? 'bg-blue-500 text-white'  // ✅ Mensaje del admin (azul)
                      : 'bg-gray-300 text-gray-800'  // ✅ Mensaje del usuario (gris)
                  }`}>
                    <p className="font-medium">{msg.content}</p>
                    <small className="block mt-1 text-xs text-gray-200">{formatDate(msg.createdAt)}</small>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>

      {/* 🔥 Enviar mensaje */}
      <div className="flex mt-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className="flex-1 border px-3 py-2 rounded-l-lg"
        />
        <button onClick={handleSendMessage} className="bg-blue-500 text-white px-4 py-2 rounded-r-lg">
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default AdminMessages;
