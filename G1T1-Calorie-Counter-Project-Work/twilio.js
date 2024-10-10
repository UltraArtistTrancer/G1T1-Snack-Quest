require('dotenv').config();
const twilio = require('twilio');
const cron = require('node-cron');
const axios = require('axios');


// Twilio credentials from your Twilio account
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

// Simulated user data with meal times and location
const users = [
  {
    userId: '123',
    phoneNumber: '', 
    mealTimes: {
      breakfast: '08:00',
      lunch: '13:00',
      dinner: '19:00'
    },
    location: {
      latitude: 40.7128,
      longitude: -74.0060
    }
  }
];

// Function to send an SMS via Twilio
async function sendReminderSMS(user, mealType, recommendations) {
  const message = `Reminder: Your ${mealType} is in 30 minutes! Here are some nearby places: ${recommendations}`;
  
  try {
    await client.messages.create({
      body: message,
      from: 'your_twilio_phone_number',  // Replace with your Twilio number
      to: user.phoneNumber
    });
    console.log(`Reminder sent to ${user.phoneNumber} for ${mealType}`);
  } catch (err) {
    console.error('Failed to send reminder: ', err.message);
  }
}

// Function to get nearby restaurant recommendations using Google Places API
async function getNearbyPlaces(userLocation) {
  const apiKey = 'your_google_places_api_key';  // Replace with your API key
  const { latitude, longitude } = userLocation;

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1500&type=restaurant&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const places = response.data.results.slice(0, 3).map(place => place.name).join(', ');
    return places || 'No recommendations found nearby.';
  } catch (err) {
    console.error('Error fetching places: ', err);
    return 'No recommendations available.';
  }
}

// Function to check if it's 30 minutes before meal time
function isThirtyMinutesBeforeMeal(mealTime) {
  const mealDate = new Date();
  const [hours, minutes] = mealTime.split(':').map(Number);
  mealDate.setHours(hours, minutes, 0);

  const now = new Date();
  mealDate.setMinutes(mealDate.getMinutes() - 30);  // 30 minutes before

  return now.getHours() === mealDate.getHours() && now.getMinutes() === mealDate.getMinutes();
}

// Cron job to check every minute
cron.schedule('* * * * *', async () => {
  for (const user of users) {
    for (const [mealType, mealTime] of Object.entries(user.mealTimes)) {
      if (isThirtyMinutesBeforeMeal(mealTime)) {
        const recommendations = await getNearbyPlaces(user.location);
        await sendReminderSMS(user, mealType, recommendations);
      }
    }
  }
});

console.log('Scheduled reminder service is running.');
