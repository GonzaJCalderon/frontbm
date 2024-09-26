import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Button, Typography, Space, Divider } from 'antd';
import { HomeOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const SuccessPage = () => {
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const successFlag = Cookies.get('purchaseSuccess');
        if (successFlag === 'true') {
            setIsSuccess(true);
            Cookies.remove('purchaseSuccess'); // Opcional: quitar la cookie después de leerla
        } else {
            setIsSuccess(false);
        }
    }, []);

    const userRole = Cookies.get('userRole') || 'no role';
    const userData = JSON.parse(Cookies.get('userData') || '{}');

    const handleLogout = () => {
        Cookies.remove('userRole');
        Cookies.remove('userData');
        navigate('/login'); // Redirigir al usuario a la página de inicio de sesión
    };

    const handleHome = () => {
        navigate('/'); // Redirigir al usuario a la página principal
    };

    if (!isSuccess) {
        return <div>Acceso denegado</div>;
    }

    return (
        <div className="p-4">
            <Space direction="horizontal" size="large" style={{ marginBottom: '20px' }}>
                <Button 
                    icon={<HomeOutlined />} 
                    onClick={handleHome} 
                    type="link"
                >
                    Home
                </Button>
                <Button 
                    icon={<LogoutOutlined />} 
                    onClick={handleLogout} 
                    type="link"
                >
                    Cerrar Sesión
                </Button>
            </Space>
            <Title level={1}>Confirmación</Title>
            <Divider />
            <div className="border p-4 rounded-lg">
                <Title level={2}>
                    Datos del {userRole === 'vendedor' ? 'Comprador' : 'Vendedor'}
                </Title>
                <Paragraph>
                    <strong>Nombre:</strong> {userRole === 'vendedor' ? 'Nombre Comprador' : userData.nombre || 'No disponible'}
                </Paragraph>
                <Paragraph>
                    <strong>DNI:</strong> {userRole === 'vendedor' ? 'DNI Comprador' : userData.dni || 'No disponible'}
                </Paragraph>
                <Paragraph>
                    <strong>CUIT:</strong> {userRole === 'vendedor' ? 'CUIT Comprador' : userData.cuit || 'No disponible'}
                </Paragraph>
            </div>
        </div>
    );
};

export default SuccessPage;
