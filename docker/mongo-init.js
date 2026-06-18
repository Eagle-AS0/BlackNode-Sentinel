db.createUser({
  user: "blacknode_user",
  pwd: "blacknode_pass",
  roles: [
    {
      role: "readWrite",
      db: "blacknode-sentinel"
    }
  ]
});

db.createCollection("users");
db.createCollection("organizations");
db.createCollection("applications");
db.createCollection("securityevents");
db.createCollection("alerts");
