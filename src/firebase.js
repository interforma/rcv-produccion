// En src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Tu configuración de Firebase personal
const firebaseConfig = {
  apiKey: "AIzaSyDOBeEkMZ8UYUKkvQWhl2NCzbzFoAH-NH4",
  authDomain: "rcv-produccion-db.firebaseapp.com",
  projectId: "rcv-produccion-db",
  storageBucket: "rcv-produccion-db.appspot.com",
  messagingSenderId: "467079642796",
  appId: "1:467079642796:web:545481c9de17beabf8a909",
  measurementId: "G-317W45VMHL"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
// Exporta la instancia de Firestore para usarla en otros archivos
export const db = getFirestore(app);