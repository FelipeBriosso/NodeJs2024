import { Request, Response } from 'express';
import * as movieLogic from '../businessLogic/movieLogic';
import { LogicError } from '../utils/errors';

export const getMovies = async (req: Request, res: Response) => {
    try {
        const keyword = req.params.keyword || null;
        const movies = await movieLogic.getMovies(keyword);
        res.status(200).json(movies);
    } catch (error: any) {
        if(error instanceof LogicError){
            res.status(404).json(error.message);
            return;
        }
        res.status(500).json({ message: 'Error retrieving movies', error });
    }
};