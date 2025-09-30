import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'https://localhost:7186',
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401 &&
            !error.config.url.includes("/auth/login")){
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("pin");
            window.location.href = "/login"; // or use navigate() in React
        }
        return Promise.reject(error);
    }
);

export default axiosClient;