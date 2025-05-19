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

  const [adminUuid, setAdminUuid] = useState(() => {
    const adminData = JSON.parse(localStorage.getItem("userData"));
    return adminData?.uuid || null;
  });

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
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200">
          <FaArrowLeft className="mr-2" /> Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-800 ml-4">Casilla de Mensajes</h1>
      </div>

      {/* Buscador de usuarios */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar usuario..."
          value={searchTerm}
          onChange={handleSearchUsers}
          className="border px-3 py-2 w-full rounded-lg"
        />
        {users?.length > 0 && (
          <ul className="bg-white shadow-md rounded-lg mt-2 max-h-40 overflow-y-auto">
            {users.map((user) => (
              <li
                key={user.uuid}
                className="p-2 cursor-pointer hover:bg-blue-100"
                onClick={() => setSelectedUser(user)}
              >
                {user.nombre} {user.apellido}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-4">
        <button onClick={() => { setActiveTab("unread"); setCurrentPage(1); }} className={`px-4 py-2 rounded-lg ${activeTab === "unread" ? "bg-red-300" : "hover:bg-red-100"}`}>
          🕒 No leídos ({unreadMessages.length})
        </button>
        <button onClick={() => { setActiveTab("read"); setCurrentPage(1); }} className={`px-4 py-2 rounded-lg ${activeTab === "read" ? "bg-green-300" : "hover:bg-green-100"}`}>
          ✅ Leídos ({readMessages.length})
        </button>
        <button onClick={() => { setActiveTab("assigned"); setCurrentPage(1); }} className={`px-4 py-2 rounded-lg ${activeTab === "assigned" ? "bg-blue-300" : "hover:bg-blue-100"}`}>
          📌 Asignados ({assignedMessages.length})
        </button>
      </div>

      {/* Composición de mensaje directo */}
      {selectedUser && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-lg font-semibold">
            Enviar mensaje a: {selectedUser.nombre} {selectedUser.apellido}
          </p>
          <textarea
            className="w-full p-2 border rounded-lg mt-2"
            placeholder="Escribe tu mensaje..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2"
            onClick={() => handleSendMessage(selectedUser.uuid)}
          >
            Enviar Mensaje
          </button>
        </div>
      )}

      {/* Listado de mensajes paginados */}
      <div className="bg-white p-4 rounded-lg shadow-md mt-4">
        <ul className="divide-y divide-gray-200">
          {paginatedMessages.map((msg) => (
            <li
              key={msg.uuid}
              className={`py-4 flex items-center justify-between cursor-pointer transition-colors px-4 rounded-lg ${
                msg.isRead ? "bg-green-100 hover:bg-green-200" : "bg-red-100 hover:bg-red-200"
              } ${!msg.assignedAdminUuid ? "border-l-4 border-yellow-500" : ""}`}
              onClick={() => handleOpenChat(msg.uuid, msg.senderUuid, msg.assignedAdminUuid)}
            >
              <div className="flex-1">
                <p className="font-medium text-gray-800">
                  {msg.sender?.nombre ? `${msg.sender.nombre} ${msg.sender.apellido}` : "Desconocido"}
                </p>
                <p className="text-gray-600 text-sm">
                  {messageCounts[msg.senderUuid] || 0} mensajes
                </p>
                <p className="text-gray-600 mt-1">{msg.content}</p>
              </div>
              <div className="text-sm text-gray-500 ml-4 text-right">
                <p>{formatDate(msg.createdAt)}</p>
                {msg.assignedAdmin
                  ? `📌 Asignado a: ${msg.assignedAdmin.nombre}`
                  : "⚠️ No asignado"}
              </div>
            </li>
          ))}
        </ul>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              className="px-3 py-1 bg-gray-200 rounded"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span className="text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            <button
              className="px-3 py-1 bg-gray-200 rounded"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMailbox;
