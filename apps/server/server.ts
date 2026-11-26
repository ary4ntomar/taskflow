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
  origin:   process.env.CLIENT_URL|| "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

//routes
app.use("/auth", authRouter);
app.use(orgRouter);
app.use(boardRouter);
app.use(issueRouter);

const PORT = process.env.PORT || 3001
app.listen( PORT , () => {
  console.log(`Server running on port ${PORT}`);
});
