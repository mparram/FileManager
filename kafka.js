const kafka_port=process.env.kafka_port || "9092";
const kafka_server=process.env.kafka_server || "localhost"
const kafka_topic=process.env.kafka_topic || "filemanager.post";
var kafka = require('kafka-node');
var Producer = kafka.Producer;
var client = new kafka.KafkaClient({kafkaHost: kafka_server + ":" + kafka_port});
var producer = new Producer(client);
var dbmodules = module.exports = {
    writefile: function(id, url, filename, size, ext, uploadDate, encoding, mimetype) {
        let message = [
            {
                id: id,
                url: url,
                filename: filename,
                size: size,
                ext: ext, 
                uploadDate: uploadDate,
                uploadDate: uploadDate,
                mimetype: mimetype
            }
        ];
        let payloads = [
            {
              topic: kafka_topic,
              messages: message
            }
          ];
        producer.send(payloads, function (err, data) {
            if (err) {
                console.log(err);
            };
            console.log(data);
            console.log("added message to kafka topic: " + kafka_topic);
            console.log("message: ");
            console.dir(message);
        });
    }
};
producer.on('ready', function () {
    
});