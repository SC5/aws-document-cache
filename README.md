# aws-document-cache NPM module

A module for implementing a simple in-memory and DB cache for 3rd party datasources using AWS DynamoDB

## Prerequisites

A DynamoDB table with a primary key "cacheKey" of type "String"
AWS credentials as required by aws-sdk module (e.g. ~/.aws/credentials)

## Use example


    var cache = require("aws-document-cache");
    cache.init({
                'awsRegion' : 'eu-west-1',             # Region where the table resides
                'cacheTable' : 'myDynamoDBTable',      # Table for the cache
                'memCacheLifetime' : 3600 * 1000,      # Lifespan in ms for the memory cache entries
                'dbCacheLifetime' : 24 * 3600 * 1000,  # Lifespan in ms for the db cache entries
                });
    cache.getDoc('myObjType', 'myObjId', function(err,data) {
        if (err) {
            ...
        }
        if (data == null) {
            ... was not found in cache, load it
        }
    });

    cache.setDoc('myObjType', 'myObjId', data, function(err, data) {
        if (err) {
            ... storage failed
        }
        ...
    }

    


## Release History

* 2015/07/21 - v0.0.1 - Initial version of module


## License

Copyright (c) 2015 [SC5](http://sc5.io/), licensed for users and contributors under MIT license.
https://github.com/SC5/aws-document-cache/blob/master/LICENSE


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/SC5/sc5-aws-lambda-boilerplate/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
