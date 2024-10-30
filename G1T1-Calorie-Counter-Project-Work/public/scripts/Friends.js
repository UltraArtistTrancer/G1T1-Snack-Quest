import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

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

// Function to send a friend request
async function sendFriendRequest(userId, friendId) {
    const friendshipRef = collection(db, "friendships");
    const friendshipDoc = doc(friendshipRef);

    await setDoc(friendshipDoc, {
        userId,
        friendId,
        status: "pending",
        createdAt: new Date()
    });
}

window.sendFriendRequest = sendFriendRequest;
window.acceptFriendRequest = acceptFriendRequest; // If you need it globally as well
window.getFriends = getFriends; // If you need it globally as well
window.getReceivedRequests = getReceivedRequests; // If you need it globally as well

// Function to accept a friend request
async function acceptFriendRequest(friendshipId) {
    const friendshipRef = doc(db, "friendships", friendshipId);
    await updateDoc(friendshipRef, {
        status: "accepted"
    });
}

// Function to retrieve friends for a user
async function getFriends(userId) {
    const friendshipsRef = collection(db, "friendships");
    const q = query(friendshipsRef, where("userId", "==", userId), where("status", "==", "accepted"));
    const querySnapshot = await getDocs(q);
    
    const friends = querySnapshot.docs.map(doc => doc.data());
    return friends;
}

// Function to retrieve received friend requests
async function getReceivedRequests(userId) {
    const friendshipsRef = collection(db, "friendships");
    const q = query(friendshipsRef, where("friendId", "==", userId), where("status", "==", "pending"));
    const querySnapshot = await getDocs(q);
    
    const requests = querySnapshot.docs.map(doc => doc.data());
    return requests;
}

