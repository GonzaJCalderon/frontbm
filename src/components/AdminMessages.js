import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  getMessagesByUser,
  sendReplyToUser,
  assignMessageToAdmin,
  getMessages,
  markUserMessagesAsRead,
    markMessagesAsRead 
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
    // console.log("🧪 Usuario cargado:", user);
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
    await dispatch(markMessagesAsRead(adminUuid)); // ✅ agrega esto
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
    <div className="bg-background min-h-[calc(100vh-80px)] font-inter flex flex-col p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full flex flex-col flex-1 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-level-2 overflow-hidden">
        
        {/* Header Premium */}
        <div className="bg-primary text-white p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="flex items-center justify-center p-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all shadow-sm">
              <FaArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold font-montserrat tracking-tight uppercase">{userName}</h1>
              <p className="text-inverse-primary text-xs font-medium mt-0.5">Hilo de conversación</p>
            </div>
          </div>
        </div>

        {/* Chat container */}
        <div
          ref={chatContainerRef}
          className="bg-surface p-6 h-[500px] overflow-y-auto space-y-4"
        >
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-on-surface-variant font-medium animate-pulse">Cargando mensajes...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-error font-semibold bg-error-container px-4 py-2 rounded-lg">{error}</p>
            </div>
          ) : localMessages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-outline font-medium italic">No hay mensajes en esta conversación.</p>
            </div>
          ) : (
            localMessages
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((msg) => (
                <div
                  key={msg.uuid}
                  className={`flex ${msg.senderUuid === adminUuid ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md p-4 text-sm shadow-sm ${
                      msg.senderUuid === adminUuid
                        ? 'bg-primary text-white rounded-2xl rounded-br-sm'
                        : 'bg-surface-container-high text-on-surface rounded-2xl rounded-bl-sm border border-outline-variant'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                    <small className={`block mt-2 text-[10px] font-semibold text-right ${msg.senderUuid === adminUuid ? 'text-inverse-primary' : 'text-outline'}`}>
                      {formatDate(msg.createdAt)}
                    </small>
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Input de envío */}
        <div className="bg-surface-container-low p-4 border-t border-outline-variant flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe tu mensaje aquí..."
            className="flex-1 bg-white border border-outline-variant px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-on-surface"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={isSending || !newMessage.trim()}
            className={`flex items-center justify-center bg-primary text-white w-12 h-12 rounded-xl transition-all shadow-sm ${isSending || !newMessage.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-container hover:shadow-md'}`}
          >
            <FaPaperPlane className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
