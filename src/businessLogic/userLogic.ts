import { User } from "../domain/user";
import * as userService  from "../service/userService";
import { LogicError } from "../utils/errors";

export const createUser = async(newUser: User) =>{

    const finalUser = await userService.createUser(newUser);
    return finalUser;
}

export const getUser = async (email:string, password:string) => {
    const user = await userService.getUser(email);
    if(!user){
        throw new LogicError("No user found");
    }
    if(!(user.password===password)){
        throw new LogicError("wrong password");
    }
    return {email: user.email, firstname: user.firstname, lastname: user.lastname};
}