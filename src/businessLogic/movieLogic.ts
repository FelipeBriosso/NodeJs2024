import * as movieService from "../service/movieService";
export const getMovies = async(keyword: string | null) =>{
    
    return await movieService.getMovies(keyword);
}