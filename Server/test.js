/* Figure out how XOR works and if bignums is neccessary and if so how to convert it to a string*/
function Feistal(password) {
    function XORString(string1, string2) {
        result = '';
        for(i=0; i<string1.length; i++) {
            result += String.fromCharCode(string1[i].charCodeAt(0).toString(10) ^ string2[i].charCodeAt(0).toString(10));
        }
        return result;
    }

    split = [password.slice(0, password.length / 2), password.slice(password.length / 2, password.length)];
    let l1, r1, l2, r2;
    l1 = split[0]
    r1 = split[1]
    l2 = r1;
    r2 = XORString(r1, l1)
    console.log({ r1, l1 });
    console.log({ r2, l2 });

    console.log(StringToHex(r1), StringToHex(l1));

    return r2 + l2
}

console.log(Feistal("smile"));