const express = require('express');
const app = express()
const cors = require('cors');
var jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const res = require('express/lib/response');



app.use(express.json())
app.use(cors())
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    req.decoded = decoded;
    next();
  });
  
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_Pass}@cluster0.mbfo5jy.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
  try {
    await client.connect()

    const partsCollection = client.db('motozone-parts').collection('parts')
    const purchaseCollection = client.db('motozone-parts').collection('purchase')
    const userCollection = client.db('motozone-parts').collection('users')


    app.put('/user/:email', async(req,res)=>{
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({ result, token });
    })

    app.get('/users', async(req,res)=>{
      const users = await userCollection.find().toArray()
      res.send(users)
    })

    app.put('/user/admin/:email',  async (req, res) => {
      const email = req.params.email
      const filter = {email: email}
      const updateDoc = {
        $set: {role: 'admin'}
      }
      const result = await userCollection.updateOne(filter,updateDoc)
      res.send(result)

    })
    app.get('/parts', async (req, res) => {
      const query = {}
      const allParts = await partsCollection.find(query).toArray()
      res.send(allParts)
    })

    app.post('/parts', async (req,res)=>{
      const addItem = req.body;
      const newItem = partsCollection.insertOne(addItem)
      res.send(newItem)
    })

    app.get('/parts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const item = await partsCollection.findOne(query)
      res.send(item)
    })

    app.post('/purchase', async (req,res)=>{
      const purchase = req.body;
      const result = purchaseCollection.insertOne(purchase)
      res.send(result)
    })
    app.get('/purchase',verifyJWT, async(req,res)=>{
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if(email === decodedEmail){
        const query = {userEmail: email}
        const result = await purchaseCollection.find(query).toArray()
        return res.send(result)
      }
      else{
        res.status(403).send({message: 'forbidden access'})
      }
     
    })

      app.delete('/purchase/:id', async(req,res)=>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)}
        const result = await purchaseCollection.deleteOne(query)
        res.send(result)
      })

  }
  finally {

  }
}

run().catch(console.dir)



app.get('/', (req, res) => {
  res.send('Hello MotoZone!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})