// app.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

// Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Your existing fetch and update logic goes here
async function fetchUserData(userId) {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        console.log("No such document!");
        return null;
    }
}

async function populateUpdateForm(userId) {
    const userData = await fetchUserData(userId);
    if (userData) {
        document.getElementById('home-username').textContent = userData.username;
        const birthdate = userData.birthdate; // Assuming the birthdate is stored as a string 'YYYY-MM-DD'
        const age = calculateAge(birthdate);

        // Update the display for birthdate and age
        document.getElementById('home-birthdate').textContent = `Birthdate: ${birthdate} (Age: ${age})`;
        // document.getElementById('home-birthdate').textContent = userData.birthdate;
        document.getElementById('home-height').textContent = userData.height;
        document.getElementById('home-weight').textContent = userData.weight;
        document.getElementById('home-lifestyle').textContent = userData.lifestyle;
        document.getElementById('home-goals').textContent = userData.goals;
        document.getElementById('home-breakfast-time').textContent = userData.mealTimes.breakfast;
        document.getElementById('home-lunch-time').textContent = userData.mealTimes.lunch;
        document.getElementById('home-dinner-time').textContent = userData.mealTimes.dinner;
    }
}

// Call this function when the page loads to populate the form
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userId = user.uid;
        populateUpdateForm(userId);
    } else {
        console.log("No user is signed in.");
    }
});

function calculateAge(birthdate) {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if the birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}