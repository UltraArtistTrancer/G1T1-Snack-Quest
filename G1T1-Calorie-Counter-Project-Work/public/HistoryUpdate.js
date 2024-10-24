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
// async function populateUpdateForm(userId) {
//     const userData = await fetchUserData(userId);
//     if (userData) {
//         // Split the string by the '|' separator
//         const dataArray = userData.foodInput.split('|');
//         document.getElementById('foodHistory').textContent = dataArray;
//         for(food of dataArray) {
//             let tr = document.createElement("tr");
//             jokeTableTbody.appendChild(tr);
//             let td = document.createElement("td");
//             let textNode = document.createTextNode(food); //i learn something new, that creating text is different from creating html element
//             td.appendChild(textNode);  //interesting because LT1_2023_24 Q3 ulist.appendChild(list_item) does not require appendChild(textNode)
//             tr.appendChild(td);
//         }
//     }
// }

async function populateUpdateForm(userId) {
    const userData = await fetchUserData(userId);
    if (userData) {
        // Split the string by the '|' separator
        const dataArray = userData.foodInput.split('|');
        
        // Clear any existing content in the table
        const jokeTableTbody = document.getElementById("foodHistory"); // Correct reference to your <tbody> element
        jokeTableTbody.innerHTML = "";  // Clear the table body

        // Iterate over the dataArray and add rows dynamically
        for (let i = 0; i < dataArray.length; i += 2) {
            // Create new row and cells for date and food
            let tr = document.createElement("tr");
            let tdDate = document.createElement("td");
            let tdFood = document.createElement("td");

            // Create text nodes for date and food
            let textNodeDate = document.createTextNode(dataArray[i]);    // Date
            let textNodeFood = document.createTextNode(dataArray[i + 1]); // Food

            // Append text nodes to the respective table cells
            tdDate.appendChild(textNodeDate);
            tdFood.appendChild(textNodeFood);

            // Append the cells to the row
            tr.appendChild(tdDate);
            tr.appendChild(tdFood);

            // Finally, append the row to the table body
            jokeTableTbody.appendChild(tr);
        }
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



