var express = require('express')
  , path = require('path')
  , app = express()
  , multer = require('multer') //middleware multipart/form-data for uploading files
  , cors = require('cors')
  , db = require('./db')
  , kafka = require('./kafka')
  , fs = require('fs')
  , findRemoveSync = require('find-remove')
  , CronJob = require('cron').CronJob;
app.use(cors());
const PORT = process.env.PORT || 8080;
const TTL = process.env.TTL || 3600; //time to live in seconds for files 

var job = new CronJob('* 0-59 * * * *', function() {
    //remove files olther than TTL
    var result = findRemoveSync('/uploads', {age: {seconds: TTL}, limit: 100})
});
job.start();

//Store here the uploads
const DIR = 'uploads/'; 
if (!fs.existsSync(DIR)){
    fs.mkdirSync(DIR);
    console.log("Directory created.");
  }else
  {
    console.log("Directory already exist");
  }
 
let upload = multer({ dest: DIR })
app.post('/api/files', upload.single("uploadfile"), function(req,res){
    var uploadDate = new Date().getTime();
    var uid = req.file.filename;
    var ext = path.extname(req.file.originalname);
    console.log({method: req.file.fieldname, filename: req.file.originalname, size: req.file.size, uid: uid, ext: ext, date: uploadDate});
    db.writefile(uid, 'http://' + req.headers.host + '/api/files/' + uid, req.file.originalname,req.file.size, ext, uploadDate, req.file.encoding, req.file.mimetype);
    kafka.writefile(uid, 'http://' + req.headers.host + '/api/files/' + uid, req.file.originalname,req.file.size, ext, uploadDate, req.file.encoding, req.file.mimetype);
    res.json({'msg': 'File uploaded successfully!', 'uid': uid, 'url': 'http://' + req.headers.host + '/api/files/' + uid,'filename': req.file.originalname, 'size': req.file.size, 'ext': ext,'date': uploadDate, 'encoding': req.file.encoding, 'mimetype': req.file.mimetype});

 });

 app.get('/api/files/:file', (req, res) => {
    console.log("get file: "+ req.params.file);
    var pathfile = path.join(__dirname, DIR, req.params.file);
    console.log("pathfile: "+ pathfile);
    if(fs.existsSync(pathfile)){
        db.readfile(req.params.file, function(data){
            res.set('Content-Type', data.mimetype);
            res.set('Uploaded-Date', data.uploadDate);
            res.download(pathfile, data.filename, function(err){
                if (err) {
                   console.log(err);
                  }
            });
        });
    }
});

 app.listen(PORT, function () {
    console.log('Node.js server is running on port ' + PORT);
  });