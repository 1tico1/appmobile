// Importando o Firebase SDK
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, push } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBu23XqaaGP7ww-_L7ckZ89oGnQV8gypVw",
    authDomain: "giftapp-c69fc.firebaseapp.com",
    databaseURL: "https://giftapp-c69fc-default-rtdb.firebaseio.com",
    projectId: "giftapp-c69fc",
    storageBucket: "giftapp-c69fc.appspot.com",
    messagingSenderId: "11005733140",
    appId: "1:11005733140:web:2a1752e863f2c2c9edba01"
};

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);

export { database, storage };
