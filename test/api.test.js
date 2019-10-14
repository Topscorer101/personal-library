const chaiHttp = require('chai-http');
const chai = require('chai');

const assert = chai.assert;

const server = require('../server');

chai.use(chaiHttp);

describe('API ROUTE FOR /api/books/:id', function(){
  
  it('GET', (done) => {
    chai.request(server)
      .get('/api/books/5bfe46d54f8c1e0061c1243e')
      .then((res) => {
        assert.property(res.body, 'comments', 'Book should contain property comments');
        assert.isArray(res.body.comments, 'Book should contain array of comments');
        assert.property(res.body, 'title', 'Book should contain property title');
        assert.property(res.body, '_id', 'Book should contain property _id');
        done();
      })
      .catch((err) => {
        throw err;
        done()
      })
  });
  
})
