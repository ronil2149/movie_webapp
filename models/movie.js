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

MovieSchema = new Schema({
    Movie_ID: { type: Number, required: true, unique: true },
    Title: { type: String, required: true },
    Year: { type: Number },
    Rated: { type: String },
    Released: { type: String },
    Runtime: { type: String },
    Genre: { type: String },
    Director: { type: String },
    Writer: { type: String },
    Actors: { type: String },
    Plot: { type: String },
    imdbRating: { type: Number },
    BoxOffice: { type: String },
    Production: { type: String },
    Language: { type: String },
    Country: { type: String },
});

module.exports = mongoose.model('Movie', MovieSchema);
