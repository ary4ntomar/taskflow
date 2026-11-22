import express from "express";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.js";
const app = express ();


app.use(express.json());
app.use(cookieParser());


//routes
app.use("/auth",authRouter);


app.listen(3000,()=>{
    console.log("App is listening on port 3000");
})