import axios from "axios";

const URL = "http://localhost:5000";

export const getGPT = async (text: string) => {
  const response = await axios.post(`${URL}/chat`, { text });
  return response.data;
}