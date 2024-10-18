import { Request, Response } from 'express';
import * as favoriteMovieLogic from '../businessLogic/favoriteMovieLogic';
import { DomainError, LogicError, ServiceError } from '../utils/errors';
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
        if(error instanceof LogicError){
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

export const getFavoriteMovies = async (req: Request, res: Response) => {
    try{
        const email = req.body.email;
        const userFavoriteMovies= await favoriteMovieLogic.getFavoriteMovies(email); 
        res.status(201).json(userFavoriteMovies);
        return;
    }catch(error: any){
        if(error instanceof LogicError){
            res.status(204).json(error.message);
            return;
        } 
        res.status(500).json(error.message);
    }
}