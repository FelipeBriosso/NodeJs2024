import jsonwebtoken from "jsonwebtoken";
import dotenv from 'dotenv';
import { Request, Response } from 'express';
dotenv.config();
export const verifyToken = async (req: Request, res: Response, next: any): Promise<void> => {
    const authorization = req.header("Authorization");
    const sessionToken = authorization
      ? authorization.replace("Bearer ", "")
      : null;
    if (!sessionToken) {
      res.status(401).json("authentication is required");
      return;
    }
    const decoded = jsonwebtoken.verify(sessionToken, process.env.JWT as string);
    if(!decoded){
        res.status(401).json("authentication is required");
        return;
    }
    next();
};