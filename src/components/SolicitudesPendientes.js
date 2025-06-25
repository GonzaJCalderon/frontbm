import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPendingRegistrations,
  approveUser,
  denyRegistration,
} from '../redux/actions/usuarios';
import {
  notification,
  Modal,
  Input,
  Button,
  Table,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  LogoutOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { fetchApprovedUsers } from '../redux/actions/usuarios';


const SolicitudesPendientes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pendingRegistrations, loading, error } = useSelector((state) => state.usuarios);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedUserUuid, setSelectedUserUuid] = useState(null);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [filters, setFilters] = useState({});
  const [loadingUuid, setLoadingUuid] = useState(null);

  const userData = JSON.parse(localStorage.getItem('userData'));

  useEffect(() => {
    dispatch(fetchPendingRegistrations());
  }, [dispatch]);

  useEffect(() => {
    if (pendingRegistrations?.length > 0) {
      const sorted = [...pendingRegistrations].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setFilteredRegistrations(sorted);
    }
  }, [pendingRegistrations]);

  const handleSearch = (newFilters) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      const filtered = pendingRegistrations.filter((u) => {
        const matchNombre = updated.nombre
          ? u.nombre?.toLowerCase().includes(updated.nombre.toLowerCase())
          : true;
        const matchApellido = updated.apellido
          ? u.apellido?.toLowerCase().includes(updated.apellido.toLowerCase())
          : true;
        const matchDni = updated.dni
          ? u.dni?.includes(updated.dni)
          : true;
        const matchEmail = updated.email
          ? u.email?.toLowerCase().includes(updated.email.toLowerCase())
          : true;
        return matchNombre && matchApellido && matchDni && matchEmail;
      });
      setFilteredRegistrations(filtered);
      return updated;
    });
  };

  const handleApprove = async (uuid) => {
  setLoadingUuid(uuid);
  const fechaAprobacion = new Date().toISOString();
  const aprobadoPor = userData.uuid;
  const aprobadoPorNombre = `${userData.nombre} ${userData.apellido}`;

  try {
    await dispatch(approveUser(uuid, {
      estado: 'aprobado',
      fechaAprobacion,
      aprobadoPor,
      aprobadoPorNombre,
    }));

    notification.success({ message: 'Usuario aprobado ✅' });

    // 🔥 Quitar el usuario del estado actual (ya lo tenés en memoria)
    setFilteredRegistrations(prev => prev.filter((u) => u.uuid !== uuid));

    // 🧠 Opcional: actualizar el estado global para approvedUsers también
    dispatch(fetchApprovedUsers());

    // También opcional: actualizar los pendientes de nuevo (si fue exitoso)
    dispatch(fetchPendingRegistrations());

  } catch (err) {
    notification.error({ message: 'Error al aprobar usuario ❌' });
  } finally {
    setLoadingUuid(null);
  }
};


  const showModal = (uuid) => {
    const user = filteredRegistrations.find((u) => u.uuid === uuid);
    if (user?.estado === 'rechazado') {
      notification.warning({ message: 'Ya fue rechazado' });
      return;
    }
    setSelectedUserUuid(uuid);
    setIsModalVisible(true);
  };

  const handleDeny = async () => {
    if (!rejectionReason.trim()) {
      notification.warning({ message: 'Motivo requerido ⚠️' });
      return;
    }
    setLoadingUuid(selectedUserUuid);
    try {
      await dispatch(denyRegistration(selectedUserUuid, {
        estado: 'rechazado',
        motivoRechazo: rejectionReason,
        fechaRechazo: new Date().toISOString(),
        rechazadoPor: userData.uuid,
      }));
      notification.success({ message: 'Usuario rechazado ❌' });
      setFilteredRegistrations((prev) => prev.filter((u) => u.uuid !== selectedUserUuid));
      await dispatch(fetchPendingRegistrations());
      setIsModalVisible(false);
      setRejectionReason('');
    } catch (err) {
      notification.error({ message: 'Error al rechazar usuario ❌' });
    } finally {
      setLoadingUuid(null);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setRejectionReason('');
  };

// 📌 CORREGIDO Columnas frontend sin duplicaciones y alias correcto:
const columns = [
  {
    title: 'Tipo',
    dataIndex: 'tipo',
    render: tipo => tipo === 'juridica' ? 'Empresa' : 'Persona Física',
  },
  {
    title: 'Rol en Empresa',
    render: usuario => usuario.rolEmpresa ? usuario.rolEmpresa.charAt(0).toUpperCase() + usuario.rolEmpresa.slice(1) : usuario.tipo === 'juridica' ? 'Responsable' : 'Sin rol',
  },
  {
    title: 'Empresa',
    render: usuario =>
      usuario.empresaAsignada?.razonSocial ||
      (usuario.tipo === 'juridica' ? 'Empresa propia' : 'No asignada'),
  },
  {
    title: 'Nombre / Razón Social',
    render: user => user.tipo === 'juridica' ? user.razonSocial || 'N/A' : `${user.nombre} ${user.apellido}`,
  },
  {
    title: 'Email',
    dataIndex: 'email',
  },
  {
    title: 'DNI',
    dataIndex: 'dni',
    render: dni => dni || 'N/A',
  },
  {
    title: 'CUIT',
    dataIndex: 'cuit',
    render: cuit => cuit || 'N/A',
  },
  {
    title: 'Dirección',
    dataIndex: 'direccion',
    render: direccion =>
      direccion
        ? [direccion.calle, direccion.altura, direccion.barrio, direccion.departamento].filter(Boolean).join(', ')
        : 'Sin Dirección',
  },
  {
    title: 'Fecha Solicitud',
    dataIndex: 'createdAt',
    sorter: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    render: createdAt => new Date(createdAt).toLocaleString(),
  },
  {
    title: 'Acciones',
    render: (_, user) => (
      <div className="flex gap-2">
        <Button onClick={() => handleApprove(user.uuid)} loading={loadingUuid === user.uuid}>
          Aprobar
        </Button>
        <Button onClick={() => showModal(user.uuid)} disabled={loadingUuid === user.uuid}>
          Denegar
        </Button>
      </div>
    ),
  },
];


  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/dashboard')}>
          Volver
        </Button>
        <div className="flex space-x-4">
          <Button icon={<HomeOutlined />} onClick={() => navigate('/admin/dashboard')}>
            Inicio
          </Button>
          <Button icon={<LogoutOutlined />} onClick={() => navigate('/home')}>
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Solicitudes de Registro Pendientes</h2>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <Input
          placeholder="Nombre"
          onChange={(e) => handleSearch({ nombre: e.target.value })}
          allowClear
        />
        <Input
          placeholder="Apellido"
          onChange={(e) => handleSearch({ apellido: e.target.value })}
          allowClear
        />
        <Input
          placeholder="DNI"
          onChange={(e) => handleSearch({ dni: e.target.value })}
          allowClear
        />
        <Input
          placeholder="Correo Electrónico"
          onChange={(e) => handleSearch({ email: e.target.value })}
          allowClear
        />
      </div>

      {loading ? (
        <p>Cargando solicitudes...</p>
      ) : (
        <Table
          locale={{ emptyText: 'No se encontraron solicitudes con los filtros aplicados.' }}
          dataSource={filteredRegistrations}
          columns={columns}
          rowKey="uuid"
          pagination={{ pageSize: 10 }}
        />
      )}

      {error && <p className="text-red-500">Error al cargar solicitudes: {error}</p>}

      <Modal
        title="Motivo de Rechazo"
        open={isModalVisible}
        onOk={handleDeny}
        onCancel={handleCancel}
      >
        <Input.TextArea
          rows={4}
          placeholder="Ingresa el motivo para rechazar"
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default SolicitudesPendientes;
