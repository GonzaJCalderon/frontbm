import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button, Table, message, Upload, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { finalizarCreacionBienes } from '../redux/actions/stockActions';
import { verificarIMEI } from '../redux/actions/bienes';
import { v4 as uuidv4 } from 'uuid'; 

const { Title, Paragraph } = Typography;

const ExcelUploadPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [rowImages, setRowImages] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDownloadTemplate = () => {
        const data = [
            ['Tipo', 'Descripción', 'Precio', 'Marca', 'Modelo', 'Cantidad Stock'],
            ['Ejemplo: Laptop, Teléfono', 'Breve descripción', 'Precio (número)', 'Marca', 'Modelo', 'Cantidad total'],
        ];
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
        XLSX.writeFile(wb, 'plantilla_inventario.xlsx');
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                const headers = jsonData[0]; // Encabezados
                const rows = jsonData.slice(1); // Filas de datos

                const previewDataWithHeaders = rows.map((row) => {
                    const rowData = {};
                    headers.forEach((header, index) => {
                        rowData[header] = row[index];
                    });
                    return rowData;
                });

                setPreviewData(previewDataWithHeaders);
                setFile(selectedFile);
            };
            reader.readAsArrayBuffer(selectedFile);
        }
    };

    const handleImageUpload = (file, rowIndex) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setRowImages((prevImages) => ({
                ...prevImages,
                [rowIndex]: e.target.result, // Base64 de la imagen
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleImageRemove = (rowIndex) => {
        setRowImages((prevImages) => {
            const updatedImages = { ...prevImages };
            delete updatedImages[rowIndex];
            return updatedImages;
        });
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
    
        const datosActualizados = await Promise.all(
            previewData.map(async (row, index) => {
                const nuevoRow = { ...row };
                const erroresFila = [];
    
                // Validar IMEI para teléfonos móviles
                if (row.Tipo && row.Tipo.toLowerCase() === 'teléfono móvil') {
                    if (!row.IMEI) {
                        // Generar IMEI único si no se proporciona
                        nuevoRow.IMEI = `${uuidv4()}`;
                    } else {
                        try {
                            const imeiExists = await dispatch(verificarIMEI(row.IMEI)); // Uso válido de `await` dentro de `async`
                            if (imeiExists) {
                                nuevoRow.IMEI = (
                                    <span style={{ color: 'red' }}>
                                        IMEI {row.IMEI} ya existe en la base de datos.
                                    </span>
                                );
                                erroresFila.push('IMEI duplicado');
                            }
                        } catch (error) {
                            console.error(`Error verificando IMEI (${row.IMEI}):`, error);
                            erroresFila.push('Error al verificar IMEI');
                        }
                    }
                }
    
                if (erroresFila.length > 0) {
                    nuevoRow.tieneErrores = true;
                }
    
                return nuevoRow;
            })
        );
    
        setPreviewData(datosActualizados);
    
        const bienesFiltrados = datosActualizados.filter((row) => !row.tieneErrores);
    
        if (bienesFiltrados.length === 0) {
            message.error('Todos los bienes tienen errores. Por favor, corrige y vuelve a intentar.');
            setIsSubmitting(false);
            return;
        }
    
        try {
            const bienesAEnviar = bienesFiltrados.map((row, index) => ({
                tipo: row.Tipo,
                descripcion: row.Descripción,
                precio: row.Precio,
                marca: row.Marca,
                modelo: row.Modelo,
                cantidadStock: row['Cantidad Stock'],
                imei: row.IMEI,
                fotos: rowImages[index] ? [rowImages[index]] : [],
            }));
    
            const response = await dispatch(finalizarCreacionBienes(bienesAEnviar));
            if (response) {
                message.success('Bienes creados exitosamente.');
                navigate('/user/dashboard');
            }
        } catch (error) {
            message.error('Error al registrar los bienes. Por favor, intenta nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };
    

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={() => navigate('/user/dashboard')}>Volver</Button>
                <Button onClick={() => navigate('/home')} type="primary" danger>
                    Cerrar Sesión
                </Button>
            </div>

            <Title level={2} className="text-center">Carga de Stock Múltiple</Title>
            <Paragraph className="text-center">
                Descarga un ejemplo de plantilla, complétala con la información de tus bienes y luego súbela aquí.
                Puedes agregar imágenes a cada bien antes de enviarlos.
            </Paragraph>

            <div className="text-center mb-6">
                <Button
                    type="default"
                    onClick={handleDownloadTemplate}
                    style={{ backgroundColor: '#52c41a', color: 'white', border: 'none' }}
                >
                    Descargar plantilla de ejemplo
                </Button>
            </div>

            <div className="bg-gradient-to-r from-blue-700 via-blue-500 to-blue-700 text-white min-h-[220px] flex items-center justify-center text-center">
                <h4 className="text-3xl font-semibold -mt-8">Sube el archivo aquí</h4>
            </div>

            <div className="max-w-lg mx-auto relative bg-white border-2 border-gray-300 border-dashed rounded-md -top-24">
                <div className="p-4 min-h-[300px] flex flex-col items-center justify-center text-center">
                    <h4 className="text-base font-semibold text-gray-600">
                        Selecciona tu archivo Excel para cargar los bienes.
                    </h4>
                    <label
                        htmlFor="chooseFile"
                        className="text-blue-600 text-base font-semibold cursor-pointer underline mt-4"
                    >
                        Elegir archivo
                    </label>
                    <input
                        type="file"
                        id="chooseFile"
                        className="hidden"
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                    />
                </div>
            </div>

            {previewData.length > 0 && (
                <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-2">Previsualización de la planilla:</h4>
                    <Table
                        dataSource={previewData.map((row, index) => ({
                            key: index,
                            Tipo: row.Tipo,
                            Descripción: row.Descripción,
                            Precio: row.Precio,
                            Marca: row.Marca,
                            Modelo: row.Modelo,
                            CantidadStock: row['Cantidad Stock'],
                            IMEI: row.IMEI,
                            Imagen: rowImages[index] || null,
                        }))}
                        columns={[
                            { title: 'Tipo', dataIndex: 'Tipo', key: 'Tipo' },
                            { title: 'Descripción', dataIndex: 'Descripción', key: 'Descripción' },
                            { title: 'Precio', dataIndex: 'Precio', key: 'Precio' },
                            { title: 'Marca', dataIndex: 'Marca', key: 'Marca' },
                            { title: 'Modelo', dataIndex: 'Modelo', key: 'Modelo' },
                            {
                                title: 'Cantidad Stock',
                                dataIndex: 'CantidadStock',
                                key: 'CantidadStock',
                                render: (text) => text || <span style={{ color: 'red' }}>Faltante</span>,
                            },
                            {
                                title: 'IMEI',
                                dataIndex: 'IMEI',
                                key: 'IMEI',
                                render: (text) => text, // Mostrar errores de IMEI aquí
                            },
                            {
                                title: 'Imagen',
                                dataIndex: 'Imagen',
                                key: 'Imagen',
                                render: (text, record, rowIndex) => (
                                    <>
                                        {text ? (
                                            <div>
                                                <img src={text} alt="Preview" style={{ width: 50, marginRight: 8 }} />
                                                <Button
                                                    type="link"
                                                    danger
                                                    onClick={() => handleImageRemove(rowIndex)}
                                                >
                                                    Eliminar
                                                </Button>
                                            </div>
                                        ) : (
                                            <Upload
                                                beforeUpload={(file) => {
                                                    handleImageUpload(file, rowIndex);
                                                    return false;
                                                }}
                                            >
                                                <Button icon={<UploadOutlined />}>Subir Imagen</Button>
                                            </Upload>
                                        )}
                                    </>
                                ),
                            },
                        ]}
                        pagination={false}
                    />
                </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                <Button
                    type="primary"
                    onClick={handleFinalSubmit}
                    loading={isSubmitting}
                    disabled={!previewData.length}
                >
                    Finalizar Registro
                </Button>
            </div>
        </div>
    );
};

export default ExcelUploadPage;
