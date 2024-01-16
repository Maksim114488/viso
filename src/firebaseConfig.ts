import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD-I97m2P-TphTC-KPbNaTl9HrKenL0Dno",
  authDomain: "viso-ba421.firebaseapp.com",
  databaseURL:"asdfasdfasdfasdfasdfasdf",
  projectId: "viso-ba421",
  storageBucket: "viso-ba421.appspot.com",
  messagingSenderId: "35127118112",
  appId: "1:35127118112:web:642c7d774d27620e4def45",
  measurementId:"G-3GDSL2RVSK"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);