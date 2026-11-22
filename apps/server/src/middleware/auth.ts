import type { Request , Response , NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware= (
    req : Request,
    res : Response,
    next : NextFunction
) => {
     
    const accessToken = req.cookies.accessToken ;

    if(!accessToken){
       return res.status(401).json({message:"token doesn't exist"});
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if(!JWT_SECRET) throw new Error("JWT_SECRET is missing");
    
    try {
          const decoded = jwt.verify(accessToken,JWT_SECRET)   
          
          if( decoded === null || typeof decoded === "number" ) {
            return res.status(401).json({message:"invalid token request"})
          }

          if (typeof decoded.sub !== "number") {
           return res.status(401).json({ message: "Invalid token payload" });
          }

          const userId = decoded.sub;
          req.userId = userId; 

          next();
    } catch(e){
        return res.status(401).json({message:"Invalid or expired access token"})
    }
}
