/*

const functions = require('firebase-functions');
const axios = require('axios');
const cors = require('cors')({origin: true});

exports.searchWikipedia = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        const breed = req.query.breed;
        if (!breed) {
            res.status(400).send("Breed query parameter is required");
            return;
        }

        const formattedBreed = breed === "germanshepherd" ? "german shepherd" : breed;
        const bestMatchTitle = await searchWikipedia(`${formattedBreed} dog`);

        if (bestMatchTitle) {
            const firstSentence = await getFirstSentence(bestMatchTitle);
            res.status(200).send(`${firstSentence}.`);
        } else {
            res.status(404).send("No matching page found on Wikipedia.");
        }
    });
});

async function searchWikipedia(query) {
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}`;

    try {
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (data.query && data.query.search && data.query.search.length > 0) {
            // Get the title of the best match
            const bestMatchTitle = data.query.search[0].title;
            return bestMatchTitle;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error searching Wikipedia:", error.message);
        return null;
    }
}

async function getFirstSentence(pageTitle) {
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&titles=${encodeURIComponent(pageTitle)}`;

    try {
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (data.query && data.query.pages) {
            const pageId = Object.keys(data.query.pages)[0];
            const firstSentence = data.query.pages[pageId].extract.split('.')[0];
            return firstSentence;
        } else {
            return "Unable to retrieve content from Wikipedia.";
        }
    } catch (error) {
        console.error("Error fetching content from Wikipedia:", error.message);
        return "Error occurred while fetching content from Wikipedia.";
    }
}
*/

// index.js in your 'functions' directory
/*const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

exports.checkUsername = functions.https.onCall(async (data, context) => {
    const username = data.username;
    if (!username) {
        throw new functions.https.HttpsError("invalid-argument", "Username is required.");
    }

    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("username", "==", username).get();

    if (snapshot.empty) {
        return { available: true };
    } else {
        return { available: false };
    }
});*/

/*const functions = require("firebase-functions/v2");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true }); // Import and configure CORS

admin.initializeApp();

const db = admin.firestore();

// Gen 2 Cloud Function for checking if a username exists with CORS enabled
exports.checkUsername = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      // Check for HTTP method
      if (req.method !== "POST") {
        return res.status(405).send("Only POST requests are allowed");
      }

      const { username } = req.body;

      if (!username) {
        return res.status(400).send("Username is required");
      }

      // Query Firestore for the username
      const userQuery = await db.collection("users")
        .where("username", "==", username)
        .get();

      if (!userQuery.empty) {
        // Username exists
        return res.status(200).json({ available: false });
      } else {
        // Username does not exist
        return res.status(200).json({ available: true });
      }
    } catch (error) {
      console.error("Error checking username:", error);
      return res.status(500).send("Internal Server Error");
    }
  });
});*/

const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const cors = require("cors")({ origin: true });

initializeApp();
const db = getFirestore();

// Gen 2 Cloud Function with region specified
exports.checkUsername = onRequest({ region: "asia-southeast1" }, (req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Methods", "POST");
      res.set("Access-Control-Allow-Headers", "Content-Type");
      res.set("Access-Control-Allow-Origin", "https://snack-quest.web.app");
      return res.status(204).send("");
    }

    try {
      if (req.method !== "POST") {
        return res.status(405).send("Only POST requests are allowed");
      }

      const { username } = req.body;

      if (!username) {
        return res.status(400).send("Username is required");
      }

      const userQuery = await db.collection("users")
        .where("username", "==", username)
        .get();

      const available = userQuery.empty;
      res.set("Access-Control-Allow-Origin", "https://snack-quest.web.app");
      return res.status(200).json({ available });
    } catch (error) {
      console.error("Error checking username:", error);
      res.set("Access-Control-Allow-Origin", "https://snack-quest.web.app");
      return res.status(500).send("Internal Server Error");
    }
  });
});