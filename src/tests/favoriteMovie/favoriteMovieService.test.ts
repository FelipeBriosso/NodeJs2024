import * as favoriteMovieService from '../../service/favoriteMovieService';
import fs from 'fs/promises';
import { ServiceError } from '../../utils/errors';
import { FavoriteMovie } from '../../domain/favoriteMovie';

jest.mock('fs/promises');  // Mock de las funciones de fs


describe('saveFavoriteMovie', () => {
  let mockMovie: FavoriteMovie;
  const mockDate = new Date('2023-10-17T00:00:00Z');
  beforeEach(() => {
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    mockMovie = new FavoriteMovie(1, 'Inception','user@example.com');
    jest.resetAllMocks();  // Resetear los mocks antes de cada prueba
  });

  it('should create a new user and save a favorite movie if user does not exist', async () => {
    // Simular que no hay datos en el archivo
    (fs.readFile as jest.Mock).mockResolvedValueOnce('');

    // Simular que la escritura de archivos funciona correctamente
    (fs.appendFile as jest.Mock).mockResolvedValueOnce(undefined);

    // Llamada a la función a probar
    const savedMovie = await favoriteMovieService.saveFavoriteMovie(mockMovie);

    // Verificar que se haya leído el archivo correctamente
    expect(fs.readFile).toHaveBeenCalledWith('./favoritos.txt', 'utf8');

    // Verificar que se haya guardado la película en un nuevo usuario
    expect(fs.appendFile).toHaveBeenCalledWith(
      './favoritos.txt',
      JSON.stringify({
        userEmail: mockMovie.userEmail,
        favoriteMovies: [
          {
            id: mockMovie.id,
            title: mockMovie.title,
            addedAt: {},
          },
        ],
      }) + '\n'
    );

    expect(savedMovie).toEqual(mockMovie);
  });

  it('should add a movie to the existing user if the movie is not already saved', async () => {
    // Simular que el archivo ya tiene datos de un usuario
    (fs.readFile as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({
        userEmail: 'user@example.com',
        favoriteMovies: [
          {
            id: 111,
            title: 'Another Movie',
            addedAt: mockDate,
          },
        ],
      }) + '\n'
    );

    // Simular la escritura en el archivo
    (fs.writeFile as jest.Mock).mockResolvedValueOnce(undefined);

    const savedMovie = await favoriteMovieService.saveFavoriteMovie(mockMovie);

    expect(fs.readFile).toHaveBeenCalledWith('./favoritos.txt', 'utf8');

    // Verificar que se haya agregado la nueva película para el usuario existente
    expect(fs.writeFile).toHaveBeenCalledWith(
      './favoritos.txt',
      expect.stringContaining('Inception') // Comprobar que la película 'Inception' está en los datos guardados
    );

    expect(savedMovie).toEqual(mockMovie);
  });

  it('should add a movie to the existing user even with corruped lines', async () => {
    const corruptLine = 'corrupted json line';
    // Simular que el archivo ya tiene datos de un usuario
    (fs.readFile as jest.Mock).mockResolvedValueOnce(`${corruptLine}\n`+
      JSON.stringify({
        userEmail: 'user@example.com',
        favoriteMovies: [
          {
            id: 111,
            title: 'Another Movie',
            addedAt: mockDate,
          },
        ],
      }) + '\n'
    );

    // Simular la escritura en el archivo
    (fs.writeFile as jest.Mock).mockResolvedValueOnce(undefined);

    const savedMovie = await favoriteMovieService.saveFavoriteMovie(mockMovie);

    expect(fs.readFile).toHaveBeenCalledWith('./favoritos.txt', 'utf8');

    expect(fs.writeFile).toHaveBeenCalledWith(
      './favoritos.txt',
      expect.stringContaining('Inception') 
    );

    expect(savedMovie).toEqual(mockMovie);
  });
  it('should throw an error if the movie is already saved for the user', async () => {
    // Simular que la película ya está guardada para el usuario
    (fs.readFile as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({
        userEmail: 'user@example.com',
        favoriteMovies: [
          {
            id: 1,
            title: 'Inception',
            addedAt: mockDate,
          },
        ],
      }) + '\n'
    );

    await expect(favoriteMovieService.saveFavoriteMovie(mockMovie)).rejects.toThrow('Movie already saved as favorite');
  });

  it('should throw an error if there is an issue reading the file', async () => {
    // Simular un error al leer el archivo
    (fs.readFile as jest.Mock).mockRejectedValueOnce(new Error('File read error'));

    await expect(favoriteMovieService.saveFavoriteMovie(mockMovie)).rejects.toThrow('Error reading the file: File read error');
  });
});

describe('getUserMovies', () => {
  const mockMovies =
    { userEmail: 'user1@example.com', favoriteMovies: [{ id: 1, title: 'Inception', addedAt: '2023-10-17T00:00:00Z' }] };

  beforeEach(() => {
    jest.clearAllMocks();  // Limpiar mocks antes de cada test
  });

  it('should return user movies if user exists', async () => {
    // Mock de fs.readFile para devolver usuarios con películas
    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockMovies));

    // Llamada a la función a probar
    const result = await favoriteMovieService.getUserMovies('user1@example.com');

    // Verificar que fs.readFile fue llamada
    expect(fs.readFile).toHaveBeenCalledWith('./favoritos.txt', 'utf8');

    // Verificar que se devuelven las películas correctas para el usuario
    expect(result).toEqual(mockMovies);
  });

  it('should return null if user does not exist', async () => {
    // Mock de fs.readFile para devolver usuarios con películas
    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockMovies));

    // Llamada a la función a probar con un email que no existe en los datos
    const result = await favoriteMovieService.getUserMovies('nonexistent@example.com');

    // Verificar que fs.readFile fue llamada
    expect(fs.readFile).toHaveBeenCalledWith('./favoritos.txt', 'utf8');

    // Verificar que se devuelve null si no se encuentra el usuario
    expect(result).toBeNull();
  });

  it('should throw ServiceError if there is an error while getting movies', async () => {
    (fs.readFile as jest.Mock).mockRejectedValue(new Error('reading error'));

    await expect(favoriteMovieService.getUserMovies('user1@example.com')).rejects.toThrow(ServiceError);
    await expect(favoriteMovieService.getUserMovies('user1@example.com')).rejects.toThrow('Error getting the user: Error reading the file: reading error');

  });
});
