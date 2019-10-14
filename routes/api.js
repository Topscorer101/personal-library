'use strict';

const expect = require('chai').expect;
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const assert = require('assert');
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});
const dbName = 'fcc';
const connectionOption = { useNewUrlParser: true };

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      MongoClient.connect(MONGODB_CONNECTION_STRING, connectionOption, (err, client) => {
        assert.equal(null, err);
        console.log('Connection established.');
        const db = client.db(dbName);
        
        listBooks(db, (data) => {
          res.json(data);
          client.close();
          console.log('Connection closed.');
        });
      });
    })
    
    .post(function (req, res){
      let title = req.body.title;
      console.log(`Title: ${title}`);
      if (!title) {
        return res.send('No book title added');
      }
    
      let newBook = {
        title,
        comments: [],
      };
    
    MongoClient.connect(MONGODB_CONNECTION_STRING, connectionOption, (err, client) => {
      assert.equal(null, err);
      console.log('Connection established.');
      const db = client.db(dbName);
       addBook(db, newBook, (data) => {
        indexCollection(db, () => {
          res.json(data)
          client.close();
          console.log('Connection closed.');
        })
      }) 
      
    });
    
    })
    
    .delete(function(req, res){
      MongoClient.connect(MONGODB_CONNECTION_STRING, connectionOption, (err, client) => {
        assert.equal(null, err);
        
        console.log('Connection established.');
        const db = client.db(dbName);
        
        deleteBooks(db, (data) => {
          res.send('complete delete successful');
          client.close();
          console.log('Connection closed.');
        });
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      
      MongoClient.connect(MONGODB_CONNECTION_STRING, connectionOption, (err, client) => {
        assert.equal(null, err);
        console.log('Connection established');
        const db = client.db(dbName);
        
        findBook(db, bookid, (data) => {
          if (data.length === 0){
            res.send('no book exists'); 
          } else {
            res.json(data[0]);
          }
           client.close();
          console.log('Connection closed.');
        });
      });
    
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      
      MongoClient.connect(MONGODB_CONNECTION_STRING, connectionOption, (err, client) => {
        assert.equal(null, err);
        console.log('Connection established.');
        const db = client.db(dbName);
        
        addComment(db, bookid, comment, (data) => {
          res.json(data[0]);
          client.close();
          console.log('Connection closed.');
        });
      });
    
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, connectionOption, (err, client) => {
        assert.equal(null, err);
        console.log('Connection established.');
        const db = client.db(dbName);
        
        deleteABook(db, bookid, (data) => {
          res.send('delete successful');
          client.close();
          console.log('Connection closed.');
        })
      });
    
    });
  const addBook = (db, newBook, callback) => {
  const collection = db.collection('book');

  collection.insertOne(newBook, (err, result) => {
    if (err) {
      return callback(err);
    }
    console.log('Book added.');
    callback(newBook);
  });
}

const listBooks = (db, callback) => {
  const collection = db.collection('book');
  
  collection.find({}).toArray((err, docs) => {
    if (err) {
      return callback(err); 
    }
    
    for (let property in docs) {
      docs[property].commentcount = docs[property].comments.length;
      delete docs[property].comments;
    }
    
    callback(docs);
  });
}

const deleteBooks = (db, callback) => {
  const collection = db.collection('book');
  
  collection.deleteMany({}, (err, docs) => {
    if (err) {
      return callback(err);
    }
    console.log('Delete successful.');
    callback('Delete successful.');
  });
}

const findBook = (db, bookid, callback) => {
  const collection = db.collection('book');
   collection.find({ _id: new ObjectId(bookid)}).toArray((err, docs) => {
      assert.equal(null, err);
      callback(docs);
  });  
}

const addComment = (db, bookid, comment, callback) => {
  const collection = db.collection('book');
  
  collection.updateOne({ _id: new ObjectId(bookid) }, { $push: { comments: comment} }, (err, docs) => {
    assert.equal(null, err);
    
    findBook(db, bookid, (data) => {
      callback(data)
    });
  });
}

const deleteABook = (db, bookid, callback) => {
  const collection  = db.collection('book');
  collection.deleteOne({ _id: new ObjectId(bookid) }, (err, docs) => {
    assert.equal(null, err);
    console.log('Deleted successfuly');
    callback('Delete successful');
  });
}

const indexCollection = (db, callback) => {
  const collection = db.collection('book').createIndex(
    { _id: 1 },
    null, 
    (err, results) => {
      // console.log(results);  
      callback();
    }
  );
}
