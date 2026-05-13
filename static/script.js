const micBtn = document.getElementById('mic-btn');
const rippleWrapper = document.getElementById('ripple-wrapper');
const statusText = document.getElementById('status-text');
const resultsSection = document.getElementById('results');
const englishTextEl = document.getElementById('english-text');
const kannadaTextEl = document.getElementById('kannada-text');
const playAudioBtn = document.getElementById('play-audio-btn');
const audioPlayer = document.getElementById('audio-player');
const textInput = document.getElementById('text-input');
const translateTextBtn = document.getElementById('translate-text-btn');

let recognition;
let isRecording = false;

// Check for Web Speech API support
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
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
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        textInput.value = finalTranscript + interimTranscript;

        if (finalTranscript !== '') {
            statusText.innerText = "Processing Translation...";
            englishTextEl.innerText = finalTranscript;
            translateText(finalTranscript);
        }
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

translateTextBtn.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (!text) {
        statusText.innerText = "Please enter some text to translate.";
        statusText.style.color = "#f43f5e";
        setTimeout(() => {
            statusText.style.color = "";
            statusText.innerText = "Tap to Speak";
        }, 3000);
        return;
    }
    statusText.style.color = "";
    statusText.innerText = "Processing Translation...";
    englishTextEl.innerText = text;
    translateText(text);
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

        if (data.audio_base64) {
            audioPlayer.src = "data:audio/mp3;base64," + data.audio_base64;
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
