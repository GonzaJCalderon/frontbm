import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMessages,
  assignMessageToAdmin,
  markMessagesAsRead,
  sendReplyToUser,
} from "../redux/actions/messageActions";
import { searchItems } from "../redux/actions/search";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminMailbox = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const adminUuid = (() => {
    const adminData = JSON.parse(localStorage.getItem("userData"));
    return adminData?.uuid || null;
  })();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState("unread");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const users = useSelector((state) => state.search.usuarios);
  const { messages = [] } = useSelector((state) => state.messages.list);

  useEffect(() => {
    if (adminUuid) {
      dispatch(getMessages(adminUuid));
    }
  }, [adminUuid, dispatch]);

  const SYSTEM_UUID = "00000000-0000-0000-0000-000000000000";

  const userMessages = messages.filter(
    (msg) => msg.senderUuid !== adminUuid && msg.senderUuid !== SYSTEM_UUID
  );

  const groupedMessagesMap = new Map();
  const messageCounts = {};

  userMessages.forEach((msg) => {
    const senderId = msg.senderUuid;
    messageCounts[senderId] = (messageCounts[senderId] || 0) + 1;

    if (
      !groupedMessagesMap.has(senderId) ||
      new Date(msg.createdAt) > new Date(groupedMessagesMap.get(senderId).createdAt)
    ) {
      groupedMessagesMap.set(senderId, msg);
    }
  });

  const groupedMessages = Array.from(groupedMessagesMap.values());
  const assignedMessages = groupedMessages.filter((msg) => msg.assignedAdminUuid);
  const unreadMessages = groupedMessages.filter((msg) => !msg.isRead);
  const readMessages = groupedMessages.filter((msg) => msg.isRead);

  const getVisibleMessages = () => {
    switch (activeTab) {
      case "unread": return unreadMessages;
      case "read": return readMessages;
      case "assigned": return assignedMessages;
      default: return [];
    }
  };

  const visibleMessages = getVisibleMessages();

  const paginatedMessages = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return visibleMessages.slice(start, start + pageSize);
  }, [visibleMessages, currentPage]);

  const totalPages = Math.ceil(visibleMessages.length / pageSize);

  const handleOpenChat = async (messageUuid, senderUuid, assignedAdminUuid) => {
    try {
      if (!assignedAdminUuid) {
        await dispatch(assignMessageToAdmin({ messageUuid, adminUuid }));
      }

      await dispatch(markMessagesAsRead(senderUuid));
      await dispatch(getMessages());

      navigate(`/admin/chat/${senderUuid}`);
    } catch (err) {
      console.error("❌ Error al abrir el chat:", err);
    }
  };

  const handleSendMessage = async (recipientUuid) => {
    if (!newMessage.trim()) return;

    try {
      await dispatch(sendReplyToUser({ recipientUuid, content: newMessage.trim() }));
      dispatch(getMessages());
      setNewMessage('');
      setSelectedUser(null);
    } catch (err) {
      console.error("❌ Error al enviar mensaje:", err);
    }
  };

  const handleSearchUsers = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length >= 2) {
      dispatch(searchItems(term, 'users'));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="bg-background min-h-screen font-inter flex flex-col pb-8">
      {/* Header Premium */}
      <header className="bg-primary text-white px-8 py-5 flex justify-between items-center shadow-md mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center p-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all shadow-sm">
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold font-montserrat tracking-tight">Casilla de Mensajes</h1>
            <p className="text-inverse-primary text-sm font-medium mt-0.5">Gestión de consultas y notificaciones</p>
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto w-full px-8">
        {/* Buscador de usuarios */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-level-2 mb-6">
          <label className="block text-sm font-semibold text-primary mb-2 uppercase tracking-wide">Buscar Usuario</label>
          <input
            type="text"
            placeholder="Buscar por nombre o apellido..."
            value={searchTerm}
            onChange={handleSearchUsers}
            className="w-full border border-outline-variant px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-on-surface"
          />
          {users?.length > 0 && (
            <ul className="bg-white border border-outline-variant shadow-lg rounded-lg mt-2 max-h-40 overflow-y-auto">
              {users.map((user) => (
                <li
                  key={user.uuid}
                  className="px-4 py-3 cursor-pointer hover:bg-surface-container transition-colors border-b border-outline-variant last:border-0 font-medium text-on-surface"
                  onClick={() => setSelectedUser(user)}
                >
                  {user.nombre} {user.apellido}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button 
            onClick={() => { setActiveTab("unread"); setCurrentPage(1); }} 
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm border border-outline-variant ${activeTab === "unread" ? "bg-error text-white shadow-md border-transparent" : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"}`}
          >
            🕒 No leídos ({unreadMessages.length})
          </button>
          <button 
            onClick={() => { setActiveTab("read"); setCurrentPage(1); }} 
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm border border-outline-variant ${activeTab === "read" ? "bg-secondary text-white shadow-md border-transparent" : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"}`}
          >
            ✅ Leídos ({readMessages.length})
          </button>
          <button 
            onClick={() => { setActiveTab("assigned"); setCurrentPage(1); }} 
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm border border-outline-variant ${activeTab === "assigned" ? "bg-primary text-white shadow-md border-transparent" : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"}`}
          >
            📌 Asignados ({assignedMessages.length})
          </button>
        </div>

        {/* Composición de mensaje directo */}
        {selectedUser && (
          <div className="mb-6 p-6 bg-surface-container-low rounded-2xl border border-outline-variant shadow-sm">
            <h3 className="text-lg font-semibold font-montserrat text-primary mb-3">
              Nuevo mensaje para: <span className="text-secondary">{selectedUser.nombre} {selectedUser.apellido}</span>
            </h3>
            <textarea
              className="w-full p-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-on-surface mb-3 min-h-[100px]"
              placeholder="Escribe tu mensaje aquí..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                className="bg-primary hover:bg-primary-container text-white px-6 py-2 rounded-lg font-bold shadow-sm transition-colors"
                onClick={() => handleSendMessage(selectedUser.uuid)}
              >
                Enviar Mensaje
              </button>
            </div>
          </div>
        )}

        {/* Listado de mensajes paginados */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-level-2 overflow-hidden">
          {paginatedMessages.length === 0 ? (
            <div className="p-8 text-center text-outline font-medium italic">No hay mensajes en esta categoría.</div>
          ) : (
            <ul className="divide-y divide-outline-variant">
              {paginatedMessages.map((msg) => (
                <li
                  key={msg.uuid}
                  className={`p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer transition-colors ${
                    msg.isRead ? "bg-white hover:bg-surface-container-lowest" : "bg-error-container/30 hover:bg-error-container/50"
                  } ${!msg.assignedAdminUuid ? "border-l-4 border-l-yellow-500" : ""}`}
                  onClick={() => handleOpenChat(msg.uuid, msg.senderUuid, msg.assignedAdminUuid)}
                >
                  <div className="flex-1 mb-2 sm:mb-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-bold text-on-surface text-lg">
                        {msg.sender?.nombre ? `${msg.sender.nombre} ${msg.sender.apellido}` : "Desconocido"}
                      </p>
                      <span className="bg-surface-container px-2 py-0.5 rounded-full text-xs font-semibold text-on-surface-variant">
                        {messageCounts[msg.senderUuid] || 0} mensajes
                      </span>
                    </div>
                    <p className="text-on-surface-variant text-sm truncate max-w-[500px]">{msg.content}</p>
                  </div>
                  <div className="text-sm text-right flex flex-col sm:items-end">
                    <span className="text-outline font-medium mb-1">{formatDate(msg.createdAt)}</span>
                    {msg.assignedAdmin ? (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">
                        📌 Asignado: {msg.assignedAdmin.nombre}
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">
                        ⚠️ No asignado
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="bg-surface-container border-t border-outline-variant p-4 flex justify-between items-center text-sm font-medium text-on-surface-variant">
              <button
                className={`px-4 py-2 rounded-lg border ${currentPage === 1 ? 'bg-surface-container-lowest opacity-50 cursor-not-allowed border-transparent' : 'bg-white border-outline-variant hover:bg-surface-container-lowest shadow-sm'}`}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              <span className="font-montserrat">
                Página {currentPage} de {totalPages}
              </span>
              <button
                className={`px-4 py-2 rounded-lg border ${currentPage === totalPages ? 'bg-surface-container-lowest opacity-50 cursor-not-allowed border-transparent' : 'bg-white border-outline-variant hover:bg-surface-container-lowest shadow-sm'}`}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMailbox;
