from flask import Flask, render_template, request, jsonify
from googletrans import Translator
from gtts import gTTS
import os
import uuid

app = Flask(__name__)
translator = Translator()

# Ensure static/audio directory exists
os.makedirs(os.path.join("static", "audio"), exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/translate', methods=['POST'])
def translate():
    data = request.json
    text = data.get('text')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
        
    try:
        # Translate from English to Kannada
        translation = translator.translate(text, src='en', dest='kn')
        kannada_text = translation.text
        
        # Generate Audio
        filename = f"{uuid.uuid4()}.mp3"
        filepath = os.path.join("static", "audio", filename)
        tts = gTTS(text=kannada_text, lang='kn')
        tts.save(filepath)
        
        audio_url = f"/static/audio/{filename}"
        
        return jsonify({
            'original_text': text,
            'kannada_text': kannada_text,
            'audio_url': audio_url
        })
    except Exception as e:
        print(f"Translation Error: {e}")
        return jsonify({'error': 'Translation failed. Please try again.'}), 500

if __name__ == '__main__':
    app.run(debug=True)
