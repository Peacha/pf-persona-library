/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      MongoClient.connect(MONGODB_CONNECTION_STRING,{useNewUrlParser:true,useUnifiedTopology:true},(err,client)=>{
        if (err){
          console.log('error connecting to database ' +err);
        } else{
          console.log('connected to database');
          let db = client.db('personal-library');
          db.collection('books').find({}).toArray((err,doc)=>{
            if (err){
              res.status(400);
              res.send('an error occurred finding books');
            } else {
              res.status(200);
              res.json(doc);
            }
            client.close();
          })
        }
      })
    })
    
    .post(function (req, res){
      var title = req.body.title;
      if (title)
      {
          MongoClient.connect(MONGODB_CONNECTION_STRING,{useNewUrlParser:true,useUnifiedTopology:true},(err,client)=>{
            if (err){
              console.log('error connecting to database' +err);
            } else{
              let db = client.db('personal-library');
              console.log('connected to database');
              db.collection('books').insertOne({title:title,commentCount:0},(err,doc)=>{
                if (err){
                  res.status(400);
                  res.send({error:'error inserting book ' + title});
                } else {
                  res.status(200);
                  res.json({title:doc.ops[0].title,_id:doc.ops[0]._id,commentCount:doc.ops[0].commentCount});
                }
                client.close();
              })
            }
          })
      } else {
        res.status(400);
        res.send('error - no title given');
      }
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING,{useNewUrlParser:true,useUnifiedTopology:true},(err,client)=>{
        if(err){
          console.log('error connecting to database '+err);
        } else{
          console.log('connected to database');
          let db = client.db('personal-library');
          db.collection('books').deleteMany({},(err,doc)=>{
            if (err){
              console.log('error deleting books');
              res.status(400);
              res.send('error deleting books');
            } else{
              db.collection('comments').deleteMany({},(err,commentDocs)=>{
              if (err){
                res.status(400);
                res.send('error deleting comments');
                client.close();
              } else{
                res.status(200);
                res.send('complete delete successful')
                client.close();
                }             
              })
            }
          })
        }
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      MongoClient.connect(MONGODB_CONNECTION_STRING,{useNewUrlParser:true,useUnifiedTopology:true},(err,client)=>{
        if (err){
          console.log('error connecting to database '+err);
        } else {
          console.log('connected to database');
          let db = client.db('personal-library');
          db.collection('books').findOne({_id:new ObjectId(bookid)},(err,book)=>{
            if (err){
              res.status(400);
              res.send('an error occured retreiving book');
            }
            if (book){
              res.status(200);
              res.json(book);
            } else{
              res.status(400);
              res.send('no book exists');
            }
            client.close();
          })
        }
      })
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      let commentObj = {book_id:bookid,createdOn:new Date(),comment:comment};
      MongoClient.connect(MONGODB_CONNECTION_STRING,{useNewUrlParser:true,useUnifiedTopology:true},(err,client)=>{
        if (err){
          console.log('error connecting to database ' +err);
        } else {
          console.log('connected to database');
          let db = client.db('personal-library');
          db.collection('books').findOneAndUpdate({_id:new ObjectId(bookid)},{$inc:{commentCount:1}},{returnOriginal:false},(err,bookDoc)=>{
            if (err){
              res.status(400);
              res.send('error occured updating comment count')
              client.close();
            } else if (!bookDoc){
              res.status(400);
              res.send('invalid book id '+bookid);
              client.close();
            } else {
              let commentObj = {book_id:bookid,comment:comment,createdOn: new Date()}
              db.collection('comments').insertOne(commentObj,(err,commentDoc)=>{
                if (err){
                  console.log('error inserting comment '+err)
                  res.status(400);
                  res.send('error inserting comment');
                  client.close();
                } else {
                  db.collection('comments').find({book_id:bookid}).toArray((err,allComments)=>{
                    if (err){
                      res.send(400);
                      res.send('error looking up comments');
                      client.close();
                    } else{
                      res.status(200);
                      res.json({title:bookDoc.value.title,_id:bookDoc.value._id,commentCount:bookDoc.value.commentCount,comments:allComments.map(e=>{return e.comment})})
                      client.close();
                    }
                  })
                }
              })
            }
          })
        }
      })
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING,{useNewUrlParser:true,useUnifiedTopology:true},(err,client)=>{
        if (err){
          console.log('error connecting to database');
        } else{
          console.log('connected to database');
          let db = client.db('personal-library');
          db.collection('books').deleteOne({_id:new ObjectId(bookid)},(err,book)=>{
            if (err){
              console.log('error deleting book');
              res.send(400);
              res.send('error deleting book');
              client.close();
            } else{
              db.collection('comments').deleteMany({bookid:bookid},(err,comments)=>{
                if (err){
                  console.log('error deleting comments '+err);
                  res.status(400);
                  res.send('error deleting comments');
                  client.close()
                } else {
                  res.status(200);
                  res.send('delete successful');
                  client.close();
                }
              })
            }
          })
        }
      })
    });
};
