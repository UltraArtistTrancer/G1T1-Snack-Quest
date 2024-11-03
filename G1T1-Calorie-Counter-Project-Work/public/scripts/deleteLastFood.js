
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

let foodHistory = '';
let foodString = '';

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
        if (userData.foodInput[0] != "2") {
            document.getElementById('mealType').textContent = 'empty';
            document.getElementById('foodInput').textContent = 'empty';
        } else {
            // Split the string by the delimiter "|"
            foodHistory = userData.foodInput;
            foodString = userData.foodInput;
            // Initial display of food sets
            displayFoodSets();
            const parts = userData.foodInput.split('|');

            // Extract the first `mealType` and `foodInput` values
            const mealType = parts[1]; // The first mealType is at index 1
            const foodInput = parts[2]; // The first foodInput is at index 2
            document.getElementById('mealType').textContent = mealType;
            document.getElementById('foodInput').textContent = foodInput;
        }
    }
}

// Form submission event listener
const updateForm = document.getElementById('deleteLastMealForm');
updateForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        const userId = auth.currentUser.uid; // Get current user ID
        // // Split the string by '|'
        // let parts = foodHistory.split('|');

        // // Remove the first set of date|mealType|foodInput (3 elements)
        // parts.splice(0, 3);

        // // Rejoin the remaining elements
        // let updatedString = parts.join('|');
        
        const updatedData = {
            foodInput: foodString,
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

// Function to display food sets
function displayFoodSets() {
    const foodContainer = document.getElementById("foodContainer");
    foodContainer.innerHTML = ""; // Clear existing content

    // Split the string into individual food sets
    const foodSets = foodString.split('|').reduce((result, item, index) => {
      const setIndex = Math.floor(index / 3);
      if (!result[setIndex]) result[setIndex] = [];
      result[setIndex].push(item);
      return result;
    }, []);

    // Append each food set to the container
    foodSets.forEach((set, index) => {
      const foodSetDiv = document.createElement("div");
      foodSetDiv.className = "food-set";
      
      const foodText = document.createElement("span");
      foodText.textContent = set.join(" | ");
      foodSetDiv.appendChild(foodText);

      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-btn";
      deleteButton.textContent = "Delete";
      deleteButton.onclick = () => deleteFoodSet(index);
      foodSetDiv.appendChild(deleteButton);

      foodContainer.appendChild(foodSetDiv);
    });
  }

// Function to delete a food set by index
async function deleteFoodSet(index) {
    const foodSets = foodString.split('|').reduce((result, item, i) => {
      const setIndex = Math.floor(i / 3);
      if (!result[setIndex]) result[setIndex] = [];
      result[setIndex].push(item);
      return result;
    }, []);

    // Remove the food set at the specified index
    foodSets.splice(index, 1);

    // Recreate the concatenated string
    foodString = foodSets.map(set => set.join("|")).join("|");

    const userId = auth.currentUser.uid; // Get current user ID
        // // Split the string by '|'
        // let parts = foodHistory.split('|');

        // // Remove the first set of date|mealType|foodInput (3 elements)
        // parts.splice(0, 3);

        // // Rejoin the remaining elements
        // let updatedString = parts.join('|');
        
        const updatedData = {
            foodInput: foodString,
        };

        await updateDoc(doc(db, "users", userId), updatedData);
        alert('User data updated successfully!');
        window.location.href = "../views/home.html";
}