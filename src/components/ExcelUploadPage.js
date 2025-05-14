import React, { useState, useRef } from 'react';
import ExcelJS from 'exceljs';
import { Button, Typography, message, Table, Upload } from 'antd'; // ✅ Agregado Table, Upload y message
import { UploadOutlined } from '@ant-design/icons'; // ✅ Agregado el icono que faltaba
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { finalizarCreacionBienes } from '../redux/actions/stockActions';
import { fetchBienes } from '../redux/actions/bienes';
import '../assets/css/excelUploadPage.css';

const { Title, Paragraph } = Typography;

const tiposPermitidos = [
    'Bicicleta',
    'TV',
    'Equipo de Audio',
    'Cámara Fotográfica',
    'Notebook',
    'Tablet',
    'Teléfono Móvil'
];

const ExcelUploadPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]); 
    const [isSubmitting, setIsSubmitting] = useState(false);


    const handleDownloadTemplate = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Plantilla');

        worksheet.columns = [
            { header: 'Tipo', key: 'tipo', width: 25 },
            { header: 'Descripción', key: 'descripcion', width: 50 },
            { header: 'Precio', key: 'precio', width: 15 },
            { header: 'Marca', key: 'marca', width: 20 },
            { header: 'Modelo', key: 'modelo', width: 20 },
            { header: 'Cantidad en Inventario', key: 'cantidad', width: 25 },
            { header: 'IMEI', key: 'imei', width: 30 },
        ];

        // Agregar filas de ejemplo
        worksheet.addRow(['Notebook', 'Notebook con procesador Intel i7 y 16GB RAM', 120000, 'Dell', 'XPS 15', 5, '']);
        worksheet.addRow(['Teléfono Móvil', 'Teléfono con pantalla AMOLED y 128GB', 65000, 'Xiaomi', 'Redmi Note 10', 2, '123456789012345']);
        worksheet.addRow(['TV', 'Smart TV 50 pulgadas 4K UHD', 45000, 'Samsung', 'Series 7', 1, '']);

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

    const fileInputRef = useRef(null); // ✅ Agregar referencia al input de archivo


    const handleImageUpload = (file, rowIndex, imeiValue) => {
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        
        if (!validImageTypes.includes(file.type)) {
            message.error('Formato de imagen no válido. Solo se permiten JPG, PNG o GIF.');
            return false;
        }
    
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewData(prevData => {
                return prevData.map((row, index) => {
                    if (index !== rowIndex) return row;
    
                    const newRow = { ...row };
    
                    if (imeiValue) {
                        newRow.ImeisImagenes = {
                            ...newRow.ImeisImagenes,
                            [imeiValue]: [...(newRow.ImeisImagenes[imeiValue] || []), e.target.result].slice(0, 4)
                        };
                    } else {
                        newRow.ImagenesGenerales = [...newRow.ImagenesGenerales, e.target.result].slice(0, 4);
                    }
    
                    return newRow;
                });
            });
        };
    
        reader.readAsDataURL(file);
        return false;
    };
    
    
    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
    
        if (!selectedFile) return;
    
        if (!/\.(xlsx|xls)$/.test(selectedFile.name)) {
            message.error('Por favor, sube un archivo de Excel (.xlsx o .xls)');
            return;
        }
    
        try {
            const workbook = new ExcelJS.Workbook();
            const reader = new FileReader();
    
            reader.readAsArrayBuffer(selectedFile);
            reader.onload = async (event) => {
                await workbook.xlsx.load(event.target.result);
                const worksheet = workbook.worksheets[0];
    
                const data = worksheet.getSheetValues().slice(2).map((row, rowIndex) => {
                    const [_, tipo, descripcion, precioGeneral, marca, modelo, cantidadStock, imei, precioPorImei] = row;
                    if (!tiposPermitidos.includes(tipo)) {
                        message.error(`Error en fila ${rowIndex + 2}: Tipo de bien no permitido (${tipo}).`);
                        return null;
                    }
    
                    const imeiArray = imei ? imei.toString().split(',').map(i => i.trim()) : [];
                    const preciosArray = precioPorImei ? precioPorImei.toString().split(',').map(p => p.trim()) : [];
    
                    if (imeiArray.length !== preciosArray.length) {
                        message.error(`Error en fila ${rowIndex + 2}: La cantidad de IMEIs (${imeiArray.length}) no coincide con la cantidad de precios.`);
                        return null;
                    }
    
                    return {
                        Tipo: tipo,
                        Descripción: descripcion,
                        Precio: precioGeneral,
                        Marca: marca,
                        Modelo: modelo,
                        CantidadStock: parseInt(cantidadStock, 10) || 0,
                        IMEI: imei || '',
                        ImeisImagenes: imeiArray.reduce((acc, imei, index) => ({
                            ...acc, [imei]: { imagenes: [], precio: preciosArray[index] || 'No especificado' }
                        }), {}),
                        ImagenesGenerales: []
                    };
                }).filter(Boolean); // Filtra errores y valores nulos
    
                setFile(selectedFile);
                setPreviewData(data);
                message.success('Archivo procesado correctamente.');
            };
        } catch (error) {
            console.error('Error al leer el archivo:', error);
            message.error('Error al procesar el archivo.');
        }
    };
    
    
    
    const handleImageRemove = (rowIndex, imeiValue, imgIndex) => {
        setPreviewData((prevData) => {
            const updatedData = [...prevData];
    
            if (updatedData[rowIndex].ImeisImagenes?.[imeiValue]) {
                updatedData[rowIndex].ImeisImagenes[imeiValue] = updatedData[rowIndex].ImeisImagenes[imeiValue].filter((_, idx) => idx !== imgIndex);
            }
    
            return updatedData;
        });
    };
    
    const handleEliminarPlanilla = () => {
        setFile(null);
        setPreviewData([]);
        message.info('Planilla eliminada. Puedes subir una nueva.');
    
        // ✅ Resetear el input de archivo manualmente
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; 
        }
    };
    
    const handleFinalSubmit = async () => {
        if (previewData.length === 0) {
            message.error('No hay datos para enviar.');
            return;
        }
    
        // 🔹 Transformar los datos para que coincidan con el modelo del backend
        const bienesProcesados = previewData.map(bien => ({
            Tipo: bien.Tipo,
            Descripción: bien.Descripción,
            Precio: bien.Precio,
            Marca: bien.Marca,
            Modelo: bien.Modelo,
            CantidadStock: bien.CantidadStock,
            IMEI: bien.IMEI,
            Fotos: bien.Tipo.toLowerCase() !== 'teléfono móvil' ? bien.ImagenesGenerales : [], // 📌 Solo para bienes SIN IMEI
            ImeisImagenes: bien.Tipo.toLowerCase() === 'teléfono móvil' ? bien.ImeisImagenes : {}, // 📌 Solo para bienes CON IMEI
        }));
    
        console.log("🚀 Enviando datos al backend:", JSON.stringify(bienesProcesados, null, 2));
    
        setIsSubmitting(true);
        try {
            const response = await dispatch(finalizarCreacionBienes(bienesProcesados));
    
            console.log("✅ Respuesta del servidor:", response);
    
            if (response && response.message === 'Bienes registrados correctamente.') {
                message.success(response.message);
                const userUuid = localStorage.getItem('userUuid');
                if (userUuid) {
                    await dispatch(fetchBienes(userUuid));
                }
                setFile(null);
                setPreviewData([]);
                navigate('/user/dashboard');
            } else {
                throw new Error(response.message || 'Error desconocido en el servidor.');
            }
        } catch (error) {
            console.error("❌ Error en la solicitud:", error.response?.data || error.message);
            message.error(error.response?.data?.message || 'Error al registrar los bienes.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    

    return (
        <div className="container">
            <div className="header-buttons">
                <Button onClick={() => navigate('/user/dashboard')}>Volver</Button>
                <Button onClick={() => navigate('/home')} type="primary" danger>
                    Cerrar Sesión
                </Button>
            </div>

            <Title level={2} className="title">Carga de Stock Múltiple</Title>

            <div className="highlight">
            <Paragraph>
    Descarga la plantilla, complétala con la información de tus bienes y luego súbela aquí.
    Puedes agregar imágenes a cada bien antes de enviarlos.
</Paragraph>

<Paragraph>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <UploadOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
        <strong>Importante:</strong> Si vas a cargar un bien del tipo <strong>Teléfono Móvil</strong>, ten en cuenta lo siguiente:
    </div>
    <ul style={{ marginTop: '8px', paddingLeft: '20px', color: '#000' }}>
        <li>📱 Cada teléfono debe tener un <strong>IMEI único</strong>.</li>
        <li>🖼️ Puedes cargar hasta <strong>4 imágenes</strong> por cada IMEI.</li>
        <li>💲 Cada IMEI debe tener un <strong>precio individual</strong>.</li>
        <li>⚠️ Si no cargas correctamente los IMEIs o los precios, la planilla será rechazada.</li>
    </ul>
</Paragraph>

                <div className="download-button-container">
                    <Button className="download-button" onClick={handleDownloadTemplate}>
                        Descarga aquí la plantilla de Excel
                    </Button>
                </div>
            </div>

            <div className="upload-container">
                <h4 className="upload-title">Sube el archivo aquí</h4>
            </div>

            <div className="file-upload-box">
                <p className="file-upload-text">Selecciona tu archivo Excel para cargar los bienes.</p>
                <label htmlFor="chooseFile" className="file-upload-label">Elegir archivo</label>
                <input 
    type="file"
    id="chooseFile"
    className="file-input"
    accept=".xlsx"
    ref={fileInputRef} // ✅ Asignar la referencia
    onChange={handleFileChange}
/>

            </div>

            {previewData.length > 0 && (
    <div className="data-preview">
        
        <h4 className="text-lg font-semibold mb-2">Previsualización de la Planilla:</h4>
        <Table
    dataSource={previewData}
    columns={[
        { title: 'Tipo', dataIndex: 'Tipo', key: 'Tipo' },
        { title: 'Descripción', dataIndex: 'Descripción', key: 'Descripción' },
        { title: 'Precio', dataIndex: 'Precio', key: 'Precio' },
        { title: 'Marca', dataIndex: 'Marca', key: 'Marca' },
        { title: 'Modelo', dataIndex: 'Modelo', key: 'Modelo' },
        { title: 'Cantidad Stock', dataIndex: 'CantidadStock', key: 'CantidadStock' },

        // 🔹 IMEIs, Precios y Fotos (solo para Teléfonos Móviles)
        {
            title: 'IMEIs y Datos',
            dataIndex: 'IMEI',
            key: 'IMEI',
            render: (imei, record, rowIndex) => {
                if (record.Tipo.toLowerCase() !== 'teléfono móvil') return "No aplica"; // 📌 Solo aplica a Teléfonos Móviles
                
                const imeis = imei ? imei.split(',').map(i => i.trim()) : [];
        
                return (
                    <div>
                        {imeis.map((imeiValue) => (
                            <div key={imeiValue} style={{ marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
                                <strong>IMEI:</strong> {imeiValue}
                                <br />
                                <strong>Precio:</strong> {record.ImeisImagenes?.[imeiValue]?.precio || 'No especificado'}
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '5px' }}>
                                    {(record.ImeisImagenes?.[imeiValue]?.imagenes || []).map((img, imgIndex) => (
                                        <div key={imgIndex} style={{ position: 'relative' }}>
                                            <img src={img} alt="Preview" style={{ width: 50, height: 50 }} />
                                            <Button
                                                type="link"
                                                danger
                                                onClick={() => handleImageRemove(rowIndex, imeiValue, imgIndex)}
                                            >
                                                ✖
                                            </Button>
                                        </div>
                                    ))}
                                    {((record.ImeisImagenes?.[imeiValue]?.imagenes || []).length < 4) && (
                                        <Upload beforeUpload={(file) => handleImageUpload(file, rowIndex, imeiValue)} showUploadList={false}>
                                            <Button icon={<UploadOutlined />}>Subir Imagen</Button>
                                        </Upload>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            },
        },
        

        // 🔹 Imágenes generales (solo para bienes que NO sean Teléfonos Móviles)
        {
            title: 'Fotos',
            dataIndex: 'ImagenesGenerales',
            key: 'ImagenesGenerales',
            render: (imagenes, record, rowIndex) => {
                // 📌 Si el bien es un Teléfono Móvil, no mostrar el botón de carga en esta columna
                const esTelefono = record.Tipo.toLowerCase() === 'teléfono móvil';

                return (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {(imagenes || []).map((img, imgIndex) => (
                            <div key={imgIndex} style={{ position: 'relative' }}>
                                <img src={img} alt="Preview" style={{ width: 50, height: 50 }} />
                                <Button type="link" danger onClick={() => handleImageRemove(rowIndex, null, imgIndex)}>✖</Button>
                            </div>
                        ))}
                        
                        {!esTelefono && (imagenes?.length || 0) < 4 && (
                            <Upload beforeUpload={(file) => handleImageUpload(file, rowIndex, null)} showUploadList={false}>
                                <Button icon={<UploadOutlined />}>Subir Imagen</Button>
                            </Upload>
                        )}
                    </div>
                );
            },
        },
    ]}
    pagination={false}
/>



    </div>
)} 

<div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
    <Button
        type="primary"
        onClick={handleFinalSubmit}
        loading={isSubmitting}
        disabled={!previewData.length}
    >
        Finalizar Registro
    </Button>

    <Button
    type="default"
    danger
    onClick={handleEliminarPlanilla} // ✅ Ahora usa la función correcta
    disabled={!file} 
>
    Eliminar Planilla
</Button>

</div>




        </div>
    );
};

export default ExcelUploadPage;
