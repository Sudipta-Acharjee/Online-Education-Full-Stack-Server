const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f3vnz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('service'));
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) => {
    res.send("hello from db its working")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const learnerCollection = client.db("onlineTeacher").collection("learner");
    const adminCollection = client.db("onlineTeacher").collection("Admin");
    const reviewCollection = client.db("onlineTeacher").collection("Review");
    app.post('/learnerData', (req, res) => {
        const learnerInfo = req.body;
        learnerCollection.insertOne(learnerInfo)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
    app.get('/dataGetUser', (req, res) => {
        learnerCollection.find()
            .toArray((err, documents) => {
                res.send(documents);
            })
    })
    app.post('/reviewData', (req, res) => {
        const reviewInfo = req.body;
        reviewCollection.insertOne(reviewInfo)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
    app.get('/reviewGetUser', (req, res) => {
        reviewCollection.find()
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/addAService', (req, res) => {
        const file = req.files.file;
        const Description = req.body.Description;
        const Title = req.body.Title;
        const newImg = file.data;
        const encImg = newImg.toString('base64');
        console.log(Description, Title, file);
        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        }
        learnerCollection.insertOne({ Description, Title, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })
    app.get('/service', (req, res) => {
        learnerCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });
    app.post('/addAdmin', (req, res) => {
        const reviewInfo = req.body;
        adminCollection.insertOne(reviewInfo)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
});


app.listen(process.env.PORT || port)