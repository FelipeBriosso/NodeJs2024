// Importar las dependencias
import { createUser, getUser, invalidateToken,sessionIsValid } from '../../service/userService'; 
import { User } from '../../domain/user';
import { ServiceError } from '../../utils/errors';
import fs from 'fs/promises';


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

describe('invalidateToken', () => {
    const mockToken = 'abc123';
    const blacklistRoute = './blacklist.txt';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should throw an error if the token is already banned', async () => {
        // Mock para simular que el token ya está en la lista negra
        (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockToken) + '\n');

        await expect(invalidateToken(mockToken)).rejects.toThrow('the token was already banned');
        expect(fs.readFile).toHaveBeenCalledWith(blacklistRoute, 'utf8');
    });

    it('should add the token if it is not banned', async () => {
        // Mock para simular que no hay tokens baneados
        (fs.readFile as jest.Mock).mockResolvedValue('');

        await invalidateToken(mockToken);

        expect(fs.appendFile).toHaveBeenCalledWith(blacklistRoute, JSON.stringify(mockToken) + '\n');
        expect(fs.readFile).toHaveBeenCalledWith(blacklistRoute, 'utf8');
    });

    it('should throw an error if reading the blacklist fails for non-ENOENT error', async () => {
        // Mock para simular que leer el archivo lanza un error
        (fs.readFile as jest.Mock).mockRejectedValue({ code: 'EACCES', message: 'Permission denied' });

        await expect(invalidateToken(mockToken)).rejects.toThrow("Error reading the file: Permission denied");
        expect(fs.readFile).toHaveBeenCalledWith(blacklistRoute, 'utf8');
    });

    it('should not throw an error if the blacklist file does not exist (ENOENT)', async () => {
        // Mock para simular que el archivo no existe
        (fs.readFile as jest.Mock).mockRejectedValue({ code: 'ENOENT' });

        await invalidateToken(mockToken);

        expect(fs.appendFile).toHaveBeenCalledWith(blacklistRoute, JSON.stringify(mockToken) + '\n');
    });

    it('should throw an error if appendFile fails', async () => {
        // Mock para simular que la función `appendFile` lanza un error
        (fs.readFile as jest.Mock).mockResolvedValue('');
        (fs.appendFile as jest.Mock).mockRejectedValue(new Error('Disk is full'));

        await expect(invalidateToken(mockToken)).rejects.toThrow('Error adding token to the blacklist: Disk is full');
        expect(fs.readFile).toHaveBeenCalledWith(blacklistRoute, 'utf8');
        expect(fs.appendFile).toHaveBeenCalledWith(blacklistRoute, JSON.stringify(mockToken) + '\n');
    });
      it('should ignored the corrupted lines and insert the user anyways', async () => {
    const corruptLine = 'corrupted line';
    const validToken = "validToken";
    (fs.readFile as jest.Mock).mockResolvedValue(`${corruptLine}\n${JSON.stringify(validToken)}\n`);
    (fs.appendFile as jest.Mock).mockResolvedValue(undefined);

    const result = await invalidateToken(mockToken);

    expect(fs.readFile).toHaveBeenCalledWith(blacklistRoute, 'utf8');
    expect(fs.appendFile).toHaveBeenCalledWith(blacklistRoute, JSON.stringify(mockToken) + '\n');
    expect(result).toEqual(mockToken);
  });

});

describe('validate Token', () => {
  const mockToken = 'abc123';
    const blacklistRoute = './blacklist.txt';

    beforeEach(() => {
        jest.clearAllMocks();
    });
  it('should return false if the token is already banned', async () => {
    // Mock para simular que el token ya está en la lista negra
    (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockToken)+ '\n');

    const isvalid = await sessionIsValid(mockToken);
    expect(fs.readFile).toHaveBeenCalledWith(blacklistRoute, 'utf8');
    expect(isvalid).toBe(false);
});
it('should return true if the token was not banned', async () => {
  // Mock para simular que el token ya está en la lista negra
  (fs.readFile as jest.Mock).mockResolvedValue('');

  const isvalid = await sessionIsValid(mockToken);
  expect(fs.readFile).toHaveBeenCalledWith(blacklistRoute, 'utf8');
  expect(isvalid).toBe(true);
});
});