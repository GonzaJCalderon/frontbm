import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  getMessagesByUser,
  sendReplyToUser,
  assignMessageToAdmin,
  getMessages,
  markUserMessagesAsRead,
} from '../redux/actions/messageActions';
import { getUserByUuid } from '../redux/actions/usuarios';
import { FaArrowLeft, FaPaperPlane } from 'react-icons/fa';

const AdminMessages = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userUuid } = useParams();
  const chatContainerRef = useRef(null);

  const adminData = JSON.parse(localStorage.getItem('userData')) || {};
  const adminUuid = adminData?.uuid;

  const [userName, setUserName] = useState("Usuario");
  const [localMessages, setLocalMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const { loading, messages, error } = useSelector((state) => state.messages.list);

useEffect(() => {
  if (!userUuid || !adminUuid) return;

  dispatch(getMessagesByUser(userUuid)).then((res) => {
    if (res?.payload?.length > 0) {
      setLocalMessages(res.payload);
    }
  });

  dispatch(markUserMessagesAsRead(userUuid, adminUuid));

getUserByUuid(userUuid)
  .then((user) => {
    console.log("🧪 Usuario cargado:", user);
    if (user?.nombre && user?.apellido) {
      const rol = user.rol || 'desconocido';
      const empresaName = user.empresa?.razonSocial;

      let empresaText = '';
      if (rol && empresaName) {
        empresaText = ` (${rol} en ${empresaName})`;
      } else if (rol) {
        empresaText = ` (${rol})`;
      }

      setUserName(`${user.nombre} ${user.apellido}${empresaText}`);
    } else {
      setUserName("Usuario desconocido");
    }
    })
    .catch((err) => {
      console.error("❌ Error al obtener el usuario:", err);
      setUserName("Usuario desconocido");
    });
}, [dispatch, userUuid, adminUuid]);


  useEffect(() => {
    if (!messages?.length) return;

    setLocalMessages((prevMessages) => {
      const realUuids = new Set(messages.map((m) => m.uuid));
      const filteredPrev = prevMessages.filter(
        (m) => !m.uuid.startsWith("temp-") || !realUuids.has(m.uuid.replace("temp-", ""))
      );
      const merged = [...filteredPrev, ...messages];
      return merged.filter((msg, idx, self) => idx === self.findIndex((m) => m.uuid === msg.uuid));
    });
  }, [messages]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [localMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const tempMsg = {
      uuid: `temp-${Date.now()}`,
      senderUuid: adminUuid,
      recipientUuid: userUuid,
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
    };

    setLocalMessages((prev) => [...prev, tempMsg]);
    setIsSending(true);
    setNewMessage('');

    try {
      const lastUnassigned = localMessages
        .filter(msg => msg.senderUuid === userUuid && !msg.assignedAdminUuid)
        .pop();

      if (lastUnassigned) {
        await dispatch(assignMessageToAdmin({ messageUuid: lastUnassigned.uuid, adminUuid }));
      }

      await dispatch(sendReplyToUser({
        recipientUuid: userUuid,
        content: tempMsg.content
      }));

      await dispatch(getMessagesByUser(userUuid));
      await dispatch(getMessages());
    } catch (err) {
      console.error("❌ Error enviando mensaje:", err);
    }

    setIsSending(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-blue-600 text-white p-4 rounded-t-lg shadow">
        <button onClick={() => navigate(-1)} className="flex items-center text-sm hover:underline">
          <FaArrowLeft className="mr-2" /> Volver
        </button>
        <h1 className="text-lg font-semibold">{userName}</h1>
        <div />
      </div>

      {/* Chat container */}
      <div
        ref={chatContainerRef}
        className="bg-gray-50 border border-gray-200 p-4 h-[400px] overflow-y-auto space-y-3"
      >
        {loading ? (
          <p className="text-gray-500">Cargando mensajes...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : localMessages.length === 0 ? (
          <p className="text-gray-500">No hay mensajes en esta conversación.</p>
        ) : (
          localMessages
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map((msg) => (
              <div
                key={msg.uuid}
                className={`flex ${msg.senderUuid === adminUuid ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg text-sm shadow ${
                    msg.senderUuid === adminUuid
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-300 text-gray-900 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                  <small className="block mt-1 text-xs text-gray-100">
                    {formatDate(msg.createdAt)}
                  </small>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Input de envío */}
      <div className="flex mt-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className="flex-1 border px-3 py-2 rounded-l-md focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
        />
        <button
          onClick={handleSendMessage}
          disabled={isSending}
          className={`bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 ${isSending ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default AdminMessages;
