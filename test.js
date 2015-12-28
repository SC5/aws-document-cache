var docCache = require('./index.js')
var expect = require('expect');
var cacheTable = 'aws-document-cache-test';

describe('aws-document-cache', function() {
    var doc={
        'rand': Math.random()
    };
    
    it('Has function init()', function(done) {
        docCache.init({
           cacheTable: cacheTable
        });
        return done();
    })
    
    it('setDoc() stores an item to the cache', function(done) {
        docCache.setDoc('test', 'testCode', {
            meta: doc
        }, function(err, result) {
           expect(err).toEqual(null);
           done(); 
        });     
    })
    
    it('getDoc() reads an item from the cache', function(done) {
        docCache.getDoc('test', 'testCode', function(err, result) {
           expect(result.meta.rand).toEqual(doc.rand);
           console.log(result);
           done(); 
        });     
    });
   
    it('getDoc() reads an item from the cache', function(done) {
        docCache.getDoc('test', 'testCode', function(err, result) {
            console.log(result);
           expect(result.meta.rand).toEqual(doc.rand);
           done(); 
        });     
    });
});