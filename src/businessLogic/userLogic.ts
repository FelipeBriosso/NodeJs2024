import { User } from "../domain/user";
import * as userService  from "../service/userService";

export const createUser = async(newUser: User) =>{
    try{
        const finalUser = await userService.createUser(newUser);
        return finalUser;
    }catch(error: any){
        throw error;
    }
}