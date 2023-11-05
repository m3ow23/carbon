import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";

function initilizeFirebase() {
    const firebaseConfig = {
        apiKey: "AIzaSyDVkAYyCd1ywcz7TD1BJEFsJOUMHt-bvl0",
        authDomain: "carbon-97e14.firebaseapp.com",
        databaseURL: "https://carbon-97e14-default-rtdb.firebaseio.com/",
        projectId: "carbon-97e14",
        storageBucket: "carbon-97e14.appspot.com",
        messagingSenderId: "613317046598",
        appId: "1:613317046598:web:be9c81debafe6da3e4f547",
        measurementId: "G-DZY2VWPDH5"
    };

    return initializeApp(firebaseConfig)
}

export { initilizeFirebase }