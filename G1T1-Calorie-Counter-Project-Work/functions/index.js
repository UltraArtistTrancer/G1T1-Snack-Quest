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