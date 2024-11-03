const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");

let userMessage = null;

// API configuration
const API_KEY = 'AIzaSyDq4SCyitS7UFjOYd_4KcPMpYBW4gdgBFU';
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

// Create a new message element and return it
const createMessageElement = (content, ...classes) => { // adding all passed classes
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

// Fetch response from the API based on user message
const generateAPIResponse = async (incomingMessageDiv) => {
    const textElement = incomingMessageDiv.querySelector(".text"); // Get text element

    // Send a POST request to the API with the user's message
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: userMessage}]
                }]
            })
        });

        const data = await response.json();

        // Get the API response text
        const apiResponse = data?.candidates[0].content.parts[0].text;
        textElement.innerText = apiResponse;
    } catch (error) {
        console.log(error);
    }
}

// Supposedly show loading animation while waiting for the API response ; but i removed the loading animation
const showLoadingAnimation = () => {
    const html = `<div class="message content">
                <p class="text"></p>
            </div>`
    const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
    chatList.appendChild(incomingMessageDiv);

    generateAPIResponse(incomingMessageDiv);
}

// Handle sending outgoing chat messages
const handleOutgoingChat = () => {
    userMessage = typingForm.querySelector(".typing-input").value.trim();
    nutritionQueryWrapper = "below is the food I ate. I want the calories, carbohydrates, protein, and fats composition of the food in csv format e.g. 'calories,528,carbohydrates,48,protein,23,fats,27'. I only want whole numbers, do not give me a range, do not give me any other information apart from the csv values:";
    userMessage = nutritionQueryWrapper + userMessage;
    if(!userMessage) return; //Exit if there is no message

    // const html = `<div class="message content">
    //             <p class="text">outgoing message sits here</p>
    //         </div>`

    // const outgoingMessageDiv = createMessageElement(html,"outgoing");
    // outgoingMessageDiv.querySelector(".text").innerText = userMessage;
    // chatList.appendChild(outgoingMessageDiv);

    typingForm.reset(); // Clear input field
    setTimeout(showLoadingAnimation, 500); // Show loading animation after a delay ; but i wont be showing any animations, i need function showLoadingAnimation to accept incomingMessage
}

//Prevent default form submission and handle outgoing chat
typingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    handleOutgoingChat();
})