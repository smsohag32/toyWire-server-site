const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
const port = process.env.PORT || 4200
dotenv.config();



// middleware
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())


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
    
    const offerCollection = client.db('toyWireDB').collection('offers');
    const blogCollection = client.db('toyWireDB').collection('blogs');
    const toyCollection = client.db('toyWireDB').collection('toys');
    
    // indexing 
    const indexKey = {toyName: 1}
    const indexOption = {toy: "toyNameSearch"}
    
    const result = await toyCollection.createIndex(indexKey, indexOption)
    
    // all toys get
    app.get('/toys', async(req,res)=> {
      const allToys = await toyCollection.find().limit(20).toArray();
      res.send(allToys);
    })
      //  some trending toy get
  app.get('/popular', async(req,res) =>{
    const option = {
      projection: {img: 1}
    }
    const query = {};
    const result = await toyCollection.find(query, option).limit(10).toArray();
    res.send(result);
  })

  // get trending toys
  app.get('/trending', async(req, res) => {
    const result = await toyCollection.find().limit(9).toArray();
    res.send(result);
  })


    // searching
    app.get('/toyssearch/:name', async(req, res)=> {
      const searchToyName = req.params.name;
      const result = await toyCollection.find({
        toyName: { $regex: searchToyName, $options: 'i'}
      }).toArray();
      res.send(result)
    })
    // shorting
    app.get('/sorted', async(req, res)=>{
      
      let shortQuery = {};
      const userEmail = req.query.email;
      const userQuery = {email: userEmail};
      const filter = parseInt(req.query.filter);
      if(filter){
        shortQuery = {price: filter}
      }
      const result = await toyCollection.find(userQuery).sort(shortQuery).toArray();
      res.send(result);
    })
    
    // get blogs data
    app.get('/blogs', async(req, res)=> {
      const result = await blogCollection.find().toArray();
      res.send(result);
    })
    // get offer data
    app.get('/offers', async(req, res)=>{
        const offersData = await offerCollection.find().toArray();
        res.send(offersData);
    })
    
    
    
    // get user toys
    app.get('/my-toys', async(req,res)=>{
      const sellerEmail = req.query.email;
      let query = {};
      if(sellerEmail){
        query = {email: sellerEmail}
      }
      const result = await toyCollection.find(query).toArray();
      res.send(result)

    })

    // single toy get
    app.get('/toys/:id', async(req, res)=> {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await toyCollection.findOne(query);
      res.send(result);
    })

    // category wise get data
    app.get('/subCategory', async(req, res) => {
    let query = {}
    if(req.query?.category){
      query = {subCategory: req.query.category}
    }
    const result = await toyCollection.find(query).toArray();
    res.send(result);
  });


  // toys post in mongodb 
  app.post('/toys', async(req, res)=>{
    const body = req.body;
    const result = await toyCollection.insertOne(body);
    res.send(result);
  })

  // toy information update
  app.put('/toy/:id', async(req,res)=> {
    const id = req.params.id;
    const toy = req.body;
    const filter = {_id: new ObjectId(id)}
    const option = {upsert: false};
    const updatedToy = {
      $set: {
        price: toy.upPrice,
        quantity: toy.upQuantity,
        description: toy.upDescription,
      }
    }
    const result = await toyCollection.updateOne(filter, updatedToy, option);
    res.send(result);
  })

  // toy delete 
  app.delete('/toy/:id', async(req, res)=>  {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    const result = await toyCollection.deleteOne(query);
    res.send(result);
  })


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
      
}

}
run().catch(console.dir);

// initial server route
app.get('/', (req,res)=>{
  res.send('toyWire server is running!')
})


app.listen(port, ()=>{
  console.log('server running');
})


