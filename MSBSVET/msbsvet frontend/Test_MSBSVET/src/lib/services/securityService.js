import agentPublic from "../api/publicAgent";

export const fetchPublicKey = async () => {
    const res = await agentPublic.get(
        "/api/security/public-key",
        {
            headers: {
                "X-Skip-Encryption": "true"
            }
        }
    );

    return res.data;
};