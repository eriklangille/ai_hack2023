import os
from io import StringIO

import pandas as pd
import openai 
import tenacity 
from flask import Flask, jsonify, request
from joblib import Memory
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app)

openai.api_key = open("key.txt").read().strip()

# retry 3 times with exponential backoff
retry_fetch = tenacity.retry(
    wait=tenacity.wait_random_exponential(multiplier=1, max=10), 
    stop=tenacity.stop_after_attempt(3)
)(openai.ChatCompletion.create) 

# cache to home cache directory
memory = Memory(location="~/.cache/openai", verbose=0)
cached_chatcompletion_create = memory.cache(retry_fetch)

# now use cached_chatcompletion_create instead of openai.ChatCompletion.create

# Prompts
PROMPT_CHARTS_TO_CREATE = """
Below is the head(5) of a pandas dataframe. Provide 3 - 5 charts I can create with the data. Only provide a numbered list of the potential charts. Do not add any other text.

Unnamed: 0.1	Unnamed: 0	Organisation	Location	Date	Detail	Rocket_Status	Price	Mission_Status
0	0	0	SpaceX	LC-39A, Kennedy Space Center, Florida, USA	Fri Aug 07, 2020 05:12 UTC	Falcon 9 Block 5 | Starlink V1 L9 & BlackSky	StatusActive	50.0	Success
1	1	1	CASC	Site 9401 (SLS-2), Jiuquan Satellite Launch Ce...	Thu Aug 06, 2020 04:01 UTC	Long March 2D | Gaofen-9 04 & Q-SAT	StatusActive	29.75	Success
2	2	2	SpaceX	Pad A, Boca Chica, Texas, USA	Tue Aug 04, 2020 23:57 UTC	Starship Prototype | 150 Meter Hop	StatusActive	NaN	Success
3	3	3	Roscosmos	Site 200/39, Baikonur Cosmodrome, Kazakhstan	Thu Jul 30, 2020 21:25 UTC	Proton-M/Briz-M | Ekspress-80 & Ekspress-103	StatusActive	65.0	Success
4	4	4	ULA	SLC-41, Cape Canaveral AFS, Florida, USA	Thu Jul 30, 2020 11:50 UTC	Atlas V 541 | Perseverance	StatusActive	145.0	Success
"""

PROMPT_CHART_NAMES = """
For each of the following descriptions listed below, provide an equivalently numbered short title that can be displayed above the chart. Only give the numbered list.

1.  Bar chart to show the number of missions by each organization.
2.  Pie chart to show the mission status distribution.
3.  Scatter plot to show the relationship between the mission price and its status.
4.  Line chart to show the number of missions over time.
5.  Stacked bar chart to show the mission status distribution by organization."""

PROMPT_FORMAT_DATA = """
Below is the head(5) of a pandas dataframe. Write python code using pandas to format each column into a number, string or date data field. Filter out any 'NaN' values. Coerce any row errors. Assume the data is already loaded into a variable called 'df'. Only return the code. Do not give any text besides the code snippet.

Unnamed: 0.1	Unnamed: 0	Organisation	Location	Date	Detail	Rocket_Status	Price	Mission_Status
0	0	0	SpaceX	LC-39A, Kennedy Space Center, Florida, USA	Fri Aug 07, 2020 05:12 UTC	Falcon 9 Block 5 | Starlink V1 L9 & BlackSky	StatusActive	50.0	Success
1	1	1	CASC	Site 9401 (SLS-2), Jiuquan Satellite Launch Ce...	Thu Aug 06, 2020 04:01 UTC	Long March 2D | Gaofen-9 04 & Q-SAT	StatusActive	29.75	Success
2	2	2	SpaceX	Pad A, Boca Chica, Texas, USA	Tue Aug 04, 2020 23:57 UTC	Starship Prototype | 150 Meter Hop	StatusActive	NaN	Success
3	3	3	Roscosmos	Site 200/39, Baikonur Cosmodrome, Kazakhstan	Thu Jul 30, 2020 21:25 UTC	Proton-M/Briz-M | Ekspress-80 & Ekspress-103	StatusActive	65.0	Success
4	4	4	ULA	SLC-41, Cape Canaveral AFS, Florida, USA	Thu Jul 30, 2020 11:50 UTC	Atlas V 541 | Perseverance	StatusActive	145.0	Success
"""

PROMPT_GENERATE_CHART = """
Below is the first two records of a JSON file. Assume the data is formatted in a JS object in the variable named 'data'. The first 2 objects are below. You do not need to create the 'data' variable. Only output the JavaScript code snippet, no other text. Write javascript code using Chart.js and attach it to the id 'chart1' and assign the Chart class to 'window.chart1' to plot the following chart: 'Bar chart to show the number of missions by each organization'. Only show the top 10 results. Do NOT write any HTML. Do NOT generate any script tags."""

RESPONSE_CHARTS_TO_CREATE = """
1.  Bar chart to show the number of missions by each organization.
2.  Pie chart to show the mission status distribution.
3.  Scatter plot to show the relationship between the mission price and its status.
4.  Line chart to show the number of missions over time.
5.  Stacked bar chart to show the mission status distribution by organization.
"""

RESPONSE_CHART_NAMES = """
1.  Missions by organization
2.  Mission status distribution
3.  Mission price vs. status
4.  Missions over time
5.  Mission status by organization
"""

RESPONSE_FORMAT_DATA = """
# Convert columns to the appropriate data type and filter out NaN values
df['Unnamed: 0.1'] = pd.to_numeric(df['Unnamed: 0.1'], errors='coerce').dropna()
df['Unnamed: 0'] = pd.to_numeric(df['Unnamed: 0'], errors='coerce').dropna()
df['Organisation'] = df['Organisation'].astype(str).dropna()
df['Location'] = df['Location'].astype(str).dropna()
df['Date'] = pd.to_datetime(df['Date'], errors='coerce').dropna()
df['Detail'] = df['Detail'].astype(str).dropna()
df['Rocket_Status'] = df['Rocket_Status'].astype(str).dropna()
df['Price'] = pd.to_numeric(df['Price'], errors='coerce').dropna()
df['Mission_Status'] = df['Mission_Status'].astype(str).dropna()
"""

def get_df_head_prompt(df: pd.DataFrame) -> str:
    head_string = df.head(5).to_string()
    prompt = f"Below is the head(5) of a pandas dataframe. Provide 3 - 5 charts I can create with the data. Only provide a numbered list of the potential charts. Do not add any other text.\n\n{head_string}"
    return prompt

def get_chart_names(input: str) -> str:
    prompt = f"For each of the following descriptions listed below, provide an equivalently numbered short title that can be displayed above the chart. Only give the numbered list.\n\n{input}"
    return prompt

def get_format_data(input: str) -> str:
    prompt = f"Below is the head(5) of a pandas dataframe. Write python code using pandas to format each column into a number, string or date data field. Filter out any 'NaN' values. Coerce any row errors. Assume the data is already loaded into a variable called 'df'. Only return the code. Do not give any text besides the code snippet.\n\n{input}"
    return prompt

def get_generate_chart(sample: str, desc: str, index: str) -> str:
    prompt = f"Below is the first two records of a JSON file. Assume the data is formatted in a JS object in the variable named 'data'. The first 2 objects are below. You do not need to create the 'data' variable. Only output the JavaScript code snippet, no other text. Write javascript code using Chart.js and attach it to the id 'chart{index}' and assign the Chart class to 'window.chart{index}' to plot the following chart: '{desc}'. Only show the top 10 results. Do NOT write any HTML. Do NOT generate any script tags.\n\n{sample}"
    return prompt

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/api/potential_charts', methods=['POST'])
def potential_charts():
    openai.api_key = open("key.txt").read().strip()
    file = request.json['file']
    df = pd.read_csv(f"./uploaded/{file}")
    prompt = get_df_head_prompt(df)
    response = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[
            {"role": "system", "content": "You are a helpful assistant used to analyze data."},
            {"role": "user", "content": PROMPT_CHARTS_TO_CREATE},
            {"role": "assistant", "content": RESPONSE_CHARTS_TO_CREATE},
            {"role": "user", "content": prompt}
        ]
    )
    return jsonify(response)

@app.route('/api/chart_names', methods=['POST'])
def chart_names():
    openai.api_key = open("key.txt").read().strip()
    prompt = request.json['options']
    response = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[
            {"role": "system", "content": "You are a helpful assistant used to analyze data."},
            {"role": "user", "content": PROMPT_CHART_NAMES},
            {"role": "assistant", "content": RESPONSE_CHART_NAMES},
            {"role": "user", "content": get_chart_names(prompt)}
        ]
    )
    return jsonify(response)

@app.route('/api/format_data', methods=['POST'])
def format_data():
    openai.api_key = open("key.txt").read().strip()
    file = request.json['file']
    df = pd.read_csv(f"./uploaded/{file}")
    prompt = get_format_data(df)
    response = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[
            {"role": "system", "content": "You are a helpful assistant used to analyze data."},
            {"role": "user", "content": PROMPT_FORMAT_DATA},
            {"role": "assistant", "content": RESPONSE_FORMAT_DATA},
            {"role": "user", "content": prompt}
        ]
    )
    data = response['choices'][0]['message']['content']
    try:
        eval(data) # Check if the code is valid
        buf = StringIO()
        df.to_csv(buf, orient='records')
        # Retrieve the contents of the buffer as a string
        return jsonify(buf.getvalue())
    except:
        return jsonify({"error": "Invalid code"})

@app.route('/api/generate_chart_js', methods=['POST'])
def generate_chart_js():
    openai.api_key = open("key.txt").read().strip()
    sample = request.json['json_sample']
    desc = request.json['desc']
    index = request.json['index']
    prompt = get_generate_chart(sample, desc, index)
    response = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[
            {"role": "system", "content": "You are a helpful assistant used to analyze data."},
            {"role": "user", "content": PROMPT_FORMAT_DATA},
            {"role": "assistant", "content": RESPONSE_FORMAT_DATA},
            {"role": "user", "content": prompt}
        ]
    )
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
