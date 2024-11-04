import React from 'react';
import * as XLSX from 'xlsx';

const ExcelTemplateDownload = () => {
    const handleDownload = () => {
        // Define los datos de la plantilla
        const data = [
            ['Descripción', 'Precio', 'Vendedor ID', 'Fecha', 'Tipo', 'Marca', 'Modelo', 'IMEI', 'Stock', 'Imagen'],
            ['', '', '', '', '', '', '', '', '', ''] // Fila vacía para que el usuario complete
        ];

        // Crea un libro de trabajo
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Inventario');

        // Genera el archivo Excel y descarga
        XLSX.writeFile(wb, 'stock.xlsx');
    };

    return (
        <div className="flex flex-col items-center mb-4">
            <h2 className="mb-2 text-lg font-semibold">Descarga la planilla de Excel de ejemplo</h2>
            <button
                onClick={handleDownload}
                className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
            >
                Descargar Planilla de ejemplo
            </button>
        </div>
    );
};

export default ExcelTemplateDownload;
