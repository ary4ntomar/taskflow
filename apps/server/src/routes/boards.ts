import { Router } from "express";
import { prisma } from "../config/db.js";
import { authMiddleware } from "../middleware/auth.js";
import { baordSchema, getBoardSchema } from "../validators/board.js";
export const boardRouter = Router();

//..........create Board .........

boardRouter.post("/boards", authMiddleware, async (req, res) => {
  //get data from user
  
  const { data, success, error } = baordSchema.safeParse(req.body);
  if (!success)
    return res.status(400).json({
      message: "invlaid credential",
      error: error.flatten().fieldErrors,
    });
  const { title, organizationId } = data;

  //find organization
  const org = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
  });

  //if org not found
  if (!org) {
    res.status(403).json({
      message: "Org dosen't exist ",
    });
    return;
  }
  //if found then create board and push data into board array

  await prisma.board.create({
    data: {
      title: title,
      organizationId: organizationId,
    },
  });

  //send success response
  res.json({
    message: "Board created successfully",
  });
});

//......read boards ......

boardRouter.get("/boards", authMiddleware, async (req, res) => {
  //extract organization id from query
  const orgId = Number(req.query.organizationId);

  const { data, success, error } = getBoardSchema.safeParse({
    organizationId: orgId,
  });
  if (!success)
    return res.status(400).json({
      message: "invlaid credential",
      error: error.flatten().fieldErrors,
    });
  const { organizationId } = data;

  //find all the boards belonging to that org
  const allBoards = await prisma.board.findMany({
    where: {
      organizationId: organizationId,
    },
  });

  //return boards
  return res.json({
    boards: allBoards,
  });
});
