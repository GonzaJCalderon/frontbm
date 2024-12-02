import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsuarioDetails, updateUser, assignRole } from '../redux/actions/usuarios';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaArrowLeft, FaSignOutAlt, FaSearch } from 'react-icons/fa';
import { Select } from 'antd';

const { Option } = Select;

const departments = [
  'Capital', 'Godoy Cruz', 'Junín', 'Las Heras', 'Maipú', 'Guaymallén', 'Rivadavia',
  'San Martín', 'La Paz', 'Santa Rosa', 'General Alvear', 'Malargüe', 'San Carlos',
  'Tupungato', 'Tunuyán', 'San Rafael', 'Lavalle', 'Luján de Cuyo'
];

const roles = ['admin', 'moderador', 'usuario']; // Opciones de roles

const EditUsuario = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userDetails = useSelector(state => state.usuarios.userDetails);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        direccion: {
            calle: '',
            altura: '',
            barrio: '',
            departamento: ''
        },
        dni: '',
        apellido: '',
        password: '',
        rol: '', // Campo para el rol
    });
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            dispatch(fetchUsuarioDetails(id))
                .then(() => setError(null))
                .catch(err => setError(err.message));
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (userDetails) {
            setFormData({
                nombre: userDetails.nombre || '',
                dni: userDetails.dni || '',
                email: userDetails.email || '',
                password: '',
                direccion: {
                    calle: userDetails.direccion?.calle || '',
                    altura: userDetails.direccion?.altura || '',
                    barrio: userDetails.direccion?.barrio || '',
                    departamento: userDetails.direccion?.departamento || '',
                },
                apellido: userDetails.apellido || '',
                rol: userDetails.rol || '', // Cargar el rol del usuario
            });
        }
    }, [userDetails]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name in formData.direccion) {
            setFormData(prevState => ({
                ...prevState,
                direccion: {
                    ...prevState.direccion,
                    [name]: value,
                },
            }));
        } else {
            setFormData(prevState => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    const handleRoleChange = (value) => {
        setFormData(prevState => ({
            ...prevState,
            rol: value, // Actualizar el rol en el estado
        }));
    };

    const handleSelectChange = (value) => {
        setFormData(prevState => ({
            ...prevState,
            direccion: {
                ...prevState.direccion,
                departamento: value,
            },
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { rol, ...userData } = formData;
    
        // Actualizar datos generales del usuario
        dispatch(updateUser(id, userData))
            .then(() => {
                // Actualizar el rol del usuario
                dispatch(assignRole(id, rol))
                    .then(() => {
                        setSuccessMessage('Datos actualizados correctamente');
                        setTimeout(() => {
                            navigate('/usuarios');
                        }, 2000);
                    })
                    .catch(err => {
                        setError(`Error actualizando el rol: ${err.message}`);
                    });
            })
            .catch(err => {
                setError(`Error actualizando los datos del usuario: ${err.message}`);
            });
    };
    
    

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md mb-6">
                <label htmlFor="buscar" className="block text-gray-700 font-bold mb-2">Buscar Usuario:</label>
                <div className="relative">
                    <input
                        type="text"
                        id="buscar"
                        name="buscar"
                        placeholder="Buscar..."
                        onChange={() => {}}
                        className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                    />
                    <FaSearch className="absolute right-3 top-3 text-gray-400" />
                </div>
            </div>

            {error && <div className="text-red-500 mb-4">Error: {error}</div>}
            {successMessage && <div className="text-green-500 mb-4">{successMessage}</div>}

            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => navigate('/usuarios')} className="text-gray-700 hover:text-gray-900">
                        <FaArrowLeft className="text-xl" />
                    </button>
                    <h2 className="text-2xl font-bold text-center">Editar Usuario</h2>
                    <button onClick={() => navigate('/home')} className="text-gray-700 hover:text-gray-900">
                        <FaSignOutAlt className="text-xl" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="font-semibold">Editar Datos:</h3>
                    {['nombre', 'apellido', 'email', 'dni'].map((field, idx) => (
                        <div key={idx} className="flex items-center">
                            <label htmlFor={field} className="block text-gray-700 font-bold w-1/3 capitalize">
                                {field.toUpperCase()}:
                            </label>
                            <div className="relative w-2/3">
                                <input
                                    type={field === 'email' ? 'email' : 'text'}
                                    id={field}
                                    name={field}
                                    value={formData[field]}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                                />
                                <FaEdit className="absolute right-3 top-3 text-gray-400" />
                            </div>
                        </div>
                    ))}

                    {/* Campos de dirección */}
                    {['calle', 'altura', 'barrio', 'departamento'].map((field, idx) => (
                        <div key={idx} className="flex items-center">
                            <label htmlFor={field} className="block text-gray-700 font-bold w-1/3 capitalize">
                                {field.toUpperCase()}:
                            </label>
                            <div className="relative w-2/3">
                                {field === 'departamento' ? (
                                    <Select
                                        id={field}
                                        name={field}
                                        value={formData.direccion[field]}
                                        onChange={handleSelectChange}
                                        className="w-full"
                                    >
                                        {departments.map((department) => (
                                            <Option key={department} value={department}>
                                                {department}
                                            </Option>
                                        ))}
                                    </Select>
                                ) : (
                                    <input
                                        type="text"
                                        id={field}
                                        name={field}
                                        value={formData.direccion[field]}
                                        onChange={handleChange}
                                        className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                                    />
                                )}
                                <FaEdit className="absolute right-3 top-3 text-gray-400" />
                            </div>
                        </div>
                    ))}

                    {/* Selección de rol */}
                    <div className="flex items-center">
                        <label htmlFor="rol" className="block text-gray-700 font-bold w-1/3 capitalize">
                            Rol:
                        </label>
                        <div className="relative w-2/3">
                            <Select
                                id="rol"
                                name="rol"
                                value={formData.rol}
                                onChange={handleRoleChange}
                                className="w-full"
                            >
                                {roles.map(role => (
                                    <Option key={role} value={role}>
                                        {role.charAt(0).toUpperCase() + role.slice(1)}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        Guardar Cambios
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditUsuario;
