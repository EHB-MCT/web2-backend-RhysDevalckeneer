const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors')
const { MongoClient } = require('mongodb');
require('dotenv').config()



const client = new MongoClient(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })

const app = express();
const port = process.env.PORT || 1337;

app.use(cors())
app.use(express.static('public'));
app.use(bodyParser.json());


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
        const query = { id: req.query.id };
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




app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})