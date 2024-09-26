import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addBien, fetchBienes } from '../redux/actions/bienes';
import { useNavigate } from 'react-router-dom';
import { Alert, Spin } from 'antd'; // Importa los componentes de Ant Design
import '../assets/css/registerBienStyles.css';

const BienForm = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [totalBienes, setTotalBienes] = useState(1);
    const [bienes, setBienes] = useState([]);
    const [tipoBien, setTipoBien] = useState('nuevo'); // 'nuevo' o 'en_stock'
    const [bienSeleccionado, setBienSeleccionado] = useState(null);
    const [buscarBien, setBuscarBien] = useState('');
    const [isFetching, setIsFetching] = useState(false);
    const [loading, setLoading] = useState(false); // Para manejar el estado de carga de la solicitud

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userId = JSON.parse(localStorage.getItem('userData'))?.userId;

    // Selectores de Redux
    const bienesUsuario = useSelector(state => state.bienes.items);
    const error = useSelector(state => state.bienes.error);

    useEffect(() => {
        if (tipoBien === 'en_stock' && userId) {
            setIsFetching(true);
            dispatch(fetchBienes(userId))
                .finally(() => setIsFetching(false));
        }
    }, [tipoBien, dispatch, userId]);

    useEffect(() => {
        if (tipoBien === 'nuevo') {
            setBienes(Array.from({ length: totalBienes }, () => ({
                tipo: '',
                cantidad: 1,
                marca: '',
                modelo: '',
                descripcion: '',
                precio: '',
                imei: '',
                fotos: []
            })));
        }
    }, [tipoBien, totalBienes]);

    useEffect(() => {
        if (bienSeleccionado) {
            setBienes(prevBienes => prevBienes.map(bien => ({
                ...bien,
                marca: bienSeleccionado.marca,
                modelo: bienSeleccionado.modelo,
                descripcion: bienSeleccionado.descripcion,
                precio: bienSeleccionado.precio,
                imei: bienSeleccionado.imei
            })));
        }
    }, [bienSeleccionado]);

    const handleBienChange = (index, e) => {
        const { name, value, files } = e.target;
        const newBienes = [...bienes];

        if (name === "fotos") {
            newBienes[index].fotos = Array.from(files).slice(0, 3);
        } else {
            newBienes[index][name] = value;
        }
        setBienes(newBienes);
    };

    const handleQuantityChange = (change) => {
        setTotalBienes(prev => Math.max(1, prev + change));
    };

    const handleNext = () => {
        if (currentStep < 3) setCurrentStep(prevStep => prevStep + 1);
    };

    const handlePrev = () => {
        if (currentStep > 1) setCurrentStep(prevStep => prevStep - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId) {
            console.error('ID del usuario no encontrado.');
            return;
        }

        setLoading(true); // Inicia el estado de carga

        try {
            console.log('Bienes a enviar:', bienes);
            for (const bien of bienes) {
                if (bien.tipo === 'telefono_movil') {
                    const imeis = bien.imei.split(',').map(imei => imei.trim());
                    if (imeis.length !== bien.cantidad) {
                        alert('La cantidad de IMEIs debe coincidir con la cantidad de teléfonos móviles.');
                        return;
                    }
                    if (imeis.some(imei => imei.length !== 15)) {
                        alert('Todos los IMEIs deben tener 15 dígitos.');
                        return;
                    }
                }
                await dispatch(addBien({ ...bien, userId }));
            }

            navigate('/success', { state: { formData: bienes } });
        } catch (err) {
            console.error('Error al enviar bienes:', err);
            alert('Error al registrar los bienes.');
        } finally {
            setLoading(false); // Finaliza el estado de carga
        }
    };

    const handleBuscarBien = (e) => {
        setBuscarBien(e.target.value);
    };

    const handleSelectBien = (value) => {
        const bienSeleccionado = bienesUsuario.find(bien => bien.id === value);
        setBienSeleccionado(bienSeleccionado);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Registro de Bienes</h2>
                        <div className="mb-4 flex justify-center items-center">
                            <label className="inline-flex items-center mr-4">
                                <input
                                    type="radio"
                                    name="tipoBien"
                                    value="nuevo"
                                    checked={tipoBien === 'nuevo'}
                                    onChange={() => setTipoBien('nuevo')}
                                    className="form-radio"
                                />
                                <span className="ml-2">Bien Nuevo</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="tipoBien"
                                    value="en_stock"
                                    checked={tipoBien === 'en_stock'}
                                    onChange={() => setTipoBien('en_stock')}
                                    className="form-radio"
                                />
                                <span className="ml-2">Bien en Stock</span>
                            </label>
                        </div>
                        <div className="flex justify-center items-center space-x-2 mb-4">
                            <button
                                type="button"
                                className="px-4 py-2 border rounded bg-gray-200 text-gray-700"
                                onClick={() => handleQuantityChange(-1)}
                            >
                                -
                            </button>
                            <span className="text-xl">{totalBienes}</span>
                            <button
                                type="button"
                                className="px-4 py-2 border rounded bg-gray-200 text-gray-700"
                                onClick={() => handleQuantityChange(1)}
                            >
                                +
                            </button>
                        </div>
                        <div className="flex justify-center space-x-4">
                            <button
                                type="button"
                                className="px-4 py-2 border rounded bg-gray-200 text-gray-700"
                                onClick={() => navigate('/userdashboard')}
                            >
                                Volver
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 border rounded bg-blue-500 text-white"
                                onClick={handleNext}
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Datos de los Bienes</h2>
                        {tipoBien === 'en_stock' && (
                            <div className="mb-4">
                                <label className="block mb-2 font-bold">Buscar Bien en Stock</label>
                                <input
                                    type="text"
                                    placeholder="Buscar en stock"
                                    value={buscarBien}
                                    onChange={handleBuscarBien}
                                    className="w-full px-4 py-2 border rounded"
                                />
                                <select
                                    onChange={(e) => handleSelectBien(e.target.value)}
                                    className="w-full mt-2 px-4 py-2 border rounded"
                                >
                                    {isFetching && <option>Cargando...</option>}
                                    {bienesUsuario.filter(bien =>
                                        bien.descripcion.toLowerCase().includes(buscarBien.toLowerCase())
                                    ).map(bien => (
                                        <option key={bien.id} value={bien.id}>
                                            {bien.descripcion}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {bienSeleccionado && tipoBien === 'en_stock' && (
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold mb-2">Detalles del Bien Seleccionado</h3>
                                <div className="mb-2">
                                    <label className="block mb-1 font-bold">Marca</label>
                                    <input
                                        type="text"
                                        value={bienSeleccionado.marca}
                                        disabled
                                        className="w-full px-4 py-2 border rounded"
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="block mb-1 font-bold">Modelo</label>
                                    <input
                                        type="text"
                                        value={bienSeleccionado.modelo}
                                        disabled
                                        className="w-full px-4 py-2 border rounded"
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="block mb-1 font-bold">Descripción</label>
                                    <input
                                        type="text"
                                        value={bienSeleccionado.descripcion}
                                        disabled
                                        className="w-full px-4 py-2 border rounded"
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="block mb-1 font-bold">Precio</label>
                                    <input
                                        type="text"
                                        value={bienSeleccionado.precio}
                                        disabled
                                        className="w-full px-4 py-2 border rounded"
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="block mb-1 font-bold">IMEI</label>
                                    <input
                                        type="text"
                                        value={bienSeleccionado.imei}
                                        disabled
                                        className="w-full px-4 py-2 border rounded"
                                    />
                                </div>
                            </div>
                        )}
                        {tipoBien === 'nuevo' && bienes.map((bien, index) => (
                            <div key={index} className="mb-4">
                                <h3 className="text-lg font-semibold mb-2">Bien {index + 1}</h3>
                                <div className="mb-2">
                                    <label className="block mb-1 font-bold">Tipo</label>
                                    <select
                                        name="tipo"
                                        value={bien.tipo}
                                        onChange={(e) => handleBienChange(index, e)}
                                        className="w-full px-4 py-2 border rounded"
                                    >
                                        <option value="">Selecciona el tipo de bien</option>
                                        <option value="telefono_movil">Teléfono Móvil</option>
                                        <option value="tableta">Tableta</option>
                                        <option value="notebook">Notebook</option>
                                        <option value="bicicleta">Bicicleta</option>
                                        <option value="tv">TV</option>
                                        <option value="equipo_audio">Equipo de Audio</option>
                                        <option value="camara_fotografica">Cámara Fotográfica</option>
                                    </select>
                                </div>
                                {bien.tipo && (
                                    <>
                                        {bien.tipo === 'telefono_movil' && (
                                            <div className="mb-2">
                                                <label className="block mb-1 font-bold">IMEI</label>
                                                <input
                                                    type="text"
                                                    name="imei"
                                                    value={bien.imei}
                                                    onChange={(e) => handleBienChange(index, e)}
                                                    className="w-full px-4 py-2 border rounded"
                                                />
                                            </div>
                                        )}
                                        <div className="mb-2">
                                            <label className="block mb-1 font-bold">Marca</label>
                                            <input
                                                type="text"
                                                name="marca"
                                                value={bien.marca}
                                                onChange={(e) => handleBienChange(index, e)}
                                                className="w-full px-4 py-2 border rounded"
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <label className="block mb-1 font-bold">Modelo</label>
                                            <input
                                                type="text"
                                                name="modelo"
                                                value={bien.modelo}
                                                onChange={(e) => handleBienChange(index, e)}
                                                className="w-full px-4 py-2 border rounded"
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <label className="block mb-1 font-bold">Descripción</label>
                                            <textarea
                                                name="descripcion"
                                                value={bien.descripcion}
                                                onChange={(e) => handleBienChange(index, e)}
                                                className="w-full px-4 py-2 border rounded"
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <label className="block mb-1 font-bold">Precio</label>
                                            <input
                                                type="text"
                                                name="precio"
                                                value={bien.precio}
                                                onChange={(e) => handleBienChange(index, e)}
                                                className="w-full px-4 py-2 border rounded"
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <label className="block mb-1 font-bold">Cantidad</label>
                                            <input
                                                type="number"
                                                name="cantidad"
                                                value={bien.cantidad}
                                                min="1"
                                                onChange={(e) => handleBienChange(index, e)}
                                                className="w-full px-4 py-2 border rounded"
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <label className="block mb-1 font-bold">Fotos</label>
                                            <input
                                                type="file"
                                                name="fotos"
                                                multiple
                                                onChange={(e) => handleBienChange(index, e)}
                                                className="w-full px-4 py-2 border rounded"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        <div className="flex justify-between">
                            <button
                                type="button"
                                className="px-4 py-2 border rounded bg-gray-200 text-gray-700"
                                onClick={handlePrev}
                            >
                                Anterior
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 border rounded bg-blue-500 text-white"
                                onClick={handleNext}
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Confirmar Registro</h2>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold">Detalles del Bien</h3>
                            <ul>
                                {bienes.map((bien, index) => (
                                    <li key={index} className="mb-2">
                                        <div><strong>Tipo:</strong> {bien.tipo}</div>
                                        <div><strong>Marca:</strong> {bien.marca}</div>
                                        <div><strong>Modelo:</strong> {bien.modelo}</div>
                                        <div><strong>Descripción:</strong> {bien.descripcion}</div>
                                        <div><strong>Precio:</strong> {bien.precio}</div>
                                        {bien.tipo === 'telefono_movil' && (
                                            <div><strong>IMEI:</strong> {bien.imei}</div>
                                        )}
                                        <div><strong>Cantidad:</strong> {bien.cantidad}</div>
                                        <div><strong>Fotos:</strong> {bien.fotos.length} fotos</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex justify-between">
                            <button
                                type="button"
                                className="px-4 py-2 border rounded bg-gray-200 text-gray-700"
                                onClick={handlePrev}
                            >
                                Anterior
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 border rounded bg-green-500 text-white"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? <Spin /> : 'Confirmar Registro'}
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <Alert message="Error" description={error} type="error" />}
            {renderStep()}
        </form>
    );
};

export default BienForm;
