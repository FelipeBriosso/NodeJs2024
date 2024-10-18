import { verifyToken } from '../../controllers/authMiddleware';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

jest.mock('jsonwebtoken', () => ({
    verify: jest.fn(),
  }));
describe('verifyToken middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      header: jest.fn(),
      body:jest.fn(),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 401 if no token is provided', async () => {
    (req.header as jest.Mock).mockReturnValue(null); // Simular que no hay header de Authorization

    await verifyToken(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith('authentication is required');
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if token is invalid', async () => {
    (req.header as jest.Mock).mockReturnValue('Bearer invalidToken'); 

    (jwt.verify as jest.Mock).mockImplementation(() =>
         {throw new Error("error")});

    await verifyToken(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith('authentication is required');
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if token is valid', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({email:'email'});
    (req.header as jest.Mock).mockReturnValue('Bearer mockedToken');

    await verifyToken(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled(); 
  });
});
