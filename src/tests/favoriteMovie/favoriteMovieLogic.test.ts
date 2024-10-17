import * as favoriteMovieLogic from '../../businessLogic/favoriteMovieLogic' 
import * as movieService from '../../service/movieService';
import * as favoriteMovieService from '../../service/favoriteMovieService';
import { LogicError } from '../../utils/errors';
import { FavoriteMovie } from '../../domain/favoriteMovie';

jest.mock('../../service/movieService');
jest.mock('../../service/favoriteMovieService');

describe('postFavoriteMovie', () => {
    let movie: FavoriteMovie;

    beforeEach(() => {
        movie =new FavoriteMovie (
            1,
            "Inception",
            "user@example.com",
        );
        jest.clearAllMocks(); // Clear mocks before each test
    });

    it('should save the movie when the movie is valid', async () => {
        const possibleMovies = [{ id: 1, title: "Inception" }];

        // Mock the movieService.getMoviesByTitle method
        (movieService.getMoviesByTitle as jest.Mock).mockResolvedValue(possibleMovies);

        // Mock the favoriteMovieService.saveFavoriteMovie method
        const savedMovie = { ...movie, addedAt: new Date().toISOString() };
        (favoriteMovieService.saveFavoriteMovie as jest.Mock).mockResolvedValue(savedMovie);

        // Call the function
        const result = await favoriteMovieLogic.postFavoriteMovie(movie);

        // Assert that the movie was saved correctly
        expect(movieService.getMoviesByTitle).toHaveBeenCalledWith(movie.title);
        expect(favoriteMovieService.saveFavoriteMovie).toHaveBeenCalledWith(movie);

        // Assert the result
        expect(result).toEqual({
            id: savedMovie.id,
            title: savedMovie.title,
            addedAt: savedMovie.addedAt,
        });
    });

    it('should throw LogicError when movie is invalid', async () => {
        const possibleMovies = [{ id: "2", title: "Some Other Movie" }];

        // Mock the movieService.getMoviesByTitle method
        (movieService.getMoviesByTitle as jest.Mock).mockResolvedValue(possibleMovies);

        await expect(favoriteMovieLogic.postFavoriteMovie(movie)).rejects.toThrow(LogicError);
        await expect(favoriteMovieLogic.postFavoriteMovie(movie)).rejects.toThrow("could not find movie with id and title");

    });
});
