const express = require('express');
const bodyParser = require('body-parser');
const database = require('./firebaseConfig'); // Your Firebase config

const app = express();
app.use(bodyParser.json());

app.post('/register', async (req, res) => {
    const userData = req.body;
    // Save userData to Firebase
    await database.ref(`users/${userData.username}`).set(userData);
    res.status(200).send('User registered successfully!');
});

app.listen(3000, () => console.log('Server running on port 3000'));
