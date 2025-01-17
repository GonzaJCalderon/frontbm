// Home.jsx
import React, { useState } from 'react';
import Register from './RegisterForm'; 
import Login from './Login';
import logo from '../assets/logo-png-sin-fondo.png'; 

const IngresoComponent = ({ onRegisterClick }) => (
  <div className="bg-gray-100 p-6 rounded-lg shadow-md flex items-center h-full">
    <div className="ml-auto"> 
      <Login onRegisterClick={onRegisterClick} />
    </div>
  </div>
);

const RegistroComponent = () => (
  <div className="bg-gray-100 p-6 rounded-lg shadow-md flex items-center h-full">
    <div className="ml-auto"> 
      <Register />
    </div>
  </div>
);

const Home = () => {
  const [mostrarIngreso, setMostrarIngreso] = useState(false);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  const handleMostrarIngreso = () => {
    setMostrarIngreso(true);
    setMostrarRegistro(false);
  };

  const handleMostrarRegistro = () => {
    setMostrarRegistro(true);
    setMostrarIngreso(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-blue-500 text-black font-sans">
      <div className="max-w-6xl mx-auto p-6 flex flex-col justify-center items-center h-full">
        <div className="grid md:grid-cols-2 gap-8 w-full">
          <div className="text-center md:text-left md:order-last">
            <img src={logo} alt="Premium Benefits" className="object-contain w-full h-auto max-h-96" />
          </div>
          <div className="flex flex-col items-center justify-center md:items-start">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 md:!leading-[55px] text-blue-100 text-center">
  Sistema Provincial Preventivo Bienes Muebles Usados{' '}
  <span className="inline-flex items-center">
    Ley N° 9556
  </span>
</h2>

         

            <p className="text-base text-blue-200 mb-10">
              ¡Bienvenido! Aquí podrá registrar la compra y venta de Bienes Muebles Usados
            </p>
            <div className="flex justify-center w-full">
              <button
                onClick={handleMostrarIngreso}
                className="px-8 py-2 text-base tracking-wider font-semibold outline-none border border-white bg-white text-blue-500 hover:bg-blue-600 hover:text-white transition-all duration-300 mr-4"
              >
                Ingresar
              </button>
              <button
                onClick={handleMostrarRegistro}
                className="px-8 py-2 text-base tracking-wider font-semibold outline-none border border-white bg-white text-green-500 hover:bg-green-600 hover:text-white transition-all duration-300"
              >
                Registrarse
              </button>
            </div>
          </div>
        </div>
        {mostrarIngreso && <IngresoComponent onRegisterClick={handleMostrarRegistro} />}
        {mostrarRegistro && <RegistroComponent />}
      </div>
    </div>
  );
};

export default Home;
