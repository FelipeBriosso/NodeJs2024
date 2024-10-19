import * as movieService from "../service/movieService";
import { LogicError } from "../utils/errors";
const max = 99;
interface Movie {
    suggestionScore: number;
    
}
export const getMovies = async(keywordId: string | null) =>{
    let keyword = null;
    if(keywordId){
        keyword = await movieService.getKeywordId(keywordId);
        if(!keyword){
            throw new LogicError("invalid keyword");
        }
    }
    let apiSearch =await movieService.getMovies(keyword);
    let movieList: Movie[] = apiSearch.results;
    if(movieList.length===0){
        throw new LogicError("no movie found");
    }
    movieList = insertSuggestionScore(movieList); 
    const sortedMovieList = movieList.sort((a, b) => (b.suggestionScore) - (a.suggestionScore));
    return sortedMovieList;
}

function insertSuggestionScore(movieList: Movie[]){
    movieList.forEach( movie => {
        movie.suggestionScore = Math.floor(Math.random() * max);
      });
    return movieList;
}