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
        <div className="excel-upload-container">
            <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={loading}>Subir Stock</button>
            {loading && <p>Cargando...</p>}
            {error && <p>Error: {error}</p>}
        </div>
    );
};

export default ExcelUpload;
