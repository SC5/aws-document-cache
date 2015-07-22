//
// Object caching using DynamoDB
//

var AWS = require('aws-sdk');
var DOC = require('dynamodb-doc');

var dynamoDB = null;
var cacheTable = null;
var memCacheLifetime = 3600 * 1000; // memcache = 1h
var dbCacheLifetime = 24*3600 * 1000; // dbcache = 24h;
var memcache = {};
var config = {};

function init(params) {
    config = params;
    var awsConfig = {};
    if (config.awsRegion != null) {
        awsConfig.region = 'eu-west-1';
    }
    if (config.cacheTable != null) {
        cacheTable = config.cacheTable;
    }
    if (config.memCacheLifetime != null) {
        memCacheLifeTime = config.memCacheLifetime;
    }
    if (config.dbCacheLifetime != null) {
        dbCacheLifetime = config.dbCacheLifetime;
    }
    var awsClient = new AWS.DynamoDB(awsConfig);
    dynamoDB = new DOC.DynamoDB(awsClient);
}

function getCacheKey(type, identifier) {
    return type + "-" + identifier;
}

function getDoc(type, identifier, callback) {
    if (callback == null) {
        callback = function() {};
    }
    var cacheKey = getCacheKey(type, identifier);
    var now = new Date().getTime();
    // First check the memory cache
    if (memcache[cacheKey] != null) {
        var doc = memcache[cacheKey];
        if ((now - doc.cacheMeta.memCacheTimeStamp) < memCacheLifetime ) {
            // Cache is valid
            doc.cacheMeta.src = "memcache";
            return callback(null, doc);
        }
    }
    if (cacheTable == null) {
        return callback(null,null);
    }
    
    // Not in memory cache -- check now in DynamoDB
    var params = {
        Key: {'cacheKey' : cacheKey},
        TableName: cacheTable
    };

    dynamoDB.getItem(params, function(err, data) {
        if (err) {
            return callback("Cache error " + err, null);
        } else {
            if (data.Item != null) {
                var doc = data.Item;
                var meta = doc.cacheMeta || {cacheTimeStamp : 0} ; // Fallback in case of schema changes

                if ((now - meta.cacheTimestamp) < dbCacheLifetime ) {
                    // Cache is valid
                    memcache[cacheKey] = doc;
                    doc.cacheMeta.src = "dbcache";
                    doc.cacheMeta.memCacheTimeStamp = new Date().getTime();
                    return callback(null,doc);
                }
            }
            // Cache invalid or does not exist
            return callback(null,null);
        }
    }); 
}

function setDoc(type, identifier,data, callback) {
    if (callback == null) {
        callback = function() {};
    }
	data.cacheMeta = {
		'cacheTimestamp' : new Date().getTime()
	};
    data.cacheKey = getCacheKey(type, identifier);
    var dbdoc = {'Item' : data,
                'TableName' : cacheTable};
    dynamoDB.putItem(dbdoc, function(err, data) {
        if (err) {
            return errorCb("Cache error: " + err); 
        }
        memcache[data.cacheKey] = data;

        return callback(null, data);
    });
}

module.exports = exports = {
    init : init,
    getDoc : getDoc,
    setDoc : setDoc
}