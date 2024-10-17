import express from 'express';
import userRoutes from './routes/userRoutes';
import movieRoutes from './routes/movieRoutes';
import favoriteMovieRoutes from './routes/favoriteMovieRoutes';
//import dotenv from "dotenv";

//dotenv.config();
const app = express();
const port = 3000;

export const main = async () => {
  try {
    app.use(express.json());

    app.use(express.raw({ type: "application/octet-stream", limit: "10mb" }));

    app.use(userRoutes);
    app.use(movieRoutes);
    app.use(favoriteMovieRoutes);
    app.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error: any) {
    console.log(error.message);
    }
}
main();
