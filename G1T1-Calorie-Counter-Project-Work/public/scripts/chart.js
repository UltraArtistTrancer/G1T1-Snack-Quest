import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

// Your existing Firebase config
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

// Function to fetch user data and create chart
async function createCalorieChart(userId) {
    try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const userData = docSnap.data();
            const foodHistory = userData.foodHistory || [];
            
            // Process data for chart
            const dates = [];
            const calories = [];
            
            foodHistory.forEach(entry => {
                dates.push(new Date(entry.date).toLocaleDateString());
                calories.push(entry.calories);
            });

            // Create chart
            const ctx = document.getElementById('calorieChart');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: 'Daily Calories',
                        data: calories,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Calories'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Date'
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Check authentication state and create chart
onAuthStateChanged(auth, (user) => {
    if (user) {
        createCalorieChart(user.uid);
    } else {
        window.location.href = "/index.html"; // Redirect to login if not authenticated
    }
});