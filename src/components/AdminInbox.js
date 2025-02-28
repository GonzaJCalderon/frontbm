import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMessages,
  assignMessageToAdmin,
  markMessagesAsRead,
  sendMessage,
} from "../redux/actions/messageActions";

import { searchItems } from "../redux/actions/search";

import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminMailbox = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Estado inicial con localStorage para evitar re-render innecesario
  const [adminUuid, setAdminUuid] = useState(() => {
    const adminData = JSON.parse(localStorage.getItem("userData"));
    return adminData?.uuid || null;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const users = useSelector((state) => state.search.usuarios); // ✅ Usa Redux

  const [selectedUser, setSelectedUser] = useState(null); // ✅ Usuario seleccionado
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!adminUuid) {
      const adminData = JSON.parse(localStorage.getItem("userData"));
      if (adminData?.uuid) {
        setAdminUuid(adminData.uuid);
      }
    }
  }, [adminUuid]);

  console.log("🔑 adminUuid obtenido:", adminUuid);

  // Obtener mensajes desde Redux
  const { loading, messages = [], error } = useSelector((state) => ({
    loading: state.messages.list?.loading || false,
    messages: state.messages.list?.messages || [],
    error: state.messages.list?.error || null,
  }));

  const [activeTab, setActiveTab] = useState("all");

  // Llamar a `getMessages()` cuando `adminUuid` esté definido y los mensajes aún no se hayan cargado
  useEffect(() => {
    if (!adminUuid) {
      const adminData = JSON.parse(localStorage.getItem("userData"));
      if (adminData?.uuid) {
        setAdminUuid(adminData.uuid);
      }
    }
  
    if (adminUuid && !messagesLoaded) {
      console.log("📩 Ejecutando getMessages() con adminUuid:", adminUuid);
      dispatch(getMessages(adminUuid))
        .then(() => {
          setMessagesLoaded(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("❌ Error en getMessages:", err);
          setIsLoading(false);
        });
    }
  }, [adminUuid, messagesLoaded, dispatch]);
  
  

  // Mostrar pantalla de carga hasta que todo esté listo
  if (isLoading || !adminUuid) {
    return <p className="text-blue-600 font-semibold">🔄 Cargando mensajes...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!messages || messages.length === 0) {
    return <p>No hay mensajes.</p>;
  }

  console.log("📩 Mensajes obtenidos:", messages.length);

  // Filtrar mensajes que no sean del admin y asegurar agrupación correcta
  const userMessages = messages.filter((msg) => msg.senderUuid !== adminUuid);

  // Agrupar mensajes por usuario (último mensaje de cada usuario)
  const groupedMessagesMap = new Map();
  userMessages.forEach((msg) => {
    if (!groupedMessagesMap.has(msg.senderUuid) || new Date(msg.createdAt) > new Date(groupedMessagesMap.get(msg.senderUuid).createdAt)) {
      groupedMessagesMap.set(msg.senderUuid, msg);
    }
  });

  const groupedMessages = Array.from(groupedMessagesMap.values());

  console.log("📩 Mensajes agrupados por usuario:", groupedMessages.length);

  // Filtrar mensajes por estado
  const pendingMessages = groupedMessages.filter((msg) => !msg.isRead);
  const respondedMessages = groupedMessages.filter((msg) => msg.isRead);
// 🔥 Ahora solo asigna el mensaje si nadie lo ha respondido antes
const handleOpenChat = async (messageUuid, senderUuid, assignedAdminUuid) => {
  try {
    if (!assignedAdminUuid) { // ✅ Solo asigna si el mensaje aún no tiene un admin
      console.log(`📩 Asignando mensaje ${messageUuid} al admin ${adminUuid}`);
      await dispatch(assignMessageToAdmin({ messageUuid, adminUuid }));
    }

    setTimeout(async () => {
      await dispatch(markMessagesAsRead(senderUuid));
    }, 500);

    setActiveTab("responded");
    dispatch(getMessages()); // 🔄 Recargar mensajes

    navigate(`/admin/chat/${senderUuid}`);
  } catch (error) {
    console.error("❌ Error al abrir chat:", error);
  }
};

const handleSendMessage = async (recipientUuid) => {
  if (!newMessage.trim()) return;

  try {
    await dispatch(sendMessage({
      senderUuid: adminUuid,
      recipientUuid: recipientUuid,
      content: newMessage.trim(),
    }));

    // 🔄 Recargar mensajes después de enviar
    dispatch(getMessages());

    setNewMessage('');
    setSelectedUser(null); // 🔥 Cerrar el cuadro después de enviar
  } catch (error) {
    console.error("❌ Error enviando mensaje:", error);
  }
};

const handleSearchUsers = (e) => {
  const term = e.target.value;
  setSearchTerm(term);

  if (term.length > 2) { // 🔥 Buscar solo si hay al menos 3 caracteres
    dispatch(searchItems(term, "nombre")); // ✅ Usa Redux para hacer la solicitud
  }
};

  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
        >
          <FaArrowLeft className="mr-2" /> Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-800 ml-4">Casilla de Mensajes</h1>
      </div>
      <div className="mb-4">
  <input
    type="text"
    placeholder="Buscar usuario..."
    value={searchTerm}
    onChange={handleSearchUsers}
    className="border px-3 py-2 w-full rounded-lg"
  />

  {users.length > 0 && (
    <ul className="bg-white shadow-md rounded-lg mt-2">
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


      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-lg ${activeTab === "all" ? "bg-gray-300" : "hover:bg-gray-200"}`}
        >
          📩 Todos ({groupedMessages.length})
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 rounded-lg ${activeTab === "pending" ? "bg-red-300" : "hover:bg-red-100"}`}
        >
          🕒 Pendientes ({pendingMessages.length})
        </button>
        <button
          onClick={() => setActiveTab("responded")}
          className={`px-4 py-2 rounded-lg ${activeTab === "responded" ? "bg-green-300" : "hover:bg-green-100"}`}
        >
          ✅ Respondidos ({respondedMessages.length})
        </button>
      </div>

{selectedUser && (
  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
    <p className="text-lg font-semibold">Enviar mensaje a: {selectedUser.nombre} {selectedUser.apellido}</p>
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


      <div className="bg-white p-4 rounded-lg shadow-md">
  <ul className="divide-y divide-gray-200">
    {groupedMessages.map((msg) => (
      <li
        key={msg.uuid}
        className={`py-4 flex items-center justify-between cursor-pointer transition-colors px-4 rounded-lg ${
          msg.isRead ? "bg-green-100 hover:bg-green-200" : "bg-red-100 hover:bg-red-200"
        } ${!msg.assignedAdminUuid ? "border-l-4 border-yellow-500" : ""}`} // 🔥 Borde amarillo si no está asignado
        onClick={() => handleOpenChat(msg.uuid, msg.senderUuid, msg.assignedAdminUuid)}
      >
        <div className="flex-1">
          <p className="font-medium text-gray-800">
            {msg.sender?.nombre ? `${msg.sender.nombre} ${msg.sender.apellido}` : "Desconocido"}
          </p>
          <p className="text-gray-600 mt-1">{msg.content}</p>
        </div>
        <div className="text-sm text-gray-500">
          {msg.assignedAdmin
            ? `📌 Asignado a: ${msg.assignedAdmin.nombre} ${msg.assignedAdmin.apellido}`
            : "⚠️ No asignado"}
        </div>
      </li>
    ))}
  </ul>
</div>


    </div>
  );
};

export default AdminMailbox;
