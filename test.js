var docCache = require('./index.js')
var expect = require('expect');
var cacheTable = 'aws-document-cache-test';

describe('aws-document-cache', function() {
    var doc={
        'rand': Math.random()
    };
    
    it('Has function init()', function(done) {
        docCache.init({
           cacheServer: ['127.0.0.1:11211']
        });
        return done();
    })
    
    it('setDoc() stores an item to the cache', function(done) {
        this.timeout(5000);
        docCache.setDoc('test', 'testCode', {
            data: doc
        }, function(err, result) {
           expect(err).toEqual(null);
           done(); 
        });     
    })
    
    it('getDoc() reads an item from the cache', function(done) {
        docCache.getDoc('test', 'testCode', function(err, result) {
           expect('object').toEqual(typeof(result));
           expect(result).toNotEqual(null);
           if (result) {
                expect(result.data.rand).toEqual(doc.rand);
           }
           done(); 
        });     
    });
   
    it('getDoc() reads an item from the cache', function(done) {
        docCache.getDoc('test', 'testCode', function(err, result) {
           expect('object').toEqual(typeof(result));
           expect(result).toNotEqual(null);
           if (result) {
                expect(result.data.rand).toEqual(doc.rand);
           }
           done(); 
        });     
    });
});