const admin = require('./firebaseConfig');
const moment = require('moment-timezone');

async function sendPushNotification(user, mealType) {
    const message = {
        notification: {
            title: 'Meal Reminder',
            body: `Your ${mealType} is in 30 minutes!`,
        },
        token: user.fcmToken,
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

function isThirtyMinutesBeforeMeal(mealTime, timezone) {
    const mealMoment = moment.tz(mealTime, "HH:mm", timezone);
    const now = moment.tz(timezone);
    return now.isSame(mealMoment.subtract(30, 'minutes'), 'minute');
}

module.exports = { sendPushNotification, isThirtyMinutesBeforeMeal };
