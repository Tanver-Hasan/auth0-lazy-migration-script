async function getUser(email, callback) {
    const axios = require('axios@1.2.1');

    const tenantId = configuration.tenantId;
    const clientId = configuration.clientId;
    const clientSecret = configuration.clientSecret;
    const graphApiUrl = "https://graph.microsoft.com/v1.0/users";

    try {
        // Step 1: Get Access Token
        const tokenResponse = await axios.post(
            `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
            new URLSearchParams({
                grant_type: "client_credentials",
                client_id: clientId,
                client_secret: clientSecret,
                scope: "https://graph.microsoft.com/.default",
            }).toString(),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        const accessToken = tokenResponse.data.access_token;

        // Step 2: Fetch User by Email
        const userResponse = await axios.get(`${graphApiUrl}?$filter=userPrincipalName eq '${email}'`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const users = userResponse.data.value;

        if (users.length === 0) {
            return callback(null, null);
        }

        const user = users[0];
        return callback(null, {
            user_id: user.id,
            email: user.mail || user.userPrincipalName,
            email_verified: true,
        });
    } catch (e) {
        return callback(new Error(`Error: ${e.response?.data?.error?.message || e.message}`));
    }
}
