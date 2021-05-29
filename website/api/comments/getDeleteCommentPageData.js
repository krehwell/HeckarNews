import axios from "axios";

import apiBaseUrl from "../../utils/apiBaseUrl.js";

export default async function getDeleteCommentPageData(commentId, req) {
    try {
        const cookie = req.headers.cookie ? req.headers.cookie : "";

        const response = await axios({
            url: `${apiBaseUrl}/comments/get-delete-comment-page-data?id=${commentId}`,
            headers: req ? { cookie: cookie } : "",
            withCredentials: true,
        });

        return response.data;
    } catch (error) {
        return { getDataError: true };
    }
}
