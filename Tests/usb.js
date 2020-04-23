const assert = require('assert');
const fs = require('fs');

describe("#Read File from USB", () =>{
    it('Should find the file and give an error if it does not.', function(done) {
        new Promise((resolve, reject) => {
            fs.readFile("E:\\test.key", (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(JSON.parse(data));
                }
            });
        })
        .then(done())
        .catch(err => done(err))
    });
});