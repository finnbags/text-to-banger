import os
import re
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import openai

# Load environment variables
load_dotenv()

# Retrieve API key and model name from environment variables
api_key = os.getenv("OPENAI_API_KEY")
model_name = os.getenv("OPENAI_MODEL_NAME", "ft:gpt-3.5-turbo-0125:personal:text-to-banger-v3:A4eTX8TJ")

# Set the OpenAI API key
openai.api_key = api_key

hostName = "0.0.0.0"
server_port = int(os.getenv('PORT', 8080))

app = Flask(__name__)
CORS(app)

@app.route('/generate-banger', methods=['POST', 'GET'])
def generate_banger():
    data = request.json
    if not data or 'originalText' not in data:
        return jsonify({"error": "No tweet text provided"}), 400

    original_text = data.get('originalText')
    banger_tweet = create_banger(original_text)

    if banger_tweet:
        return jsonify({"banger": banger_tweet}), 200
    else:
        return jsonify({"error": "Error generating banger tweet."}), 500

def create_banger(tweet_text):
    print(f"Generating banger for tweet: '{tweet_text}'")

    try:
        # Define the prompt
        prompt = (
            "You are a human being instructed to turn this tweet into a solid banger, "
            "where a banger is a tweet of shocking and mildly psychotic comedic value, "
            "that's prone to go viral. Reply only with the banger."
        )
        
        # Make the API call to OpenAI ChatCompletion
        response = openai.ChatCompletion.create(
            model=model_name,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": tweet_text}
            ],
            max_tokens=100,
            temperature=0.7
        )
        banger_tweet = response['choices'][0]['message']['content'].strip()

        # Clean the generated banger tweet
        banger_tweet = re.sub(r'#\S+', '', banger_tweet)  # Remove hashtags
        banger_tweet = re.sub(r'^"|"$|^\'|\'$', '', banger_tweet)  # Remove quotes
        banger_tweet = re.sub(r'\.$', '', banger_tweet.strip())  # Remove ending dot

        if not banger_tweet:
            return None

        print(f"Generated banger: '{banger_tweet}'")
        return banger_tweet

    except Exception as e:
        print(f"Error generating banger: {e}")
        return None

if __name__ == '__main__':
    app.run(host=hostName, port=server_port)
