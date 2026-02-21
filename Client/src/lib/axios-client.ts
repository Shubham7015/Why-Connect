import axios from "axios"


export const API = axios.create({
    baseURL:
        import.meta.env.MODE === "devlopment"
        ?`${import.meta.env.VITE_API_URL}/api`
        : "/api",
        withCredentials:true
});