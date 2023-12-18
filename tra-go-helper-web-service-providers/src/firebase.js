// Import the compat version for the Web namespaced API
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNUk_3TiUs_X8GQQr34kGinQtWBCcyAUc",
  authDomain: "tra-go-helper-ec2a3.firebaseapp.com",
  databaseURL: "https://tra-go-helper-ec2a3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tra-go-helper-ec2a3",
  storageBucket: "tra-go-helper-ec2a3.appspot.com",
  messagingSenderId: "438642593026",
  appId: "1:438642593026:web:4f8c75de87dfaaecc3461b",
  measurementId: "G-ZSZX65H3Q2"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.database(); // Use the database() method to get the Realtime Database instance
const auth = firebaseApp.auth(); // Use the auth() method to get the Authentication instance
const storageRef = firebase.storage().ref();

export { db, auth, storageRef };