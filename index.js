const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
const port = process.env.PORT || 3000
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
    
    const toysCollection = client.db('toyWireDB').collection('toys');
    const blogCollection = client.db('toyWireDB').collection('blogs');
    const offerCollection = client.db('toyWireDB').collection('offers');
    
    // indexing 
    const indexKey = {toyName: 1}
    const indexOption = {toy: "toyNameSearch"}
    
    const result = await toysCollection.createIndex(indexKey, indexOption)
    
    // all toys get
    app.get('/toys', async(req,res)=> {
      const allToys = await toysCollection.find().limit(20).toArray();
      res.send(allToys);
    })

    // searching
    app.get('/toys-search/:name', async(req, res)=> {
      const searchToyName = req.params.name;
      const result = await toysCollection.find({
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
      const result = await toysCollection.find(userQuery).sort(shortQuery).toArray();
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
      const result = await toysCollection.find(query).toArray();
      res.send(result)

    })

    // single toy get
    app.get('/toys/:id', async(req, res)=> {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await toysCollection.findOne(query);
      res.send(result);
    })

    // category wise get data
    app.get('/subCategory', async(req, res) => {
    let query = {}
    if(req.query?.category){
      query = {subCategory: req.query.category}
    }
    const result = await toysCollection.find(query).toArray();
    res.send(result);
  });

  //  some trending toy get
  app.get('/popular', async(req,res) =>{
    const option = {
      projection: {img: 1}
    }
    const query = {};
    const result = await toysCollection.find(query, option).limit(10).toArray();
    res.send(result);
  })

  // get trending toys
  app.get('/trending', async(req, res) => {
    const result = await toysCollection.find().limit(9).toArray();
    res.send(result);
  })

  // toys post in mongodb 
  app.post('/toys', async(req, res)=>{
    const body = req.body;
    const result = await toysCollection.insertOne(body);
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
    const result = await toysCollection.updateOne(filter, updatedToy, option);
    res.send(result);
  })

  // toy delete 
  app.delete('/toy/:id', async(req, res)=>  {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    const result = await toysCollection.deleteOne(query);
    res.send(result);
  })


    await client.db("admin").command({ ping: 1 });
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


