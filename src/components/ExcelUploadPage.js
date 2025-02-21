import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button, Table, message, Upload, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { finalizarCreacionBienes } from '../redux/actions/stockActions';
import { fetchBienes } from '../redux/actions/bienes';

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
            ['Tipo', 'Descripción', 'Precio', 'Marca', 'Modelo', 'Cantidad Stock', 'IMEI'],
            ['Teléfono Móvil', 'Teléfono con pantalla AMOLED y 128GB', 65000, 'Xiaomi', 'Redmi Note 10', 2, '123456789012345,987654321098765'],
            ['Notebook', 'Notebook con procesador Intel i7 y 16GB RAM', 120000, 'Dell', 'XPS 15', 1, ''],
            ['TV', 'Smart TV 50 pulgadas 4K UHD', 45000, 'Samsung', 'Series 7', 1, ''],
            ['Tablet', 'Tablet de 10 pulgadas con 64GB', 28000, 'Huawei', 'MediaPad T5', 1, ''],
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
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    if (!jsonData || jsonData.length < 2) {
                        message.error('El archivo está vacío o no tiene el formato correcto');
                        return;
                    }

                    const headers = jsonData[0];
                    const rows = jsonData.slice(1);
                    const camposRequeridos = ['Tipo', 'Descripción', 'Precio', 'Marca', 'Modelo', 'Cantidad Stock', 'IMEI'];
                    const headersNormalized = headers.map((header) => header?.trim().toLowerCase());
                    const missingHeaders = camposRequeridos.filter(
                        (header) => !headersNormalized.includes(header.toLowerCase())
                    );

                    if (missingHeaders.length > 0) {
                        message.error(`Faltan los siguientes encabezados: ${missingHeaders.join(', ')}`);
                        return;
                    }

                    const expandedData = rows
                        .filter((row) => row.length > 0)
                        .flatMap((row) => {
                            const imeis = (row[6] || '').split(',').map((imei) => imei.trim());
                            const stock = parseInt(row[5], 10);

                            if (isNaN(stock) || stock <= 0) {
                                message.warn(`Fila con error: Cantidad Stock no válida para el bien ${row[3] || 'Desconocido'}`);
                                return [];
                            }

                            return imeis.map((imei) => ({
                                Tipo: row[0],
                                Descripción: row[1],
                                Precio: row[2],
                                Marca: row[3],
                                Modelo: row[4],
                                CantidadStock: 1,
                                IMEI: imei,
                            }));
                        });

                    if (expandedData.length === 0) {
                        message.error('No se encontraron datos válidos en el archivo');
                        return;
                    }

                    setPreviewData(expandedData);
                    setFile(selectedFile);
                } catch (error) {
                    console.error('Error al procesar el archivo:', error);
                    message.error('Error al procesar el archivo. Verifica que el formato sea correcto.');
                }
            };
            reader.readAsArrayBuffer(selectedFile);
        }
    };

    const handleImageUpload = (file, rowIndex) => {
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];

        if (!validImageTypes.includes(file.type)) {
            message.error('Formato de imagen no válido. Solo se permiten imágenes JPG, PNG o GIF.');
            return false;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Image = e.target.result;
            if (typeof base64Image === 'string' && base64Image.startsWith('data:image')) {
                setRowImages((prevImages) => {
                    const updatedImages = { ...prevImages };
                    updatedImages[rowIndex] = [...(updatedImages[rowIndex] || []), base64Image];
                    return updatedImages;
                });
            } else {
                message.error('Formato de imagen no válido. Por favor, sube una imagen válida.');
            }
        };
        reader.readAsDataURL(file);
    };

    const handleImageRemove = (rowIndex, imageIndex) => {
        setRowImages((prevImages) => {
            const updatedImages = { ...prevImages };
            updatedImages[rowIndex] = updatedImages[rowIndex].filter((_, idx) => idx !== imageIndex);
            if (updatedImages[rowIndex].length === 0) {
                delete updatedImages[rowIndex];
            }
            return updatedImages;
        });
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);

        try {
            const bienesMap = new Map();
            previewData.forEach((row, index) => {
                const imeis = row.Tipo.toLowerCase().includes('teléfono móvil')
                    ? (row.IMEI || '').split(',').map((imei) => imei.trim())
                    : [];
                const key = `${row.Tipo}-${row.Marca}-${row.Modelo}`;
                if (!bienesMap.has(key)) {
                    bienesMap.set(key, {
                        tipo: row.Tipo,
                        descripcion: row.Descripción,
                        precio: row.Precio,
                        marca: row.Marca,
                        modelo: row.Modelo,
                        cantidadStock: row.CantidadStock,
                        imeis,
                        fotos: rowImages[index] || [],
                    });
                } else {
                    const existing = bienesMap.get(key);
                    existing.cantidadStock += row.CantidadStock;
                    existing.imeis.push(...imeis);
                    existing.fotos.push(...(rowImages[index] || []));
                    bienesMap.set(key, existing);
                }
            });

            const bienesAEnviar = Array.from(bienesMap.values());
            if (bienesAEnviar.length === 0) {
                throw new Error('No hay bienes válidos para registrar.');
            }

            const response = await dispatch(finalizarCreacionBienes(bienesAEnviar));
            if (response && response.message === 'Bienes registrados correctamente.') {
                message.success(response.message);
                const userUuid = localStorage.getItem('userUuid');
                if (userUuid) {
                    await dispatch(fetchBienes(userUuid));
                }
                setFile(null);
                setPreviewData([]);
                setRowImages({});
                navigate('/user/dashboard');
            } else {
                throw new Error('Error en la respuesta del servidor.');
            }
        } catch (error) {
            console.error('Error:', error);
            message.error(error.message || 'Error al registrar los bienes.');
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
                            ...row,
                            Imagen: rowImages[index] || [],
                        }))}
                        columns={[
                            { title: 'Tipo', dataIndex: 'Tipo', key: 'Tipo' },
                            { title: 'Descripción', dataIndex: 'Descripción', key: 'Descripción' },
                            { title: 'Precio', dataIndex: 'Precio', key: 'Precio' },
                            { title: 'Marca', dataIndex: 'Marca', key: 'Marca' },
                            { title: 'Modelo', dataIndex: 'Modelo', key: 'Modelo' },
                            { title: 'Cantidad Stock', dataIndex: 'CantidadStock', key: 'CantidadStock' },
                            { title: 'IMEI', dataIndex: 'IMEI', key: 'IMEI' },
                            {
                                title: 'Imágenes',
                                dataIndex: 'Imagen',
                                key: 'Imagen',
                                render: (images, _, rowIndex) => (
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        {images.map((img, imgIndex) => (
                                            <div key={imgIndex}>
                                                <img src={img} alt="Preview" style={{ width: 50, height: 50 }} />
                                                <Button
                                                    type="link"
                                                    danger
                                                    onClick={() => handleImageRemove(rowIndex, imgIndex)}
                                                >
                                                    Eliminar
                                                </Button>
                                            </div>
                                        ))}
                                        {images.length < 3 && (
                                            <Upload
                                                beforeUpload={(file) => handleImageUpload(file, rowIndex)}
                                                showUploadList={false}
                                            >
                                                <Button icon={<UploadOutlined />}>Subir Imagen</Button>
                                            </Upload>
                                        )}
                                    </div>
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
