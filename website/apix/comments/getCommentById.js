import axios from "axios";

import apiBaseUrl from "../../utils/apiBaseUrl.js";

export default async function getCommentById(commentId, page, req) {
    try {
        const cookie = req.headers.cookie ? req.headers.cookie : "";

        const response = await axios({
            url: `${apiBaseUrl}/comments/get-comment-by-id?id=${commentId}&page=${page}`,
            headers: req ? { cookie: cookie } : "",
            withCredentials: true,
        });

        return response.data;
    } catch (error) {
        return { getDataError: true };
    }
}
