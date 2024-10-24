import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
    import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
    import { getFirestore, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
    import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-functions.js";
    import { fetchNutritionData } from './NutritionAPI.js';

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

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);  // Make sure Firestore is initialized

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

    const registerForm = document.getElementById('foodInputForm');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        let foodInput = new Date().toISOString().split('T')[0] + '|' + document.getElementById('foodInput').value;

        try {
            const userId = auth.currentUser.uid; // Get current user ID
            const firestoreData = await fetchUserData(userId);
            if (firestoreData) {
                foodInput = firestoreData.foodInput + '|' + foodInput;
            }

            // Prepare user data for Firestore
            const userData = {
                foodInput: foodInput
            };

            // Save user data to Firestore
            //To modify your existing code so that it adds data to the existing user document 
            //instead of replacing the entire document in Firestore, you need to use the updateDoc function instead of setDoc. 
            //The setDoc function replaces the document, while updateDoc only updates the specific fields you provide, 
            //leaving the other fields intact.
            await updateDoc(doc(db, "users", userId), userData);
            alert('Food submission successful .');
            window.location.href = "3DVersion.html";
        } catch (error) {
            console.error("Error during registration:", error);
            alert(error.message);
        }
    });