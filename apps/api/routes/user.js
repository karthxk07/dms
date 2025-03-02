const express = require("express");
const userRouter = express.Router();

const { resolveUser, isAdmin } = require("./auth");
const { prisma } = require("../helpers/prisma");

userRouter.get("/getUser", async (req, res) => {
  try {
    const user = await resolveUser(req.cookies.access_token);
    if (user) res.status(200).send(user);
    res.status(400).end();
  } catch (e) {
    res.status(400).send("Invalid access token");
  }
});

userRouter.get("/getAllUsers", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
      },
    });
    res.status(200).send(users);
  } catch (e) {
    res.send(e.message);
  }
});

module.exports = { userRouter };
