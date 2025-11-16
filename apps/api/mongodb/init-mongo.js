db = db.getSiblingDB('admin');

db.createUser({
  user: "mongo_user",
  pwd: "mongo_password",
  roles: [{ role: "readWrite", db: "admin" }]
});