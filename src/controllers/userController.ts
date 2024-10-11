import { Request, Response } from 'express';

export const register = async(req: Request, res: Response) =>{
    const { email, firstname, lastname, password } = req.body;
    const newUser = {
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: password
    };
    res
        .status(201)
        .json({newUser: newUser}); 
}
export const login = async(req: Request, res: Response) =>{

}