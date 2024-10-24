import * as logic from '../../businessLogic/userLogic';
import * as service from '../../service/userService';
import {User} from '../../domain/user';
import { LogicError } from '../../utils/errors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


jest.mock('../../service/userService');
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('createUser', () => {
    it('should create a new user successfully', async () => {
        const newUser = new User(
            'testuser@example.com',
            'Test@1234',
            'jhon',
            'doe'
        );
        
        (bcrypt.hash as jest.Mock).mockResolvedValue(newUser.password);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (service.createUser as jest.Mock).mockResolvedValue(newUser);
        const result = await logic.createUser(newUser);
        expect(result.email).toBe(newUser.email);
        expect(result.firstname).toBe(newUser.firstname);
        expect(result.lastname).toBe(newUser.lastname);
    });
});

describe('getUser', () => {
  const mockUser: User = new User(
    'test@example.com',
    'securePassword123',
    'jhon',
    'doe'
  );
  
  beforeEach(() => {
    jest.clearAllMocks(); // Limpiar los mocks antes de cada test
  });
  
  it('should return the user information if the user email and password are correct', async () => {
    // Simular que el servicio devuelve un usuario válido
    (bcrypt.hash as jest.Mock).mockResolvedValue(mockUser.password);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (service.getUser as jest.Mock).mockResolvedValue(mockUser);
    (jwt.sign as jest.Mock).mockReturnValue('mockedToken');
     const result = await logic.getUser('test@example.com', 'securePassword123');
  
    expect(result).toEqual({
      email: mockUser.email,
      firstname: mockUser.firstname,
      lastname: mockUser.lastname,
      token: 'mockedToken'
      });
    });
  
  it('should throw an error if the password is wrong', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    (service.getUser as jest.Mock).mockResolvedValue(mockUser);
  
    await expect(logic.getUser('test@example.com', 'wrongPassword')).rejects.toThrow(LogicError);
    await expect(logic.getUser('test@example.com', 'wrongPassword')).rejects.toThrow('wrong password');
  
  });
  
  it('should throw an error if no user is found', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue(mockUser.password);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (service.getUser as jest.Mock).mockResolvedValue(null);
     try{
      await logic.getUser('nonexistent@example.com', 'somePassword');
      }catch(error: any){
      expect(error).toEqual(new LogicError('No user found'));
    }
  });
});
describe('getUser', () => {
  it('should return the same token after invalidating it',async ()=>{
    const invalidtoken ="invalidToken";
    (service.invalidateToken as jest.Mock).mockResolvedValue(invalidtoken);
    const returnedToken = await logic.invalidateToken(invalidtoken);
    expect(returnedToken).toBe(invalidtoken);
  });
});
