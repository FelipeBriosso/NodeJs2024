import { FavoriteMovie } from '../domain/favoriteMovie';
import * as movieService from '../service/movieService';
import * as favoriteMovieService from '../service/favoriteMovieService';
import { LogicError } from '../utils/errors';

const max= 99;
interface favoriteMovie{
    suggestionForTodayScore: number;
}

export const postFavoriteMovie = async (movie: FavoriteMovie) => {
    const posibleMovies: any[] = await movieService.getMoviesByTitle(movie.title);
    if(!isValidMovie(movie,posibleMovies)){
        throw new LogicError("could not find movie with that id and title");
    }
    const savedMovie: FavoriteMovie = await favoriteMovieService.saveFavoriteMovie(movie);
    return {id:savedMovie.id, title:savedMovie.title, addedAt:savedMovie.addedAt};
} 

export const getFavoriteMovies = async (email: string) => {
    const moviesFromUser:any = await favoriteMovieService.getUserMovies(email);
    if(!moviesFromUser){
        throw new LogicError("movies not found");
    }
    let movies = insertSuggestionScore(moviesFromUser.favoriteMovies); 
    const sortedMovieList = movies.sort((a, b) => (b.suggestionForTodayScore) - (a.suggestionForTodayScore));
    return sortedMovieList;
}

function insertSuggestionScore(movieList: favoriteMovie[]){
    movieList.forEach( movie => {
        movie.suggestionForTodayScore = Math.floor(Math.random() * max);
      });
    return movieList;
}

function isValidMovie(movie: FavoriteMovie, posibleMovies: any) {
    return posibleMovies.results.some((posibleMovie:any) => posibleMovie.id === movie.id && posibleMovie.title === movie.title);
}
