import { Request, Response } from 'express';
import { User } from '../domain/user';
import { DomainError, LogicError, ServiceError } from '../utils/errors';
import * as userLogic  from '../businessLogic/userLogic'; 

export const register = async(req: Request, res: Response) =>{
    try{
        const { email, firstname, lastname, password } = req.body;
        const newUser = new User(
            email,
            password,
            firstname,
            lastname
        );
        const createdUser = await userLogic.createUser(newUser); 
        res
            .status(201)
            .json(createdUser); 
        return;
    }catch(error: any){
        if(error instanceof DomainError){
            res
                .status(400)
                .json(error.message);
            return;
        }
        if(error instanceof ServiceError){
            res
                .status(401)
                .json(error.message);
            return;
        }
        res
            .status(500)
            .json(error.message);
        return;
    }
   
}
export const login = async(req: Request, res: Response) =>{
    try{
        const { email,password } = req.body;
        const loggedInUser = await userLogic.getUser(email, password);
        res
            .status(201)
            .json(loggedInUser);

    }catch(error: any){
        if(error instanceof LogicError){
            res
            .status(403)
            .json(error.message);
            return;
        }
        res
            .status(500)
            .json(error.message);
        return;
    }
}