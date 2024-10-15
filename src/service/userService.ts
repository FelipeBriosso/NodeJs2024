import { User } from "../domain/user";
import fs from 'fs/promises'; // Usamos las funciones basadas en promesas de fs
import { ServiceError } from "../utils/errors";
const rutaArchivo = './usuarios.txt';
export const createUser = async (user: User) => {
    try {
        const savedUsers = await getAllUsers();
        const userExists = savedUsers.some(u => u.email === user.email);
        if (userExists) {
          throw new ServiceError('the email is already used');
        }
        const usuarioJson = JSON.stringify(user); // JSON en una sola línea

        await fs.appendFile(rutaArchivo, usuarioJson + '\n'); // Escribir en el archivo de forma asíncrona
        console.log('Usuario guardado correctamente');
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

const getAllUsers = async() => {
        // Leer el archivo y verificar si ya existe un usuario con el mismo email
        let data: string = '';
        try {
            data = await fs.readFile(rutaArchivo, 'utf8'); // Leer el archivo de forma asíncrona
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
                        console.error(`Error parsing the line: ${line}`);
                        return null; // Ignorar líneas corruptas
                    }
                })
                .filter(Boolean); // Eliminar usuarios que no pudieron ser parseados
    }
    return users;
}
