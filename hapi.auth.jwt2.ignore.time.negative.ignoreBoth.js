const Hapi = require('hapi');
const authJwt2 = require('hapi-auth-jwt2'); 
const jwt = require('jsonwebtoken');
var Blankie = require('blankie');
var Scooter = require('scooter');
const Inert = require('inert');
const server = new Hapi.Server();
const port = 3000;

server.connection({port: port}); 

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
const validate = function(jwt, tokenid, cb){
  console.log("calling validate function");
  console.log("token: "+jwt.accountId);
  if (! jwt.accountId || jwt.accountId != 123){
    console.log("Missing creds");
    return cb(null, false);
  } else {
    return cb(null, true);
  }
}
// defining main handler
const getMain = function (request, reply) {
  console.log("Get Main Function");
  reply('hello, ' + request.auth.credentials.name);
}

//register server & add auth strategy
server.register([{register:authJwt2},
  {
    register: Inert,
    options: {}
  },{
    register: Scooter,
    options: {}
  },{
    register: Blankie,
    options: {scriptSrc: 'self'}
  }], function(err){
  server.auth.strategy('jwt-auth', 'jwt', {
    key: config.jwt_hmac_secret,      //obtain secret from config file
    validateFunc: validate,           //point to defined 'validate' function
    verifyOptions: {                  //provide verification options to jsonwebtokens library
      algorithms: ['HS256'],
      ignoreNotBefore: true,
      ignoreExpiration: true
    }
  });
});

server.route({
  method: 'GET',
  path: '/',
  config: {
    auth: 'jwt-auth'                   //use jwt-auth strategy to access page
  },
  handler: getMain
});

server.start(function () {
  console.log('Now Visit: http://localhost:' + port);
});
