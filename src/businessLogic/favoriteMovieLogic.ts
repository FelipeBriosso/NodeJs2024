import { FavoriteMovie } from '../domain/favoriteMovie';
import * as movieService from '../service/movieService';
import * as favoriteMovieService from '../service/favoriteMovieService';
import { LogicError } from '../utils/errors';

export const postFavoriteMovie = async (movie: FavoriteMovie) => {
    const posibleMovies: any[] = await movieService.getMoviesByTitle(movie.title);
    if(!isValidMovie(movie,posibleMovies)){
        throw new LogicError("could not find movie with id and title");
    }
    const savedMovie: FavoriteMovie = await favoriteMovieService.saveFavoriteMovie(movie);
    return {id:savedMovie.id, title:savedMovie.title, addedAt:savedMovie.addedAt};
}   

function isValidMovie(movie: FavoriteMovie, posibleMovies: any) {
        return posibleMovies.results.some((posibleMovie:any) => posibleMovie.id === movie.id && posibleMovie.title === movie.title);
}
