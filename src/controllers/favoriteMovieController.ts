import { Request, Response } from 'express';
import * as favoriteMovieLogic from '../businessLogic/favoriteMovieLogic';
import { DomainError, ServiceError } from '../utils/errors';
import  { FavoriteMovie }  from '../domain/favoriteMovie';

export const postFavoriteMovie = async (req: Request, res: Response) => {
    try{
        const {id, title,email} = req.body;
        const movie = new FavoriteMovie(
            id,
            title,
            email
        );
        const favoriteMovie = await favoriteMovieLogic.postFavoriteMovie(movie);
        res.status(201).json(favoriteMovie);
    }catch(error: any){
        if(error instanceof DomainError){
            res.status(404).json(error.message);
            return;
        }
        if(error instanceof ServiceError){
            res.status(404).json(error.message);
            return;
        }
        res.status(500).json({ message: 'Error saving a new favorite movie', error });
    }
}