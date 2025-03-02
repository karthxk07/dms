const express = require("express");
const groupRouter = express.Router();
const { prisma } = require("../helpers/prisma");

const { isAdmin, isAuth, resolveUser } = require("./auth");

groupRouter.use(isAuth);

groupRouter.post("/create", async (req, res) => {
  // Get the creator , and add to admin list by default
  const { name } = req.body;
  const user = await resolveUser(req.cookies.access_token);
  try {
    const group = await prisma.group.create({
      data: {
        name: name,
        participants: {
          connect: {
            id: user.id,
          },
        },
        admins: {
          connect: {
            id: user.id,
          },
        },
      },
    });
    res.status(201).send(group);
  } catch (e) {
    res.send(e.message);
  }
});

groupRouter.post("/addUser/:groupId", isAdmin, async (req, res) => {
  const { userId } = req.body;
  const { groupId } = req.params;
  try {
    const group = await prisma.group.update({
      where: {
        id: groupId,
      },
      data: {
        participants: {
          connect: {
            id: userId,
          },
        },
      },
    });
    res.status(201).send(group);
  } catch (e) {
    res.send(e.message);
  }
});

groupRouter.post("/addAdmin/:groupId", isAdmin, async (req, res) => {
  const { userId } = req.body;
  const { groupId } = req.params;
  try {
    const group = await prisma.group.update({
      where: {
        id: groupId,
      },
      data: {
        admins: {
          connect: {
            id: userId,
          },
        },
      },
    });
    res.status(201).send(group);
  } catch (e) {
    res.send(e.message);
  }
});

groupRouter.get("/getGroups", async (req, res) => {
  console.log("here");
  const user = await resolveUser(req.cookies.access_token);
  console.log(user);
  try {
    const groups = await prisma.group.findMany({
      where: {
        participants: {
          some: {
            id: user.id,
          },
        },
      },
    });
    res.status(200).send(groups);
  } catch (e) {
    res.send(e.message);
  }
});

groupRouter.get("/getFiles/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const files = await prisma.file.findMany({
      where: {
        groupId: id,
      },
    });
    res.status(200).send(files);
  } catch (e) {
    res.send(e.message);
  }
});

groupRouter.get("/getUsers/:groupId", async (req, res) => {
  const { groupId } = req.params;
  try {
    const users = await prisma.user.findMany({
      where: {
        participating_groups: {
          some: {
            id: groupId,
          },
        },
      },
    });
    res.status(200).send(users);
  } catch (e) {
    res.send(e.message);
  }
});

groupRouter.delete("/removeUser/:groupId", isAdmin, async (req, res) => {
  const { userId } = req.body;
  const { groupId } = req.params;
  try {
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        admins: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (group != null) return res.status(401).send("Unauthorized");

    group = await prisma.group.update({
      where: {
        id: groupId,
      },
      data: {
        participants: {
          disconnect: {
            id: userId,
          },
        },
      },
    });
    res.status(200).send("User removed successfully");
  } catch (e) {
    res.send(e.message);
  }
});

groupRouter.post("/addFile/:groupId", isAdmin, async (req, res) => {
  const { fileUrl, fileName } = req.body;
  const { groupId } = req.params;
  try {
    const file = await prisma.file.create({
      data: {
        url: fileUrl,
        name: fileName,
        groupId: groupId,
      },
    });
    res.status(201).send(file);
  } catch (e) {
    res.send(e.message);
  }
});

groupRouter.get("/getFileUrl/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const file = await prisma.file.findUnique({
      where: {
        id: id,
      },
    });
    res.status(200).send(file.url);
  } catch (e) {
    res.send(e.message);
  }
});

groupRouter.delete(
  "/deleteFile/:groupId/:fileId",
  isAdmin,
  async (req, res) => {
    const { groupId, fileId } = req.params;

    try {
      // Delete the file reference from database
      const deletedFile = await prisma.file.delete({
        where: {
          id: fileId,
          groupId: groupId,
        },
      });

      if (!deletedFile) {
        return res.status(404).send("File not found or already deleted");
      }

      return res.status(200).send("File reference successfully deleted");
    } catch (error) {
      console.error("Error deleting file reference:", error);
      return res
        .status(500)
        .send("An error occurred while deleting the file reference");
    }
  }
);

module.exports = { groupRouter };
