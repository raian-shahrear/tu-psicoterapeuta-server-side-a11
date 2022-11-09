require("dotenv").config();
const express = require('express');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



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
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send({
        status: true,
        data: services
      })
    })

    // get individual service
    
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