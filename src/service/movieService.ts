import axios from 'axios';
import dotenv from 'dotenv';
import { ServiceError } from '../utils/errors';
dotenv.config();

export const getMovies = async (keyword: string | null) => {
let url = 'https://api.themoviedb.org/3/discover/movie?';
  if (keyword != null) {
    url = `${url}with_keywords=${keyword}`;
  }

  const options = {
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${process.env.API_KEY}`,
    },
  };

  try {
    const response = await axios.get(url, options);
    console.log(response.data);
    return response.data;
  } catch (err: any) {
    throw new ServiceError(err.message);
  }
};
