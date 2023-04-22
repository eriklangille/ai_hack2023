import os

import pandas as pd
import openai 
import tenacity 
from flask import Flask, jsonify, request
from joblib import Memory

app = Flask(__name__)

openai.api_key = os.getenv("OPENAI_API_KEY")

# retry 3 times with exponential backoff
retry_fetch = tenacity.retry(
    wait=tenacity.wait_random_exponential(multiplier=1, max=10), 
    stop=tenacity.stop_after_attempt(3)
)(openai.ChatCompletion.create) 

# cache to home cache directory
memory = Memory(location="~/.cache/openai", verbose=0)
cached_chatcompletion_create = memory.cache(retry_fetch)

# now use cached_chatcompletion_create instead of openai.ChatCompletion.create

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/chat', methods=['POST'])
def chat():
    prompt = request.json['prompt']
    response = cached_chatcompletion_create(
    model="gpt-3.5-turbo",
    messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Who won the world series in 2020?"},
            {"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},
            {"role": "user", "content": "Where was it played?"}
        ]
    )
    response = cached_chatcompletion_create(prompt)
    return jsonify(response)

def handle_chat_response(response):
    ...

if __name__ == '__main__':
    app.run(debug=True)
