import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const ExcelTemplateDownload = () => {
    const [previewData, setPreviewData] = useState([]);

    const handleDownloadTemplate = () => {
        const data = [
            [
                'Tipo', 
                'Descripción', 
                'Precio', 
                'Marca', 
                'Modelo', 
                'Cantidad en inventario'
            ],
            [
                'Ejemplo: Notebook, Teléfono Móvil, Bicicleta, Tablet, TV, Equipo de Audio o Camara Fotografica.', 
                'Descripción breve del producto (ejemplo: Bicicleta de montaña color negro mate, rodado 29, con cuadro de aluminio resistente. Cuenta con suspensión delantera para absorber golpes en caminos irregulares y frenos a disco hidráulicos, que brindan un frenado seguro y firme. Tiene transmisión 1x10, lo que facilita el cambio de velocidades en subidas y bajadas. El asiento está en muy buenas condiciones, y el manubrio ancho aporta mayor control y estabilidad. Ideal para quienes buscan una bici confiable para salir a pedalear por senderos o caminos de tierra.)', 
                'Precio del bien (ejemplo: 1,500.00)', 
                'Marca del producto (ejemplo: Dell, Apple)', 
                'Modelo específico (ejemplo: XPS 15, 14 Pro)', 
                'Cantidad en inventario inicial (ejemplo: 10)'
            ],
            ['', '', '', '', '', '']
        ];
    
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
        XLSX.writeFile(wb, 'plantilla_inventario.xlsx');
    };
    

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                setPreviewData(jsonData); // Guarda los datos para previsualización
            };
            reader.readAsArrayBuffer(file);
        }
    };

    return (
        <div className="flex flex-col items-center mb-4">
            <h2 className="mb-2 text-lg font-semibold">Descarga y carga planilla de ejemplo</h2>
            <p className="mb-4 text-gray-600">
                Descarga una planilla de ejemplo, complétala y súbela para previsualizarla antes de enviarla.
            </p>
            <button
                onClick={handleDownload}
                className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 mb-4"
            >
                Descargar planilla de ejemplo ⬇️
            </button>
            <input
                type="file"
                accept=".xlsx"
                onChange={handleFileUpload}
                className="mb-4"
            />
            {previewData.length > 0 && (
                <div className="w-full overflow-x-auto">
                    <h3 className="text-lg font-semibold mb-2">Previsualización de la planilla:</h3>
                    <table className="table-auto border-collapse border border-gray-200 w-full">
                        <thead>
                            <tr>
                                {previewData[0].map((header, index) => (
                                    <th key={index} className="border border-gray-300 px-4 py-2">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {previewData.slice(1).map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                                            {cell || ''}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ExcelTemplateDownload;
