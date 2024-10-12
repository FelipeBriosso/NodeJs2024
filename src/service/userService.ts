import { User } from "../domain/user";
import fs from 'fs/promises'; // Usamos las funciones basadas en promesas de fs
import { ServiceError } from "../utils/errors";

export const createUser = async (user: User) => {
    const rutaArchivo = './usuarios.txt';

    try {
        // Leer el archivo y verificar si ya existe un usuario con el mismo email
        let data: string = '';
        try {
            data = await fs.readFile(rutaArchivo, 'utf8'); // Leer el archivo de forma asíncrona
        } catch (err: any) {
            if (err.code !== 'ENOENT') { // Si el error no es por archivo inexistente, lanzar error
                throw new ServiceError(`Error al leer el archivo: ${err.message}`);
            }
        }

        let usuarios: User[] = [];

        if (data) {
            usuarios = data.split('\n')
                .filter(Boolean) // Eliminar líneas vacías
                .map(linea => {
                    try {
                        return JSON.parse(linea); // Parsear cada línea como un objeto JSON
                    } catch (parseErr) {
                        console.error(`Error al parsear la línea: ${linea}`);
                        return null; // Ignorar líneas corruptas
                    }
                })
                .filter(Boolean); // Eliminar usuarios que no pudieron ser parseados
        }

        // Verificar si ya existe un usuario con el mismo email
        const existeUsuario = usuarios.some(u => u.email === user.email);
        if (existeUsuario) {
            throw new ServiceError('El email ya está registrado.');
        }

        // Si no existe, agregar el nuevo usuario en una sola línea
        const usuarioJson = JSON.stringify(user); // JSON en una sola línea

        await fs.appendFile(rutaArchivo, usuarioJson + '\n'); // Escribir en el archivo de forma asíncrona
        console.log('Usuario guardado correctamente');
        return user;

    } catch (err: any) {
        throw new ServiceError(`Error al crear el usuario: ${err.message}`); // Manejar cualquier error
    }
};
