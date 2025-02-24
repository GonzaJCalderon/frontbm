import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMessages, assignMessageToAdmin, markMessagesAsRead } from '../redux/actions/messageActions';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AdminMailbox = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const adminData = JSON.parse(localStorage.getItem('userData'));
  const adminUuid = adminData?.uuid;

  const { loading, messages, error } = useSelector((state) => state.messages.list);
  const [activeTab, setActiveTab] = useState('all');

  // 🔥 Filtrar mensajes solo de usuarios (excluir los del admin)
  const userMessages = messages?.filter(msg => msg.senderUuid !== adminUuid) || [];

  // 🔥 Agrupar mensajes por usuario (solo muestra el último mensaje)
  const groupedMessages = Object.values(
    userMessages.reduce((acc, msg) => {
      acc[msg.senderUuid] = msg;
      return acc;
    }, {})
  );

  // 🔥 Filtrar mensajes por estado
  const pendingMessages = groupedMessages.filter(msg => !msg.isRead);
  const respondedMessages = groupedMessages.filter(msg => msg.isRead);

  // 🔥 Ordenar mensajes de más nuevo a más viejo
  const sortedMessages = (list) => list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  useEffect(() => {
    dispatch(getMessages());
  }, [dispatch]);

  // 🔥 Manejar clic en un mensaje: asignarlo al admin y abrir chat
  const handleOpenChat = async (messageUuid, senderUuid) => {
    try {
      await dispatch(assignMessageToAdmin({ messageUuid, adminUuid }));
      await dispatch(markMessagesAsRead(senderUuid, adminUuid));

      setActiveTab('responded');
      dispatch(getMessages());

      navigate(`/admin/chat/${senderUuid}`);
    } catch (error) {
      console.error('Error al abrir chat:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200">
          <FaArrowLeft className="mr-2" /> Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-800 ml-4">Casilla de Mensajes</h1>
      </div>

      {/* 🔥 Pestañas */}
      <div className="flex space-x-4 mb-4">
        <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-lg ${activeTab === 'all' ? 'bg-gray-300' : 'hover:bg-gray-200'}`}>
          📩 Todos ({groupedMessages.length})
        </button>
        <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 rounded-lg ${activeTab === 'pending' ? 'bg-red-300' : 'hover:bg-red-100'}`}>
          🕒 Pendientes ({pendingMessages.length})
        </button>
        <button onClick={() => setActiveTab('responded')} className={`px-4 py-2 rounded-lg ${activeTab === 'responded' ? 'bg-green-300' : 'hover:bg-green-100'}`}>
          ✅ Respondidos ({respondedMessages.length})
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        {loading ? (
          <p>Cargando mensajes...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : groupedMessages.length === 0 ? (
          <p className="text-gray-600">No hay mensajes.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {sortedMessages(groupedMessages).map((msg) => (
           <li
           key={msg.uuid}
           className={`py-4 flex items-center justify-between cursor-pointer transition-colors px-4 rounded-lg ${
             msg.isRead ? 'bg-green-100 hover:bg-green-200' : 'bg-red-100 hover:bg-red-200'
           }`}
           onClick={() => handleOpenChat(msg.uuid, msg.senderUuid)}
         >
           <div className="flex-1">
             <p className="font-medium text-gray-800">
               {msg.sender?.nombre ? `${msg.sender.nombre} ${msg.sender.apellido}` : 'Desconocido'}
             </p>
             <p className="text-gray-600 mt-1">{msg.content}</p>
           </div>
           <div className="text-sm text-gray-500">{formatDate(msg.createdAt)}</div>
         </li>
         
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminMailbox;
