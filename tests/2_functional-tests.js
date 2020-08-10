/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  /*test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */
 var id;
  suite('Routing tests', function() {
     suite('POST /api/books with title => create book object/expect book object', function() {
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
        .post('/api/books')
        .send({
          title:'the first book vol I'
        })
        .end((err,res)=>{
          assert.equal(res.status,200)
          assert.property(res.body,'_id')
          assert.equal(res.body.title,'the first book vol I')
          assert.equal(res.body.commentCount,0)
        })
        done();
      });
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
        .post('/api/books')
        .send({})
        .end((err,res)=>{
          assert.equal(res.status,400)
          assert.equal(res.text,'error - no title given')
        })
        done();
      });
    });


    suite('GET /api/books => array of books', function(){
      test('Test GET /api/books',  function(done){
        chai.request(server)
        .get('/api/books')
        .query({})
        .end((err,res)=>{
          assert.isArray(res.body);
          assert.equal(res.status,200);
          assert.property(res.body[0],'title');
          assert.property(res.body[0],'_id');
          assert.property(res.body[0],'commentCount');
        })
        done();
      });      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
        .get('/api/books/5f30af11632bd6783c356278')
        .end((err,res)=>{
          assert.equal(res.status,400)
          assert.equal(res.text,'no book exists')
        })
        done();
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
        .get('/api/books')
        .end((err,book)=>{
          id = book.body[0]._id
          chai.request(server)
          .get('/api/books/'+id)
          .end((err,res)=>{
            assert.equal(res.status,200)
            assert.equal(res.body._id,id)
            assert.equal(res.body.title,'the first book vol I')
            assert.property(res.body,'commentCount')
          })
        })
        done();
      });
    });

    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
        .get('/api/books')
        .end((err,book)=>{
          id = book.body[0]._id
          chai.request(server)
          .post('/api/books/'+id)
          .send({
            comment: 'this is a new comment about the book'
          })
          .end((err,res)=>{
            assert.equal(res.status,200);
            assert.equal(res.body._id,id);
            assert.isArray(res.body.comments);
            assert.property(res.body,'commentCount');
            assert.equal(res.body.comments[0],'this is a new comment about the book');
            assert.equal(res.body.title,'the first book vol I');
          })
        }); 
        done();
      })
    });
    //delete tests
    suite('DELETE /api/books/[id] => delete a book object with id', function(){
      test('Test DELETE /api/books/[id] with ID', function(done){
        chai.request(server)
        .get('/api/books')
        .end((err,book)=>{
          id = book.body[0]._id
          chai.request(server)
          .delete('/api/books/'+id)
          .end((err,res)=>{
            assert.equal(res.status,200);
            assert.equal(res.text,'delete successful');
          })
        }); 
        done();
      })
    });
    
  });
});
