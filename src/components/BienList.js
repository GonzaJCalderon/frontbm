import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllBienes } from '../redux/actions/bienes';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaHome, FaArrowLeft } from 'react-icons/fa';
import { Table, Image, Modal, Carousel, Button, Spin } from 'antd';
import { notification } from 'antd';

const BienList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items: bienes, error } = useSelector(state => state.bienes);
    const [selectedBien, setSelectedBien] = useState(null);
    const [visibleGallery, setVisibleGallery] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [trazabilidad, setTrazabilidad] = useState(null);

    const userData = JSON.parse(localStorage.getItem('userData'));
    const isAdmin = userData?.rolDefinitivo === 'admin';
    const isModerator = userData?.rolDefinitivo === 'moderador';

    useEffect(() => {
        const loadBienes = async () => {
            setIsLoading(true);
            try {
                await dispatch(fetchAllBienes());
            } catch (error) {
                console.error('Error al cargar los bienes:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadBienes();
    }, [dispatch]);

    const handleBienClick = (bien) => {
        setSelectedBien(bien);
        if (bien && bien.uuid) {
            obtenerTrazabilidad(bien.uuid);
        } else {
            notification.error({
                message: 'Error',
                description: 'El bien seleccionado no tiene un identificador válido.',
            });
        }
    };

    const obtenerTrazabilidad = async (uuid) => {
        try {
            const response = await fetch(`/bienes/trazabilidad/${uuid}`);
            const data = await response.json();
            setTrazabilidad(data);
        } catch (error) {
            console.error('Error al obtener trazabilidad:', error);
            notification.error({
                message: 'Error',
                description: 'No se pudo obtener la trazabilidad del bien.',
            });
        }
    };

    const closeGallery = () => {
        setVisibleGallery(false);
    };

    const closeModal = () => {
        setSelectedBien(null);
    };

    const sortedBienes = [...bienes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const columns = [
        { title: 'Tipo', dataIndex: 'tipo', key: 'tipo' },
        { title: 'Modelo', dataIndex: 'modelo', key: 'modelo' },
        { title: 'Marca', dataIndex: 'marca', key: 'marca' },
        { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion' },
        {
            title: 'Foto',
            key: 'foto',
            render: (_, record) =>
                record.fotos && record.fotos.length > 0 ? (
                    <Image src={record.fotos[0]} alt="Foto del bien" width={50} preview={false} />
                ) : 'Sin foto',
        },
        {
            title: 'Acción',
            key: 'action',
            render: (_, bien) => (
                <div className="flex space-x-2">
                    <Button
                        type="primary"
                        onClick={() => handleBienClick(bien)}
                        style={{ background: '#1890ff', borderColor: '#1890ff' }}
                    >
                        Ver Trazabilidad
                    </Button>
                    {isAdmin && (
                        <>
                            <Button
                                type="default"
                                style={{
                                    background: '#ffc107',
                                    borderColor: '#ffc107',
                                    color: '#000',
                                }}
                            >
                                Editar
                            </Button>
                            <Button type="primary" danger>
                                Eliminar
                            </Button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" />
                <p className="mt-4 text-xl text-gray-700">Cargando bienes, por favor espera...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center mt-10">
                <h2 className="text-red-500 text-2xl font-bold">Error al cargar los bienes</h2>
                <p className="text-gray-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="container flex-grow p-4">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-800"
                >
                    <FaArrowLeft className="mr-2" />
                    Volver
                </button>
                <div className="flex space-x-4">
                    <button
                        onClick={() => navigate('/home')}
                        className="px-4 py-2 bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-800"
                    >
                        <FaHome className="mr-2" />
                        Inicio
                    </button>
                    <button
                        onClick={() => navigate('/logout')}
                        className="px-4 py-2 bg-red-700 text-white rounded-lg shadow-md hover:bg-red-800"
                    >
                        <FaSignOutAlt className="mr-2" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Lista de Bienes</h2>
            <Table
                dataSource={sortedBienes}
                columns={columns}
                rowKey="uuid"
                pagination={{ pageSize: 10 }}
            />

            {/* Modal para trazabilidad */}
            {trazabilidad && (
                <Modal open={true} onCancel={() => setTrazabilidad(null)} footer={null}>
                    <h3>Trazabilidad del Bien</h3>
                    <pre>{JSON.stringify(trazabilidad, null, 2)}</pre>
                </Modal>
            )}
        </div>
    );
};

export default BienList;
