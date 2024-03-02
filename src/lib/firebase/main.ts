import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import * as dotenv from 'dotenv';
dotenv.config({path: '.env'});

const firebaseConfig = {
    apiKey: process.env.APIKEY,
    authDomain: "instanote111.firebaseapp.com",
    projectId: "instanote111",
    storageBucket: "instanote111.appspot.com",
    messagingSenderId: process.env.MESSAGINGSENDERID,
    appId: process.env.APPID
};


const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);

export default firestore;