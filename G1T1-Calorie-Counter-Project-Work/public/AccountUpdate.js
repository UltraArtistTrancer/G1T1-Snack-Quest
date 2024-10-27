// Import necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { fetchNutritionData } from './NutritionAPI.js';

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
        document.getElementById('update-username').value = userData.username;
        document.getElementById('sex').value = userData.sex;
        document.getElementById('birthdate').value = userData.birthdate;
        document.getElementById('height').value = userData.height;
        document.getElementById('weight').value = userData.weight;
        document.getElementById('lifestyle').value = userData.lifestyle;
        document.getElementById('update-goals').value = userData.goals;
        document.getElementById('update-breakfast-time').value = userData.mealTimes.breakfast;
        document.getElementById('update-lunch-time').value = userData.mealTimes.lunch;
        document.getElementById('update-dinner-time').value = userData.mealTimes.dinner;

        document.getElementById('display-username').textContent = userData.username;
        document.getElementById('display-sex').textContent = userData.sex;
        document.getElementById('display-birthdate').textContent = userData.birthdate;
        document.getElementById('display-height').textContent = userData.height;
        document.getElementById('display-weight').textContent = userData.weight;
        document.getElementById('display-lifestyle').textContent = userData.lifestyle;
        document.getElementById('display-goals').textContent = userData.goals;
        document.getElementById('display-breakfast-time').textContent = userData.mealTimes.breakfast;
        document.getElementById('display-lunch-time').textContent = userData.mealTimes.lunch;
        document.getElementById('display-dinner-time').textContent = userData.mealTimes.dinner;
    }
}

// Function to check if a username is unique
async function isUsernameUnique(username) {
    const userRef = collection(db, 'users'); // Get the reference to the 'users' collection
    const q = query(userRef, where('username', '==', username)); // Create a query for the username
    const snapshot = await getDocs(q); // Execute the query and get the snapshot
    return snapshot.empty; // Return true if no user found with the same username
}

// Function to handle username check and enable/disable button
async function checkUsername() {
    const usernameInput = document.getElementById('update-username').value;
    const usernameStatus = document.getElementById('username-status');
    const currentUsername =  document.getElementById('display-username').textContent;
    console.log("Current Username:", currentUsername)

    if (usernameInput) {
        const isUnique = await isUsernameUnique(usernameInput);
        if (isUnique || usernameInput===currentUsername) {
            usernameStatus.textContent = "Username is available";
            usernameStatus.style.color = "green";
        } else {
            usernameStatus.textContent = "Username is taken";
            usernameStatus.style.color = "red";
        }
    } else {
        usernameStatus.textContent = "";
    }
}

// Add event listener to check username availability on button click
document.getElementById('check-username-btn').addEventListener('click', checkUsername);

// Form submission event listener
const updateForm = document.getElementById('updateForm');
updateForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        // Call fetchNutritionData and wait for it to complete
        await fetchNutritionData(); // This will populate the nutrition data

        const userId = auth.currentUser.uid; // Get current user ID
        const newUsername = document.getElementById('update-username').value;
        const currentUsername =  document.getElementById('display-username').textContent;

        // Ensure the username is still available
        if (!(await isUsernameUnique(newUsername) || newUsername===currentUsername)) {
            alert("Username is taken, please choose another one.");
            return;
        }

        const updatedData = {
            username: newUsername,
            birthdate: document.getElementById('birthdate').value,
            height: document.getElementById('height').value,
            weight: document.getElementById('weight').value,
            lifestyle: document.getElementById('lifestyle').value,
            goals: document.getElementById('update-goals').value,
            mealTimes: {
                breakfast: document.getElementById('update-breakfast-time').value,
                lunch: document.getElementById('update-lunch-time').value,
                dinner: document.getElementById('update-dinner-time').value,
            },
            // Nutrition fields
            sex: document.getElementById('sex').value,
            carbohydrates: document.getElementById('carbohydrates').value,
            protein: document.getElementById('protein').value,
            fat: document.getElementById('fat').value,
            fiber: document.getElementById('fiber').value,
            bmi: document.getElementById('bmi').value,
            calorieNeeds: document.getElementById('calorieNeeds').value,
        };

        await updateDoc(doc(db, "users", userId), updatedData);
        alert('User data updated successfully!');
        window.location.href = "views/index.html";
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
