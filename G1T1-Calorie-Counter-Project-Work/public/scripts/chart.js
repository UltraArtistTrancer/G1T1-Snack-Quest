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

// Function to fetch user data and create charts
async function createFoodCharts(userId) {
    try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const userData = docSnap.data();
            const foodHistory = userData.foodHistory || [];
            
            // Group food entries by date
            const groupedData = foodHistory.reduce((acc, entry) => {
                const date = new Date(entry.date).toLocaleDateString();
                if (!acc[date]) {
                    acc[date] = {
                        calories: 0,
                        protein: 0,
                        carbs: 0,
                        fat: 0
                    };
                }
                acc[date].calories += entry.calories || 0;
                acc[date].protein += entry.protein || 0;
                acc[date].carbs += entry.carbs || 0;
                acc[date].fat += entry.fat || 0;
                return acc;
            }, {});

            // Convert grouped data to arrays for charts
            const dates = Object.keys(groupedData);
            const caloriesData = dates.map(date => groupedData[date].calories);
            const macroData = {
                protein: dates.map(date => groupedData[date].protein),
                carbs: dates.map(date => groupedData[date].carbs),
                fat: dates.map(date => groupedData[date].fat)
            };

            // Create calorie chart
            createLineChart('calorieChart', dates, [{
                label: 'Daily Calories',
                data: caloriesData,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }], 'Calories Consumed');

            // Create macronutrients chart
            createLineChart('macroChart', dates, [
                {
                    label: 'Protein (g)',
                    data: macroData.protein,
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                },
                {
                    label: 'Carbs (g)',
                    data: macroData.carbs,
                    borderColor: 'rgb(54, 162, 235)',
                    tension: 0.1
                },
                {
                    label: 'Fat (g)',
                    data: macroData.fat,
                    borderColor: 'rgb(255, 206, 86)',
                    tension: 0.1
                }
            ], 'Macronutrients');
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById('error-message').textContent = 
            'Error loading charts. Please try again later.';
    }
}

function createLineChart(canvasId, labels, datasets, title) {
    const ctx = document.getElementById(canvasId);
    new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: title
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: title === 'Calories Consumed' ? 'Calories' : 'Grams'
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

// Check authentication state and create charts
onAuthStateChanged(auth, (user) => {
    if (user) {
        createFoodCharts(user.uid);
    } else {
        window.location.href = "/index.html";
    }
});