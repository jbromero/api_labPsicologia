require('dotenv').config();
const{initializeApp,applicationDefault}=require('firebase-admin/app');
const {getFirestore}=require('firebase-admin/firestore');
const {getAuth}= require('firebase-admin/auth');
const { credential } = require('firebase-admin');

const firebaseConfigBase64  = process.env.FIREBASE_CONFIG;
if(firebaseConfigBase64){
     // Decodifica la cadena Base64
     const firebaseConfigBuffer = Buffer.from(firebaseConfigBase64, 'base64');
     const firebaseConfig = JSON.parse(firebaseConfigBuffer.toString());   
     initializeApp({
        credential:credential.cert(firebaseConfig)
    });
}



const db= getFirestore();
const auth=getAuth();
module.exports={
    db,
}