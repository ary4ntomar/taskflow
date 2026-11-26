import { Router } from "express";
import { prisma } from "../config/db.js";
import { authMiddleware } from "../middleware/auth.js";
import {
  boardIdSchema,
  createIssueSchema,
  issueSchema,
} from "../validators/issues.js";
export const issueRouter = Router();

// ........ create issue ..............
issueRouter.post("/issue", authMiddleware, async (req, res) => {
  //extract data from body
  const { data, success, error } = createIssueSchema.safeParse(req.body);
  if (!success)
    return res.status(400).json({
      message: "invlaid credential",
      error: error.flatten().fieldErrors,
    });
  const { title, boardId, assignedTo, priority } = data;

  //find board in which issue is there
  const myBoard = await prisma.board.findUnique({
    where: { id: boardId },
  });

  //if not found
  if (!myBoard) {
    res.status(403).json({
      message: " Board not found",
    });
    return;
  }

  const userId = req.userId;
  if (userId === undefined) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  //check if user belongs to the org of board
  const myOrg = await prisma.organization.findFirst({
    where: {
      id: myBoard.organizationId,
      OR: [{ adminId: userId }, { user: { some: { id: userId } } }],
    },
  });

  if (!myOrg) {
    return res.status(403).json({
      message: "You do not have accesst to this board",
    });
  }

  //check if assigend user exist or not
  const assignedUser = await prisma.user.findUnique({
    where: { username: assignedTo },
  });

  //if not exist
  if (!assignedUser) {
    return res.status(403).json({
      message: "User does  not exist",
    });
  }

  const assigneeMembership = await prisma.organization.findFirst({
    where: {
      id: myOrg.id,
      user: { some: { id: assignedUser.id } },
    },
  });

  if (!assigneeMembership) {
    return res.status(403).json({
      message: "Assignee must be a member of this organization",
    });
  }

  const issue = await prisma.issues.create({
    data: {
      title: title,
      priority: priority,
      board: { connect: { id: boardId } },
      assignedTo: { connect: { id: assignedUser.id } },
    },
  });

  //sucess response
  res.json({
    id: issue.id,
    received: req.body.priority ?? null,
    parsed: priority,
    saved: issue.priority,
    message: "Issues added successfully",
  });
});

//.......Read Issues ........
issueRouter.get("/issues", authMiddleware, async (req, res) => {
  //extract board id for which you looking for
  const Id = Number(req.query.boardId);
  const { data, success, error } = boardIdSchema.safeParse({ boardId: Id });
  if (!success)
    return res.status(400).json({
      message: "invlaid credential",
      error: error.flatten().fieldErrors,
    });
  const { boardId } = data;

  const verifyBoard = await prisma.board.findFirst({
    where: { id: boardId },
  });

  if (!verifyBoard) {
    return res.status(400).json({ message: "invlaid credential" });
  }

  const userId = req.userId;
  if (userId === undefined) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const verifyOrg = await prisma.organization.findFirst({
    where: {
      boards: { some: { id: verifyBoard?.id } },
      OR: [{ user: { some: { id: userId } } }, { adminId: userId }],
    },
  });

  if (!verifyOrg) {
    return res.status(400).json({ message: "invlaid credential" });
  }

  //extract all the issues belonging to that board
  const allIssues = await prisma.issues.findMany({
    where: { boardId: boardId },
    include: {
      assignedTo: { select: { username: true } },
    },
  });

  //return all the issues belonging to that board
  return res.json({
    issues: allIssues,
  });
});

//..........who is assigned to this issue.................

issueRouter.get("/members", authMiddleware, async (req, res) => {
  //extract issue id
  const Id = Number(req.query.issueId);
  const { data, success, error } = issueSchema.safeParse({ issueId: Id });
  if (!success)
    return res.status(400).json({
      message: "invlaid credential",
      error: error.flatten().fieldErrors,
    });
  const { issueId } = data;

  //find issue
  const myIssue = await prisma.issues.findFirst({
    where: { id: issueId },
  });

  if (!myIssue) {
    return res.status(404).json({
      message: "issue not found",
    });
  }
  const verifyBoard = await prisma.board.findFirst({
    where: { issues: { some: { id: issueId } } },
  });

  if (!verifyBoard) {
    return res.status(404).json({ message: "board not found" });
  }

  const userId = req.userId;
  if (userId === undefined) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const verifyOrg = await prisma.organization.findFirst({
    where: {
      boards: { some: { id: verifyBoard?.id } },
      OR: [{ user: { some: { id: userId } } }, { adminId: userId }],
    },
  });

  if (!verifyOrg) {
    return res
      .status(403)
      .json({ message: "you do not have access to this baord" });
  }

  //find assigned user
  if (myIssue.userId === null) {
    return res.status(404).json({
      message: "Issue has no assignee",
    });
  }
  const assignedUsers = await prisma.user.findUnique({
    where: { id: myIssue.userId },
  });

  if (!assignedUsers) {
    return res.status(404).json({
      message: "user not found",
    });
  }

  return res.json({
    members: [
      {
        username: assignedUsers.username,
      },
    ],
  });
});

//........update issue ............

issueRouter.put("/issues", authMiddleware, async (req, res) => {
  //extract issue id
  const Id = Number(req.query.issueId);
  const { data, success, error } = issueSchema.safeParse({ issueId: Id });
  if (!success)
    return res.status(400).json({
      message: "invlaid credential",
      error: error.flatten().fieldErrors,
    });
  const { issueId } = data;

  //find issue
  const myIssue = await prisma.issues.findFirst({
    where: { id: issueId },
  });

  if (!myIssue) {
    return res.status(404).json({
      message: "issue not found",
    });
  }
  const verifyBoard = await prisma.board.findFirst({
    where: { issues: { some: { id: issueId } } },
  });

  if (!verifyBoard) {
    return res.status(404).json({ message: "board not found" });
  }

  const userId = req.userId;
  if (userId === undefined) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const verifyOrg = await prisma.organization.findFirst({
    where: {
      boards: { some: { id: verifyBoard?.id } },
      OR: [{ user: { some: { id: userId } } }, { adminId: userId }],
    },
  });

  if (!verifyOrg) {
    return res
      .status(403)
      .json({ message: "you do not have access to this baord" });
  }
  const currentStatus = myIssue.status;

  if (currentStatus === "done") {
    return res.status(200).json({
      message: "Issue is already resolved",
      status: currentStatus,
    });
  }

  let nextStatus: string;

  if (currentStatus === "upnext") {
    nextStatus = "inprogress";
  } else if (currentStatus === "inprogress") {
    nextStatus = "done";
  } else {
    return res.status(409).json({ message: "Unexpected issue status" });
  }

  const updatedIssue = await prisma.issues.update({
    where: { id: issueId },
    data: { status: nextStatus },
  });

  return res.json({
    message: "Status changed successfully",
    status: updatedIssue.status,
  });
});

//.....delete issue...........
issueRouter.delete("/issues", authMiddleware, async (req, res) => {
  const userId = req.userId;
  if (userId === undefined) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const result = issueSchema.safeParse({
    issueId: Number(req.query.issueId),
  });

  if (!result.success) {
    return res.status(400).json({ message: "Invalid issue ID" });
  }

  const deleted = await prisma.issues.deleteMany({
    where: {
      id: result.data.issueId,
      board: {
        organization: {
          OR: [{ adminId: userId }, { user: { some: { id: userId } } }],
        },
      },
    },
  });

  if (deleted.count === 0) {
    return res.status(404).json({ message: "Issue not found" });
  }

  return res.json({ message: "Issue deleted" });
});
