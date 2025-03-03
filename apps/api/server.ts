const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const express = require("express");
const app = express();

const { authRouter } = require("./routes/auth");
const { groupRouter } = require("./routes/group");
const { userRouter } = require("./routes/user");
const { gapiRouter } = require("./routes/google");

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
  })
);

app.use("/auth", authRouter);
app.use("/group", groupRouter);
app.use("/user", userRouter);
app.use("/gapi", gapiRouter);

app.listen(3001, () => {});
