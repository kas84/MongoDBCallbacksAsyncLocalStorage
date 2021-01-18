const express = require('express')
const { AsyncLocalStorage } = require('async_hooks')
const asyncLocalStorage = new AsyncLocalStorage()
const MongoClient = require('mongodb').MongoClient

var url = 'mongodb://localhost:27017/'

MongoClient.connect(url, function (err, db) {
  if (err) throw err
  console.log('connected to db!')

  const requestIdMiddleware = (req, res, next) => {
    asyncLocalStorage.run(new Map(), () => {
      asyncLocalStorage.getStore().set('requestId', Math.random())
      next()
    })
  }

  const app = express()

  app.use(requestIdMiddleware)

  app.get('/', (req, res) => {
    const id = asyncLocalStorage.getStore().get('requestId')
    console.log(`[${id}] request received`)
    var dbo = db.db("test");

    setTimeout(()=>{
      const id2 = asyncLocalStorage.getStore().get('requestId')
      console.log(`[${id2}] request received setTimeout`)

    })

    //as callback
    dbo.collection("testcollection").insertOne({}, function(err, res) {
      if (err) throw err;
      const id3 = asyncLocalStorage.getStore()?.get('requestId')
      console.log(`[${id3}] request callback received`)
    });

    //as promise
    dbo.collection("testcollection").insertOne({}).then(function(res) {
      const id4 = asyncLocalStorage.getStore()?.get('requestId')
      console.log(`[${id4}] request promise received`)
    });

    res.send(`[${id}] request received`)
  })

  const port = process.env.PORT || 3000
  app.listen(port, () =>
    console.log(`Express server listening on port ${port}`),
  )
})
