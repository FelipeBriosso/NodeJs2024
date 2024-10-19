import axios from 'axios';
import dotenv from 'dotenv';
import { ServiceError } from '../utils/errors';
dotenv.config();



export const getMovies = async (keyword: string | null) => {
let url = 'https://api.themoviedb.org/3/discover/movie?';
const options = {
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${process.env.API_KEY}`,
  },
};
  if (keyword != null) {
    url = `${url}with_keywords=${keyword}`;
  }
  try {
    const response = await axios.get(url, options);
    return response.data;
  } catch (err: any) {
    throw new ServiceError(err.message);
  }
};

export const getMoviesByTitle = async (title: string) =>{
  let url = `https://api.themoviedb.org/3/search/movie?query=${title}`;
  const options = {
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${process.env.API_KEY}`,
    },
  };
  try {
    const response = await axios.get(url, options);
    return response.data;
  } catch (err: any) {
    throw new ServiceError(err.message);
  }
}

export const getKeywordId= async(keyword: any) =>{
  let url = `https://api.themoviedb.org/3/search/keyword?query=${keyword}`;
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${process.env.API_KEY}`,
    }
  };
  try {
    const response = await axios.get(url, options);
    const result = response.data.results;
    let keywordId ="";
    if(result.length ===0)return keywordId;
    result.forEach((posibleKeyword:any) => {
      if(posibleKeyword.name===keyword){
        keywordId = ""+posibleKeyword.id;
      }
    });
    return keywordId;
  } catch (err: any) {
    throw new ServiceError(err.message);
  }
}
