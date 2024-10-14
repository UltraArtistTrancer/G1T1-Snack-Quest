require('dotenv').config();
const twilio = require('twilio');
const cron = require('node-cron');
const axios = require('axios');
const moment = require('moment-timezone');  // Add timezone support

const apiKey = process.env.VUE_APP_GOOGLEMAPS_APIKEY ;
console.log(apiKey);

// Twilio credentials and Google API key from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// ... User data ...

async function sendReminderSMS(user, mealType, recommendations) {
  if (!user.phoneNumber) {
    console.error('User has no phone number, skipping SMS.');
    return;
  }

  const message = `Reminder: Your ${mealType} is in 30 minutes! Nearby places: ${recommendations}`;
  
  try {
    await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: user.phoneNumber
    });
    console.log(`Reminder sent to ${user.phoneNumber} for ${mealType}`);
  } catch (err) {
    console.error('Failed to send reminder: ', err.message);
  }
}

function isThirtyMinutesBeforeMeal(mealTime, timezone) {
  const mealMoment = moment.tz(mealTime, "HH:mm", timezone);
  const now = moment.tz(timezone);
  return now.isSame(mealMoment.subtract(30, 'minutes'), 'minute');
}

cron.schedule('* * * * *', async () => {
  for (const user of users) {
    for (const [mealType, mealTime] of Object.entries(user.mealTimes)) {
      if (isThirtyMinutesBeforeMeal(mealTime, user.timezone)) {
        try {
          const recommendations = await getNearbyPlaces(user.location);
          await sendReminderSMS(user, mealType, recommendations);
        } catch (error) {
          console.error(`Error processing reminders for ${user.userId}: ${error.message}`);
        }
      }
    }
  }
});
