import axios from 'axios';
import api from '../redux/axiosConfig';
import React, { useState } from 'react';
import { Button, Modal, Table, Upload, message, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { uploadStockExcel, finalizarCreacionBienes } from '../redux/actions/stockActions';


const { Title } = Typography;

const ExcelUploadPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [bienes, setBienes] = useState([]);
    const [imagenesPorBien, setImagenesPorBien] = useState({});
    const [bienesNoValidos, setBienesNoValidos] = useState([]);
    const [modalBienesValidosVisible, setModalBienesValidosVisible] = useState(false);
    const [modalBienesNoValidosVisible, setModalBienesNoValidosVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false); // Para el modal principal
const [modalInvalidVisible, setModalInvalidVisible] = useState(false); // Para el modal de bienes no válidos


const bienesTiposPermitidos = [
    'camara fotografica',
    'equipo de audio',
    'laptop',
    'tablet',
    'tv',
    'teléfono movil',
    'bicicleta',
];

const normalizarTipo = (tipo) => {
    const tipoNormalizado = tipo.toLowerCase().trim();

    if (tipoNormalizado === 'parlante bluetooth') return 'equipo de audio';
    if (tipoNormalizado === 'cámara fotográfica') return 'camara fotografica';
    if (tipoNormalizado === 'teléfono móvil') return 'teléfono movil';

    return tipoNormalizado; // Devuelve el tipo normalizado si ya está permitido
};


    const handleClearFile = () => {
        // Limpia el archivo cargado y reinicia el estado relacionado con la planilla
        setFile(null);
        setBienes([]);
        setBienesNoValidos([]);
        setImagenesPorBien({});
        message.info('Planilla eliminada.');
    };
    
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
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
                    // Normaliza los tipos y filtra bienes
                    const bienesFiltrados = response.bienes.filter((bien) =>
                        bienesTiposPermitidos.includes(normalizarTipo(bien.Tipo))
                    );
    
                    const bienesNoValidos = response.bienes.filter((bien) =>
                        !bienesTiposPermitidos.includes(normalizarTipo(bien.Tipo))
                    );
    
                    setBienesNoValidos(bienesNoValidos);
                    setBienes(
                        bienesFiltrados.map((bien) => ({
                            key: bien.idTemporal,
                            ...bien,
                        }))
                    );
    
                    // Mostrar modales en secuencia
                    if (bienesNoValidos.length > 0) {
                        setModalInvalidVisible(true); // Abre el modal de no válidos
                    } else if (bienesFiltrados.length > 0) {
                        setModalBienesValidosVisible(true); // Abre directamente el modal de válidos si no hay inválidos
                    }
    
                    if (bienesFiltrados.length === 0 && bienesNoValidos.length === 0) {
                        message.warning('No se encontraron bienes válidos en la planilla.');
                    }
                } else {
                    message.warning('No se encontraron bienes válidos en la planilla.');
                }
            })
            .catch(() => {
                message.error('Error al cargar la planilla.');
            });
    };
    const handleImageUploadForBien = async (bienKey, fileList) => {
        const formData = new FormData();
        fileList.forEach((file) => {
          formData.append('fotos', file.originFileObj || file);
        });
      
        try {
          const response = await api.post(`/excel/subir-fotos/${bienKey}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
      
          console.log('Respuesta del backend:', response.data);
      
          const fotosValidas = response.data.fotos || []; // Asegúrate de procesar solo lo recibido
          if (fotosValidas.length > 0) {
            setImagenesPorBien((prev) => ({
              ...prev,
              [bienKey]: [
                ...(prev[bienKey] || []),
                ...fotosValidas.map((url) => ({ url })), // Mapear directamente las URLs
              ],
            }));
            message.success('Imágenes subidas exitosamente.');
          } else {
            console.warn('No se encontraron URLs válidas en las fotos subidas:', response.data.fotos);
            message.warning('No se encontraron URLs válidas en las fotos subidas.');
          }
        } catch (error) {
          console.error('Error al subir las imágenes:', error);
          message.error('Error al subir las imágenes.');
        }
      };
      
    
    

    const handleSubmit = () => {
        const bienesConFotos = bienes.map((bien) => ({
            tipo: bien.Tipo,
            descripcion: bien['Descripción'],
            precio: bien.Precio,
            marca: bien.Marca,
            modelo: bien.Modelo,
            fotos: (imagenesPorBien[bien.key] || []).map((file) => file.url), // Asocia las URLs de fotos
            cantidadStock: bien.CantidadStock,
        }));
    
        console.log('Datos enviados al backend:', bienesConFotos); // <-- LOG 3
    
        // Valida que cada bien tenga al menos una foto
        const faltanFotos = bienesConFotos.some((bien) => !bien.fotos || bien.fotos.length === 0);
        if (faltanFotos) {
            message.error('Todos los bienes deben tener al menos una foto asociada.');
            return;
        }
    
        dispatch(finalizarCreacionBienes(bienesConFotos))
            .then(() => {
                message.success('Bienes creados exitosamente.');
                setModalBienesValidosVisible(false);
                setFile(null);
                setBienes([]);
                setImagenesPorBien({});
            })
            .catch((error) => {
                console.error('Error al finalizar la creación de bienes:', error);
                message.error('Error al finalizar la creación de los bienes.');
            });
    };
    
    

    const columns = [
        { title: 'Tipo', dataIndex: 'Tipo', key: 'Tipo' },
        { title: 'Descripción', dataIndex: 'Descripción', key: 'Descripción' },
        { title: 'Precio', dataIndex: 'Precio', key: 'Precio' },
        { title: 'Marca', dataIndex: 'Marca', key: 'Marca' },
        { title: 'Modelo', dataIndex: 'Modelo', key: 'Modelo' },
        { title: 'Stock', dataIndex: 'CantidadStock', key: 'CantidadStock' },
        {
            title: 'Fotos',
            key: 'Fotos',
            render: (_, record) => {
                const fileList = (imagenesPorBien[record.key] || []).map((file, index) => ({
                    uid: `${record.key}-${index}`,
                    name: file.name || `imagen-${index}`,
                    status: 'done',
                    url: file.url,
                }));
        
                console.log('Lista de archivos mostrados en la tabla:', fileList); // <-- LOG 4
        
                return (
                    <Upload
                        listType="picture-card"
                        multiple
                        beforeUpload={(file) => {
                            handleImageUploadForBien(record.key, [file]);
                            return false;
                        }}
                        fileList={fileList}
                        onRemove={(file) => {
                            const index = (imagenesPorBien[record.key] || []).findIndex((img) => img.url === file.url);
                            if (index !== -1) {
                                const updatedImages = [...imagenesPorBien[record.key]];
                                updatedImages.splice(index, 1);
                                setImagenesPorBien((prev) => ({ ...prev, [record.key]: updatedImages }));
                            }
                        }}
                    >
                        <UploadOutlined />
                    </Upload>
                );
            },
        }
        
        ,
    ];

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={() => navigate('/user/dashboard')}>Volver </Button>
                <Button onClick={() => navigate('/home')} type="primary" danger>
                    Cerrar Sesión
                </Button>
            </div>



<div className="font-[sans-serif]">
    <div className="bg-gradient-to-r from-blue-700 via-blue-500 to-blue-700 text-white min-h-[220px] flex items-center justify-center text-center">
        <h4 className="text-3xl font-semibold -mt-8">Sube el archivo aquí.</h4>
    </div>

    <div className="max-w-lg mx-auto relative bg-white border-2 border-gray-300 border-dashed rounded-md -top-24">
        <div className="p-4 min-h-[300px] flex flex-col items-center justify-center text-center cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 mb-4 fill-gray-600 inline-block" viewBox="0 0 32 32">
                <path
                    d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z"
                />
                <path
                    d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z"
                />
            </svg>

            <h4 className="text-base font-semibold text-gray-600">Arrastra y suelta el archivo aquí <br /> o</h4>
            <label htmlFor="chooseFile" className="text-blue-600 text-base font-semibold cursor-pointer underline">
            Elegir archivo
            </label>
            <input
                type="file"
                id="chooseFile"
                className="hidden"
                accept=".xlsx, .xls"
                onChange={handleFileChange}  // Funcionalidad existente para manejar el archivo
            />
        </div>
    </div>

    {/* Botones de carga y limpieza */}
    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
        <Button
            type="primary"
            onClick={handleUpload}
            disabled={!file}
            style={{ marginLeft: '10px' }}
        >
            Cargar Planilla
        </Button>
        {file && (
            <Button
                danger
                onClick={handleClearFile}
                style={{ marginLeft: '10px' }}
            >
                Borrar Planilla
            </Button>
        )}
    </div>
</div>


            <Modal
    title="Asociar Fotos a los Bienes"
    open={modalBienesValidosVisible}
    onCancel={() => setModalBienesValidosVisible(false)}
    footer={[
        <Button key="cancel" onClick={() => setModalBienesValidosVisible(false)}>
            Cancelar
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
            Guardar Cambios
        </Button>,
    ]}
    width="80%"
    style={{ top: 20 }}
>
    <Table dataSource={bienes} columns={columns} pagination={false} />
</Modal>


<Modal
    title="Bienes no válidos"
    open={modalInvalidVisible}
    onCancel={() => {
        setModalInvalidVisible(false);
        if (bienes.length > 0) {
            setModalBienesValidosVisible(true); // Abre el modal de válidos si hay bienes válidos
        }
    }}
    footer={[
        <Button
            key="close"
            onClick={() => {
                setModalInvalidVisible(false);
                if (bienes.length > 0) {
                    setModalBienesValidosVisible(true); // Abre el modal de válidos si hay bienes válidos
                }
            }}
        >
            Continuar
        </Button>,
    ]}
>
    <p>Los siguientes bienes no fueron procesados porque no cumplen con los tipos permitidos:</p>
    <ul>
        {bienesNoValidos.map((bien, index) => (
            <li key={index}>
                Tipo: {bien.Tipo}, Descripción: {bien.Descripción}
            </li>
        ))}
    </ul>
</Modal>






        </div>
    );
};

export default ExcelUploadPage;
