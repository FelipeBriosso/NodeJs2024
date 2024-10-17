import { Request, Response } from 'express';
import * as favoriteMovieController from '../../controllers/favoriteMovieController';
import * as favoriteMovieLogic from '../../businessLogic/favoriteMovieLogic';
import { DomainError, ServiceError } from '../../utils/errors';
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
                ownScore: 95,
                email: "user@example.com",
            },
        };
        const favoriteMovie = new FavoriteMovie(
            1,
            95,
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
                ownScore: 95,
                email: "user@example.com",
            },
        };
        const errorMessage = "Movie id is required";
        
        await favoriteMovieController.postFavoriteMovie(req as Request, res as Response);

        // Verify that the response status and JSON were called correctly
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(errorMessage);
    });

    it('should return 404 if DomainError invalid ownScore is thrown', async () => {
        req = {
            body: {
                id: 1,
                ownScore: -5,
                email: "user@example.com",
            },
        };
        const errorMessage = "own score must be a valid number";

        await favoriteMovieController.postFavoriteMovie(req as Request, res as Response);

        // Verify that the response status and JSON were called correctly
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(errorMessage);
    });
    it('should return 404 if DomainError invalid ownScore is thrown', async () => {
        req = {
            body: {
                id: 1,
                ownScore: 105,
                email: "user@example.com",
            },
        };
        const errorMessage = "own score must be a valid number";

        await favoriteMovieController.postFavoriteMovie(req as Request, res as Response);

        // Verify that the response status and JSON were called correctly
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(errorMessage);
    });


    it('should return 404 if DomainError no email is thrown', async () => {
        req = {
            body: {
                id: 1,
                ownScore: 95,
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
                ownScore: 95,
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

    it('should return 500 if an unexpected error is thrown', async () => {
        req = {
            body: {
                id: 1,
                ownScore: 95,
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
