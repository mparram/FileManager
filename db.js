const redis = require("redis");
const redis_port=process.env.redis_port || "6379";
const redis_host=process.env.redis_host || "localhost"
const redis_pass=process.env.redis_pass || "changeit";
const client = redis.createClient(redis_port, redis_host,{password: redis_pass});
 
client.on("error", function(error) {
  console.error(error);
});
var dbmodules = module.exports = {
    writefile: function(id, url, filename, size, ext, uploadDate, encoding, mimetype) {
        client.hmset("uploadfile:" + id, "url", url, "filename", filename, "size", size, "ext", ext, "uploadDate", uploadDate, "encoding", encoding, "mimetype", mimetype, function (err, reply) {
            console.log("added key to redis: uploadfile:" + id);
            console.log(reply);
        });
    },
    readfile: function(id, cb) {
        client.hgetall("uploadfile:" + id, function(err, object) {
            console.log("reading from redis: ");
            console.log(object);
            cb(object);
        });
    }
};