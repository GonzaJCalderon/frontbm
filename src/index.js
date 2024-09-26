import React from 'react';
import ReactDOM from 'react-dom';
import './assets/styles/tailwind.css';
import './index.css'; // Importa index.css para aplicar el patrón global
import { Provider } from 'react-redux';
import store from './redux/store/store'; // Asegúrate de importar tu store de Redux aquí
import App from './App';

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
