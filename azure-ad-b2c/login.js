function login(email, password, callback) {
    const axios = require('axios@1.2.1');
    const qs = require('qs');
    const jwtDecode = require('jwt-decode').default;

    const tenantId = configuration.tenantId;
    const clientId = configuration.clientId;
    const clientSecret = configuration.clientSecret;

    const data = {
        'client_id': clientId,
        'scope': 'user.read openid profile offline_access',
        'username': email,
        'password': password,
        'grant_type': 'password',
        'client_secret': clientSecret
    };
    const options = {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: qs.stringify(data),
        url: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    };

    axios(options).then(
        response => {
            // in a production setting it would be best to validate this JWT fully before reading claims
            const claims = jwtDecode(response.data.id_token);

            if (response.statusCode === 401) return callback();

            callback(null, {
                // this is a simple example of properties that can be mapped back to the auth0 user profile
                // you are free to choose exactly what maps back over based on what data you get from the azure token
                user_id: claims.sub,
                nickname: claims.name,
                email: claims.preferred_username
            });

        }
    );
}