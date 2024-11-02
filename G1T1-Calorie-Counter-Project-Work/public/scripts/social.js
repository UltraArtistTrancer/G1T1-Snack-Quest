import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getFirestore, collection, getDoc, getDocs, doc, setDoc, query, where } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

// Initialize Firebase
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

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

async function loadFriends() {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const friendsList = document.getElementById("friends-list");
    friendsList.innerHTML = "";

    const friendsRef = collection(db, `users/${userId}/friends`);
    const friendsSnapshot = await getDocs(friendsRef);
    friendsSnapshot.forEach(doc => {
        const friend = doc.data();
        const li = document.createElement("li");
        li.textContent = friend.username;
        friendsList.appendChild(li);
    });
}

async function addFriend() {
    const friendUsername = document.getElementById("friend-email").value;
    if (!friendUsername) return alert("Please enter a friend's username");

    const currentUser = auth.currentUser;
    const userId = currentUser.uid;

    // Find friend user ID by username
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", friendUsername));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        alert("User not found");
        return;
    }

    const friendDoc = querySnapshot.docs[0];
    const friendId = friendDoc.id;

    // Add friend for current user
    await setDoc(doc(db, `users/${userId}/friends`, friendId), { username: friendUsername });

    // Add current user as friend for the other user
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
    const userData = await fetchUserData(userId);
    const toFriendName = userData.username
    await setDoc(doc(db, `users/${friendId}/friends`, userId), { username: toFriendName});

    alert("Friend added!");
    loadFriends();
    document.getElementById("friend-email").value = ""; // Clear input
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        loadFriends();
    } else {
        console.log("User not signed in");
    }
});

window.addFriend = addFriend; // Expose addFriend to HTML for button onclick