import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsuarioDetails, updateUser } from '../redux/actions/usuarios';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaArrowLeft, FaSignOutAlt, FaSearch } from 'react-icons/fa';

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
        if (id) {
            dispatch(fetchUsuarioDetails(id))
                .then(() => setError(null)) // Resetear el error si la recuperación es exitosa
                .catch(err => setError(err.message)); // Manejar el error si la recuperación falla
        }
    }, [dispatch, id]);
    
    useEffect(() => {
        if (userDetails) { // Cambia `user` por `userDetails`
            console.log('Usuario recuperado:', userDetails);
            setFormData({
                nombre: userDetails.nombre || '',
                dni: userDetails.dni || '',
                email: userDetails.email || '',
                password: '',  // No mostrar la contraseña actual
                direccion: {
                    calle: userDetails.direccion?.calle || '', // Asegúrate de usar la notación opcional aquí
                    altura: userDetails.direccion?.altura || '',
                    barrio: userDetails.direccion?.barrio || '',
                    departamento: userDetails.direccion?.departamento || '',
                },
                apellido: userDetails.apellido || '',
               
            });
        }
    }, [userDetails]);
    

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Si el campo pertenece a la dirección, actualizar el objeto de dirección
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

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(updateUser(id, formData))
            .then(() => {
                setSuccessMessage('Datos actualizados correctamente');
                setError(null);
                setTimeout(() => {
                    navigate('/usuarios'); // Redirigir después de un tiempo
                }, 2000);
            })
            .catch(err => {
                setError(err.message);
                setSuccessMessage('');
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
    {/* Mostrar datos actuales */}
    <h3 className="font-semibold">Datos Actuales:</h3>
    <div className="mb-2">
        <p><strong>Nombre:</strong> {userDetails?.nombre || 'N/A'}</p>
        <p><strong>Apellido:</strong> {userDetails?.apellido || 'N/A'}</p>
        <p><strong>Email:</strong> {userDetails?.email || 'N/A'}</p>
        <p><strong>DNI:</strong> {userDetails?.dni || 'N/A'}</p>
        <p><strong>Calle:</strong> {userDetails?.direccion?.calle || 'N/A'}</p> 
        <p><strong>Altura:</strong> {userDetails?.direccion?.altura || 'N/A'}</p> 
        <p><strong>Barrio:</strong> {userDetails?.direccion?.barrio || 'N/A'}</p> 
        <p><strong>Departamento:</strong> {userDetails?.direccion?.departamento || 'N/A'}</p> 
    </div>

    {/* Formulario para editar datos */}
    <h3 className="font-semibold">Editar Datos:</h3>
    {['nombre', 'apellido', 'email', 'dni'].map((field, idx) => (
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

    {/* Campos de dirección */}
    {['calle', 'altura', 'barrio', 'departamento'].map((field, idx) => (
        <div key={idx} className="flex items-center">
            <label htmlFor={field} className="block text-gray-700 font-bold w-1/3 capitalize">
                {field.replace(/([A-Z])/g, ' $1').toUpperCase()}:
            </label>
            <div className="relative w-2/3">
                <input
                    type="text"
                    id={field}
                    name={field}
                    value={formData.direccion[field]}
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
