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

var express = require('express')
var app = express();
var database = require('./config/database');
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const session = require('express-session');
const flash = require('connect-flash');
var Movie = require('./models/movie');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const handlebars = require('handlebars');
var port     = process.env.PORT || 8000;
require('dotenv').config();


// Set up the app to use body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

// Configure Handlebars as the view engine
app.engine(
    'hbs',
    exphbs.engine({
        handlebars: allowInsecurePrototypeAccess(handlebars),
        extname: 'hbs',
        defaultLayout: 'main'
    })
);
app.set('view engine', 'hbs');
app.set('views', './views');
app.use(express.static('public'));

// Set up session middleware
app.use(
    session({
        secret: 'movieappsecret',
        resave: false,
        saveUninitialized: true,
    })
);

// Use flash middleware
app.use(flash());

// Pass flash messages to views
app.use((req, res, next) => {
    res.locals.successMessage = req.flash('success');
    res.locals.errorMessage = req.flash('error');
    next();
});

// Connect to MongoDB
if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is undefined. Check your .env file.");
    process.exit(1); 
  }
  
  mongoose.connect(process.env.MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  })
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.error('MongoDB connection error:', err));
  


// Get all movies
app.get('/api/movies', (req, res) => {
    Movie.find().lean().exec((err, movies) => {
        if (err) {
            console.error("Error fetching movies:", err);
            return res.status(500).send("Error fetching movies.");
        }

        // Pass flash messages to the view
        res.render('movies', { 
            title: 'All Movies', 
            movies,
            successMessage: req.flash('success'),
            errorMessage: req.flash('error')
        });        
    });
});


// Render the Add Movie page
app.get('/api/movies/add', (req, res) => {
    res.render('addMovie', { title: 'Add Movie' });
});

// Create a new movie and return all movies after creation
app.post('/api/movies/add', (req, res) => {
    const movieData = {
        Movie_ID: req.body.Movie_ID,
        Title: req.body.Title,
        Year: req.body.Year,
        Rated: req.body.Rated,
        Released: req.body.Released,
        Runtime: req.body.Runtime,
        Genre: req.body.Genre,
        Director: req.body.Director,
        Writer: req.body.Writer,
        Actors: req.body.Actors,
        Plot: req.body.Plot,
        imdbRating: req.body.imdbRating,
        BoxOffice: req.body.BoxOffice,
        Production: req.body.Production,
        Language: req.body.Language,
        Country: req.body.Country,
    };

    Movie.create(movieData, (err, movie) => {
        if (err) {
            console.error("Error adding movie:", err);
            req.flash('error', 'An error occurred while adding the movie.');
            return res.redirect('/api/movies/add');
        }

        // Add success message
        req.flash('success', `Movie "${movie.Title}" has been successfully added!`);
        res.redirect('/api/movies');
    });
});


// Get a movie by _id
app.get('/api/movies/:id', async (req, res) => {
    try {
        const id = mongoose.Types.ObjectId.isValid(req.params.id)
            ? mongoose.Types.ObjectId(req.params.id)
            : req.params.id;    

            const movie = await Movie.findOne({
                $or: [{ _id: id }, { Movie_ID: id }]
            }).lean();

        if (!movie) {
            req.flash('error', 'Movie not found.');
            return res.redirect('/api/movies');
        }

        res.render('movieDetails', { 
            title: `${movie.Title} Details`, 
            movie 
        });
    } catch (err) {
        console.error("Error fetching movie details:", err);
        req.flash('error', 'Error fetching movie details.');
        res.redirect('/api/movies');
    }
});


// Search for movies by title
app.get('/search', async (req, res) => {
    try {
        const query = req.query.query;

        if (!query) {
            req.flash('error', 'Please enter a search term.');
            return res.redirect('/api/movies');
        }

        // Use a case-insensitive regex to match movie titles
        const movies = await Movie.find({ 
            Title: { $regex: query, $options: 'i' }
        }).lean();

        if (movies.length === 0) {
            req.flash('error', `No movies found for "${query}"`);
            return res.redirect('/api/movies');
        }

        res.render('movies', { 
            title: `Search Results for "${query}"`, 
            movies 
        });
    } catch (err) {
        console.error('Error during search:', err);
        req.flash('error', 'An error occurred while searching.');
        res.redirect('/api/movies');
    }
});



// Get a movie for editing by _id
app.get('/api/movies/edit/:id', (req, res) => {
    const id = req.params.id;
    Movie.findById(id)
        .lean()
        .exec((err, movie) => {
            if (err) {
                console.error('Error fetching movie for editing:', err);
                return res.status(500).send('Error fetching movie.');
            }
            if (!movie) return res.status(404).send('Movie not found.');
            res.render('editMovie', { title: `Edit ${movie.Title}`, movie });
        });
});

// Update a movie by _id
app.post('/api/movies/:id', (req, res) => {
    const id = req.params.id;
    const updatedData = {
        Title: req.body.Title,
        Year: req.body.Year,
        Genre: req.body.Genre,
        Director: req.body.Director,
        Runtime: req.body.Runtime,
        Actors: req.body.Actors,
        imdbRating: req.body.imdbRating,
    };

    Movie.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true }, (err, movie) => {
        if (err) {
            console.error('Error updating movie:', err);
            return res.status(500).send('Error updating movie.');
        }
        if (!movie) return res.status(404).send('Movie not found.');
        res.redirect('/api/movies');
    });
});

// Delete a movie by _id
app.post('/api/movies/delete/:id', (req, res) => {
    const id = req.params.id;
    Movie.findByIdAndRemove(id, (err) => {
        if (err) {
            console.error('Error deleting movie:', err);
            return res.status(500).send('Error deleting movie.');
        }
        res.redirect('/api/movies');
    });
});

// Render the confirmation page for deletion
app.get('/api/movies/confirm-delete/:id', (req, res) => {
    const id = req.params.id;
    Movie.findById(id)
        .lean()
        .exec((err, movie) => {
            if (err) {
                console.error('Error fetching movie for confirmation:', err);
                return res.status(500).send('Error fetching movie.');
            }
            if (!movie) return res.status(404).send('Movie not found.');
            res.render('confirmDelete', { title: `Delete ${movie.Title}`, movie });
        });
});


// Home page
app.get('/', (req, res) => {
    res.render('home', { title: 'Welcome to the Movie App' });
});

app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    next();
});


app.get('*', (req, res) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    res.status(404).send('404 - Route not found');
});

// Start the server
app.listen(port);
console.log('App listening on port : ' + port);

module.exports = app;