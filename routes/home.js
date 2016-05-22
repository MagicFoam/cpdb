"use strict";

var express = require('express');
var router = express.Router();
var user_stem = require('../models/user_stem').user_stem;
var stem = require('../models/stem').stem;
var stemmer = require('../stemmer.js').st;
var adv = require('../models/adv.js').adv;
var adv_stem = require('../models/adv_stem.js').adv_stem;

const clusters_count = 3;

var clusters = [clusters_count];

var feature_t = class {
    constructor() {
        this.id = 1;
        this.val = 0;
    }
};

var object_t = class {
    constructor() {
        this.cid = 1;
        this.major = 0;
        this.n = 0;
        this.features = [];
    }
};

var cluster_t = class {
    constructor() {
        this.size = 0;
        this.major = 0;
        this.features = [][2];
    }
};

var distance_to_cluster = function(obj, cluster) {
    var diff = 0;
    for (var i = 0; i < obj.n; i++) {
        var feature = obj.features[i];
        diff = diff + feature.val * cluster.features[feature.id][0];
    }
    return obj.major + cluster.major - 2 * diff;
};

var estimate_centroids = function(clusters, nclusters, nfeatures) {
  for (var cid = 0; cid < nclusters; cid++) {
      var cluster = clusters[cid];
      if (cluster.size == 0)
          continue;
      cluster.major = 0;
      for (var i = 0; i < nfeatures; i++) {
          cluster.features[i][0] = cluster[i][1] / cluster.size;
          cluster.features[i][1] = 0;
          cluster.major = cluster.major + cluster.features[i][0] * cluster.features[i][0]
      }
      cluster.size = 0;
  }
};

var nearest_cluster = function(object, clusters, nclusters) {
    var min_dist = distance_to_cluster(object, clusters[0]);
    var min_dist_cid = 0;
    for (var cid = 1; cid < nclusters; cid++) {
        var dist = distance_to_cluster(object, clusters[cid]);
        if (dist < min_dist) {
            min_dist = dist;
            min_dist_cid = cid;
        }
    }
    if (dist) {
        dist = min_dist;
    }
    return {
        min_dist_cid: min_dist_cid,
        dist: dist
    };
};

var distribute_objects = function(objects, nobjects, clusters, nclusters) {
    var changed = false;
    for (var oid = 0; oid < nobjects; oid++) {
        var object = objects[oid];
        var cid = nearest_cluster(object, clusters, nclusters).min_dist_cid;
        if (cid !== object.cid) {
            changed = true;
        }
        object.cid = cid;
        var cluster = clusters[cid];
        cluster.size = cluster.size + 1;
        for (var i = 0; i < object.n; i++) {
            cluster.features[object.features[i].id][1] += object.features[i].val;
        }
    }
    return changed;
};

var step = function(objects, nobjects, clusters, nclusters, nfeatures) {
    estimate_centroids(clusters, nclusters, nfeatures);
    return distribute_objects(objets, nobjects, clusters, nclusters);
};

var clusterization = function(objects, nobjects, clusters, nclusters, nfeatures) {
    while(step(objects, nobjects, clusters, nclusters, nfeatures)){}
};

var isAuthenticated = function (req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
    if (req.isAuthenticated())
        return next();
    // if the user is not authenticated then redirect him to the login page
    res.redirect('/');
};

var save_user_stem = function(new_user_stem) {
    user_stem.findOne({ where: { userId : new_user_stem.userId, stemId: new_user_stem.stemId } }).then(
        function(usr_stm) {
            if (!usr_stm) {
                new_user_stem.save().then(
                    function (saved_user_stem) {
                        stem.findOne({where: {id: saved_user_stem.stemId}}).then(
                            function(stm) {
                            stm.update({
                                quantity: stm.quantity + 1
                            }).then(function() {}).catch(
                                function (err) {
                                    if (err) {
                                        console.log('Error in Updating stem: ' + err);
                                        throw err;
                                    }
                                }
                            )}).catch(
                            function (err) {
                                if (err) {
                                    console.log('Error in Updating stem: ' + err);
                                    throw err;
                                }
                            });
                        console.log('User_stem saving successful');
                    }).catch(
                    function (err) {
                        if (err) {
                            console.log('Error in Saving user_stem: ' + err);
                            throw err;
                        }
                    });
            }
            else {
                usr_stm.update({
                    quantity: usr_stm.quantity + 1
                }).then(function() {}).catch(
                    function (err) {
                        if (err) {
                            console.log('Error in Updating stem: ' + err);
                            throw err;
                        }
                    }
                );
            }
        }).catch(
        function(err) {
           if (err) {
               console.log('Error in Saving user_stem: ' + err);
               throw err;
           }
        });
};

/* GET Home Page */
router.get('/', isAuthenticated, function(req, res) {
    res.render('home', { user: req.user });
});

router.post('/search', function(req, res) {
    var words = req.body.query;
    var id = req.body.id;
    var stm = new stemmer();
    let wrd = stm.tokenizeAndStem(words);
    for (let value of wrd) {
        stem.findOne({ where: { stem :  value } }).then(
            function(stm) {
                if (!stm) {
                    var new_stem = stem.build({stem: value});
                    new_stem.save().then(
                        function (saved_stem) {
                            var new_user_stem = user_stem.build({
                                userId: id,
                                stemId: saved_stem.id
                            });
                            //save_user_stem(new_user_stem);
                            new_user_stem.save().then(
                                function (saved_user_stem) {
                                    console.log('User_stem saving successful');
                                }).catch(
                                function (err) {
                                    if (err) {
                                        console.log('Error in Saving user_stem: ' + err);
                                        throw err;
                                    }
                                });
                            console.log('Stem saving successful');
                        }).catch(
                        function (err) {
                            if (err) {
                                console.log('Error in Saving stem: ' + err);
                                throw err;
                            }
                        });
                }
                else {
                    var new_user_stem = user_stem.build({
                        userId: id,
                        stemId: stm.id
                    });
                    save_user_stem(new_user_stem);
                }
            });
    }
    res.send(id);
});

module.exports = router;