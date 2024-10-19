const logic = require('../../../businessLogic/userLogic');
import {login} from '../../../controllers/userController'; 
import jwt from 'jsonwebtoken';
import { LogicError, ServiceError } from '../../../utils/errors';

jest.mock('../../../businessLogic/userLogic');
jest.mock('jsonwebtoken', () => ({
    verify: jest.fn(),
    sign : jest.fn()
}));
describe('User Controller', () => {

    
    describe('POST /signIn', () => {
        it('should sign in a new user successfully', async () => {
            const newUser = {
                email: 'testuser@example.com',
                password: 'Test@1234'
            };
            const token = 'randomToken';
            (jwt.verify as jest.Mock).mockResolvedValue({ email: 'testuser@example.com'});
            const loggedInUser ={
                token: token,
                email: 'testuser@example.com',
                firstname:'jhon',
                lastname: 'doe'
            };

            (logic.getUser as jest.Mock).mockResolvedValue(loggedInUser);
            const req: any = {body: newUser};
            const res: any = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            await login(req,res);

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
                await login(req,res); 
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
                await login(req,res); 
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
            }; 
            logic.getUser = jest.fn().mockImplementation(() => {
                throw new Error('unknown Error');
            });
            const req: any = {body: validUser};
            const res: any = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            try{
                await login(req,res); 
            }catch(error){
                expect(error).toEqual(new ServiceError('unknown Error'));
            }
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith('unknown Error');
        });
    });
});