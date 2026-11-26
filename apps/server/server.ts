import express from "express";
import cookieParser from "cookie-parser";
import { authRouter } from "./src/routes/auth.js";
import { orgRouter } from "./src/routes/organization.js";
import { boardRouter } from "./src/routes/boards.js";
import { issueRouter } from "./src/routes/issues.js";

const app = express();
import cors from "cors";

// After const app = express(), before the routers
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

//routes
app.use("/auth", authRouter);
app.use(orgRouter);
app.use(boardRouter);
app.use(issueRouter);

app.listen(3001, () => {
  console.log("App is listening on port 3001");
});
