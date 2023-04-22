import axios from "axios";

const URL = "http://127.0.0.1:5000/api";

const getFirstChoice = (data: any) => {
  return data.choices[0].message.content;
};

export const potential_charts = async (file: string) => {
  const response = await axios.post(`${URL}/potential_charts`, { file }, {headers: {'Access-Control-Allow-Origin': '*'}});
  console.log(response.data)
  return getFirstChoice(response.data);
}

export const chart_names = async (options: string) => {
  const response = await axios.post(`${URL}/chart_names`, { options });
  return getFirstChoice(response.data);
}

export const format_data = async (file: string) => {
  const response = await axios.post(`${URL}/format_data`, { file });
  return response.data;
}

export const generate_chart_js = async (json_sample: string, desc: string, index: string) => {
  const response = await axios.post(`${URL}/generate_chart_js`, { json_sample, desc, index });
  return getFirstChoice(response.data);
}

export const formatList = (inputString: string): string[] => {
  return inputString
  .trim() // Remove any leading/trailing white space
  .split('\n') // Split the string into an array of lines
  .map(line => line.replace(/^\d+\.\s*/, '')) // Remove the numbers and any following whitespace
  .map(line => `${line}`); // Add a bullet point to the start of each line
}