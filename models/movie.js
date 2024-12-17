/******************************************************************************
 *** 
*  ITE5315 – Assignment 4 
*  I declare that this assignment is my own work in accordance with Humber Academic Policy.   
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including web sites) or distributed to other students. 
*  
*  Name: _____Ronil_Ghoghari_____________ Student ID: _____N01581413__________ Date: _____11/19/2024_______________ 
* 
* 
******************************************************************************
 **/ 

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const movieSchema = new mongoose.Schema({
    Movie_ID: String,
    Title: String,
    Year: Number,
    Rated: String,
    Released: String,
    Runtime: String,
    Genre: String,
    Director: String,
    Writer: String,
    Actors: String,
    Plot: String,
    Poster: String, // Ensure this field is defined
    imdbRating: Number,
    BoxOffice: String,
    Production: String,
    Language: String,
    Country: String,
});
module.exports = mongoose.model('Movie', movieSchema);
