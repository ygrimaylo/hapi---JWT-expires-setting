const Hapi = require('hapi');
const authJwt = require('hapi-auth-jwt');
const jwt = require('jsonwebtoken');
var Blankie = require('blankie');
var Scooter = require('scooter');
const Inert = require('inert');
const server = new Hapi.Server();
const port = 3000;

server.connection({port: port});

var server2 = new Hapi.Server();
server2.connection({ port: 3000 });

server2.register([{
  register: Inert,
  options: {}
  },{
  register: Scooter,
  options: {}
  },{
  register: Blankie,
  options: {scriptSrc: 'self'}
  }], 
  function (err) {
  if (err) {
      throw err;
  }
});

let token =  jwt.sign(
  {
    id: user._id,
    name: user.name, 
    admin: user.admin
  }, 
  config.jwt_hmac_secret, 
  {
    expiresIn: "2h",    // expire token in two hours
    algorithm: 'HS256'
  }
);

// defining validateFunc
const validate = function(req, decoded_token, cb){
  console.log("calling validate function");
  console.log("token: "+decoded_token.accountId);
  if (! decoded_token.accountId || decoded_token.accountId != 123){
    console.log("Missing creds");
    return cb({error: "Missing creds"});
  } else {
    return cb({name:"John"});
  }
}

// defining main handler
const getMain = function (request, reply) {
  console.log("Get Main Function");
  reply('hello, ' + request.auth);
}

var verifyOptions = {                  //provide verification options to jsonwebtokens library
  algorithms: ['HS256'],
  ignoreNotBefore: true,
  ignoreExpiration: true
};

server.register(authJwt, function(err){
  server.auth.strategy('jwt-auth', 'jwt', {
    key: config.jwt_hmac_secret,      //obtain secret from config file
    validateFunc: validate,           //point to defined 'validate' function
    verifyOptions: verifyOptions
  });
});
server.route({
  method: 'GET',
  path: '/',
  config: {
    auth: 'jwt-auth'                  //use jwt-auth strategy to access page
  },
  handler: getMain
});

server.start(function () {
  console.log('Now Visit: http://localhost:' + port);
});
