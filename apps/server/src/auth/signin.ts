import express from "express";
import { signinSchema } from "../validators/auth.js";
import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import { createAuthSession } from "../services/auth.services.js";

export const signinRoute = express();


signinRoute.post("/signin", async (req,res)=>{
     const { data , success , error } = signinSchema.safeParse(req.body);
     if(!success) return res.status(400).json({message:"Invalid credentials", error: error.flatten().fieldErrors});
     const { username , password } = data ;
     
     const userExist = await prisma.user.findUnique({
        where :{     
                username
              }
        })

     if(!userExist) return res.status(401).json({message:"invalid username or password"});

    
     const isMatch = await bcrypt.compare(
        password,
        userExist.password 
     )

     if (!isMatch) return res.status(401).json({message:"Invalid username or password"});

     await createAuthSession(userExist.id , res);
     
     return res.status(200).json({
        message:"Signin successful"
     })
      
})