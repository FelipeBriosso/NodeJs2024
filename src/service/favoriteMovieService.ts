import { FavoriteMovie } from '../domain/favoriteMovie';
import fs from 'fs/promises'; 
import { ServiceError } from "../utils/errors";
const rutaArchivo = './favoritos.txt';

interface movie{
	userEmail:string,
	favoriteMovies:{
		id:number,
		title:string,
		addedAt:Date
	}[]
};
export const saveFavoriteMovie = async(movie: FavoriteMovie) =>{
	try{
	const savedMovies = await getAllFavoriteMovies();
	const user = savedMovies.find(u => u.userEmail === movie.userEmail);
	if (user) {
	const movieExists = user.favoriteMovies.some(m => m.id === movie.id);
	
	if (movieExists) {
		throw new ServiceError('Movie already saved as favorite');
	}
	user.favoriteMovies.push({
		id: movie.id,
		title: movie.title,
		addedAt: new Date()
	});

	await fs.writeFile(rutaArchivo, savedMovies.map(u => JSON.stringify(u)).join('\n') + '\n');
	return movie;
	}
	const newUserMovies: movie =
	{
		userEmail: movie.userEmail,
		favoriteMovies: [
			{
				id: movie.id,
				title: movie.title,
				addedAt: new Date()
			}
		]
	};
	await fs.appendFile(rutaArchivo, JSON.stringify(newUserMovies) + '\n'); // Escribir en el archivo de forma asíncrona
	return movie;
	} catch (err: any) {
	throw new ServiceError(`Error saving favorite movie: ${err.message}`); // Manejar cualquier error
	}
};

const getAllFavoriteMovies = async() => {
	let data: string = '';
	try {
		data = await fs.readFile(rutaArchivo, 'utf8'); 
	} catch (err: any) {
		if (err.code !== 'ENOENT') { 
			throw new ServiceError(`Error reading the file: ${err.message}`);
		}
	}

	let movies: movie[] = [];

	if (data) {
		movies = data.split('\n')
			.filter(Boolean) 
			.map(line => {
				try {
					return JSON.parse(line); 
				} catch (parseErr) {
					return null; 
				}
			})
			.filter(Boolean); 
}
console.log(movies);
return movies;
}