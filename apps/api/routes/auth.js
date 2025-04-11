const express = require("express");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");
const { prisma } = require("../helpers/prisma");

authRouter.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  // future implementation: use bcrypt to hash the password
  try {
    const user = await prisma.user.create({
      data: {
        username: username,
        password: password,
      },
    });
    res.status(201).send(user);
  } catch (e) {
    res
      .status(400)
      .send(
        e.code == "P2002" ? "Username already exists" : "Error creating user"
      );
  }
});

authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;
  // future implementation: use bcrypt to hash the password
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    if (user.password === password) {
      const accessToken = jwt.sign(
        { userId: user.id },
        process.env.AUTH_SECRET
      );
      console.log("saf");
      res.cookie("access_token", accessToken, {
        httpOnly: true,
        sameSite: "none",
        secure : true,      
      });
      res.status(200).send("User login successful");
    } else {
      res.status(401).send("Invalid password");
    }
  } catch (e) {
    res.status(404).send(e.message);
  }
});

authRouter.get("/signout", (req, res) => {
  res.clearCookie("access_token");
  res.end();
});

const isAdmin = async (req, res, next) => {
  // future implementation : generate the user from the access token and then check
  // use as a middleware
  const { groupId } = req.params;

  const user = await resolveUser(req.cookies.access_token);

  if (user.role == "ADMIN") return next();

  const group = await prisma.group.findFirst({
    where: {
      id: groupId,
      admins: {
        some: {
          id: user.id,
        },
      },
    },
  });

  console.log(group);
  return group != null ? next() : res.status(401).send("Unauthorized");
};

const isAuth = async (req, res, next) => {
  const user = await resolveUser(req.cookies.access_token);
  console.log(user + "isAuth");
  if (user) return next();
  res.status(401).send("Unauthorized");
};

const resolveUser = async (accessToken) => {
  // Get the user from the acess token
  try {
    const userId = await jwt.decode(accessToken, process.env.AUTH_SECRET)
      .userId;
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
      },
    });
    return user;
  } catch (e) {
    return null;
  }
};

module.exports = { authRouter, isAdmin, isAuth, resolveUser };
