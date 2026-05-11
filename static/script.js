const micBtn = document.getElementById('mic-btn');
const rippleWrapper = document.getElementById('ripple-wrapper');
const statusText = document.getElementById('status-text');
const resultsSection = document.getElementById('results');
const englishTextEl = document.getElementById('english-text');
const kannadaTextEl = document.getElementById('kannada-text');
const playAudioBtn = document.getElementById('play-audio-btn');
const audioPlayer = document.getElementById('audio-player');

let recognition;
let isRecording = false;

// Check for Web Speech API support
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        isRecording = true;
        micBtn.classList.add('recording');
        rippleWrapper.classList.add('recording');
        statusText.innerText = "Listening...";
        resultsSection.classList.add('hidden');
        playAudioBtn.classList.add('hidden');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        statusText.innerText = "Processing Translation...";
        englishTextEl.innerText = transcript;
        translateText(transcript);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        statusText.innerText = "Error recognizing speech. Tap to try again.";
        micBtn.classList.remove('recording');
        rippleWrapper.classList.remove('recording');
        isRecording = false;
    };

    recognition.onend = () => {
        micBtn.classList.remove('recording');
        rippleWrapper.classList.remove('recording');
        isRecording = false;
        if(statusText.innerText === "Listening...") {
             statusText.innerText = "Tap to Speak";
        }
    };

} else {
    statusText.innerText = "Voice input not supported in your browser.";
    micBtn.disabled = true;
    micBtn.style.opacity = '0.5';
    micBtn.style.cursor = 'not-allowed';
}

micBtn.addEventListener('click', () => {
    if (!recognition) return;
    
    if (isRecording) {
        recognition.stop();
    } else {
        recognition.start();
    }
});

async function translateText(text) {
    try {
        const response = await fetch('/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: text })
        });

        const data = await response.json();

        if (data.error) {
            statusText.innerText = "Translation error: " + data.error;
            return;
        }

        kannadaTextEl.innerText = data.kannada_text;
        resultsSection.classList.remove('hidden');
        statusText.innerText = "Translation Complete";

        if (data.audio_url) {
            audioPlayer.src = data.audio_url;
            playAudioBtn.classList.remove('hidden');
            // Auto play the audio
            audioPlayer.play().catch(e => console.log("Autoplay prevented:", e));
        }

    } catch (error) {
        console.error('Error during translation:', error);
        statusText.innerText = "Network error. Tap to try again.";
    }
}

playAudioBtn.addEventListener('click', () => {
    audioPlayer.play();
});
