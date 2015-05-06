# beacon-socket-restify


This the Client/Server applikation of Presence.

## Start the application

DEBUG=* node index.js

## token
curl -ikL -X POST -H "username: username" -H "password: pwd" http://localhost:3000/token

## connect
curl -ikLv -X GET -H "authorization: Bearer TOKENZZZZZZZZ"

## register
curl -ikLv -X POST -H "authorization: Bearer TOKENZZZZZZZ" -H "username: username" -H "password: pwd" http://localhost:3000/register
