require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const app = express();
const { auth, requiresAuth } = require('express-openid-connect');

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SECRET,
    baseURL: 'http://localhost:3000',
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: process.env.ISSUER_BASE_URL
};

app.use(auth(config));
app.use(jsonParser);

app.get('/', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

app.get('/profile', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user));
});

app.post('/trade', requiresAuth(), jsonParser, (req, res) => {
    if ('sentplayers' in req.body && 'receivedplayers' in req.body) {
        const sentplayers = req.body.sentplayers;
        const receivedplayers = req.body.receivedplayers;

        if (Array.isArray(receivedplayers) && Array.isArray(sentplayers)) {
            res.status(200).json({grade: 'A'});
        }
        else {
            res.status(400).json({message: 'data is not an array'});
        }
    }
    else {
         res.status(400).json({message: 'required fields are not found'});
    }
});

app.listen(process.env.PORT || 3000);
module.exports = app;