const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv');

const port = process.env.PORT || 3000

dotenv.config();

// middleware

app.use(cors());
app.use(express.json());

// initial server route
app.get('/', (req,res)=>{
    res.send('toyWire server is running!')
})
// mongo db uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d2ul6pd.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
   
    // await client.connect();
   
    const offerCollection = client.db('toyWireDB').collection('offers');

    app.get('/offers', async(req, res)=>{
        
        const offersData = await offerCollection.find().toArray()
        res.send(offersData)
    })
    
    
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
      
}
}
run().catch(console.dir);

app.listen(port, ()=>{
  console.log(`server is running `);
})


