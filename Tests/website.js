describe("#Filter through the table", () => {
    it("should show us the  website with the keyword from search", function(done) {
        let search_text = "f";
        let table = ["www.facebook.com"];
        let a = table; //let a be all rows

        for (let i = 0; i < a.length; i++) {
            let specific_value = a[i]; // specify what we want to compare

            if (specific_value.indexOf(search_text)) {
                done()
            } else {}
        }
    });
});