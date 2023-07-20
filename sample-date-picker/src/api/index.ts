import axios from "axios";

const REQUEST_URL = 'https://public.data.igaw.io/holiday/search'

export async function getHoliday() {
    try {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const response = await axios.get(`${REQUEST_URL}?key=${year}`);
        return response.data.data;
    } catch (e) {
        console.log(e)
        return e;
    }
}
