import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadStockExcel } from '../redux/actions/stockActions';
import ExcelTemplateDownload from './ExcelTemplateDownload';

const ExcelUpload = () => {
    const [file, setFile] = useState(null);
    const dispatch = useDispatch();
    const [success, setSuccess] = useState(null);
    const { loading, error } = useSelector(state => state.stock);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        // Validación de extensiones de archivo
        const validExtensions = ['.xlsx', '.xls'];
        const fileExtension = selectedFile.name.slice(((selectedFile.name.lastIndexOf(".") - 1) >>> 0) + 2); // Extraer extensión sin usar path

        if (validExtensions.includes(`.${fileExtension}`)) {
            setFile(selectedFile);
        } else {
            alert('Por favor, sube un archivo de Excel válido (.xlsx, .xls)');
            setFile(null); // Reinicia el estado del archivo si no es válido
        }
    };

    const handleUpload = () => {
        if (file) {
            dispatch(uploadStockExcel(file))
                .then(() => setSuccess('Stock actualizado con éxito.'))
                .catch(() => setSuccess(null)); // Opcional: restablecer éxito en caso de error
        }
    };

    return (
        <div className="flex flex-col items-center">
            <ExcelTemplateDownload /> {/* Componente de descarga de plantilla */}
            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="mb-2 border border-gray-300 rounded p-2 w-full max-w-xs"
            />
            <button
                onClick={handleUpload}
                disabled={loading}
                className={`bg-teal-500 text-white rounded px-4 py-2 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-600'}`}
            >
                Subir Stock
            </button>
            {loading && <p className="mt-2">Cargando...</p>}
            {error && <p className="mt-2 text-red-500">Error: {error}</p>}
            {success && <p className="mt-2 text-green-500">{success}</p>} {/* Mensaje de éxito */}
        </div>
    );
};

export default ExcelUpload;
