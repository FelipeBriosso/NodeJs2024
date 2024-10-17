// movies.test.js
import axios from 'axios';
import * as movieService from '../../service/movieService';
import { ServiceError } from '../../utils/errors';

jest.mock('axios'); // Mock axios

describe('getMovies', () => {
  const API_KEY = 'test_api_key';

  beforeEach(() => {
    jest.resetAllMocks();
    process.env.API_KEY = API_KEY; // Mock API_KEY environment variable
  });

  it('should fetch movies successfully with no keyword', async () => {
    const mockResponse = { data: { results: [{ id: 1, title: 'Test Movie' }] } };

    // Mock axios.get to resolve with the mockResponse
    (axios.get as jest.Mock).mockResolvedValue(mockResponse);

    const movieList = await movieService.getMovies(null);

    // Expect axios.get to have been called with the correct URL and headers
    expect(axios.get).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/discover/movie?',
      {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    // Expect the result to match the mock response data
    expect(movieList).toEqual(mockResponse.data);
  });

  it('should fetch movies with a keyword', async () => {
    const mockResponse = { data: { results: [{ id: 2, title: 'Keyword Movie' }] } };
    const keyword = '12345';

    // Mock axios.get to resolve with the mockResponse
    (axios.get as jest.Mock).mockResolvedValue(mockResponse);

    const movieList = await movieService.getMovies(keyword);

    // Expect axios.get to have been called with the keyword in the URL
    expect(axios.get).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/discover/movie?with_keywords=12345',
      {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    // Expect the result to match the mock response data
    expect(movieList).toEqual(mockResponse.data);
  });

  it('should throw ServiceError on request failure', async () => {
    // Mock axios.get to reject with an error
    (axios.get as jest.Mock).mockRejectedValue(new Error('Request failed'));

    // Expect getMovies to throw ServiceError when the request fails
    await expect(movieService.getMovies(null)).rejects.toThrow(ServiceError);
    await expect(movieService.getMovies(null)).rejects.toThrow('Request failed');
  });
});

describe("get movies by title", () => {
  const API_KEY = 'test_api_key';
  beforeEach(() => {
    jest.resetAllMocks();
    process.env.API_KEY = API_KEY; // Mock API_KEY environment variable
  });
  it('should fetch movies with similar title', async () => {
    const mockResponse = { data: { results: [{ id: 2, title: 'title' }] } };
    const title = 'title';

    // Mock axios.get to resolve with the mockResponse
    (axios.get as jest.Mock).mockResolvedValue(mockResponse);

    const movieList = await movieService.getMoviesByTitle(title);

    // Expect axios.get to have been called with the keyword in the URL
    expect(axios.get).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/search/movie?query=title',
      {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );
    expect(movieList).toEqual(mockResponse.data);
  });

  it('should throw ServiceError on request failure', async () => {
    // Mock axios.get to reject with an error
    (axios.get as jest.Mock).mockRejectedValue(new Error('Request failed'));

    // Expect getMovies to throw ServiceError when the request fails
    await expect(movieService.getMoviesByTitle("title")).rejects.toThrow(ServiceError);
    await expect(movieService.getMoviesByTitle("title")).rejects.toThrow('Request failed');
  });
})