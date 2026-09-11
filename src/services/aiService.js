import API from "./api";

export const sendAIMessage = ({
    message,
    history = [],
    pageContext = "",
    timezone = "",
    flow = null,
}) => {
    return API.post("/ai/chat", {
        message,
        history,
        pageContext,
        timezone,
        flow,
    });
};
