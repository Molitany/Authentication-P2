const crypto = require('crypto');
const hash = crypto.createHash('sha256');

function Feistal(password) {
    const XORBuffer = (buffer1, buffer2) => {
        let len = Math.max(buffer1.length, buffer1.length);
        let result = Buffer.allocUnsafe(len)

        for (let i = 0; i < len; i++) {
            result[i] = buffer1[i] ^ buffer2[i]
        }

        return result
    }
    split = [password.slice(0, password.length / 2), password.slice(password.length / 2, password.length)];
    let l1, r1, l2, r2;
    l1 = Buffer.from(split[0]).toString('hex');
    r1 = Buffer.from(split[1]).toString('hex');
    l2 = r1;
    r2 = XORBuffer(Buffer.from(l1, 'hex'), hash.copy().update(Buffer.from(r1, 'hex')).digest('hex')).toString('hex');
    console.log({ r1, l1 });
    console.log({ r2, l2 });

    return r2 + l2
}

function ReverseFeistal(password) {
    const XORBuffer = (buffer1, buffer2) => {
        let len = Math.max(buffer1.length, buffer1.length);
        let result = Buffer.allocUnsafe(len)

        for (let i = 0; i < len; i++) {
            result[i] = buffer1[i] ^ buffer2[i]
        }

        return result
    }
    split = [password.slice(0, password.length / 2 - 1), password.slice(password.length / 2 - 1, password.length)];
    let l1, r1, l2, r2;
    l1 = split[0];
    r1 = split[1];
    l2 = r1;
    r2 = XORBuffer(Buffer.from(l1, 'hex'), hash.copy().update(Buffer.from(r1, 'hex')).digest('hex')).toString('hex');
    console.log({ r1, l1 });
    console.log({ r2, l2 });

    return r2 + l2
}

console.log(Buffer.from(ReverseFeistal(Feistal("Lul We One Of Those XDs")), 'hex').toString());
