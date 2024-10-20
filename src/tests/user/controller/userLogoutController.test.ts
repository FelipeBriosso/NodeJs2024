import { logout } from '../../../controllers/userController'; 
const logic = require('../../../businessLogic/userLogic');
import { ServiceError } from '../../../utils/errors';

jest.mock('../../../businessLogic/userLogic');
describe('logout function', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {
      body: {
        token: 'mockedToken', // Simulamos que el request contiene un token
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should invalidate the token and return 201 status', async () => {
    // Mockeamos la función invalidateToken para que simule un resultado exitoso
    (logic.invalidateToken as jest.Mock).mockResolvedValue('Token invalidated');
    
    await logout(req, res);

    expect(logic.invalidateToken).toHaveBeenCalledWith('mockedToken');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith('Token invalidated');
  });

  it('should return 404 if ServiceError is thrown', async () => {
    logic.invalidateToken = jest.fn().mockImplementation(() => {
      throw new ServiceError('ServiceError');
  });

    await logout(req, res);

    expect(logic.invalidateToken).toHaveBeenCalledWith('mockedToken');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith('ServiceError');
  });

  it('should return 500 if a general error is thrown', async () => {
    logic.invalidateToken = jest.fn().mockImplementation(() => {
      throw new Error('unknown Error');
  });

    await logout(req, res);

    expect(logic.invalidateToken).toHaveBeenCalledWith('mockedToken');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith('unknown Error');
  });
});
