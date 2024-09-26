import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsuarioDetails, updateUser } from '../redux/actions/usuarios';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaArrowLeft, FaSignOutAlt, FaSearch } from 'react-icons/fa';

const EditUsuario = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(state => state.usuarios.user);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        direccion: '',
        dni: '',
        apellido: '',
        rolTemporal: '',
        password: '',
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            dispatch(fetchUsuarioDetails(id))
                .then(() => setError(null))  // Reset error on successful fetch
                .catch(err => setError(err.message));  // Handle error if fetch fails
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (user) {
            setFormData({
                nombre: user.nombre || '',
                dni: user.dni || '',
                email: user.email || '',
                password: user.password || '',
                direccion: user.direccion || '',
                apellido: user.apellido || '',
                rolTemporal: user.rolTemporal || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(updateUser(id, formData))
            .then(() => navigate('/usuarios'))
            .catch(err => setError(err.message));
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
                    {['nombre', 'apellido', 'email', 'direccion', 'dni', 'rolTemporal'].map((field, idx) => (
                        <div key={idx} className="flex items-center">
                            <label htmlFor={field} className="block text-gray-700 font-bold w-1/3 capitalize">
                                {field.replace(/([A-Z])/g, ' $1').toUpperCase()}:
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
