describe("#Filter through the table", () => {
    it("should show us the  website with the keyword from search", done => {


        let search = function() {

            let search_text = "f";
            let table = ["www.facebook.com", "www.example.com", "www.fixitfelix.com"];
            let a = table; //let a be all rows



            for (i = 0; i < a.length; i++) {
                let specific_value = a[i]; // specifi what we want to compare


                if (specific_value.indexOf(search_text)) {
                    console.log(specific_value);
                }

            }


        }
    });
});