const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const { response } = require('express')
const port = 3000
const {isInvalidEmail, isEmptyPayload} = require('./validator')
const { MongoClient } = require('mongodb');

const {DB_USER, DB_PASS, DEV} = process.env
const dbAddress = '127.0.0.1:27017'

const url = DEV ? `mongodb://${dbAddress}` : `mongodb://${DB_USER}:${DB_PASS}@${dbAddress}?authSource=company_db`

const client = new MongoClient(url);
const dbName = 'company_db'
const collName = 'employees'


app.use(bodyParser.json())
app.use('/', express.static(__dirname + '/dist'))


 app.get('/get-profile', async function(req, res) {    
    await client.connect()
    console.log('Connected successfully to server')

    const db = client.db(dbName)
    const collection = db.collection(collName)

    // get data from database

    const result = await collection.findOne({id: 1})
    console.log(result)
    client.close()

    let response = {}

    if (result !== null) {
        response = {
            name : result.name,
            email : result.email,
            interest : result.interest
        }
    }

    res.send(response)
})

app.post('/update-profile', async function(req, res) {
    const payload = req.body
    console.log(payload)     
    
    if (isEmptyPayload(payload) || isInvalidEmail(payload)) {
        res.status(400).send({error: "Invalid payload. Couldn't update user"})        
    } else {
        await client.connect()
        console.log('Connected successfully to server')

        //initiates the db
        const db = client.db(dbName)
        const collection = db.collection(collName)


        // save payload data to the database
        payload['id'] = 1
        const updatedValues = { $set: payload }
        await collection.updateOne({ id: 1 }, updatedValues, {upsert: true})
        client.close()
        res.status(200).send({info: "user profile data updated successfully"})    
    }      
})

const server = app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })

module.exports = {
    app,
    server
}