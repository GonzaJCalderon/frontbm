import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button, Modal, Table, message, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { uploadStockExcel } from '../redux/actions/stockActions';

const { Title, Paragraph } = Typography;

const ExcelUploadPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [modalBienesValidosVisible, setModalBienesValidosVisible] = useState(false);
    const [bienes, setBienes] = useState([]);

    const handleDownloadTemplate = () => {
        const data = [
            [
                'Tipo', 
                'Descripción', 
                'Precio', 
                'Marca', 
                'Modelo', 
                'Cantidad', 
                'Stock'
            ],
            [
                'Ejemplo: Laptop, Teléfono Móvil, Bicicleta, etc.', 
                'Descripción breve del producto (e.g., Dell XPS 15, iPhone 14 Pro)', 
                'Precio del bien (e.g., 1200 para 1200 USD)', 
                'Marca del producto (e.g., Dell, Apple)', 
                'Modelo específico (e.g., XPS 15, 14 Pro)', 
                'Cantidad total del bien (e.g., 10)', 
                'Stock actual disponible (e.g., 7)'
            ],
            ['', '', '', '', '', '', '']
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
                setPreviewData(jsonData);
                setFile(selectedFile);
            };
            reader.readAsArrayBuffer(selectedFile);
        }
    };

    const handleUpload = () => {
        if (!file) {
            message.error('Por favor selecciona un archivo Excel.');
            return;
        }

        const propietario_uuid = localStorage.getItem('userUuid');
        dispatch(uploadStockExcel(file, propietario_uuid))
            .then((response) => {
                if (response.bienes && response.bienes.length > 0) {
                    setBienes(response.bienes);
                    setModalBienesValidosVisible(true);
                } else {
                    message.warning('No se encontraron bienes válidos en la planilla.');
                }
            })
            .catch(() => {
                message.error('Error al cargar la planilla.');
            });
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            {/* Botones de navegación */}
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={() => navigate('/user/dashboard')}>Volver</Button>
                <Button onClick={() => navigate('/home')} type="primary" danger>
                    Cerrar Sesión
                </Button>
            </div>

            {/* Título y descripción */}
            <Title level={2} className="text-center">Carga de Stock Múltiple</Title>
            <Paragraph className="text-center text-lg font-semibold">
                Aquí podrás cargar todos tus bienes de forma masiva utilizando una planilla Excel. 
                <br />
                Descarga un ejemplo de plantilla, complétala con la información de tus bienes y luego súbela aquí.
                <br />
                Además, podrás asociar imágenes a cada bien después de la carga. ¡Es rápido y sencillo!
            </Paragraph>

            {/* Botón para descargar la plantilla */}
            <div className="text-center mb-6">
                <Button
                    type="default"
                    onClick={handleDownloadTemplate}
                    style={{ backgroundColor: '#52c41a', color: 'white', border: 'none' }}
                >
                    Descargar plantilla de ejemplo
                </Button>
            </div>

            {/* Área de carga */}
            <div className="font-[sans-serif]">
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

                {/* Previsualización del archivo */}
                {previewData.length > 0 && (
                    <div className="mt-6">
                        <h4 className="text-lg font-semibold mb-2">Previsualización de la planilla:</h4>
                        <Table
                            dataSource={previewData.slice(1).map((row, index) => ({
                                key: index,
                                Tipo: row[0],
                                Descripción: row[1],
                                Precio: row[2],
                                Marca: row[3],
                                Modelo: row[4],
                                Cantidad: row[5],
                                Stock: row[6],
                            }))}
                            columns={[
                                { title: 'Tipo', dataIndex: 'Tipo', key: 'Tipo' },
                                { title: 'Descripción', dataIndex: 'Descripción', key: 'Descripción' },
                                { title: 'Precio', dataIndex: 'Precio', key: 'Precio' },
                                { title: 'Marca', dataIndex: 'Marca', key: 'Marca' },
                                { title: 'Modelo', dataIndex: 'Modelo', key: 'Modelo' },
                                { title: 'Cantidad', dataIndex: 'Cantidad', key: 'Cantidad' },
                                { title: 'Stock', dataIndex: 'Stock', key: 'Stock' },
                            ]}
                            pagination={false}
                        />
                    </div>
                )}

                {/* Botones de acción */}
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                    <Button type="primary" onClick={handleUpload} disabled={!file}>
                        Cargar Planilla
                    </Button>
                    {file && (
                        <Button danger onClick={() => setFile(null)} style={{ marginLeft: '10px' }}>
                            Borrar Planilla
                        </Button>
                    )}
                </div>
            </div>

            {/* Modal de bienes válidos */}
            <Modal
                title="Bienes válidos"
                open={modalBienesValidosVisible}
                onCancel={() => setModalBienesValidosVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setModalBienesValidosVisible(false)}>
                        Cerrar
                    </Button>,
                ]}
            >
                <p>Los siguientes bienes fueron procesados correctamente:</p>
                <ul>
                    {bienes.map((bien, index) => (
                        <li key={index}>
                            {bien.Tipo}: {bien.Descripción} (${bien.Precio})
                        </li>
                    ))}
                </ul>
            </Modal>
        </div>
    );
};

export default ExcelUploadPage;
