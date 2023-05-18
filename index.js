const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();
const port = process.env.PORT || 5050;

dotenv.config();

// middleware

app.use(cors);
app.use(express.json());




// initial server route

app.get('/', (req,res)=>{
    res.send('toyWire server is running!')
})



app.listen(port, ()=>{
    console.log(`toyWire server is running on port ${port}`);
})

