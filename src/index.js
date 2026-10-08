import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './assets/styles/tailwind.css';
import './index.css';
import { Provider } from 'react-redux';
import store from './redux/store/store';
import App from './App';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Verificar variables de entorno en consola (DESPUÉS de las importaciones)
// console.log("🚀 REACT_APP_ENV:", process.env.REACT_APP_ENV);
// console.log("🌎 API URL LOCAL:", process.env.REACT_APP_API_URL_LOCAL);
// console.log("🌍 API URL REMOTE:", process.env.REACT_APP_API_URL_REMOTE);
// console.log("🔗 API URL ACTIVA:", process.env.REACT_APP_API_URL);

// Solución para el problema del ResizeObserver
window.addEventListener('error', (event) => {
  if (event.message?.includes('ResizeObserver loop completed')) {
    event.preventDefault();
  }
});

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </Provider>
  </React.StrictMode>
);
