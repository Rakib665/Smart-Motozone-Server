const express = require('express');
const app = express()
const cors = require('cors');
const port = process.env.PORT || 5000
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



app.use(express.json())
app.use(cors())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_Pass}@cluster0.mbfo5jy.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
  try {
    await client.connect()

    const partsCollection = client.db('motozone-parts').collection('parts')
    const purchaseCollection = client.db('motozone-parts').collection('purchase')

    app.get('/parts', async (req, res) => {
      const query = {}
      const allParts = await partsCollection.find(query).toArray()
      res.send(allParts)
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
    app.get('/purchase', async(req,res)=>{
      const email = req.query.email;
      const query = {userEmail: email}
      const result = await purchaseCollection.find(query).toArray()
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