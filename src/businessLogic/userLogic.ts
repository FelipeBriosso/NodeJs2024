import { User } from "../domain/user";
import * as userService  from "../service/userService";
import { LogicError } from "../utils/errors";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
dotenv.config();
const saltRounds: any = Number(process.env.BCRYPT_LEVEL); // Este número representa la complejidad del algoritmo (más alto, más seguro pero más lento)

export const createUser = async(newUser: User) =>{
    const hashedPassword = await hashPassword(newUser.password);
    newUser.password = hashedPassword;
    const finalUser = await userService.createUser(newUser);
    return {email: finalUser.email, firstname: finalUser.firstname, lastname: finalUser.lastname};
}

export const getUser = async (email:string, password:string) => {
    const user = await userService.getUser(email);
    if(!user){
        throw new LogicError("No user found");
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if(!isPasswordCorrect){
        throw new LogicError("wrong password");
    }
    const token = jwt.sign(
        { email: user.email}, 
        process.env.JWT as string, 
        { expiresIn: '2h' }
    );
    return {token: token, email: user.email, firstname: user.firstname, lastname: user.lastname};
}
export const invalidateToken= async(token: any) =>{
   const invalidToken = await userService.invalidateToken(token);
   return invalidToken;
}

async function hashPassword(plainPassword: string) {
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
  return hashedPassword;
}


