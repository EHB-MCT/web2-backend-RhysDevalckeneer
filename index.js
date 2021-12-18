const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors')
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config()

const client = new MongoClient(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })

const app = express();
const port = process.env.PORT || 1337;

app.use(express.static('public'));
app.use(bodyParser.json());
// "Pyp, open the f*cking gate!" - https://www.youtube.com/watch?v=u5sRJqpRpsU
app.use(cors());


// basic route
app.get('/', (req, res) => {
    res.status(300).redirect('/info.html');
})

// get all movies
app.get('/movies', async ( req, res) => {
    try {
        // connect to database
        await client.connect();
        const collection = client.db('courseproject').collection('movies')
        const movies = await collection.find({}).toArray();

        // send back response with data
        res.status(200).send(movies);
    } catch(error){
        console.log(error)
        // return error when something is wrong
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    } finally {
        await client.close();
    }
});


// get one movie
app.get('/movie/:id', async (req,res) => {
    
    //id is located in the query: req.query.id
    try{
        // connect to database
        await client.connect();

        const collections= client.db('courseproject').collection('movies');

        //only look for a challenge with this ID
        const query = { _id: ObjectId(req.params.id) };
        console.log(query)

        const movie = await collections.findOne(query);

        if(movie){
            // send back response with data
            res.status(200).send(movie);
            return;
        }else{
            res.status(400).send('Movie could not be found with id: ' + req.query.id);
        }
      
    }catch(error){
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    }finally {
        await client.close();
    }
});

// save a challenge
app.post('/movies', async (req, res) => {

    try{
         //connect to the db
        await client.connect();

         //retrieve the challenges collection data
        const collection = client.db('courseproject').collection('movies');

         // Validation for double challenges
        const movie = await collection.findOne({movie_id: req.body.movie_id });
        if(movie){
            res.status(400).send(`Bad request: Movie already exists with name ${movie_id} for course ${req.body.movie_id}` );
            return;
        } 
         // Create the new Challenge object
        let newMovie = {
            movie_id: req.body.movieId,
            poster_path: req.body.moviePoster
        }

         // Insert into the database
        let insertResult = await collection.insertOne(newMovie);

         //Send back successmessage
        res.status(201).json(newMovie);
        return;
    }catch(error){
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    }finally {
        await client.close();
    }
});

// delete moves
app.delete('/movie/:id', async (req,res) => {
    
    if(!req.params.id){
        res.status(400).send({
            error: 'Bad Request',
            value: 'No id available in url'
        });
        return;
    }

    try{
         //connect to the db
        await client.connect();

         //retrieve the challenges collection data
        const collection = client.db('courseproject').collection('movies');

         // Validation for double challenges
        let movie = await collection.deleteOne({_id: ObjectId(req.params.id)});
         
        //Send back successmessage
        res.status(201).json(movie);
        return;
    }catch(error){
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    }finally {
        await client.close();
    }
});



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})