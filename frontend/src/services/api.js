import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8089/api", // your backend URL
});

export default api;