import axios from "axios";

export const api = axios.create({
baseURL: import.meta.env.VITE_API_URL,
withCredentials: true,
});

export const registerUser = async (data: {
name: string;
email: string;
mobile: string;
password: string;
}) => {
return api.post("/auth/register", data);
};

export const loginUser = async (
email: string,
password: string
) => {
return api.post("/auth/login", {
email,
password,
});
};
