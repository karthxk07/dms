"use strict";
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const people = google.people("v1");
require("dotenv").config();

const express = require("express");
const gapiRouter = express.Router();

// Use environment variables instead of credentials.json
const oauth2Client = new google.auth.OAuth2(
  process.env.WEB_CLIENT_ID,
  process.env.WEB_CLIENT_SECRET,
  process.env.WEB_REDIRECT_URIS.split(",")[0] // Get the first redirect URI
);

google.options({ auth: oauth2Client });

gapiRouter.get("/auth/google", (req, res) => {
  try {
    const authorizeUrl = oauth2Client.generateAuthUrl({
      access_type: "online",
      scope: ["profile", "https://www.googleapis.com/auth/drive.file"].join(
        " "
      ),
    });
    res.status(200).send(authorizeUrl);
  } catch (e) {
    res.status(400).send("OAuth failed");
  }
});

// Callback endpoint
gapiRouter.get("/callback", async (req, res) => { console.log("Received callback");
  console.log("Session data:", req.session);

  const code = req.query.code;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    const googleaccessToken = tokens.access_token;
    const googlerefreshToken = tokens.refresh_token;

    oauth2Client.setCredentials({
      refresh_token: googlerefreshToken,
      access_token: googleaccessToken,
    });

    res.cookie("google_accessToken", googleaccessToken,{
      sameSite:"none",
      secure:false,
      httpOnly:false
    });
    res.redirect("https://dms-web-eight.vercel.app/");
  } catch (e) {
    res.status(400).send("Authorization error");
  }
});

module.exports = { gapiRouter };
