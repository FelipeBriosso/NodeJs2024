const logic = require('../../businessLogic/userLogic');
const service = require('../../service/userService');
import {User} from '../../domain/user';
import { LogicError } from '../../utils/errors';

jest.mock('../../service/userService');


describe('createUser', () => {
    it('should create a new user successfully', async () => {
        const newUser = new User(
            'testuser@example.com',
            'Test@1234',
            'jhon',
            'doe'
        );
        service.createUser = jest.fn().mockResolvedValue(newUser);
        const result = await logic.createUser(newUser);
        expect(result).toBe(newUser);
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

      service.getUser.mockResolvedValue(mockUser);
  
      const result = await logic.getUser('test@example.com', 'securePassword123');
  
      expect(result).toEqual({
        email: mockUser.email,
        firstname: mockUser.firstname,
        lastname: mockUser.lastname
      });
    });
  
    it('should throw an error if the password is wrong', async () => {
      // Simular que el servicio devuelve un usuario válido
      service.getUser.mockResolvedValue(mockUser);
  
      await expect(logic.getUser('test@example.com', 'wrongPassword')).rejects.toThrow(LogicError);
      await expect(logic.getUser('test@example.com', 'wrongPassword')).rejects.toThrow('wrong password');
  
    });
  
    it('should throw an error if no user is found', async () => {
      // Simular que el servicio no encuentra un usuario
      service.getUser.mockResolvedValue(null);
  
       try{
        await logic.getUser('nonexistent@example.com', 'somePassword');
       }catch(error: any){
        expect(error).toEqual(new LogicError('No user found'));
       }
    });
  });