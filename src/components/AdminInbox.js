// src/components/AdminMailbox.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMessages, deleteConversation, markMessagesAsRead } from '../redux/actions/messageActions';
import { fetchUsuarios } from '../redux/actions/usuarios';
import { FaInbox, FaSearch, FaUserAlt, FaArrowLeft, FaTrash, FaReply } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AdminMailbox = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const adminData = JSON.parse(localStorage.getItem('userData'));
  const adminId = adminData?.uuid;

  const { loading: loadingMessages, messages, error: errorMessages } = useSelector(
    (state) => state.messages.list
  );
  const { loading: loadingUsers, usuarios, error: errorUsers } = useSelector(
    (state) => state.usuarios
  );

  // Configuración de paginación y filtro alfabético
  const itemsPerPage = 5;
  const [currentPageInbox, setCurrentPageInbox] = useState(1);
  const [currentPageUsuarios, setCurrentPageUsuarios] = useState(1);
  const [selectedIndexRange, setSelectedIndexRange] = useState('Todos');

  const [activeTab, setActiveTab] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [filterStatus, setFilterStatus] = useState('todos');

  // Cargar mensajes al montar (pestaña "inbox")
  useEffect(() => {
    if (activeTab === 'inbox') {
      dispatch(getMessages());
    }
  }, [dispatch, activeTab]);

  // Agrupar mensajes enviados al admin por conversación
  useEffect(() => {
    if (activeTab === 'inbox' && messages) {
      const incomingMessages = messages.filter((msg) => msg.recipientUuid === adminId);

      const conversations = incomingMessages.reduce((acc, msg) => {
        const key = msg.senderUuid;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(msg);
        return acc;
      }, {});

      const convArray = Object.entries(conversations).map(([userUuid, msgs]) => {
        const sorted = msgs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const lastMessage = sorted[0];
        const userName = lastMessage.sender
          ? `${lastMessage.sender.nombre} ${lastMessage.sender.apellido}`
          : 'Desconocido';

        return { userUuid, userName, lastMessage, messages: sorted };
      });

      let convFiltered = searchQuery.trim()
        ? convArray.filter((conv) =>
            conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : convArray;

      if (filterStatus === 'pendientes') {
        convFiltered = convFiltered.filter(
          (conv) => conv.lastMessage.senderUuid !== adminId && conv.lastMessage.isRead === false
        );
      } else if (filterStatus === 'respondidos') {
        convFiltered = convFiltered.filter(
          (conv) =>
            conv.lastMessage.senderUuid === adminId ||
            (conv.lastMessage.senderUuid !== adminId && conv.lastMessage.isRead === true)
        );
      }

      convFiltered.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

      setFilteredConversations(convFiltered);
    }
  }, [messages, activeTab, searchQuery, adminId, filterStatus]);

  useEffect(() => {
    if (activeTab === 'usuarios' && searchQuery.trim().length >= 3) {
      dispatch(fetchUsuarios({ nombre: searchQuery.trim() })); 
    }
  }, [dispatch, activeTab, searchQuery]);

  const handleDelete = async (userUuid, e) => {
    e.stopPropagation();
    try {
      await dispatch(deleteConversation(userUuid));
      dispatch(getMessages());
    } catch (error) {
      console.error("Error al eliminar la conversación:", error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setFilterStatus('todos');
    // Reiniciamos la paginación al cambiar de pestaña
    setCurrentPageInbox(1);
    setCurrentPageUsuarios(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (activeTab === 'inbox') {
      setCurrentPageInbox(1);
    } else {
      setCurrentPageUsuarios(1);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleConversationClick = (selectedUserUuid) => {
    if (!selectedUserUuid) return;
    navigate(`/admin/chat/${selectedUserUuid}`);
  };

  // Al responder se marca como leídos, se actualiza la lista y se navega al chat
  const handleResponse = async (userUuid, e) => {
    e.stopPropagation();
    try {
      await dispatch(markMessagesAsRead(userUuid));

      setFilteredConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.userUuid === userUuid
            ? { ...conv, lastMessage: { ...conv.lastMessage, isRead: true } }
            : conv
        )
      );

      await dispatch(getMessages());
      navigate(`/admin/chat/${userUuid}`);
    } catch (error) {
      console.error("Error al marcar mensajes como leídos:", error);
    }
  };

  const handleUserClick = (userUuid) => {
    if (!userUuid) return;
    navigate(`/admin/chat/${userUuid}`);
  };

  // --- Paginación para Inbox ---
  const totalPagesInbox = Math.ceil(filteredConversations.length / itemsPerPage);
  const paginatedConversations = filteredConversations.slice(
    (currentPageInbox - 1) * itemsPerPage,
    currentPageInbox * itemsPerPage
  );

  // --- Filtro, Ordenación y Paginación para Usuarios ---
  const filteredUsuarios = usuarios
    .filter((usr) =>
      `${usr.nombre} ${usr.apellido} ${usr.email}`.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((usr) => {
      if (selectedIndexRange === 'Todos') return true;
      const firstLetter = usr.nombre.charAt(0).toUpperCase();
      const [start, end] = selectedIndexRange.split('-');
      return firstLetter >= start && firstLetter <= end;
    });

  // Ordenar por apellido y, en caso de empate, por nombre
  const sortedUsuarios = [...filteredUsuarios].sort((a, b) => {
    const apellidoA = a.apellido.toLowerCase();
    const apellidoB = b.apellido.toLowerCase();
    if (apellidoA < apellidoB) return -1;
    if (apellidoA > apellidoB) return 1;
    const nombreA = a.nombre.toLowerCase();
    const nombreB = b.nombre.toLowerCase();
    if (nombreA < nombreB) return -1;
    if (nombreA > nombreB) return 1;
    return 0;
  });

  const totalPagesUsuarios = Math.ceil(sortedUsuarios.length / itemsPerPage);
  const paginatedUsuarios = sortedUsuarios.slice(
    (currentPageUsuarios - 1) * itemsPerPage,
    currentPageUsuarios * itemsPerPage
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Barra superior */}
      <div className="flex items-center mb-4">
        <button
          onClick={handleBack}
          className="flex items-center px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors duration-200 mr-4"
        >
          <FaArrowLeft className="mr-2" /> Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Casilla de Mensajes</h1>
      </div>

      {/* Pestañas */}
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => handleTabChange('inbox')}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'inbox'
              ? 'bg-indigo-200 text-indigo-800'
              : 'text-gray-700 hover:bg-indigo-100'
          }`}
        >
          <FaInbox className="mr-2" /> Inbox
        </button>
        <button
          onClick={() => handleTabChange('usuarios')}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'usuarios'
              ? 'bg-green-200 text-green-800'
              : 'text-gray-700 hover:bg-green-100'
          }`}
        >
          <FaUserAlt className="mr-2" /> Buscar Usuarios
        </button>
      </div>

      {/* Filtros adicionales para Inbox */}
      {activeTab === 'inbox' && (
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setFilterStatus('todos')}
            className={`px-3 py-1 rounded ${filterStatus === 'todos' ? 'bg-gray-300' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterStatus('pendientes')}
            className={`px-3 py-1 rounded ${filterStatus === 'pendientes' ? 'bg-red-300' : 'bg-red-100 hover:bg-red-200'}`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFilterStatus('respondidos')}
            className={`px-3 py-1 rounded ${filterStatus === 'respondidos' ? 'bg-green-300' : 'bg-green-100 hover:bg-green-200'}`}
          >
            Respondidos
          </button>
        </div>
      )}

      {/* Buscador */}
      <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 mb-4">
        <FaSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder={
            activeTab === 'inbox'
              ? 'Buscar en conversaciones...'
              : 'Buscar usuario por nombre, apellido o email...'
          }
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full focus:outline-none"
        />
      </div>

      {activeTab === 'inbox' ? (
        <div className="bg-white p-4 rounded-lg shadow-md">
          {loadingMessages ? (
            <p>Cargando conversaciones...</p>
          ) : errorMessages ? (
            <p className="text-red-600">{errorMessages}</p>
          ) : filteredConversations.length === 0 ? (
            <p className="text-gray-600">No se encontraron conversaciones.</p>
          ) : (
            <>
              <ul className="divide-y divide-gray-200">
                {paginatedConversations.map((conv) => (
                  <li
                    key={conv.userUuid}
                    className="py-4 flex items-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleConversationClick(conv.userUuid)}
                  >
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-gray-800">{conv.userName}</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-500">
                            {new Date(conv.lastMessage.createdAt).toLocaleString()}
                          </p>
                          {conv.lastMessage.senderUuid !== adminId && conv.lastMessage.isRead === false ? (
                            <span className="bg-red-200 text-red-800 text-xs px-2 py-1 rounded">
                              Pendiente
                            </span>
                          ) : (
                            <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded">
                              Respondido
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 mt-1 line-clamp-1">{conv.lastMessage.content}</p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={(e) => handleResponse(conv.userUuid, e)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaReply />
                      </button>
                      <button
                        onClick={(e) => handleDelete(conv.userUuid, e)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {/* Paginación para Inbox */}
              {totalPagesInbox > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  <button
                    onClick={() => setCurrentPageInbox(currentPageInbox - 1)}
                    disabled={currentPageInbox === 1}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  {Array.from({ length: totalPagesInbox }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPageInbox(index + 1)}
                      className={`px-3 py-1 rounded ${
                        currentPageInbox === index + 1 ? 'bg-indigo-500 text-white' : 'bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPageInbox(currentPageInbox + 1)}
                    disabled={currentPageInbox === totalPagesInbox}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow-md">
          {/* Filtro por índice alfabético para Usuarios */}
          <div className="flex space-x-4 mb-4">
            {['Todos', 'A-C', 'D-F', 'G-I', 'J-L', 'M-O', 'P-R', 'S-U', 'V-Z'].map((range) => (
              <button
                key={range}
                onClick={() => {
                  setSelectedIndexRange(range);
                  setCurrentPageUsuarios(1);
                }}
                className={`px-3 py-1 rounded ${
                  selectedIndexRange === range ? 'bg-blue-300' : 'bg-blue-100 hover:bg-blue-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          {loadingUsers ? (
            <p>Cargando usuarios...</p>
          ) : errorUsers ? (
            <p className="text-red-600">{errorUsers}</p>
          ) : sortedUsuarios.length === 0 ? (
            <p className="text-gray-600">No se encontraron usuarios.</p>
          ) : (
            <>
              <ul className="divide-y divide-gray-200">
                {paginatedUsuarios.map((usr) => (
                  <li
                    key={usr.uuid}
                    className="py-4 flex items-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleUserClick(usr.uuid)}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {usr.nombre} {usr.apellido}
                      </p>
                      <p className="text-gray-600 mt-1 text-sm">{usr.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
              {/* Paginación para Usuarios */}
              {totalPagesUsuarios > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  <button
                    onClick={() => setCurrentPageUsuarios(currentPageUsuarios - 1)}
                    disabled={currentPageUsuarios === 1}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  {Array.from({ length: totalPagesUsuarios }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPageUsuarios(index + 1)}
                      className={`px-3 py-1 rounded ${
                        currentPageUsuarios === index + 1 ? 'bg-green-500 text-white' : 'bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPageUsuarios(currentPageUsuarios + 1)}
                    disabled={currentPageUsuarios === totalPagesUsuarios}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminMailbox;
