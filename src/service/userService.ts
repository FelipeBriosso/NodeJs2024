import { User } from "../domain/user";
import fs from 'fs/promises'; // Usamos las funciones basadas en promesas de fs
import { ServiceError } from "../utils/errors";
const rutaUsuarios = './usuarios.txt';
const rutaBlacklist = './blacklist.txt';


export const createUser = async (user: User) => {
    try {
        const savedUsers = await getAllUsers();
        const userExists = savedUsers.some(u => u.email === user.email);
        if (userExists) {
          throw new ServiceError('the email is already used');
        }
        const usuarioJson = JSON.stringify(user); // JSON en una sola línea

        await fs.appendFile(rutaUsuarios, usuarioJson + '\n'); // Escribir en el archivo de forma asíncrona
        return user;

    } catch (err: any) {
        throw new ServiceError(`Error creating user: ${err.message}`); // Manejar cualquier error
    }
};

export const getUser= async(email:string) =>{
    try {
    const users = await getAllUsers();
     return users.find(user => user.email === email) || null;
    }catch(err: any){
        throw new ServiceError(`Error getting the user: ${err.message}`); // Manejar cualquier error
    }
}
export const invalidateToken = async(token:string) =>{
    const bannedTokens = await getBlackList();
    const bannedToken = bannedTokens.some(u => u=== token);
    if (bannedToken) {
      throw new ServiceError('the token was already banned');
    }
    try{
        await fs.appendFile(rutaBlacklist, JSON.stringify(token) + '\n'); // Escribir en el archivo de forma asíncrona
        return token;
    } catch (err: any) {
        throw new ServiceError(`Error adding token to the blacklist: ${err.message}`); // Manejar cualquier error
    }
}
export const sessionIsValid = async(token:string) => {
    const bannedTokens = await getBlackList();
    const bannedToken = bannedTokens.some(u => u=== token);
    if (bannedToken) {

      return false;
    }
    return true;
}
const getBlackList = async()=> {
    let data: string = '';
    try{
        data = await fs.readFile(rutaBlacklist, 'utf8'); // Leer el archivo de forma asíncrona
    } catch (err: any) {
        if (err.code !== 'ENOENT') { // Si el error no es por archivo inexistente, lanzar error
            throw new ServiceError(`Error reading the file: ${err.message}`);
        }
    }
    let bannedTokens: string[] = [];
    if (data) {
        bannedTokens = data.split('\n')
            .filter(Boolean) 
            .map(line => {
                try{
                return JSON.parse(line); 
                }catch(error){
                    return null;
                }
            })
            .filter(Boolean); 
}
return bannedTokens;
}

const getAllUsers = async() => {
        // Leer el archivo y verificar si ya existe un usuario con el mismo email
        let data: string = '';
        try {
            data = await fs.readFile(rutaUsuarios, 'utf8'); // Leer el archivo de forma asíncrona
        } catch (err: any) {
            if (err.code !== 'ENOENT') { // Si el error no es por archivo inexistente, lanzar error
                throw new ServiceError(`Error reading the file: ${err.message}`);
            }
        }

        let users: User[] = [];

        if (data) {
            users = data.split('\n')
                .filter(Boolean) // Eliminar líneas vacías
                .map(line => {
                    try {
                        return JSON.parse(line); // Parsear cada línea como un objeto JSON
                    } catch (parseErr) {
                        return null; // Ignorar líneas corruptas
                    }
                })
                .filter(Boolean); // Eliminar usuarios que no pudieron ser parseados
    }
    return users;
}
