const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const { ObjectID } = require("mongodb");
const dotenv = require('dotenv');
dotenv.config();
const {PORT,USER,PASSWORD,DBNAME,} = process.env;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cors());


const MongoClient = require("mongodb").MongoClient;
const uri =
 ` mongodb+srv://${USER}:${PASSWORD}@cluster0.vnsl8.mongodb.net/${DBNAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const categoryCollection = client.db("volunteer-network").collection("category");
  const registerCollection = client.db("volunteer-network").collection("register");

  app.post("/addcategory", (req, res) => {

    if (req.body !== {}) {
      categoryCollection.insertOne(req.body)
        .then(() => res.send({ msg: "Category added successfully" }))
        .catch((err) => res.send({ error: err }));
    } else {
      res.send({ msg: "Error: Body Not Set" });
    }

  });



  app.get("/showcategory", (req, res) => {
      categoryCollection.find({}).toArray()
      .then((data) => res.send(data))
      .catch(err => res.send({error: err}))
  })


  app.post("/register", (req, res) => {

    if (req.body !== {}) {
   const ObjectId = require('mongodb').ObjectID 
          let id = new ObjectId(req.body.id)
          req.body.id = id
      registerCollection.insertOne(req.body)
        .then(() => res.send({ msg: "Register successfully" }))
        .catch((err) => res.send({ error: err }));
    } else {
      res.send({ msg: "Error: Body Not Set" });
    }

  });


  app.get('/registerperson/:email',(req,res) => {
    let email = req.params.email
      registerCollection.aggregate([

        {$match: {email}},

        { $lookup:
          {
            from: 'category',
            localField: 'id',
            foreignField: '_id',
            as: 'category'
          }
        }

      ]).toArray()
      .then(result => res.send(result))
      .catch(err => res.send({error:err}))
  })


  app.get('/registerallpersone',(req,res) => {
      registerCollection.aggregate([
    
        { $lookup:
          {
            from: 'category',
            localField: 'id',
            foreignField: '_id',
            as: 'category'
          }
        }

      ]).toArray()
      .then(result => res.send(result))
      .catch(err => res.send({error:err}))
  })

  app.delete('/userdelete',(req, res) => {
    let id = new ObjectID(req.body.id)
    registerCollection.deleteOne({
      _id:id
    })
    .then(() => res.send({msg:"successfully deleted"}))
    .catch(err => res.send({error:err}))
  })


});


app.listen(PORT);
