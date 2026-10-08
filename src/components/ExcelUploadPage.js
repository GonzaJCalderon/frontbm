import React, { useState, useRef } from 'react';
import ExcelJS from 'exceljs';
import { Button, Typography, message, Table, Upload, Input, InputNumber, Select  } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { finalizarCreacionBienes } from '../redux/actions/stockActions';
import { fetchBienes } from '../redux/actions/bienes';
import { FaArrowLeft, FaHome, FaSignOutAlt } from 'react-icons/fa';
import '../assets/css/excelUploadPage.css';

const { Title, Paragraph } = Typography;

const tiposPermitidos = [
  'Bicicleta',
  'TV',
  'Equipo de Audio',
  'Cámara Fotográfica',
  'Notebook',
  'Tablet',
  'Teléfono Móvil',
];

const ExcelUploadPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
const [editingIndex, setEditingIndex] = useState(null);
const [editingBien, setEditingBien] = useState(null);

  const fileInputRef = useRef(null);

  const [formVisible, setFormVisible] = useState(false);
const [nuevoBien, setNuevoBien] = useState({
  Tipo: '',
  Descripción: '',
  Precio: '',
  Marca: '',
  Modelo: '',
  CantidadStock: 1,
});

const handleAgregarNuevoBien = () => {
  const bien = {
    ...nuevoBien,
    Precio: parseFloat(nuevoBien.Precio) || 0,
    CantidadStock: parseInt(nuevoBien.CantidadStock, 10) || 1,
    IMEI: nuevoBien.Tipo.toLowerCase() === 'teléfono móvil' ? [] : [],
    ImeisImagenes: {},
    ImagenesGenerales: [],
  };

  setPreviewData((prev) => [...prev, bien]);
  setFormVisible(false);
  setNuevoBien({
    Tipo: '',
    Descripción: '',
    Precio: '',
    Marca: '',
    Modelo: '',
    CantidadStock: 1,
  });
};


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
      { header: 'Precio por IMEI', key: 'precioPorImei', width: 25 },
    ];

    worksheet.addRow(['Notebook', 'Notebook con procesador Intel i7 y 16GB RAM', 120000, 'Dell', 'XPS 15', 5, '', '']);
    worksheet.addRow(['Teléfono Móvil', 'Pantalla AMOLED y 128GB', 65000, 'Xiaomi', 'Redmi Note 10', 2, '123456789012345', '65000']);
    worksheet.addRow(['TV', 'Smart TV 50 pulgadas 4K UHD', 45000, 'Samsung', 'Series 7', 1, '', '']);

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

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla_inventario.xlsx';
    link.click();
    window.URL.revokeObjectURL(url);
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
          const [, tipo, descripcion, precioGeneral, marca, modelo, cantidadStock, imei, precioPorImei] = row;

          if (!tiposPermitidos.includes(tipo)) {
            message.error(`Error en fila ${rowIndex + 2}: Tipo de bien no permitido (${tipo}).`);
            return null;
          }
const imeis = imei?.toString().split(',').map(i => i.trim()).filter(Boolean) || [];

const preciosArray = precioPorImei
  ? precioPorImei.toString().split(',').map(p => parseFloat(p.trim()))
  : imeis.map(() => parseFloat(precioGeneral));


          if (imeis.length !== preciosArray.length) {
            message.error(`Error en fila ${rowIndex + 2}: La cantidad de IMEIs (${imeis.length}) no coincide con la cantidad de precios (${preciosArray.length}).`);
            return null;
          }

         const imeisImagenes = {};
imeis.forEach((imeiVal, index) => {
  if (!imeiVal) return; // evitar claves vacías

  imeisImagenes[imeiVal] = {
    imagenes: [], // serán llenadas desde la UI
    precio: preciosArray[index] || precioGeneral || 0,
  };
});


          return {
            Tipo: tipo,
            Descripción: descripcion,
            Precio: precioGeneral,
            Marca: marca,
            Modelo: modelo,
            CantidadStock: parseInt(cantidadStock, 10) || 0,
            IMEI: imeis,
            ImeisImagenes: imeisImagenes,
            ImagenesGenerales: [],
          };
        }).filter(Boolean);

        setFile(selectedFile);
        setPreviewData(data);
        message.success('Archivo procesado correctamente.');
      };
    } catch (error) {
      console.error('Error al leer el archivo:', error);
      message.error('Error al procesar el archivo.');
    }
  };

  const handleImageUpload = (file, rowIndex, imeiValue) => {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validImageTypes.includes(file.type)) {
      message.error('Formato de imagen no válido. Solo JPG, PNG o GIF.');
      return false;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewData(prevData =>
        prevData.map((row, index) => {
          if (index !== rowIndex) return row;
          const newRow = { ...row };
          if (imeiValue) {
            newRow.ImeisImagenes = {
              ...newRow.ImeisImagenes,
              [imeiValue]: {
                ...newRow.ImeisImagenes[imeiValue],
                imagenes: [...(newRow.ImeisImagenes[imeiValue]?.imagenes || []), e.target.result].slice(0, 4),
              },
            };
          } else {
            newRow.ImagenesGenerales = [...newRow.ImagenesGenerales, e.target.result].slice(0, 4);
          }
          return newRow;
        })
      );
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleImageRemove = (rowIndex, imeiValue, imgIndex) => {
    setPreviewData(prevData => {
      const updated = [...prevData];
      if (imeiValue) {
        updated[rowIndex].ImeisImagenes[imeiValue].imagenes =
          updated[rowIndex].ImeisImagenes[imeiValue].imagenes.filter((_, i) => i !== imgIndex);
      } else {
        updated[rowIndex].ImagenesGenerales =
          updated[rowIndex].ImagenesGenerales.filter((_, i) => i !== imgIndex);
      }
      return updated;
    });
  };

const handleEliminarBien = (indexToRemove) => {
  setPreviewData(prev => prev.filter((_, index) => index !== indexToRemove));
};

const handlePrecioPorImeiChange = (rowIndex, imei, nuevoPrecio) => {
  setPreviewData(prevData => {
    const newData = [...prevData];
    if (!newData[rowIndex].ImeisImagenes[imei]) return newData;
    newData[rowIndex].ImeisImagenes[imei].precio = parseFloat(nuevoPrecio) || 0;
    return newData;
  });
};

const handleEditarBien = (index) => {
  setEditingIndex(index);
  setEditingBien({ ...previewData[index] });
};

const handleGuardarEdicion = () => {
  setPreviewData((prev) => {
    const nuevos = [...prev];
    nuevos[editingIndex] = editingBien;
    return nuevos;
  });
  setEditingIndex(null);
  setEditingBien(null);
};

const handleCancelarEdicion = () => {
  setEditingIndex(null);
  setEditingBien(null);
};


  const handleEliminarPlanilla = () => {
    setFile(null);
    setPreviewData([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    message.info('Planilla eliminada. Puedes subir una nueva.');
  };

  const handleFinalSubmit = async () => {
    if (previewData.length === 0) {
      message.error('No hay datos para enviar.');
      return;
    }

for (const [index, bien] of previewData.entries()) {
  const isTelefono = bien.Tipo.toLowerCase() === 'teléfono móvil';
  if (isTelefono) {
    const imeis = bien.IMEI || [];

    for (const imei of imeis) {
      const imagenes = bien.ImeisImagenes?.[imei]?.imagenes || [];
      const precio = bien.ImeisImagenes?.[imei]?.precio;

      if (!precio || precio.toString().trim() === '') {
        message.error(`El IMEI "${imei}" (fila ${index + 2}) no tiene precio asignado.`);
        return;
      }

      if (!imagenes || imagenes.length === 0) {
        message.error(`El IMEI "${imei}" (fila ${index + 2}) no tiene imágenes cargadas.`);
        return;
      }
    }
  }
}



    const bienesProcesados = previewData.map(bien => ({
      Tipo: bien.Tipo,
      Descripción: bien.Descripción,
      Precio: bien.Precio,
      Marca: bien.Marca,
      Modelo: bien.Modelo,
      CantidadStock: bien.CantidadStock,
      IMEI: bien.IMEI,
      Fotos: bien.Tipo.toLowerCase() !== 'teléfono móvil' ? bien.ImagenesGenerales : [],
      ImeisImagenes: bien.Tipo.toLowerCase() === 'teléfono móvil' ? bien.ImeisImagenes : {},
      IdentificadoresUnicos: bien.IdentificadoresUnicos || [],
    }));

    setIsSubmitting(true);

    try {
     const response = await dispatch(finalizarCreacionBienes(bienesProcesados));

if (response?.success === false) {
  message.error(response.message);
  return;
}

if (response?.message === 'Bienes registrados correctamente.') {

        message.success(response.message);
        const usuario = JSON.parse(localStorage.getItem('userData') || '{}');
        const userUuid = usuario.empresaUuid || usuario.uuid;
        if (userUuid) await dispatch(fetchBienes(userUuid));
        setFile(null);
        setPreviewData([]);
        navigate('/user/dashboard');
      } else {
        throw new Error(response.message || 'Error en el servidor.');
      }
    } catch (error) {
      console.error("❌ Error al enviar al backend:", error);
      message.error(
        error?.response?.data?.error || error?.response?.data?.message || 'Error al registrar los bienes.'
      );
    } finally {
      setIsSubmitting(false); // ✅ Esto evita que se quede cargando para siempre
    }
  };

  return (
    <div className="bg-background min-h-screen font-inter flex flex-col pb-8">
      {/* Header Premium */}
      <header className="bg-primary text-white px-8 py-5 flex justify-between items-center shadow-md mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center p-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all shadow-sm border-none cursor-pointer">
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold font-montserrat tracking-tight m-0 text-white">Carga de Stock Múltiple</h1>
            <p className="text-inverse-primary text-sm font-medium mt-0.5 mb-0">
              Sube tus bienes masivamente con un archivo Excel
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => {
            localStorage.removeItem('userData');
            navigate('/home');
          }} className="flex items-center gap-2 px-4 py-2 bg-error text-white rounded-lg hover:bg-red-600 transition-all font-semibold shadow-sm border-none cursor-pointer">
            <FaSignOutAlt className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-8">
        <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-level-2 border border-outline-variant">

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
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>

      {previewData.length > 0 && (
        <div className="data-preview">
      <Table
  dataSource={previewData}
  rowKey={(record, index) => index}
columns={[
  { title: 'Tipo', dataIndex: 'Tipo', key: 'Tipo' },
  { title: 'Descripción', dataIndex: 'Descripción', key: 'Descripción' },
  {
    title: 'Precio',
    dataIndex: 'Precio',
    key: 'Precio',
    render: (_, record) => {
      if (record.Tipo.toLowerCase() === 'teléfono móvil') {
        const precios = Object.values(record.ImeisImagenes || {}).map(i => parseFloat(i.precio) || 0);
        const total = precios.reduce((sum, val) => sum + val, 0);
        return `$ ${total.toLocaleString()}`;
      }
      return `$ ${record.Precio?.toLocaleString() || 0}`;
    }
  },
  { title: 'Marca', dataIndex: 'Marca', key: 'Marca' },
  { title: 'Modelo', dataIndex: 'Modelo', key: 'Modelo' },
  { title: 'Cantidad Stock', dataIndex: 'CantidadStock', key: 'CantidadStock' },

  // 🔥 Agregamos la columna de imágenes generales aquí mismo
  {
    title: 'Fotos',
    dataIndex: 'ImagenesGenerales',
    key: 'ImagenesGenerales',
    render: (imagenes, record, rowIndex) => {
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

  {
  title: 'Fotos por IMEI',
  dataIndex: 'IMEI',
  key: 'IMEIImagenes',
  render: (imei, record, rowIndex) => {
    if (record.Tipo.toLowerCase() !== 'teléfono móvil') return 'No aplica';

    const imeis = Array.isArray(imei)
      ? imei
      : typeof imei === 'string'
      ? imei.split(',').map(i => i.trim())
      : [];

    return (
      <div>
        {imeis.map((imeiValue) => (
          <div
            key={imeiValue}
            style={{
              marginBottom: '10px',
              borderBottom: '1px solid #ccc',
              paddingBottom: '5px'
            }}
          >
            <strong>IMEI:</strong> {imeiValue}
            <br />
            <strong>Precio:</strong>{' '}
            <InputNumber
              value={record.ImeisImagenes?.[imeiValue]?.precio || ''}
              onChange={(val) => handlePrecioPorImeiChange(rowIndex, imeiValue, val)}
              style={{ width: 120, marginTop: 4 }}
            />
            <div
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                marginTop: '8px'
              }}
            >
              {(record.ImeisImagenes?.[imeiValue]?.imagenes || []).map((img, imgIndex) => (
                <div key={imgIndex} style={{ position: 'relative' }}>
                  <img src={img} alt="imei-img" style={{ width: 50, height: 50 }} />
                  <Button
                    type="link"
                    danger
                    onClick={() => handleImageRemove(rowIndex, imeiValue, imgIndex)}
                  >
                    ✖
                  </Button>
                </div>
              ))}

              {(record.ImeisImagenes?.[imeiValue]?.imagenes?.length || 0) < 4 && (
                <Upload
                  beforeUpload={(file) => handleImageUpload(file, rowIndex, imeiValue)}
                  showUploadList={false}
                >
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


  {
    title: 'Acciones',
    key: 'acciones',
    render: (_, __, rowIndex) => (
      <>
        <Button size="small" onClick={() => handleEditarBien(rowIndex)} style={{ marginRight: 8 }}>
          Editar
        </Button>
        <Button danger size="small" onClick={() => handleEliminarBien(rowIndex)}>
          Eliminar
        </Button>
      </>
    ),
  },
]}
  pagination={false}
  scroll={{ x: 'max-content' }}
/>

<Button
  type="dashed"
  onClick={() => setFormVisible(true)}
  block
  style={{ marginTop: 20 }}
>
  + Agregar nuevo bien manualmente
</Button>

{formVisible && (
  <div style={{ marginTop: 20, border: '1px solid #ccc', padding: 16, borderRadius: 8 }}>
    <Title level={5}>Nuevo Bien</Title>
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      <Select
        placeholder="Tipo"
        style={{ width: 180 }}
        value={nuevoBien.Tipo}
        onChange={(value) => setNuevoBien({ ...nuevoBien, Tipo: value })}
      >
        {tiposPermitidos.map((tipo) => (
          <Select.Option key={tipo} value={tipo}>
            {tipo}
          </Select.Option>
        ))}
      </Select>

      <Input
        placeholder="Descripción"
        style={{ width: 200 }}
        value={nuevoBien.Descripción}
        onChange={(e) => setNuevoBien({ ...nuevoBien, Descripción: e.target.value })}
      />
      <Input
        placeholder="Marca"
        style={{ width: 150 }}
        value={nuevoBien.Marca}
        onChange={(e) => setNuevoBien({ ...nuevoBien, Marca: e.target.value })}
      />
      <Input
        placeholder="Modelo"
        style={{ width: 150 }}
        value={nuevoBien.Modelo}
        onChange={(e) => setNuevoBien({ ...nuevoBien, Modelo: e.target.value })}
      />
      <InputNumber
        placeholder="Precio"
        style={{ width: 120 }}
        value={nuevoBien.Precio}
        onChange={(value) => setNuevoBien({ ...nuevoBien, Precio: value })}
      />
      <InputNumber
        placeholder="Stock"
        min={1}
        style={{ width: 120 }}
        value={nuevoBien.CantidadStock}
        onChange={(value) => setNuevoBien({ ...nuevoBien, CantidadStock: value })}
      />
    </div>

    <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
      <Button onClick={() => setFormVisible(false)}>Cancelar</Button>
      <Button type="primary" onClick={handleAgregarNuevoBien}>Agregar a la tabla</Button>
    </div>
  </div>
)}




        </div>
      )}
{editingBien && (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <div style={{ background: '#fff', padding: 24, borderRadius: 8, width: 600, maxWidth: '90%' }}>
      <Title level={4}>Editar Bien</Title>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: 16 }}>
        <Select
          style={{ width: 180 }}
          value={editingBien.Tipo}
          onChange={(val) => setEditingBien({ ...editingBien, Tipo: val })}
        >
          {tiposPermitidos.map((tipo) => (
            <Select.Option key={tipo} value={tipo}>
              {tipo}
            </Select.Option>
          ))}
        </Select>

        <Input
          placeholder="Descripción"
          style={{ width: 200 }}
          value={editingBien.Descripción}
          onChange={(e) => setEditingBien({ ...editingBien, Descripción: e.target.value })}
        />
        <Input
          placeholder="Marca"
          style={{ width: 150 }}
          value={editingBien.Marca}
          onChange={(e) => setEditingBien({ ...editingBien, Marca: e.target.value })}
        />
        <Input
          placeholder="Modelo"
          style={{ width: 150 }}
          value={editingBien.Modelo}
          onChange={(e) => setEditingBien({ ...editingBien, Modelo: e.target.value })}
        />
        <InputNumber
          placeholder="Precio"
          style={{ width: 120 }}
          value={editingBien.Precio}
          onChange={(value) => setEditingBien({ ...editingBien, Precio: value })}
        />
        <InputNumber
          placeholder="Stock"
          min={1}
          style={{ width: 120 }}
          value={editingBien.CantidadStock}
          onChange={(value) => setEditingBien({ ...editingBien, CantidadStock: value })}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <Button onClick={handleCancelarEdicion}>Cancelar</Button>
        <Button type="primary" onClick={handleGuardarEdicion}>
          Guardar Cambios
        </Button>
      </div>
    </div>
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
          onClick={handleEliminarPlanilla}
          disabled={!file}
        >
          Eliminar Planilla
        </Button>
      </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelUploadPage;
