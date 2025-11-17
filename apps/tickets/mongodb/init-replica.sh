#!/bin/bash
set -e

echo "Waiting for MongoDB to start..."
until mongosh --quiet --eval "db.adminCommand('ping').ok" > /dev/null 2>&1; do
  sleep 2
  echo "Waiting for MongoDB..."
done

echo "MongoDB is up. Checking replica set status..."

# Verificar si ya está inicializado
if mongosh --quiet --eval "rs.status().ok" > /dev/null 2>&1; then
  echo "Replica set already initialized"
else
  echo "Initializing replica set..."
  mongosh --quiet --eval "
    rs.initiate({
      _id: 'rs0',
      members: [{ _id: 0, host: 'localhost:27017' }]
    })
  "
  
  echo "Waiting for primary to be elected..."
  for i in {1..30}; do
    if mongosh --quiet --eval "rs.status().members.some(m => m.stateStr === 'PRIMARY')" 2>/dev/null | grep -q "true"; then
      echo "Replica set initialized successfully!"
      exit 0
    fi
    sleep 1
  done
  
  echo "Warning: Replica set initialization timeout"
fi