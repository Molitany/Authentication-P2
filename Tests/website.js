describe("#Password handling", () => {
    it("Copy to clipboard", done => {
        const toCopy = document.createElement('textarea');

        toCopy.value = "Something that should be copied";
        document.body.appendChild(toCopy);
        toCopy.select()
        document.execCommand('copy')
        document.body.removeChild(toCopy);

        if ("Something that should be copied" === document.execCommand('paste'))
            done();
        else
            done(Error('execCommand not useable'));
    });

    it("Show hide password", done => {
        if (document.getElementById('psw').innerText === "*********") {
            document.getElementById('psw').innerText = document.getElementById('psw').title;
            if (document.getElementById('psw').innerText == "xd")
                done()
        }
    });
});

describe("#Filter through the table", () => {
    it("should show us the  website with the keyword from search", done => {
        let search_text = "f";
        let table = ["www.facebook.com", "www.apple.com", "www.wwe.com"];

        for (let i = 0; i < table.length; i++) {
            let specific_value = table[i]; // specify what we want to compare

            if (specific_value.indexOf(search_text) != -1) {
                done();
            }
        }
    });
});
