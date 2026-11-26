import { Router } from "express";
import { prisma } from "../config/db.js";
import { authMiddleware } from "../middleware/auth.js";
import { getOrgSchema, orgDataSchema, orgSchema } from "../validators/org.js";
export const orgRouter = Router();

//.....create organization......
orgRouter.post("/organization", authMiddleware, async (req, res) => {
  if (req.userId === undefined || req.userId === null) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { data, success, error } = orgDataSchema.safeParse(req.body);
  if (!success)
    return res.status(400).json({
      message: "invlaid credential",
      error: error.flatten().fieldErrors,
    });
  const { title, description } = data;

  const newOrganization = await prisma.organization.create({
    data: {
      title,
      description,
      adminId: req.userId,
    },
  });

  res.json({
    message: "org created",
    id: newOrganization.id,
  });
});

//.......add member to organization...........

orgRouter.post(
  "/add-member-to-organization",
  authMiddleware,
  async (req, res) => {
    const { data, success, error } = orgSchema.safeParse(req.body);
    if (!success)
      return res.status(400).json({
        message: "invlaid credential",
        error: error.flatten().fieldErrors,
      });
    const { organizationId, memberUsername } = data;

    //find organization
    const Organization = await prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
    });

    //check admin / if org not exist
    if (!Organization || Organization.adminId !== req.userId) {
      return res.status(403).json({
        message: "Either Org dosen't exist or User isn't admin ",
      });
    }
    //find member user
    const memberUser = await prisma.user.findUnique({
      where: {
        username: memberUsername,
      },
    });

    //if not exist
    if (!memberUser) {
      return res.status(403).json({
        message: " user dosen't exist in out Database",
      });
    }

    await prisma.organization.update({
      where: {
        id: organizationId,
      },
      data: {
        user: { connect: { id: memberUser.id } },
      },
    });

    //send success message
    res.json({
      message: "New Member added",
    });
  },
);

//.......Show all the orgs where signed-in user is eihter admin or member ........

orgRouter.get("/my-organizations", authMiddleware, async (req, res) => {
  const userId = req.userId;

  if (userId === null || userId === undefined) {
    return res.status(401).json({
      message: "Invalid UserID ",
    });
  }

  const myOrgs = await prisma.organization.findMany({
    where: {
      OR: [{ adminId: userId }, { user: { some: { id: userId } } }],
    },
  });

  res.json({
    myOrgs: myOrgs,
  });
});

//.........show specific org detail ..............
orgRouter.get("/organization", authMiddleware, async (req, res) => {
  //user send org id
  const orgId = Number(req.query.organizationId);
  const { data, success, error } = getOrgSchema.safeParse({
    organizationId: orgId,
  });
  if (!success)
    return res.status(400).json({
      message: "invlaid OrgID",
      error: error.flatten().fieldErrors,
    });
  const { organizationId } = data;

  //find that org from DB

  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
    include: {
      admin: { select: { username: true } },
      user: { select: { id: true, username: true } },
    },
  });

  if (!organization) {
    return res.status(404).json({ message: "Organization not found" });
  }

  const isAdmin = organization.adminId === req.userId;
  const isMember = organization.user.some((member) => member.id === req.userId);

  if (!isAdmin && !isMember) {
    return res
      .status(403)
      .json({ message: "You do not have access to this organization" });
  }

  return res.json({ organization, isAdmin });
});

//.......Delete member from organization..........

orgRouter.delete("/members", authMiddleware, async (req, res) => {
  const { data, success, error } = orgSchema.safeParse(req.body);
  if (!success)
    return res.status(400).json({
      message: "invlaid credential",
      error: error.flatten().fieldErrors,
    });
  const { organizationId, memberUsername } = data;

  //find organization
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
  });

  //check admin / if org not exist
  if (!organization || organization.adminId !== req.userId) {
    return res.status(403).json({
      message: "Either Org dosen't exist or User isn't admin ",
    });
  }
  //find member user
  const memberUser = await prisma.user.findUnique({
    where: {
      username: memberUsername,
    },
  });

  //if not exist
  if (!memberUser) {
    return res.status(403).json({
      message: " user dosen't exist in out Database",
    });
  }
  //if exist then delete

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      user: { disconnect: { id: memberUser.id } },
    },
  });

  //send success message
  res.json({
    message: " Member Removed from Org",
  });
});
