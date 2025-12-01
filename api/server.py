import json
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


@app.route('/generate-memecoin', methods=['POST'])
def generate_memecoin():
    """
    Create a memecoin brief using the custom fine-tuned model.
    """
    data = request.json or {}
    idea = data.get('idea') or data.get('originalText') or "Airdrop-ready meme coin that farms engagement"
    tone = data.get('tone', "feral degen energy")
    utility = data.get('utility', "Community-first chaos + onchain games")

    memecoin = create_memecoin_brief(idea, tone, utility)
    if memecoin:
        return jsonify({"memecoin": memecoin}), 200

    return jsonify({"error": "Unable to mint memecoin brief"}), 500

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


def create_memecoin_brief(idea, tone, utility):
    print(f"Minting memecoin for idea: '{idea}' | tone: '{tone}' | utility: '{utility}'")

    system_prompt = (
        "You are the lead strategist at a degen growth studio. "
        "You turn chaotic prompts into fully-branded memecoin launch briefs that feel viral on day one. "
        "ALWAYS respond with JSON using this template:\n"
        "{"
        '"name": "coin name",'
        '"ticker": "UPTO4",'
        '"tagline": "one-line battle cry",'
        '"lore": "Origin story + meme reference",'
        '"utility": ["short bullets"],'
        '"viralityHooks": ["viral mechanics"],'
        '"launchPlan": ["3 fast bullet steps"]'
        "}"
    )

    user_prompt = (
        f"Idea: {idea}\n"
        f"Tone to match: {tone}\n"
        f"Utility focus: {utility}\n"
        "Keep it high-energy, very online, and reference current crypto culture."
    )

    try:
        response = openai.ChatCompletion.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=300,
            temperature=0.9
        )
        content = response['choices'][0]['message']['content']
        memecoin_json = _extract_json(content)
        memecoin = json.loads(memecoin_json)
        memecoin = _normalize_memecoin(memecoin)
        print(f"Minted memecoin: {memecoin['name']} (${memecoin['ticker']})")
        return memecoin
    except Exception as e:
        print(f"Error minting memecoin: {e}")
        return None


def _extract_json(blob):
    """
    Pull the JSON block out of the model response.
    """
    match = re.search(r'\{.*\}', blob, re.DOTALL)
    if match:
        return match.group(0)
    return blob


def _normalize_memecoin(payload):
    """
    Guarantee required fields exist even if the model strays.
    """
    defaults = {
        "name": "Unnamed Meme Coin",
        "ticker": "MEME",
        "tagline": "Viral by default.",
        "lore": "Forged in the group chats during a liquidity crunch.",
        "utility": [
            "Chaos-to-earn quests",
            "Unlocks community war room",
        ],
        "viralityHooks": [
            "Live leaderboard of most unhinged shills",
            "Memetic bounty board"
        ],
        "launchPlan": [
            "Drop teaser art with countdown",
            "Community meme-thon with XP multipliers",
            "Flash launch on a degen-friendly DEX"
        ],
    }

    result = {**defaults, **payload}
    for key in ("utility", "viralityHooks", "launchPlan"):
        value = result.get(key)
        if isinstance(value, str):
            # Split on bullets or commas to keep UI consistent
            parts = [part.strip(" -•") for part in re.split(r'[\n,]', value) if part.strip()]
            result[key] = parts or defaults[key]
        elif not isinstance(value, list) or not value:
            result[key] = defaults[key]

    result["ticker"] = result.get("ticker", defaults["ticker"]).upper().replace(" ", "")[:4] or "MEME"
    return result

if __name__ == '__main__':
    app.run(host=hostName, port=server_port)
