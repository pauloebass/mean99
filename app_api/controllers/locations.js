var mongoose = require('mongoose');
var Loc = mongoose.model('Location');
const geolib = require('geolib');

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

var getDistance = function(point1, point2){
  var distance = geolib.getPreciseDistance(
    { latitude: point1.lat, longitude: point1.lng },
    { latitude: point2.lat, longitude: point2.lng },
    1
  );
  //console.log('dist :' + distance);
  return distance;
}

var theEarth = (function() {
  var earthRadius = 6371; // km, miles is 3959

  var getDistanceFromRads = function(rads) {
    return parseFloat(rads * earthRadius);
  };

  var getRadsFromDistance = function(distance) {
    return parseFloat(distance / earthRadius);
  };

  var mToKm = function(distance) {
    return parseFloat(distance / 1000);
  };
  var kmToM = function(distance) {
      return parseFloat(distance * 1000);
  };

  return {
    getDistanceFromRads: getDistanceFromRads,
    getRadsFromDistance: getRadsFromDistance,
    mToKm: mToKm,
    kmToM: kmToM
  };
})();

/* GET list of locations */
module.exports.locationsListByDistance = function(req, res) {
  var lng = parseFloat(req.query.lng);
  var lat = parseFloat(req.query.lat);
  var point = {lng: lng, lat: lat};
  var maxDistance = parseFloat(req.query.maxDistance);
  var locations;

  if ((!lng && lng!==0) || (!lat && lat!==0) || ! maxDistance) {
    console.log('locationsListByDistance missing params');
    sendJSONresponse(res, 404, {
      "message": "lng, lat and maxDistance query parameters are all required"
    });
    return;
  }

  Loc.find({
    location: {
     $near: {
      $maxDistance: maxDistance,
      $geometry: {
       type: "Point",
       coordinates: [lng, lat]
      }
     }
    }
   }, function(err, results){
        console.log('results :' + results);
        if (err) {
          console.log('Near error:', err);
          sendJSONresponse(res, 404, err);
        } else {
          locations = buildLocationList(req, res, results, point);
          sendJSONresponse(res, 200, locations);
        }
   });
};

var buildLocationList = function(req, res, results, point) {
  var locations = [];
  var locationPoint;
  //console.log(results);
  //console.log(JSON.stringify(results, 0, 2));
  results.forEach(function(doc) {
    locationPoint = {lng: doc.location.coordinates[0], lat: doc.location.coordinates[1]};
    locations.push({
      distance: getDistance(point, locationPoint),
      name: doc.name,
      address: doc.address,
      rating: doc.rating,
      facilities: doc.facilities,
      _id: doc._id
    });
  });
  return locations;
};

/* GET a location by the id */
module.exports.locationsReadOne = function(req, res) {
  console.log('Finding location details', req.params);
  if (req.params && req.params.locationid) {
    var id = new mongoose.Types.ObjectId(req.params.locationid);
    Loc
      .find({_id : id}, function(err, location) {
        console.log('location :' + location);
        console.log('err :' + err);
        if (!location) {
          sendJSONresponse(res, 404, {
            "message": "locationid not found"
          });
          return;
        } else if (err) {
          console.log(err);
          sendJSONresponse(res, 404, err);
          return;
        }
        console.log(location);
        sendJSONresponse(res, 200, location);
      });
  } else {
    console.log('No locationid specified');
    sendJSONresponse(res, 404, {
      "message": "No locationid in request"
    });
  }
};

/* POST a new location */
/* /api/locations */
module.exports.locationsCreate = function(req, res) {
  console.log(req.body);
  Loc.create({
    name: req.body.name,
    address: req.body.address,
    facilities: req.body.facilities.split(","),
    coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
    openingTimes: [{
      days: req.body.days1,
      opening: req.body.opening1,
      closing: req.body.closing1,
      closed: req.body.closed1,
    }, {
      days: req.body.days2,
      opening: req.body.opening2,
      closing: req.body.closing2,
      closed: req.body.closed2,
    }]
  }, function(err, location) {
    if (err) {
      console.log(err);
      sendJSONresponse(res, 400, err);
    } else {
      console.log(location);
      sendJSONresponse(res, 201, location);
    }
  });
};

/* PUT /api/locations/:locationid */
module.exports.locationsUpdateOne = function(req, res) {
  if (!req.params.locationid) {
    sendJSONresponse(res, 404, {
      "message": "Not found, locationid is required"
    });
    return;
  }
  Loc
    .findById(req.params.locationid)
    .select('-reviews -rating')
    .exec(
      function(err, location) {
        if (!location) {
          sendJSONresponse(res, 404, {
            "message": "locationid not found"
          });
          return;
        } else if (err) {
          sendJSONresponse(res, 400, err);
          return;
        }
        location.name = req.body.name;
        location.address = req.body.address;
        location.facilities = req.body.facilities.split(",");
        location.coords = [parseFloat(req.body.lng), parseFloat(req.body.lat)];
        location.openingTimes = [{
          days: req.body.days1,
          opening: req.body.opening1,
          closing: req.body.closing1,
          closed: req.body.closed1,
        }, {
          days: req.body.days2,
          opening: req.body.opening2,
          closing: req.body.closing2,
          closed: req.body.closed2,
        }];
        location.save(function(err, location) {
          if (err) {
            sendJSONresponse(res, 404, err);
          } else {
            sendJSONresponse(res, 200, location);
          }
        });
      }
  );
};

/* DELETE /api/locations/:locationid */
module.exports.locationsDeleteOne = function(req, res) {
  var locationid = req.params.locationid;
  if (locationid) {
    Loc
      .findByIdAndRemove(locationid)
      .exec(
        function(err, location) {
          if (err) {
            console.log(err);
            sendJSONresponse(res, 404, err);
            return;
          }
          console.log("Location id " + locationid + " deleted");
          sendJSONresponse(res, 204, null);
        }
    );
  } else {
    sendJSONresponse(res, 404, {
      "message": "No locationid"
    });
  }
};
