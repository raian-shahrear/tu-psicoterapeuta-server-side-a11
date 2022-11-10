require("dotenv").config();
const express = require('express');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// JWT token
async function jwtToken(){
  try {
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.JWT_SECRET);
      res.send({token});
    })
  } catch (error) {
    console.log(error)
  }
}
jwtToken();

function jwtVerification(req, res, next){
  const jwtHeader = req.headers.authorization;
  if(!jwtHeader){
    return res.status(401).send({message: 'unauthorized access'});
  }
  const token = jwtHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, function(err, decoded){
    if(err){
      return res.status(403).send({message: 'forbidden access'});
    }
    req.decoded = decoded;
    next();
  })
}



const uri = `mongodb+srv://${process.env.MDB_USER}:${process.env.MDB_PASSWORD}@cluster0.xnvdy5u.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
  try {
    const servicesCollection = client.db("tu-psicoterapeuta").collection("services");
    const reviewCollection = client.db("tu-psicoterapeuta").collection("reviews");

    // post/create service
    app.post('/service', async(req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      console.log(result);
      res.send({
        status: true,
        data: result
      })
    })

    // post/create comment
    app.post('/comment', async(req, res) => {
      const comment = req.body;
      const result = await reviewCollection.insertOne(comment);
      console.log(result);
      res.send({
        status: true,
        data: result
      })
    })

    // get 3 services
    app.get('/service-home', async(req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.limit(3).toArray();
      res.send({
        status: true,
        data: services
      })
    })

    // get all services
    app.get('/services', async(req, res) => {
      const page = req.query.page;
      const dataSize = Number(req.query.dataSize);

      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.skip(dataSize * page).limit(dataSize).toArray();
      const count = await servicesCollection.countDocuments(); 
      res.send({
        status: true,
        count: count,
        data: services
      })
    })

    // get individual service
    app.get('/services/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      res.send({
        status: true,
        data: service
      })
    })

    // get comments by serviceId
    app.get('/comments', async(req, res) => {
      let query = { };
      if(req.query.serviceId){
        query = {
          serviceId: req.query.serviceId
        }
      }
      const cursor = reviewCollection.find(query).sort({'uploadTime': -1});
      const comments = await cursor.toArray();
      res.send({
        status: true,
        data: comments
      })
    })

    // get individual comment
    app.get('/comments/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await reviewCollection.findOne(query);
      res.send({
        status: true,
        data: service
      })
    })

    // get comments for individual email
    app.get('/user-comments', jwtVerification, async(req, res) => {
      const decoded = req.decoded;
      if(decoded.email !== req.query.email){
        return res.status(403).send({message: 'forbidden access'})
      }
      
      let query = { };
      if(req.query.email){
        query = {
          myEmail: req.query.email
        }
      }
      console.log(req.query)
      const cursor = reviewCollection.find(query);
      const comments = await cursor.toArray();
      res.send({
        status: true,
        data: comments
      })
    })

    // update/patch individual comment
    app.patch('/comments/:id', async(req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const comment = req.body;
      console.log(comment)
      const updateComment = {
        $set: {
          myRating: comment.rating,
          myComment: comment.comment
        }
      };
      const result = await reviewCollection.updateOne(filter, updateComment);
      res.send({
        status: true,
        data: result
      })
    })

    // delete/remove individual comment
    app.delete('/comments/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send({
        status: true,
        data: result
      })
    })

  }
  finally{

  }
}
run().catch(err => console.log(err))





// server initializing
app.get('/', (req, res) => {
  res.send('Tu Psicoterapeuta server is running...');
})
app.listen(port, () => {
  console.log(`Server is running on port:${port}`)
})