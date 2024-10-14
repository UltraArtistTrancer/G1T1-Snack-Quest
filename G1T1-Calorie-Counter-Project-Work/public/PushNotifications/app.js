document.getElementById('registrationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const fcmToken = /* Retrieve the token from your variable here */;

    const userData = { username, phoneNumber, fcmToken, /* other user info */ };
    
    // Send userData to your backend API
    await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
});

