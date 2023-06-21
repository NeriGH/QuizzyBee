const express = require('express');
const request = require('request-promise-native');
const bodyParser = require('body-parser');
const querystring = require('querystring');
const axios = require('axios');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const clientId = '1dmmot068zgracp0krwtpyd7bdv68s';
const clientSecret = 'o0ozeq6ifo4xfxr39cy7cjrla5a4l9';
const redirectUri = 'http://localhost:3000/auth/twitch/callback/';

let accessToken = null; // Store the access token globally

// Step 1: Redirect the user to Twitch's authorization page
app.get('/auth/twitch', (req, res) => {
  const authUrl = 'https://id.twitch.tv/oauth2/authorize?' +
    querystring.stringify({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'bits:read channel:read:polls channel:manage:polls channel:read:redemptions channel:read:subscriptions channel:read:charity',
    });
  console.log('requ url:', req.url, 'requ query:',req.query)
  console.log('Authorization URL:', authUrl);
  res.redirect(authUrl);
});

// Step 2: Exchange the authorization code for an access token
app.get('/auth/twitch/callback', async (req, res) => {
  const code = req.query.code;
  console.log('Authorization code:', code);

  const options = {
    method: 'POST',
    uri: 'https://id.twitch.tv/oauth2/token',
    form: {
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    },
    json: true,
  };

  try {
    const response = await request(options);
    accessToken = response.access_token; // Store the access token globally
    console.log('Access token:', accessToken);
    res.redirect('/donations'); // Redirect to the /donations endpoint
  } catch (error) {
    res.status(500).send('Failed to obtain access token');
  }
});

// Step 3: Use the access token to make API calls to Twitch
// Endpoint for retrieving the donations
app.get('/donations', async (req, res) => {
  const userId = 81808584; // Replace with your own user ID
  console.log('Access token:', accessToken);
  const options = {
    method: 'GET',
    uri: 'https://api.twitch.tv/helix/charity/donations?broadcaster_id=' + userId,
    headers: {
      'Client-ID': clientId,
      Authorization: `Bearer ${accessToken}`,
    },
    json: true,
  };
  console.log("Option:", options)
  try {
    const response = await request(options);
    const donations = response.data;
    console.log('Donations:', donations);
    res.send(donations);
  } catch (error) {
    res.status(500).send('Failed to retrieve donations');
  }
});

  
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
