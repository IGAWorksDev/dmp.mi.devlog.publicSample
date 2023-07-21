import {basicInstance} from "./index";

export const getHoliday = async (year:number)=> {
    try {
        const response = await basicInstance.get(`?key=${year}`);
        return response.data.data
    } catch (e) {
        console.log(e)
    }
}