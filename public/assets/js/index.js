import bot from './assets/imgs/bot.svg';
import user from './assets/imgs/user.svg';

const apiHost = "/api/gpt";
const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element) {
    element.textContent = '';

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0;

    const interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 20);
}

// Generate unique ID for each message div of bot
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img src=${isAi ? bot : user} alt="${isAi ? 'bot' : 'user'}" />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    );
}

const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const prompt = formData.get('prompt');

    // User's chatstripe
    chatContainer.innerHTML += chatStripe(false, prompt);

    // Clear the textarea input 
    form.reset();

    // Bot's chatstripe
    const uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatStripe(true, '', uniqueId);

    // Scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Specific message div 
    const messageDiv = document.getElementById(uniqueId);

    // Show loading indicator
    loader(messageDiv);

    try {
        const response = await fetch(apiHost, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch');
        }

        const data = await response.json();
        const botResponse = data.bot.trim(); // Trim any trailing spaces or newline characters

        // Remove loading indicator and display bot's response
        clearInterval(loadInterval);
        messageDiv.innerHTML = '';
        typeText(messageDiv, botResponse);
    } catch (error) {
        // Display error message
        messageDiv.innerHTML = 'Something went wrong';
        console.error(error);
        alert('Something went wrong');
    }
};

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e);
    }
});
