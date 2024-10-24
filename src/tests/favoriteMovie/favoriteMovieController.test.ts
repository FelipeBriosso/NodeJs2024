import { Request, Response } from 'express';
import * as favoriteMovieController from '../../controllers/favoriteMovieController';
import * as favoriteMovieLogic from '../../businessLogic/favoriteMovieLogic';
import { DomainError, LogicError, ServiceError } from '../../utils/errors';
import { FavoriteMovie } from '../../domain/favoriteMovie';

jest.mock('../../businessLogic/favoriteMovieLogic');
describe('postFavoriteMovies', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    const mockStatus = jest.fn().mockReturnThis();
    const mockJson = jest.fn();
    const mockSend = jest.fn();

    beforeEach(() => {
        res = {
            status: mockStatus,
            json: mockJson,
            send: mockSend,
        };
        jest.clearAllMocks(); // Clear mocks before each test
    });

    it('should successfully save a favorite movie and return it', async () => {
        req = {
            body: {
                id: 1,
                title: "inception",
                email: "user@example.com",
            },
        };
        const favoriteMovie = new FavoriteMovie(
            1,
            "inception",
            "user@example.com"
        );

        // Mock the favoriteMovieLogic.postFavoriteMovies method
        (favoriteMovieLogic.postFavoriteMovie as jest.Mock).mockResolvedValue(favoriteMovie);

        await favoriteMovieController.postFavoriteMovie(req as Request, res as Response);

        // Verify that the response status and JSON were called correctly
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(favoriteMovie);
    });

    it('should return 404 if DomainError no id is thrown', async () => {
        req = {
            body: {
                id: "",
                title: "inception",
                email: "user@example.com",
            },
        };
        const errorMessage = "Movie id is required";
        
        await favoriteMovieController.postFavoriteMovie(req as Request, res as Response);

        // Verify that the response status and JSON were called correctly
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(errorMessage);
    });

    it('should return 404 if DomainError invalid title is thrown', async () => {
        req = {
            body: {
                id: 1,
                title: "",
                email: "user@example.com",
            },
        };
        const errorMessage = "Movie title is required";

        await favoriteMovieController.postFavoriteMovie(req as Request, res as Response);

        // Verify that the response status and JSON were called correctly
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(errorMessage);
    });



    it('should return 404 if DomainError no email is thrown', async () => {
        req = {
            body: {
                id: 1,
                title: "inception",
                email: "",
            },
        };
        const errorMessage = "A valid user email is required";

        await favoriteMovieController.postFavoriteMovie(req as Request, res as Response);

        // Verify that the response status and JSON were called correctly
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(errorMessage);
    });

    it('should return 404 if ServiceError is thrown', async () => {
        req = {
            body: {
                id: 1,
                title: "inception",
                email: "user@example.com",
            },
        };
        const errorMessage = "Service error occurred";

        // Mock the favoriteMovieLogic.postFavoriteMovies method to throw a ServiceError
        (favoriteMovieLogic.postFavoriteMovie as jest.Mock).mockRejectedValue(new ServiceError(errorMessage));

        await favoriteMovieController.postFavoriteMovie(req as Request, res as Response);

        // Verify that the response status and JSON were called correctly
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(errorMessage);
    });

    it('should return 404 if logicError is thrown', async () => {
        req = {
            body: {
                id: 1,
                title: "inception",
                email: "user@example.com",
            },
        };
        const errorMessage = "Logic error occurred";

        // Mock the favoriteMovieLogic.postFavoriteMovies method to throw a ServiceError
        (favoriteMovieLogic.postFavoriteMovie as jest.Mock).mockRejectedValue(new LogicError(errorMessage));

        await favoriteMovieController.postFavoriteMovie(req as Request, res as Response);

        // Verify that the response status and JSON were called correctly
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(errorMessage);
    });
    it('should return 500 if an unexpected error is thrown', async () => {
        req = {
            body: {
                id: 1,
                title: "inception",
                email: "user@example.com",
            },
        };
        const unexpectedError = new Error("Unexpected error");

        // Mock the favoriteMovieLogic.postFavoriteMovies method to throw an unexpected error
        (favoriteMovieLogic.postFavoriteMovie as jest.Mock).mockRejectedValue(unexpectedError);

        await favoriteMovieController.postFavoriteMovie(req as Request, res as Response);

        // Verify that the response status and JSON were called correctly
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Error saving a new favorite movie', error: unexpectedError });
    });
});


describe('getFavoriteMovies', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn(() => ({ json: mockJson }));

    // Simulando el objeto req y res
    req = {
      body: {
        email: 'user@example.com'
      }
    };

    res = {
      status: mockStatus as any
    };

    jest.clearAllMocks(); // Limpiar mocks antes de cada test
  });

  it('should return user favorite movies if found', async () => {
    const mockMovies = [
      { id: 1, title: 'Inception', addedAt: '2023-10-17T00:00:00Z' },
      { id: 2, title: 'Interstellar', addedAt: '2023-10-18T00:00:00Z' }
    ];

    // Simulando la respuesta de la lógica de negocio
    (favoriteMovieLogic.getFavoriteMovies as jest.Mock).mockResolvedValueOnce(mockMovies);

    // Llamada a la función
    await favoriteMovieController.getFavoriteMovies(req as Request, res as Response);

    // Verificaciones
    expect(favoriteMovieLogic.getFavoriteMovies).toHaveBeenCalledWith('user@example.com');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(mockJson).toHaveBeenCalledWith(mockMovies);
  });

  it('should return 204 if no favorite movies found (LogicError)', async () => {
    // Simulando un error de lógica (sin películas)
    const logicError = new LogicError('No favorite movies found');
    (favoriteMovieLogic.getFavoriteMovies as jest.Mock).mockRejectedValueOnce(logicError);

    // Llamada a la función
    await favoriteMovieController.getFavoriteMovies(req as Request, res as Response);

    // Verificaciones
    expect(favoriteMovieLogic.getFavoriteMovies).toHaveBeenCalledWith('user@example.com');
    expect(res.status).toHaveBeenCalledWith(204);
    expect(mockJson).toHaveBeenCalledWith(logicError.message);
  });

  it('should return 500 for any other error', async () => {
    const serverError = new Error('Something went wrong');
    (favoriteMovieLogic.getFavoriteMovies as jest.Mock).mockRejectedValueOnce(serverError);

    // Llamada a la función
    await favoriteMovieController.getFavoriteMovies(req as Request, res as Response);

    // Verificaciones
    expect(favoriteMovieLogic.getFavoriteMovies).toHaveBeenCalledWith('user@example.com');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith('Something went wrong');
  });
});

