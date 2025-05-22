import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsuarioDetails, updateUser, getEmpresas } from '../redux/actions/usuarios';
import { useParams, useNavigate } from 'react-router-dom';
import { Select, notification } from 'antd';
import { FaArrowLeft, FaSignOutAlt } from 'react-icons/fa';

const { Option } = Select;

const departments = [
  'Capital', 'Godoy Cruz', 'Junín', 'Las Heras', 'Maipú', 'Guaymallén', 'Rivadavia',
  'San Martín', 'La Paz', 'Santa Rosa', 'General Alvear', 'Malargüe', 'San Carlos',
  'Tupungato', 'Tunuyán', 'San Rafael', 'Lavalle', 'Luján de Cuyo'
];

const roles = ['admin', 'moderador', 'usuario'];
const rolesEmpresa = ['responsable', 'delegado'];

const EditUsuario = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userDetails = useSelector((state) => state.usuarios.userDetails);
  const [empresasDisponibles, setEmpresasDisponibles] = useState([]);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    dni: '',
    direccion: { calle: '', altura: '', barrio: '', departamento: '' },
    rol: '',
    rolEmpresa: '',
    razonSocial: '',
    cuit: '',
    direccionEmpresa: { calle: '', altura: '', departamento: '' },
    empresa_uuid: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchUsuarioDetails(id))
        .then(() => setError(''))
        .catch((err) => setError(err?.message || 'Error desconocido al obtener datos'));
    }

    dispatch(getEmpresas()).then((res) => {
  console.log('🌐 Empresas cargadas:', res?.payload); // 💡 VERIFICACIÓN
  setEmpresasDisponibles(res?.payload || []);
});

  }, [dispatch, id]);

  useEffect(() => {
    if (userDetails && Object.keys(userDetails).length > 0) {
      const empresa = userDetails.empresa || {};
      setFormData((prev) => ({
        ...prev,
        nombre: userDetails.nombre || '',
        apellido: userDetails.apellido || '',
        email: userDetails.email || '',
        dni: userDetails.dni || '',
        direccion: {
          calle: userDetails.direccion?.calle || '',
          altura: userDetails.direccion?.altura || '',
          barrio: userDetails.direccion?.barrio || '',
          departamento: userDetails.direccion?.departamento || ''
        },
        rol: userDetails.rolDefinitivo || '',
        rolEmpresa: userDetails.rolEmpresa || '',
        razonSocial: empresa?.razonSocial || '',
        cuit: empresa?.cuit || '',
        direccionEmpresa: {
          calle: empresa?.direccion?.calle || '',
          altura: empresa?.direccion?.altura || '',
          departamento: empresa?.direccion?.departamento || ''
        },
        empresa_uuid: empresa?.uuid || ''
      }));
    }
  }, [userDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name in formData.direccion) {
      setFormData((prev) => ({
        ...prev,
        direccion: { ...prev.direccion, [name]: value }
      }));
    } else if (name in formData.direccionEmpresa) {
      setFormData((prev) => ({
        ...prev,
        direccionEmpresa: { ...prev.direccionEmpresa, [name]: value }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEmpresaSelect = (uuid) => {
    const empresa = empresasDisponibles.find((e) => e.uuid === uuid);

    if (empresa) {
      setFormData((prev) => ({
        ...prev,
        empresa_uuid: uuid,
        razonSocial: empresa.razonSocial,
        cuit: empresa.cuit,
        direccionEmpresa: {
          calle: empresa.direccion?.calle || '',
          altura: empresa.direccion?.altura || '',
          departamento: empresa.direccion?.departamento || ''
        }
      }));
    } else {
      // Si se limpió el select
      setFormData((prev) => ({
        ...prev,
        empresa_uuid: '',
        razonSocial: '',
        cuit: '',
        direccionEmpresa: { calle: '', altura: '', departamento: '' }
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = { ...formData };

    dispatch(updateUser(id, userData))
      .then(() => {
        notification.success({ message: 'Éxito', description: 'Datos del usuario actualizados.' });
        navigate('/usuarios');
      })
      .catch((err) => {
        notification.error({ message: 'Error', description: err.message || 'No se pudo actualizar.' });
      });
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
<button onClick={() => navigate('/usuarios', { state: { reload: true } })}>
  <FaArrowLeft />
</button>


          <h2 className="text-xl font-bold">Editar Usuario</h2>
          <button onClick={() => navigate('/home')}><FaSignOutAlt /></button>
        </div>

        {error && <div className="text-red-500 mb-2">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {['nombre', 'apellido', 'email', 'dni'].map((field) => (
            <div key={field} className="flex flex-col">
              <label>{field.toUpperCase()}</label>
              <input name={field} value={formData[field]} onChange={handleChange} className="border p-2" />
            </div>
          ))}

          <div className="flex flex-col">
            <label>Departamento</label>
            <Select
              value={formData.direccion.departamento}
              onChange={(val) => setFormData((prev) => ({
                ...prev, direccion: { ...prev.direccion, departamento: val }
              }))}
            >
              {departments.map((d) => <Option key={d} value={d}>{d}</Option>)}
            </Select>
          </div>

          {/* Empresa Select */}
          <div className="flex flex-col">
            <label>Seleccionar Empresa</label>
            <Select
              showSearch
              value={formData.empresa_uuid || undefined}
              onChange={handleEmpresaSelect}
              allowClear
              placeholder="Buscar empresa..."
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {empresasDisponibles.map((e) => (
                <Option key={e.uuid} value={e.uuid}>
                  {e.razonSocial} ({e.cuit})
                </Option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col">
            <label>Razón Social</label>
            <input
              name="razonSocial"
              value={formData.razonSocial}
              onChange={handleChange}
              className="border p-2"
              disabled={!!formData.empresa_uuid}
            />
          </div>

          <div className="flex flex-col">
            <label>CUIT</label>
            <input
              name="cuit"
              value={formData.cuit}
              onChange={handleChange}
              className="border p-2"
              disabled={!!formData.empresa_uuid}
            />
          </div>

          {['calle', 'altura', 'departamento'].map((field) => (
            <div className="flex flex-col" key={field}>
              <label>Dirección Empresa - {field}</label>
              {field === 'departamento' ? (
                <Select
                  value={formData.direccionEmpresa.departamento}
                  onChange={(val) => setFormData((prev) => ({
                    ...prev, direccionEmpresa: { ...prev.direccionEmpresa, departamento: val }
                  }))}
                  disabled={!!formData.empresa_uuid}
                >
                  {departments.map((d) => <Option key={d} value={d}>{d}</Option>)}
                </Select>
              ) : (
                <input
                  name={field}
                  value={formData.direccionEmpresa[field]}
                  onChange={handleChange}
                  className="border p-2"
                  disabled={!!formData.empresa_uuid}
                />
              )}
            </div>
          ))}

          <div className="flex flex-col">
            <label>Rol Global</label>
            <Select value={formData.rol} onChange={(val) => setFormData((prev) => ({ ...prev, rol: val }))}>
              {roles.map((r) => <Option key={r} value={r}>{r}</Option>)}
            </Select>
          </div>

          <div className="flex flex-col">
            <label>Rol en Empresa</label>
            <Select value={formData.rolEmpresa} onChange={(val) => setFormData((prev) => ({ ...prev, rolEmpresa: val }))}>
              <Option value="">Ninguno</Option>
              {rolesEmpresa.map((r) => <Option key={r} value={r}>{r}</Option>)}
            </Select>
          </div>

          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditUsuario;
