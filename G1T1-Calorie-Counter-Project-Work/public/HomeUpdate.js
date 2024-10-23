
    // Import Firebase services (Authentication, Firestore, Functions)
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
    import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
    import { getFirestore, doc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
    import { fetchUserData } from './AccountUpdate.js';

    // Firebase Configuration (replace with your own project's configuration)
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

    // Populate the form with the user's data
async function populateUpdateForm(userId) {
    const userData = await fetchUserData(userId);
    if (userData) {
        // document.getElementById('food-sex').value = userData.sex;
        // const userAge = calculateAge(userData.birthdate);
        // document.getElementById('food-age').value = userAge;
        // document.getElementById('food-height').value = userData.height;
        // document.getElementById('food-weight').value = userData.weight;
        // document.getElementById('food-lifestyle').value = userData.lifestyle;

        document.getElementById('home2--username').value = userData.username;
        document.getElementById('home2-birthdate').value = userData.birthdate;
        document.getElementById('home2-height').value = userData.height;
        document.getElementById('home2-weight').value = userData.weight;
        document.getElementById('home2-lifestyle').value = userData.lifestyle;
        document.getElementById('home2--goals').value = userData.goals;
        document.getElementById('home2--breakfast-time').value = userData.mealTimes.breakfast;
        document.getElementById('home2--lunch-time').value = userData.mealTimes.lunch;
        document.getElementById('home2--dinner-time').value = userData.mealTimes.dinner;

        document.getElementById('home2--username').textContent = userData.username;
        document.getElementById('home2--birthdate').textContent = userData.birthdate;
        document.getElementById('home2--height').textContent = userData.height;
        document.getElementById('home2--weight').textContent = userData.weight;
        document.getElementById('home2--lifestyle').textContent = userData.lifestyle;
        document.getElementById('home2--goals').textContent = userData.goals;
        document.getElementById('home2--breakfast-time').textContent = userData.mealTimes.breakfast;
        document.getElementById('home2--lunch-time').textContent = userData.mealTimes.lunch;
        document.getElementById('home2--dinner-time').textContent = userData.mealTimes.dinner;
    }
}

    // Set up listener for the logged-in user to get their UID
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userId = user.uid; // Get the unique user ID
            populateUpdateForm(userID);
            console.log("Logged in user's UID: ", userId);

            // Submit button event listener
            document.getElementById('submitFoodBtn').addEventListener('click', async () => {
                // Collect form data
                const foodInput = document.getElementById('foodInput').value;
                const mealType = document.getElementById('mealType').value;
                const currentDate = new Date().toISOString(); // Get the current date in ISO format
                
                try {
                    // Prepare the data to be added
                    const foodData = {
                        date: currentDate,
                        food: foodInput,
                        meal: mealType
                    };

                    // Update the Firestore document under the user's UID
                    const userDocRef = doc(db, "users", userId);

                    // Add the new data to a field (assume there's a field for storing multiple entries)
                    await updateDoc(userDocRef, {
                        foodEntries: arrayUnion(foodData)  // Add the new data to the array of food entries
                    });

                    // Notify the user
                    alert('Data successfully added!');
                } catch (error) {
                    console.error("Error adding data: ", error);
                    alert(error.message);
                }
            });

        } else {
            console.log("No user is signed in.");
        }
    });

    function calculateAge(birthdate) {
        const birthDateObj = new Date(birthdate); // Convert string to Date object
        const today = new Date(); // Current date
    
        let age = today.getFullYear() - birthDateObj.getFullYear(); // Calculate difference in years
        const monthDiff = today.getMonth() - birthDateObj.getMonth(); // Calculate difference in months
        const dayDiff = today.getDate() - birthDateObj.getDate(); // Calculate difference in days
    
        // Adjust the age if the birthdate has not occurred yet this year
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }
    
        return age;
    }