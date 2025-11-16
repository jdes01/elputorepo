db = db.getSiblingDB('tickets');

db.createUser({
  user: "tickets_mongo_user",
  pwd: "tickets_mongo_password",
  roles: [{ role: "readWrite", db: "tickets" }]
});