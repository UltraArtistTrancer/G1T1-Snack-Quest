import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getFirestore,collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

// Fill in with your own web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBAhYdiPIDo0OtV-RoIiRVQCxvgofMb0js",
    authDomain: "snack-quest.firebaseapp.com",
    databaseURL: "https://snack-quest-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "snack-quest",
    storageBucket: "snack-quest.appspot.com",
    messagingSenderId: "974726219698",
    appId: "1:974726219698:web:361c5bf4bf98a8798c86ab",
    measurementId: "G-YXRNC4ZPTZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const logoutButton = document.getElementById('logout-button');

logoutButton.addEventListener('click', async () => {
    await signOut(auth);
});

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "../index.html"
    }
});