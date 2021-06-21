import axios from "axios";

import apiBaseUrl from "../../utils/apiBaseUrl.js";

export default async function getRankedItemsByDay(day, page, req) {
    try {
        const cookie = req.headers.cookie ? req.headers.cookie : "";

        const response = await axios({
            url: `${apiBaseUrl}/items/get-ranked-items-by-day?day=${day}&page=${page}`,
            headers: req ? { cookie: cookie } : "",
            withCredentials: true,
        });

        return response.data;
    } catch (error) {
        return { getDataError: true };
    }
}
