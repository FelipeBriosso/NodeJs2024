// Importar las dependencias
import { createUser, getUser } from '../../service/userService'; // Ajusta la ruta según la estructura del proyecto
import { User } from '../../domain/user';
import { ServiceError } from '../../utils/errors';
import fs from 'fs/promises';
import { use } from 'chai';

// Mockear las funciones de fs/promises
jest.mock('fs/promises');

describe('createUser', () => {
  const mockUser: User = new User (
    'johndoe@example.com',
    'MyPassword123',
    'John',
    'doe'
  );

  beforeEach(() => {
    jest.clearAllMocks(); // Limpiar los mocks antes de cada test
  });

  it('should save a user correctly if the file doesnt exists', async () => {
    // Mockear la lectura del archivo para que simule que el archivo no existe (ENOENT)
    (fs.readFile as jest.Mock).mockRejectedValue({ code: 'ENOENT' });
    // Mockear appendFile para simular que se escribe correctamente
    (fs.appendFile as jest.Mock).mockResolvedValue(undefined);

    const result = await createUser(mockUser);

    expect(fs.readFile).toHaveBeenCalledWith('./usuarios.txt', 'utf8');
    expect(fs.appendFile).toHaveBeenCalledWith('./usuarios.txt', JSON.stringify(mockUser) + '\n');
    expect(result).toEqual(mockUser);
  });

  it('should throw an error if the mail is already saved', async () => {
    // Simular que el archivo contiene un usuario con el mismo email
    const existingUser = {firstname: 'jhon',lastname:'doe', email: 'johndoe@example.com' };
    (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(existingUser) + '\n');

    await expect(createUser(mockUser)).rejects.toThrow(ServiceError);
    await expect(createUser(mockUser)).rejects.toThrow('Error creating user: the email is already used');

    expect(fs.readFile).toHaveBeenCalledWith('./usuarios.txt', 'utf8');
    expect(fs.appendFile).not.toHaveBeenCalled();
  });

  it('should throw a serviceError if there is a read error different to ENOENT', async () => {
    // Mockear para simular un error de lectura que no es ENOENT
    (fs.readFile as jest.Mock).mockRejectedValue(new Error('reading error'));

    await expect(createUser(mockUser)).rejects.toThrow(ServiceError);
    await expect(createUser(mockUser)).rejects.toThrow('Error reading the file: reading error');

    expect(fs.readFile).toHaveBeenCalledWith('./usuarios.txt', 'utf8');
    expect(fs.appendFile).not.toHaveBeenCalled();
  });

  it('should ignored the corrupted lines and insert the user anyways', async () => {
    const corruptLine = 'corrupted json line';
    const validUser = { id: 2, name: 'Jane Doe', email: 'janedoe@example.com' };
    (fs.readFile as jest.Mock).mockResolvedValue(`${corruptLine}\n${JSON.stringify(validUser)}\n`);
    (fs.appendFile as jest.Mock).mockResolvedValue(undefined);

    const result = await createUser(mockUser);

    expect(fs.readFile).toHaveBeenCalledWith('./usuarios.txt', 'utf8');
    expect(fs.appendFile).toHaveBeenCalledWith('./usuarios.txt', JSON.stringify(mockUser) + '\n');
    expect(result).toEqual(mockUser);
  });
});

describe('getUser', () => {
    const mockUser: User = new User (
        'johndoe@example.com',
        'MyPassword123',
        'John',
        'doe'
      );
    
      beforeEach(() => {
        jest.clearAllMocks(); // Limpiar los mocks antes de cada test
      });
      it('should return the user if found', async () => {

        (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockUser) + '\n');
        const user = await getUser(mockUser.email);
        expect(user?.email).toBe(mockUser.email);
        expect(user?.firstname).toBe(mockUser.firstname);
        expect(user?.lastname).toBe(mockUser.lastname);
      });
      it('should return null if no user found', async () => {

        (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(null) + '\n');
        const user = await getUser(mockUser.email);
        expect(user).toBe(null);
      });
      it('should throw an unknown error', async () => {

        (fs.readFile as jest.Mock).mockRejectedValue(new Error('reading error'));
        await expect(getUser(mockUser.email)).rejects.toThrow(ServiceError);
        await expect(getUser(mockUser.email)).rejects.toThrow('Error getting the user: Error reading the file: reading error');

      });
});