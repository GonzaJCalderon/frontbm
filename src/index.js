import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import './assets/styles/tailwind.css';
import './index.css'; // Importa index.css para aplicar el patrón global
import { Provider } from 'react-redux';
import store from './redux/store/store'; // Asegúrate de importar tu store de Redux aquí
import App from './App';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Importar los estilos de react-toastify

// Solución para el problema del ResizeObserver
window.addEventListener('error', (event) => {
  if (event.message?.includes('ResizeObserver loop completed')) {
    console.warn('ResizeObserver loop error detectado y prevenido.');
    event.preventDefault();
  }
});


ReactDOM.render(
  <Provider store={store}>
    <Router>
      <App />
      <ToastContainer // Configura el contenedor de notificaciones
        position="top-right" // Posición de las notificaciones
        autoClose={3000} // Tiempo de cierre automático en milisegundos
        hideProgressBar={false} // Mostrar barra de progreso
        newestOnTop={false} // Mostrar notificaciones nuevas en la parte superior
        closeOnClick // Cerrar al hacer clic
        rtl={false} // De derecha a izquierda
        pauseOnFocusLoss // Pausar al perder el foco
        draggable // Permitir arrastrar la notificación
        pauseOnHover // Pausar al pasar el ratón
        theme="light" // Tema claro (puedes cambiar a "dark" si lo prefieres)
      />
    </Router>
  </Provider>,
  document.getElementById('root')
);
