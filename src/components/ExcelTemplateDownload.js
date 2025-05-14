import React from 'react';
import ExcelJS from 'exceljs';

const tiposPermitidos = [
    'Bicicleta',
    'TV',
    'Equipo de Audio',
    'Cámara Fotográfica',
    'Notebook',
    'Tablet',
    'Teléfono Móvil'
];

const ExcelTemplateDownload = () => {
    const handleDownloadTemplate = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Plantilla');

        worksheet.columns = [
            { header: 'Tipo', key: 'tipo', width: 25 },
            { header: 'Descripción', key: 'descripcion', width: 50 },
            { header: 'Precio General', key: 'precio', width: 15 },
            { header: 'Marca', key: 'marca', width: 20 },
            { header: 'Modelo', key: 'modelo', width: 20 },
            { header: 'Cantidad en Inventario', key: 'cantidad', width: 25 },
            { header: 'IMEI', key: 'imei', width: 35 }, // 📌 Nueva columna para IMEIs
            { header: 'Precio por IMEI', key: 'precio_imei', width: 35 } // 📌 Nueva columna para precios individuales
        ];

        // Agregar fila de ejemplo para Notebook (sin IMEI)
        worksheet.addRow([
            'Notebook', 
            'Notebook con procesador Intel i7 y 16GB RAM', 
            120000, 
            'Dell', 
            'XPS 15', 
            5,
            '', // Sin IMEI
            ''  // Sin precio por IMEI
        ]);

        // Agregar fila de ejemplo para Teléfono Móvil con múltiples IMEIs y precios
        worksheet.addRow([
            'Teléfono Móvil', 
            'Teléfono con pantalla AMOLED y 128GB', 
            65000, 
            'Xiaomi', 
            'Redmi Note 10', 
            2,
            '123456789012345,987654321098765', // 📌 IMEIs separados por coma
            '65000,62000' // 📌 Precios individuales separados por coma
        ]);

        // Agregar fila de ejemplo para TV (sin IMEI)
        worksheet.addRow([
            'TV', 
            'Smart TV 50 pulgadas 4K UHD', 
            45000, 
            'Samsung', 
            'Series 7', 
            1,
            '', // Sin IMEI
            ''  // Sin precio por IMEI
        ]);

        // Aplicar validación de dropdown en la columna "Tipo" desde la fila 2 hasta la 100
        for (let i = 2; i <= 100; i++) {
            worksheet.getCell(`A${i}`).dataValidation = {
                type: 'list',
                allowBlank: false,
                formulae: [`"${tiposPermitidos.join(',')}"`],
                showErrorMessage: true,
                errorTitle: 'Valor no permitido',
                error: 'Seleccione un tipo de bien válido desde la lista desplegable.',
            };
        }

        // Descargar el archivo Excel
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'plantilla_inventario.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col items-center mb-4">
            <h2 className="mb-2 text-lg font-semibold">Descarga y carga planilla de ejemplo</h2>
            <button
                onClick={handleDownloadTemplate}
                className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 mb-4"
            >
                Descargar Planilla de Ejemplo ⬇️
            </button>
        </div>
    );
};

export default ExcelTemplateDownload;
