import { Request, Response } from 'express';
import * as movieController from '../../controllers/movieController'; // Ajusta la ruta según tu estructura
import * as movieLogic from '../../businessLogic/movieLogic'; // Ajusta la ruta según tu estructura
import { LogicError } from '../../utils/errors';

// Mock de la lógica de películas
jest.mock('../../businessLogic/movieLogic', () => ({
    getMovies: jest.fn(),
}));

describe('getMovies Controller', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        req = {
            params: {
                keyword: 'inception',
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    it('should return a list of movies when keyword is provided', async () => {
        // Mock de los datos de películas
        const movies = [{ title: 'Inception', year: 2010 }];
        // Simular el comportamiento de movieLogic.getMovies
        (movieLogic.getMovies as jest.Mock).mockResolvedValue(movies);

        // Llamar a la función del controlador
        await movieController.getMovies(req as Request, res as Response);

        // Comprobar si el estado 200 fue llamado
        expect(res.status).toHaveBeenCalledWith(200);
        // Comprobar si la respuesta JSON contiene las películas esperadas
        expect(res.json).toHaveBeenCalledWith(movies);
    });
    it('should return a list of movies when no keyword is provided', async () => {
        // Mock data for movies
        const movies = [{ title: 'Inception', year: 2010 }];
    
        (movieLogic.getMovies as jest.Mock).mockResolvedValue(movies);

        const req2: Partial<Request> = { params: { keyword: '' } }; 
    
        // Call the controller function
        await movieController.getMovies(req2 as Request, res as Response);
    
        // Check if the status 200 was called
        expect(res.status).toHaveBeenCalledWith(200);
        // Check if the JSON response contains the expected movies
        expect(res.json).toHaveBeenCalledWith(movies);
    });
    

    it('should return a 500 error if there is an exception', async () => {
        // Simular un error en movieLogic.getMovies
        (movieLogic.getMovies as jest.Mock).mockRejectedValue(new Error('Error retrieving movies'));

        // Llamar a la función del controlador
        await movieController.getMovies(req as Request, res as Response);

        // Comprobar si el estado 500 fue llamado
        expect(res.status).toHaveBeenCalledWith(500);
        // Comprobar si la respuesta JSON contiene el mensaje de error
        expect(res.json).toHaveBeenCalledWith({
            message: 'Error retrieving movies',
            error: new Error('Error retrieving movies'),
        });
    });

    it('should return a 404 error if there is an exception', async () => {
            // Simular un error en movieLogic.getMovies
            (movieLogic.getMovies as jest.Mock).mockRejectedValue(new LogicError('no movie found'));
    
            // Llamar a la función del controlador
            await movieController.getMovies(req as Request, res as Response);
    
            // Comprobar si el estado 500 fue llamado
            expect(res.status).toHaveBeenCalledWith(404);
            // Comprobar si la respuesta JSON contiene el mensaje de error
            expect(res.json).toHaveBeenCalledWith('no movie found');
    });
});
