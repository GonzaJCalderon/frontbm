import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadStockExcel } from '../redux/actions/stockActions';

const ExcelUpload = () => {
    const [file, setFile] = useState(null);
    const dispatch = useDispatch();
    const { loading, error } = useSelector(state => state.stock);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = () => {
        if (file) {
            dispatch(uploadStockExcel(file));
        }
    };

    return (
        <div className="flex flex-col items-center"> {/* Flexbox para alinear el contenido */}
            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="mb-2 border border-gray-300 rounded p-2 w-full max-w-xs" // Estilo del input
            />
            <button
                onClick={handleUpload}
                disabled={loading}
                className={`bg-teal-500 text-white rounded px-4 py-2 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-600'}`} // Estilo del botón
            >
                Subir Stock
            </button>
            {loading && <p className="mt-2">Cargando...</p>}
            {error && <p className="mt-2 text-red-500">Error: {error}</p>} {/* Mensaje de error */}
        </div>
    );
};

export default ExcelUpload;
