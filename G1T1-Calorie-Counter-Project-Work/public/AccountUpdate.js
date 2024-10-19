// Import necessary Firebase functions
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
        document.getElementById('update-birthdate').value = userData.birthdate;
        document.getElementById('update-height').value = userData.height;
        document.getElementById('update-weight').value = userData.weight;
        document.getElementById('update-lifestyle').value = userData.lifestyle;
        document.getElementById('update-goals').value = userData.goals;
        document.getElementById('update-breakfast-time').value = userData.mealTimes.breakfast;
        document.getElementById('update-lunch-time').value = userData.mealTimes.lunch;
        document.getElementById('update-dinner-time').value = userData.mealTimes.dinner;

        document.getElementById('display-username').textContent = userData.username;
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
    const userRef = db.collection('users');
    const snapshot = await userRef.where('username', '==', username).get();
    return snapshot.empty; // Return true if no user found with the same username
}

// Function to handle username check and enable/disable button
async function checkUsername() {
    const usernameInput = document.getElementById('update-username').value;
    const usernameStatus = document.getElementById('username-status');

    if (usernameInput) {
        const isUnique = await isUsernameUnique(usernameInput);
        if (isUnique) {
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

// Add event listener to check username availability on input change
document.getElementById('check-username-btn').addEventListener('click', checkUsername);

// Form submission event listener
const updateForm = document.getElementById('updateForm');
updateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = auth.currentUser.uid; // Get current user ID
    const newUsername = document.getElementById('update-username').value;

    // Make sure the username is still available before proceeding
    if (!(await isUsernameUnique(newUsername))) {
        alert("Username is taken, please choose another one.");
        return;
    }

    const updatedData = {
        username: newUsername,
        birthdate: document.getElementById('update-birthdate').value,
        height: document.getElementById('update-height').value,
        weight: document.getElementById('update-weight').value,
        lifestyle: document.getElementById('update-lifestyle').value,
        goals: document.getElementById('update-goals').value,
        mealTimes: {
            breakfast: document.getElementById('update-breakfast-time').value,
            lunch: document.getElementById('update-lunch-time').value,
            dinner: document.getElementById('update-dinner-time').value
        }
    };

    try {
        await updateDoc(doc(db, "users", userId), updatedData);
        alert('User data updated successfully!');
        window.location.href = "3DVersion.html";
    } catch (error) {
        alert(error.message);
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
