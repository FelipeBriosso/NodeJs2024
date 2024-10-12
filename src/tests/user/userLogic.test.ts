const logic = require('../../businessLogic/userLogic');
const service = require('../../service/userService');
import {User} from '../../domain/user';

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