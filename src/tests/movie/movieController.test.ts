import { Request, Response } from 'express';
import * as movieController from '../../controllers/movieController'; // Ajusta la ruta según tu estructura
import * as movieLogic from '../../businessLogic/movieLogic'; // Ajusta la ruta según tu estructura

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
});
