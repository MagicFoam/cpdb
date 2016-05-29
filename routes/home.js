"use strict";

let express = require('express');
let router = express.Router();
let user = require('../models/user').user;
let user_stem = require('../models/user_stem').user_stem;
let stem = require('../models/stem').stem;
let stemmer = require('../stemmer.js').st;
let adv = require('../models/adv.js').adv;
let adv_stem = require('../models/adv_stem.js').adv_stem;

const pictures_count = 6;

let feature_t = class {
    constructor() {
        this.id = 1;
        this.val = 0;
    }
};

let object_t = class {
    constructor() {
        this.cid = -1;
        this.major = 0;
        this.n = 0;
        this.features = [];
    }
};

let cluster_t = class {
    constructor() {
        this.size = 0;
        this.major = 0;
        this.features_0 = [];
        this.features_1 = [];
    }
};

function rand_int(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function distance_to_cluster(obj, cluster) {
    let diff = 0;
    for (let i = 0; i < obj.n; i++) {
        let feature = obj.features[i];
        diff = diff + feature.val * cluster.features_0[feature.id];
    }
    return obj.major + cluster.major - 2 * diff;
}

function estimate_centroids(clusters, nclusters, nfeatures) {
  for (let cid = 0; cid < nclusters; cid++) {
      let cluster = clusters[cid];
      if (cluster.size == 0)
          continue;
      cluster.major = 0;
      for (let i = 0; i < nfeatures; i++) {
          cluster.features_0[i] = cluster.features_1[i] / cluster.size;
          cluster.features_1[i] = 0;
          cluster.major = cluster.major + cluster.features_0[i] * cluster.features_0[i];
      }
      cluster.size = 0;
  }
}

function nearest_cluster(object, clusters, nclusters) {
    let min_dist = distance_to_cluster(object, clusters[0]);
    let min_dist_cid = 0;
    let dist = 0;
    for (let cid = 0; cid < nclusters; cid++) {
        dist = distance_to_cluster(object, clusters[cid]);
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
}

function distribute_objects(objects, nobjects, clusters, nclusters) {
    let changed = false;
    for (let oid = 0; oid < nobjects; oid++) {
        let object = objects[oid];
        let cid = nearest_cluster(object, clusters, nclusters).min_dist_cid;
        if (cid !== object.cid) {
            changed = true;
        }
        object.cid = cid;
        let cluster = clusters[cid];
        cluster.size = cluster.size + 1;
        for (let i = 0; i < object.n; i++) {
            cluster.features_1[object.features[i].id] += object.features[i].val;
        }
    }
    return changed;
}

function clust_step(objects, nobjects, clusters, nclusters, nfeatures) {
    estimate_centroids(clusters, nclusters, nfeatures);
    let changed = distribute_objects(objects, nobjects, clusters, nclusters);
    return changed;
}

function calc_object_major(object) {
    let major = 0;
    for (let i = 0; i < object.n; i++)
        major += object.features[i].val * object.features[i].val;
    object.major = major;
}

function calc_cluster_major(cluster, nfeatures) {
    let major = 0;
    for (let i = 0; i < nfeatures; i++)
        major += cluster.features_0[i] * cluster.features_0[i];
    cluster.major = major;
}

function init_object(object, id, nobjects, custom_stems) {
    object.id = id;
    object.n = custom_stems.length;
    for (let i = 0; i < custom_stems.length; i++) {
        object.features[i] = new feature_t();
        object.features[i].id = custom_stems[i].id - 1;
        let tf =  1 + Math.log(custom_stems[i].user_stem.quantity);
        let idf = Math.log(1 + nobjects / custom_stems[i].quantity);
        object.features[i].val = tf * idf;
    }    
    calc_object_major(object);
}

function init_cluster(cluster, nfeatures, proto) {
    for (let i = 0; i < proto.n; i++)
        cluster.features_0[proto.features[i].id] = proto.features[i].val;
    calc_cluster_major(cluster, nfeatures);
}

function search_selected(objects, nobjects, sum) {
    let l = 0;
    let r = nobjects - 1;
    while (l <= r) {
        let k = Math.floor((l + r) / 2);
        if (objects[k].major < sum)
            l = k + 1;
        else
            r = k - 1;
    }
    return l;
}

function find_proto(objects, nobjects, clusters, nclusters) {
    let sum = 0;
    for (let oid = 0; oid < nobjects; oid++) {
        let dist;
        nearest_cluster(objects[oid], clusters, nclusters).dist;
        sum += dist;
        objects[oid].major = sum;
    }
    sum *= Math.random();
    let oid = search_selected(objects, nobjects, sum);
    return objects[oid];
}

function generate_clusters(clusters, nclusters, nfeatures, objects, nobjects) {
    init_cluster(clusters[0], nfeatures, objects[Math.round(Math.random() * nobjects - 1)]);
    for (let cid = 1; cid < nclusters; cid++) {
        let proto = find_proto(objects, nobjects, clusters, cid);
        init_cluster(clusters[cid], nfeatures, proto);
    }
    for (let oid = 0; oid < nobjects; oid++) {
        calc_object_major(objects[oid]);
    }
}

function clusterization(current_user_id) {
    let nclusters = 0;
    let nfeatures = 0;
    let nobjects = 0;
    let objects = []; 
    let clusters = [];
    let flag = 0;
    let file_names = [];
    user.findAndCountAll().then(function(users) {
        stem.findAndCountAll().then(function(stems) {
            nclusters = Math.round(Math.log(users.count));
            nobjects = users.count;
            nfeatures = stems.count;
            for (let i = 0; i < nobjects; i++) {
                objects[i] = new object_t();
            }
            for (let i = 0; i < nclusters; i++) {
                clusters[i] = new cluster_t();
                clusters[i].features_0 = [];
                clusters[i].features_1 = [];
                for (let j = 0; j < stems.count; j++) {
                    clusters[i].features_0[j] = 0;
                    clusters[i].features_1[j] = 0;
                }
            }
            let objects_ready = 0;
            for (let i = 0; i < nobjects; i++) {
                users.rows[i].getStems().then(function(custom_stems) {
                    objects[i].n = custom_stems.length;
                    for (let j = 0; j < custom_stems.length; j++) {
                        objects[i].features[j] = new feature_t();
                        objects[i].features[j].id = custom_stems[j].id - 1;
                        let tf =  1 + Math.log(custom_stems[j].user_stem.quantity);
                        let idf = Math.log(1 + nobjects / custom_stems[j].quantity);
                        objects[i].features[j].val = tf * idf;
                    }
                    let major = 0;
                    for (let j = 0; j < objects[i].n; j++) {
                        major += objects[i].features[j].val * objects[i].features[j].val;
                    }
                    objects[i].major = major;
                    objects_ready++;
                }).then(function () {
                    if (objects_ready == nobjects) {
                        generate_clusters(clusters, nclusters, nfeatures, objects, nobjects);
                        while(clust_step(objects, nobjects, clusters, nclusters, nfeatures)){}
                        let sorted_stems = []
                        let cid = objects[current_user_id - 1].cid;
                        for (let j = 0; j < nfeatures; j++) {
                            sorted_stems[j] = clusters[cid].features_0[j];
                        }
                        sorted_stems.sort(function (a, b) {return b - a});
                        for (let j = 0; j < pictures_count; j++) {
                            let index = clusters[cid].features_0.indexOf(sorted_stems[j]);
                            stems.rows[index].getAdvs().then(function(custom_advs) {
                                if (!custom_advs) {
                                    file_names.push(custom_advs[rand_int(0, custom_advs.length - 1)].location);
                                }
                                else {
                                    file_names.push(rand_int(0, 6) + '.png');       
                                }
                            })
                        }
                    }
                });
            }                
        })
    })    
}

let isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
};

let save_user_stem = function(new_user_stem) {
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

router.get('/', isAuthenticated, function(req, res) {
    res.render('home', { user: req.user });
});

router.post('/search', function(req, res) {
    let words = req.body.query;
    let id = req.body.id;
    let stm = new stemmer();
    let wrd = stm.tokenizeAndStem(words);
    for (let value of wrd) {
        stem.findOne({ where: { stem :  value } }).then(
            function(stm) {
                if (!stm) {
                    let new_stem = stem.build({stem: value});
                    new_stem.save().then(
                        function (saved_stem) {
                            let new_user_stem = user_stem.build({
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
                    let new_user_stem = user_stem.build({
                        userId: id,
                        stemId: stm.id
                    });
                    save_user_stem(new_user_stem);
                }
            });
    }
    clusterization(req.user.id);
    res.send({
        data: 'data'
    })
});

module.exports = router;