import * as movieService from '../../service/movieService';
import * as movieLogic from '../../businessLogic/movieLogic';
import { LogicError } from '../../utils/errors';

jest.mock('../../service/movieService'); // Mock the entire movieService module

interface Movie {
    suggestionScore?: number;
    
}
describe('getMovies', () => {
    const keyword = 'inception';

    afterEach(() => {
        jest.clearAllMocks(); // Clear any mock data after each test
    });

    test('should return sorted movies with suggestion scores', async () => {
        // Mock the return value of movieService.getMovies
        const mockMovies = {
            results: [
                { title: 'Movie A' },
                { title: 'Movie B' },
                { title: 'Movie C' },
            ],
        };
        // Resolve with mock data
        (movieService.getKeywordId as jest.Mock).mockResolvedValue("keywordsIds");
        (movieService.getMovies as jest.Mock).mockResolvedValue(mockMovies); 

        const sortedMovies: Movie[] = await movieLogic.getMovies(keyword);

        // Check that movies were assigned a suggestionScore
        expect(sortedMovies).toHaveLength(3);
        sortedMovies.forEach(movie => {
            expect(movie.suggestionScore).toBeDefined(); // Check if suggestionScore is defined
        });

        // Check that the list is sorted by suggestionScore
        expect(sortedMovies[0].suggestionScore).toBeGreaterThanOrEqual(sortedMovies[1].suggestionScore || 0);
        expect(sortedMovies[1].suggestionScore).toBeGreaterThanOrEqual(sortedMovies[2].suggestionScore || 0);
    });

    test('should throw LogicError when no keywords found', async () => {
        (movieService.getKeywordId as jest.Mock).mockResolvedValue(""); // Resolve with no movies

        await expect(movieLogic.getMovies(keyword)).rejects.toThrow(LogicError);
        await expect(movieLogic.getMovies(keyword)).rejects.toThrow("invalid keyword");
    });
    test('should throw LogicError when no movies found', async () => {
        (movieService.getKeywordId as jest.Mock).mockResolvedValue("keywordsIds");
        (movieService.getMovies as jest.Mock).mockResolvedValue({ results: [] }); // Resolve with no movies

        await expect(movieLogic.getMovies(keyword)).rejects.toThrow(LogicError);
        await expect(movieLogic.getMovies(keyword)).rejects.toThrow("no movie found");
    });
});
