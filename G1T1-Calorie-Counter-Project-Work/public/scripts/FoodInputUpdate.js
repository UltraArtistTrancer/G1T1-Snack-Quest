
// Import necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
// import { generateAPIResponse } from './NakedGeminiNutritionWrapper.js';

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


let historyFood = '';
let foodInput = '';



// Function to fetch user data
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

// Populate the form with the user's data
async function populateUpdateForm(userId) {
    const userData = await fetchUserData(userId);
    if (userData) {
        if (userData.foodInput)
        historyFood = userData.foodInput;
    }
}

// Form submission event listener
const updateForm = document.getElementById('updateForm');
updateForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        // Call fetchNutritionData and wait for it to complete
        // await fetchNutritionData(); // This will populate the nutrition data
        const userId = auth.currentUser.uid; // Get current user ID
        const currentDate = new Date().toISOString().slice(0, 10);
        const mealDropdown = document.getElementById("mealDropdown");
        if (historyFood[0] == '2') { // check if user has any data inside foodInput or first time submitting
            foodInput = currentDate + '|' + mealDropdown.value + '|' + document.getElementById('food').value + '|' + historyFood;
        } else {
            foodInput = currentDate + '|' + mealDropdown.value + '|' + document.getElementById('food').value;
        }
        
        const updatedData = {
            foodInput: foodInput,
        };

        await updateDoc(doc(db, "users", userId), updatedData);
        alert('User data updated successfully!');
        window.location.href = "../views/home.html";
    } catch (error) {
        console.error('Error updating user data:', error);
        alert('Failed to update user data. Please try again.');
    }
});

// Call this function when the page loads to populate the form
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userId = user.uid;
        populateUpdateForm(userId);
    } else {
        console.log("No user is signed in.");
    }
});

