const request = require('supertest');
const userController = require('../../controllers/userController');
const app = require('../../app');

describe('User Controller', () => {

    describe('POST /signup', () => {
        it('should sign up a new user successfully', async () => {
            const newUser = {
                firstname: 'jhon',
                lastname:"doe",
                email: 'testuser@example.com',
                password: 'Test@1234'
            };
            const req: any = {body: newUser};
            const res: any = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            await userController.register(req,res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({newUser});
        });

        it('should return 400 if the email is already in use', async () => {
            const existingUser = {
                username: 'existinguser',
                email: 'existinguser@example.com',
                password: 'Test@1234'
            };
            const req: any = {body: existingUser};
            const res: any = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            await userController.register(req,res);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Email already in use');
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

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Password is too weak');
        });
    });
});