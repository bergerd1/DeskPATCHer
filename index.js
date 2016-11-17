var request = require('request');
var util = require('util');
var authToken = process.env.TOKEN;
var express = require('express');
var app = express();
var http = require("http");

//------- Get user ID -------//
function saveCustomer(ticketId, customerId, email) {
  var url = util.format("https://api.onmodulus.net/users/find?email=%s&authToken=%s", email, authToken);

  request({
    url: url,
    method: 'GET',
    json: true
  }, function (err, res, body) {
  var id, isOrg;

  console.log(res);

  if (!err && res) {

    console.log(JSON.stringify(body));

    id = body.id;

//------- Get user stripe ID -------//
  var stripeInfo = util.format("https://api.onmodulus.net/billing/user/%s?authToken=%s", id, authToken);

  request({
      url: stripeInfo,
      method: 'GET',
      json: true
    }, function(err, res, body) {
      var modulusId, stripeId;

      console.log(res, body);

      if (!err && res) {

        console.log(JSON.stringify(body));

        modulusId = body.modulusId;
        stripeId = body.stripeId;

//------- Get user organizations -------//
  var orgInfo = util.format("https://api.onmodulus.net/user/%s/organizations?authToken=%s", id, authToken);

  request({
    url: orgInfo,
    method: 'GET',
    json: true
  }, function(err, res, body) {

    console.log(res, body);

    if (!err && res) {

      console.log(JSON.stringify(body));

      var orgIdList = [];

      for(var o = 0; o < body.length; o++) {
        orgIdList.push(body[o].id);
      }
      console.log(body, orgIdList);

//------- Get user projects -------//
  var projectInfo = util.format("https://api.onmodulus.net/user/%s/projects?authToken=%s", id, authToken);

  request({
    url: projectInfo,
    method: 'GET',
    json: true
  }, function(err, res, body) {

    console.log(res, body);

    if (!err && res) {

      console.log(JSON.stringify(body));

      var projectIdList = [];

      for(var p = 0; p < body.length; p++) {
        projectIdList.push(body[p].id);
      }
      console.log(body, projectIdList);

  //------- Get user Databases -------//
    var databaseInfo = util.format("https://api.onmodulus.net/user/%s/databases?authToken=%s", id, authToken);

      request({
        url: databaseInfo,
        method: 'GET',
        json: true
      }, function(err, res, body) {

          console.log(res, body);

          if (!err && res) {

            console.log(JSON.stringify(body));

            var databaseIdList = [], deskFields;

            for(var d = 0; d < body.length; d++) {
              databaseIdList.push(body[d].id);
            }
            console.log(body, databaseIdList);

  //------- Patch all of that info to the Desk customer custom fields -------//
      var DeskUrl = util.format('https://help.modulus.io/api/v2/customers/%s', customerId);
      var DeskToken = new Buffer(process.env.Credentials);
      deskFields = {
        custom_fields: {
          user_id: id,
          stripe_id: stripeId,
          organization_id: orgIdList,
          project_id: projectIdList,
          database_id: databaseIdList

         }
      };

      request({
        url: DeskUrl,
        method: 'PATCH',
        headers: {
          'Authorization': util.format('Basic %s', DeskToken),
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': process.env.Authorization
        },
        json: deskFields
      }, function (err, res, body) {
        if (err) console.log(err);
        console.log(res.statusCode, err, res, body);

  //------- POST all of that info to a note in the ticket -------//
      var DeskNoteURL = util.format('https://help.modulus.io/api/v2/cases/%s/notes', ticketId);
      var DeskToken2 = new Buffer(process.env.Credentials);

      request({
        url: DeskNoteURL,
        method: 'POST',
        headers: {
          'Authorization': util.format('Basic %s', DeskToken2),
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': process.env.Authorization
        },
        json: {
          'body': util.format("User id: %s \n Stripe id: %s \n Projects: \n %s \n Databases: \n %s \n Organizations: \n %s", id, stripeId, projectIdList, databaseIdList, orgIdList)
        }
      }, function (err, res, body) {
        if (err) console.log(err);
        console.log(res.statusCode, err, res, body);

      });
            });
          };
        });
      };
    });
   };
 });
 };
 });
  }
});
}

app.get('/', function(req, res) {
    var ticket_id = req.query.ticketId;
    var customer_id = req.query.customerId;
    var email = req.query.email;
    saveCustomer(ticket_id, customer_id, email);
    res.end('This should have updated the customer info');
});

app.listen(8080, function () {
  console.log('App listening on port 8080! Logs incoming');
});
