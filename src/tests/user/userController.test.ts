const userController = require('../../controllers/userController');
const logic = require('../../businessLogic/userLogic');
const jwt = require('jsonwebtoken');
import {User} from '../../domain/user';
import { DomainError, LogicError, ServiceError } from '../../utils/errors';

jest.mock('../../businessLogic/userLogic');
jest.mock('jsonwebtoken', () => ({
    verify: jest.fn(),
    sign : jest.fn()
}));
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
            expect(res.json).toHaveBeenCalledWith(createdUser);
        });

        it('should return 400 if the email is already in use', async () => {
            const existingUser = {
                username: 'existinguser',
                email: 'existinguser@example.com',
                password: 'Test@1234'
            };
            logic.createUser = jest.fn().mockImplementation(() => {
                throw new ServiceError('user already exists');
            });
            const req: any = {body: existingUser};
            const res: any = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            try{
                await userController.register(req,res); 
            }catch(error){
                expect(error).toEqual(new ServiceError('user already exists'));
            }
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith('user already exists');
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
            try{
                await userController.register(req,res); 
            }catch(error){
                expect(error).toEqual(new DomainError('Password is invalid'));
            }

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith("Password is invalid");
        });
        it('should return 400 if the email is not valid', async () => {
            const wrongEmailUser = {
                firstname: 'jhon',
                lastname: 'doe',
                email: 'mail',
                password: 'validPassword123'
            };

            const req: any = {body: wrongEmailUser};
            const res: any = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            try{
                await userController.register(req,res); 
            }catch(error){
                expect(error).toEqual(new DomainError('Invalid email address'));
            }

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith("Invalid email address");
        });

        it('should return 400 if no first name is send', async () => {
            const noNameUser = {
                firstname: '',
                lastname: 'doe',
                email: 'weakpassworduser@example.com',
                password: 'validPassword123'
            };
    
            const req: any = {body: noNameUser};
            const res: any = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            try{
                await userController.register(req,res); 
            }catch(error){
                expect(error).toEqual(new DomainError('First name is required'));
            }
    
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith("First name is required");
        });
        
        it('should return 400 if no first name is send', async () => {
            const noLastNameUser = {
                firstname: 'jhon',
                lastname: '',
                email: 'email@example.com',
                password: 'validPassword123'
            };
    
            const req: any = {body: noLastNameUser};
            const res: any = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            try{
                await userController.register(req,res); 
            }catch(error){
                expect(error).toEqual(new DomainError('last name is required'));
            }
    
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith("last name is required");
        });
        it('should return 500 if sudden error occurred', async () => {
            const validUser = {
                firstname: 'jhon',
                lastname: 'doe',
                email: 'email@example.com',
                password: 'validPassword123'
            }; logic.createUser = jest.fn().mockImplementation(() => {
                throw new Error('unknown Error');
            });
            const req: any = {body: validUser};
            const res: any = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            try{
                await userController.register(req,res); 
            }catch(error){
                expect(error).toEqual(new Error('unknown Error'));
            }
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith('unknown Error');
        });
    });
    describe('POST /signIn', () => {
        it('should sign in a new user successfully', async () => {
            const newUser = {
                email: 'testuser@example.com',
                password: 'Test@1234'
            };
            const token = 'randomToken';
            jwt.verify.mockResolvedValue({ email: 'testuser@example.com'});
            const loggedInUser ={
                token: token,
                email: 'testuser@example.com',
                firstname:'jhon',
                lastname: 'doe'
            };

            logic.getUser = jest.fn().mockResolvedValue(loggedInUser);
            const req: any = {body: newUser};
            const res: any = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            await userController.login(req,res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(loggedInUser);
        });

        it('should return 403 if no user exists with that mail', async () => {
            const nonExistingUser = {
                email: 'testuser@example.com',
                password: 'Test@1234'
            };
            logic.getUser = jest.fn().mockImplementation(() => {
                throw new LogicError('Either the user or the password is incorrect');
            });
            const req: any = {body: nonExistingUser};
            const res: any = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            try{
                await userController.login(req,res); 
            }catch(error){
                expect(error).toEqual(new LogicError('Either the user or the password is incorrect'));
            }
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith("Either the user or the password is incorrect");
        });

        it('should return 403 if the password is wrong', async () => {
            const wrongPasswordUser = {
                email: 'testuser@example.com',
                password: 'Test@1234'
            };

            const req: any = {body: wrongPasswordUser};
            const res: any = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            logic.getUser = jest.fn().mockImplementation(() => {
                throw new LogicError('Either the user or the password is incorrect');
            });
            try{
                await userController.login(req,res); 
            }catch(error){
                expect(error).toEqual(new LogicError('Either the user or the password is incorrect'));
            }

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith("Either the user or the password is incorrect");
        });
        it('should return 500 if sudden error occurred', async () => {
            const validUser = {
                firstname: 'jhon',
                lastname: 'doe',
                email: 'email@example.com',
                password: 'validPassword123'
            }; logic.getUser = jest.fn().mockImplementation(() => {
                throw new Error('unknown Error');
            });
            const req: any = {body: validUser};
            const res: any = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            try{
                await userController.login(req,res); 
            }catch(error){
                expect(error).toEqual(new ServiceError('unknown Error'));
            }
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith('unknown Error');
        });
    });
});