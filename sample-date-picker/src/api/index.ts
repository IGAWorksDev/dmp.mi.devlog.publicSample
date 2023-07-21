import axios from "axios";

const REQUEST_URL = 'https://public.data.igaw.io/holiday/search'

const axiosAPI = (url:string,options?:any) => {
    const instance = axios.create({baseURL:url,...options});
    return instance;
};


export const basicInstance = axiosAPI(REQUEST_URL)
