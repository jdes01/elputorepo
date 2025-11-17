#!/bin/sh

if [ "$DEBUG" = "1" ]; then
  echo "Running with debug..."
  npm run start:debug
else
  echo "Running in development mode..."
  npm run start:dev
fi
