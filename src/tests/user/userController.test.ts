const request = require('supertest');
const userController = require('../../controllers/userController');
const app = require('../../app');
const logic = require('../../businessLogic/userLogic');
import {User} from '../../domain/user';

jest.mock('../../businessLogic/userLogic');
describe('User Controller', () => {

    describe('POST /signup', () => {
        it('should sign up a new user successfully', async () => {
            const newUser = {
                firstname: 'jhon',
                lastname:"doe",
                email: 'testuser@example.com',
                password: 'Test@1234'
            };
            const createdUser = new User(
                'testuser@example.com',
                'Test@1234',
                'jhon',
                'doe'
            )
            logic.createUser = jest.fn().mockResolvedValue(createdUser);
            const req: any = {body: newUser};
            const res: any = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            await userController.register(req,res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({createdUser});
        });

        it('should return 400 if the email is already in use', async () => {
            const existingUser = {
                username: 'existinguser',
                email: 'existinguser@example.com',
                password: 'Test@1234'
            };
            logic.createUser = jest.fn().mockImplementation(() => {
                throw new Error('user already exists');
            });
            const req: any = {body: existingUser};
            const res: any = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            try{
                await userController.register(req,res); 
            }catch(error){
                expect(error).toEqual(new Error('user already exists'));
            }
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if the password is too weak', async () => {
            const weakPasswordUser = {
                username: 'weakpassworduser',
                email: 'weakpassworduser@example.com',
                password: '123'
            };

            const req: any = {body: weakPasswordUser};
            const res: any = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            await userController.register(req,res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith("Password is invalid");
        });
    });
});