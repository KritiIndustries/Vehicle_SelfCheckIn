import { v4 as uuidv4 } from "uuid";

const getSessionId = () => {
    let sessionId = localStorage.getItem("driver_session");

    if (!sessionId) {
        sessionId = uuidv4();
        localStorage.setItem("driver_session", sessionId);
    }

    return sessionId;
};
export default getSessionId;