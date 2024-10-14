const cron = require('node-cron');
const { sendPushNotification, isThirtyMinutesBeforeMeal } = require('./notifications');
const database = require('./firebaseConfig');

cron.schedule('* * * * *', async () => {
    const snapshot = await database.ref('users').once('value');
    const users = snapshot.val();
    
    for (const userId in users) {
        const user = users[userId];
        for (const [mealType, mealTime] of Object.entries(user.mealTimes)) {
            if (isThirtyMinutesBeforeMeal(mealTime, user.timezone)) {
                await sendPushNotification(user, mealType);
            }
        }
    }
});
