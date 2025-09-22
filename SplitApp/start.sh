#!/bin/bash

if [ "$1" == "-a" ]; then
  (cd client && npm start &) 
  (cd server && node index.js &)
  echo "Client and server started."
elif [ "$1" == "-b" ]; then
  for port in 7777 7778; do
    pid=$(lsof -ti :$port)
    if [ -n "$pid" ]; then
      kill $pid
      echo "Killed process $pid on port $port"
    fi
  done
  echo "All on ports 7777/7778 killed."
else
  echo "Usage: $0 -a (start) | -b (stop)"
fi