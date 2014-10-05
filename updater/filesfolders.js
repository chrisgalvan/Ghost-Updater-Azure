var config      = require('../config'),
    debug       = require('debug')('Filesfolders'),
    request     = require('request'),
    Promise     = require('bluebird'),
    fs          = require('fs'),
    ProgressBar = require('progress');

Promise.promisifyAll(request);
Promise.promisifyAll(fs);

var auth = {
    'user': config.user,
    'pass': config.password
}

var filesfolders = {
    mkDir: function (dir) {
        return mk(dir, true);
    },

    mkFile: function (file) {
        return mk(dir, false);
    },

    rmDir: function (dir) {
        return rm(dir, true);
    },

    rmFile: function (file) {
        return rm(dir, false);
    },

    mk: function (target, isDir) {
        target = (isDir) ? target + '/' : target;

        return request.putAsync(config.website + '/api/vfs/site/' + dir, {
            'auth': auth,
        }).then(function(response, body) {
            if (response.statusCode === '409') {
                // Directory already exists
                
            }
            return response;
        }).catch(console.log);
    },

    rm: function (target, isDir) {
        target = (isDir) ? target + '/' : target;

        return request.delAsync(config.website + '/api/vfs/site/' + dir, {
            'auth': auth
        }).then(function(response, body) {
            return response;
        }).catch(console.log);    
    },

    upload: function (source, target) {
        return new Promise(function (resolve, reject) {
            var targetUrl = config.website + '/api/vfs/' + target,
                sourceStream = fs.createReadStream(source);

            debug('Uploading ' + source + ' to ' + target);

            sourceStream.pipe(request.put(targetUrl, {'auth': config.auth}, 
                function(error, result) {
                    if (error) {
                        debug('Upload Error: ', error);
                        reject.call(error);
                    }
                    resolve.call(result);
                })
            );
        });
    },

    uploadWebjob: function (source, name) {
        return new Promise(function (resolve, reject) {
            var targetUrl = config.website + '/api/triggeredwebjobs/' + name,
                sourceStream = fs.createReadStream(source);

            debug('Uploading Webjob ' + source + ' as ' + name);

            request.delAsync(targetUrl, {'auth': config.auth})
            .then(function () {
                sourceStream.pipe(request.put(targetUrl, {
                    'auth': config.auth,
                    'headers': {
                        'Content-Disposition': 'attachement; filename=' + name
                    }
                }, 
                    function(error, response, body) {
                        if (error) {
                            debug('Trigger Error: ', error);
                            reject.call(error);
                        }
                        debug('Response: ', response);
                        debug('Body: ', body);
                        resolve.call(response);
                    })
                );
            })
        });
    },

    triggerWebjob: function (name) {
        return new Promise(function (resolve, reject) {
            var targetUrl = config.website + '/api/triggeredwebjobs/' + name + '/run';

            debug('Triggering Webjob ' + name);

            request.post(targetUrl, {'auth': config.auth}, 
                function(error, response, body) {
                    if (error) {
                        debug('Trigger Error: ', error);
                        reject.call(error);
                    }
                    debug('Response: ', response);
                    debug('Body: ', body);
                    resolve.call(response);
                }
            )
        });
    },
    
    saveGhost: function () {
        request.getAsync(config.latestGhost)
        .then(function (response, body) {
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        });
    }
}

module.exports = filesfolders;