import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// Configuración de Firebase (asegúrate de usar tu propia configuración)
const firebaseConfig = {
    apiKey: "AIzaSyDf9GesEj5EUhvD8-ElKqrOHGh-crh4DHI",
    authDomain: "bienesmuebles-6616a.firebaseapp.com",
    projectId: "bienesmuebles-6616a",
    storageBucket: "bienesmuebles-6616a.firebasestorage.app",
    messagingSenderId: "85054160825",
    appId: "1:85054160825:web:5d8a03304f554900c38068",
    measurementId: "G-082L0W3EWD"
};

// Inicializa Firebase solo si no se ha inicializado aún
const app = initializeApp(firebaseConfig);
const storage = getStorage(app); // Usamos la app inicializada

export { storage };
