import { User } from "../domain/user";
import * as userService  from "../service/userService";
import { LogicError } from "../utils/errors";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
export const createUser = async(newUser: User) =>{

    const finalUser = await userService.createUser(newUser);
    return {email: finalUser.email, firstname: finalUser.firstname, lastname: finalUser.lastname};
}

export const getUser = async (email:string, password:string) => {
    const user = await userService.getUser(email);
    if(!user){
        throw new LogicError("No user found");
    }
    if(!(user.password===password)){
        throw new LogicError("wrong password");
    }
    const token = jwt.sign(
        { email: user.email}, 
        process.env.JWT as string, 
        { expiresIn: '2h' }
    );
    return {token: token, email: user.email, firstname: user.firstname, lastname: user.lastname};
}