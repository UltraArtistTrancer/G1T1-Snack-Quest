const admin = require('firebase-admin');
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://<YOUR-FIREBASE-APP>.firebaseio.com'
});

module.exports = admin;
