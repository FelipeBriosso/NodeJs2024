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
        const possibleMovies = {results:[{ id: 1, title: "Inception" }]};

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
        const possibleMovies = {results:[{ id: "2", title: "Some Other Movie" }]};

        // Mock the movieService.getMoviesByTitle method
        (movieService.getMoviesByTitle as jest.Mock).mockResolvedValue(possibleMovies);

        await expect(favoriteMovieLogic.postFavoriteMovie(movie)).rejects.toThrow(LogicError);
        await expect(favoriteMovieLogic.postFavoriteMovie(movie)).rejects.toThrow("could not find movie with id and title");

    });
});

describe('getFavoriteMovies', () => {
  const mockMovies = [
    { id: 1, title: 'Inception', addedAt: '2023-10-17T00:00:00Z' },
    { id: 2, title: 'Interstellar', addedAt: '2023-10-18T00:00:00Z' }
  ];

  beforeEach(() => {
    jest.clearAllMocks(); // Limpiar mocks antes de cada test
  });

  it('should return movies with suggestion score if movies are found', async () => {
    // Mock de la función getUserMovies para devolver películas
    (favoriteMovieService.getUserMovies as jest.Mock).mockResolvedValueOnce({user:"user",favoriteMovies:mockMovies});

    // Llamada a la función a probar
    const result = await favoriteMovieLogic.getFavoriteMovies('user@example.com');

    // Verificar que getUserMovies fue llamada con el email correcto
    expect(favoriteMovieService.getUserMovies).toHaveBeenCalledWith('user@example.com');

    // verificar que no se perdieron elementos
    expect(result).toHaveLength(2);
    result.forEach(movie => {
        expect(movie.suggestionForTodayScore).toBeDefined(); 
    });
    //verificar que esta ordenada
    expect(result[0].suggestionForTodayScore).toBeGreaterThanOrEqual(result[1].suggestionForTodayScore);
  });

  it('should throw LogicError if no movies are found', async () => {
    // Mock de la función getUserMovies para devolver una lista vacía

    (favoriteMovieService.getUserMovies as jest.Mock).mockResolvedValueOnce(null);

    // Verificar que se lanza un error de lógica si no se encuentran películas
    await expect(favoriteMovieLogic.getFavoriteMovies('user@example.com')).rejects.toThrow(LogicError);
    await expect(favoriteMovieLogic.getFavoriteMovies('user@example.com')).rejects.toThrow('movies not found');
  });
});
