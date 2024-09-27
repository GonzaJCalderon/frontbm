import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsuarios, deleteUsuario,fetchTransaccionesByAdmin } from '../redux/actions/usuarios'; 
import { useNavigate } from 'react-router-dom';
import { notification, message, Button } from 'antd';
import { ArrowLeftOutlined, LogoutOutlined, HomeOutlined } from '@ant-design/icons';

const UsuarioList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { usuarios, loading, error } = useSelector(state => state.usuarios || { usuarios: [], loading: false, error: null });

    useEffect(() => {
        dispatch(fetchUsuarios());  // Carga la lista de usuarios al montar el componente
    }, [dispatch]);

    const handleViewDetails = async (user) => {
        try {
            await dispatch(fetchTransaccionesByAdmin(user.id)); 
            navigate(`/admin/operaciones/${user.id}`);
        } catch (error) {
            console.error(error);
            notification.error({
                message: 'Error al cargar operaciones',
                description: error.message,
            });
        }
    };

    const handleEdit = (id) => {
        navigate(`/usuarios/${id}/edit`);
    };

    const handleDelete = (id) => {
        dispatch(deleteUsuario(id));
        notification.success({
            message: 'Usuario eliminado',
            description: `El usuario con ID ${id} ha sido eliminado con éxito.`,
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('token'); // Simulación de cierre de sesión
        notification.success({
            message: 'Cierre de sesión exitoso',
            description: 'Has cerrado sesión correctamente.',
        });
        navigate('/login');
    };

    const handleBack = () => {
        navigate(-1); // Navegar a la página anterior
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {/* Encabezado con botones */}
            <div className="flex justify-between items-center mb-4">
                <Button
                    type="primary"
                    icon={<ArrowLeftOutlined />}
                    onClick={handleBack}
                >
                    Volver
                </Button>
                <div className="flex space-x-4">
                    <Button
                        type="default"
                        icon={<HomeOutlined />}
                        onClick={() => navigate('/')}
                    >
                        Inicio
                    </Button>
                    <Button
                        type="primary"
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                    >
                        Cerrar Sesión
                    </Button>
                </div>
            </div>

            <h1 className="text-2xl font-bold mb-4">Lista de Usuarios</h1>
            {loading ? (
                <div className="text-center">Cargando...</div>
            ) : (
                <table className="w-full bg-white shadow-md rounded-lg">
                    <thead>
                        <tr>
                            <th className="p-2 border-b">Nombre</th>
                            <th className="p-2 border-b">Apellido</th>
                            <th className="p-2 border-b">DNI</th>
                            <th className="p-2 border-b">Email</th>
                            <th className="p-2 border-b">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.length > 0 ? (
                            usuarios.map(user => (
                                <tr key={user.id}>
                                    <td className="p-2 border-b">{user.nombre}</td>
                                    <td className="p-2 border-b">{user.apellido || 'No disponible'}</td>
                                    <td className="p-2 border-b">{user.dni || 'No disponible'}</td>
                                    <td className="p-2 border-b">{user.email}</td>
                                    <td className="p-2 border-b flex space-x-2">
                                        <Button
                                            onClick={() => handleViewDetails(user)} // Usa la acción al hacer clic
                                            className="bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                                        >
                                            Ver Operaciones
                                        </Button>
                                        <Button
                                            onClick={() => handleEdit(user.id)}
                                            className="bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(user.id)}
                                            className="bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                        >
                                            Eliminar
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-2 border-b text-center">No hay usuarios disponibles</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
            {error && (
                <div className="text-red-500 mt-4">
                    <p>Error: {error}</p>
                </div>
            )}
        </div>
    );
};

export default UsuarioList;
