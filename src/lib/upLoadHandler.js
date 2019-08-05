const fs = require('fs');
const multiparty = require('multiparty');
var sharp = require('sharp');
const cfg = require('./config');

const log = require('../lib/logUtil');

//Export API
const uploadHandler = module.exports = {};

function baseName(str) {
    let base = String(str).substring(str.lastIndexOf('/') + 1);
    return base;
}

// Size Conversion
function bytesToSize(bytes) {
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return 'n/a';
    let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    if (i == 0) return bytes + ' ' + sizes[i];
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}

let uuidV4 = require("uuid/v4");
let AWS = require('aws-sdk');
AWS.config.accessKeyId = 'AKIAILAFE74RD4EVVYWA';
AWS.config.secretAccessKey = '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';
AWS.config.region = 'ap-southeast-1';

// Bucket names must be unique across all S3 users

let myBucket = 'dev.landber';
let s3 = new AWS.S3();
let s3Url = 'https://s3-' + AWS.config.region + '.amazonaws.com/' + myBucket;

function uploadS3(path, key, callback) {
    fs.readFile(path, (err, data) => {
        if (err) {
            callback(err, null)
        } else {
            let key = uuidV4();
            let extensionIndex = path.lastIndexOf(".");
            key = key + path.substr(extensionIndex);
            let params = {
                Bucket: myBucket,
                Key: key,
                Body: data
            };
            s3.putObject(params, (err, data) => {
                if (err) {
                    log.info("fail to upload s3", err);
                    callback(err, null);
                } else {
                    callback(null, s3Url + "/" + key)
                }

            });
        }
    });
}
function uploadS3Small(fp, path, key, result, res) {
    sharp(fp)
        .resize(280, 160)
        .max()
        .toFile(path, function (err) {
            if (err) {
                console.log("sharp err : ", err);
                res({
                    success: false,
                    file: result
                });
            } else {
                uploadS3(path, key, function (err, s3path) {
                    if (err) {
                        res({
                            success: false,
                            file: result
                        });
                    } else {
                        console.log("---------------------------------success o upload uploadS3Small:", s3path);
                        result.url = s3path;
                        res({
                            success: true,
                            file: result
                        });
                    }
                });
            }
        });
}
uploadHandler.uploadFiles = (req, res, next) => {
    console.log(req.body);
    console.dir(req.headers)
    let form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
        if (typeof (files) === 'undefined') {
            return res.status(500).json({
                msg: 'fuck'
            })
        }


        let fp = files[Object.keys(files)[0]][0].path;
        let fn = files[Object.keys(files)[0]][0].fieldName;
        let originalFilename = files[Object.keys(files)[0]][0].originalFilename;
        if (!fn || fn === "file" || fn === "files" || fn === "image") {
            fn = fields.filename || originalFilename;
        }

        let fsize = files[Object.keys(files)[0]][0].size;
        //let newpath = __dirname + "/../../web/upload/"+fn;
        let newpath = cfg.tempFolder + "/" + fn;

        log.info('Duong dan: ' + newpath);
        let result = {
            name: fn,
            size: bytesToSize(fsize),
            showme: fields.showme,
            dwimgsrc: fields.dwimgsrc,
            dwid: fields.dwid
        };

        fs.readFile(fp, (err, data) => {

            fs.writeFile(newpath, data, (err) => {
                if (err) log.info(err);
                else {
                    uploadS3(newpath, fn[0], (err, s3path) => {
                        if (err) {
                            log.error('File upload err:  ', err);

                            res.status(400).json({
                                success: false,
                                file: result
                            })
                        } else {
                            log.info('----------------------------upload file SUCCESSFULLY')
                            result.url = s3path;
                            log.info('\x1b[32m\x1b[1m\x1b[5m%s\x1b[0m', 'File url:  '.concat(result.url));
                            res.status(200).json({
                                success: true,
                                file: result
                            })
                        }
                    });
                }
            })
        });
    });
};

uploadHandler.uploadAvatarFiles = (req, res) => {
    let form = new multiparty.Form();
    form.parse(req.payload, (err, fields, files) => {
        let newFileMaps = [];
        if (typeof (files) === 'undefined') {
            return res({
                status: 1,
                msg: 'Vui lòng thử lại'
            })
        }

        let fp = files[Object.keys(files)[0]][0].path;
        let fn = files[Object.keys(files)[0]][0].fieldName;
        let originalFilename = files[Object.keys(files)[0]][0].originalFilename;
        if (!fn || fn === "file" || fn === "files" || fn === "image") {
            fn = fields.filename || originalFilename;
        }

        let fsize = files[Object.keys(files)[0]][0].size;
        //let newpath = __dirname + "/../../web/upload/"+fn;
        let newpath = cfg.tempFolder + "/" + fn;

        log.info('Duong dan: ' + newpath);
        let result = {
            name: fn,
            size: bytesToSize(fsize),
            showme: fields.showme,
            dwimgsrc: fields.dwimgsrc,
            dwid: fields.dwid
        };

        fs.readFile(fp, (err, data) => {

            fs.writeFile(newpath, data, (err) => {
                if (err) log.info(err);
                else {
                    uploadS3Small(fp, newpath, fn[0], result, res);
                }
            })
        });
    });
};