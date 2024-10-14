import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

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

// Fetch leaderboard function
async function fetchLeaderboard(currentUserId) {
    const usersCollectionRef = collection(db, "users");
    try {
        const querySnapshot = await getDocs(usersCollectionRef);
        const users = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            users.push({ id: doc.id, ...data });
        });
        users.sort((a, b) => b.weight - a.weight);
        const top10Users = users.slice(0, 10);
        const currentUser = users.find(user => user.id === currentUserId);
        const currentUserRank = users.findIndex(user => user.id === currentUserId) + 1;
        displayLeaderboard(top10Users, currentUser, currentUserRank);
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

// Display leaderboard function
function displayLeaderboard(topUsers, currentUser, currentUserRank) {
    const leaderboardContainer = document.getElementById('leaderboard-container');
    leaderboardContainer.innerHTML = '';
    topUsers.forEach((user, index) => {
        const userEntry = document.createElement('div');
        userEntry.innerText = `${index + 1}. ${user.username}: ${user.weight} kg`;
        leaderboardContainer.appendChild(userEntry);
    });
    if (currentUser) {
        const currentUserEntry = document.createElement('div');
        currentUserEntry.innerText = `Your Rank: ${currentUserRank} - ${currentUser.username}: ${currentUser.weight} kg`;
        leaderboardContainer.appendChild(currentUserEntry);
    } else {
        const noRankEntry = document.createElement('div');
        noRankEntry.innerText = "You are not in the top 10.";
        leaderboardContainer.appendChild(noRankEntry);
    }
}

// Handle logout
const logoutButton = document.getElementById('logout-button');
logoutButton.addEventListener('click', async () => {
    await signOut(auth);
});

// Auth state change listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userId = user.uid;
        fetchLeaderboard(userId);
    } else {
        console.log("No user is logged in");
        // Optionally redirect to login page
        window.location.href = "index.html";
    }
});
