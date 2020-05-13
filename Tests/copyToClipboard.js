describe("#Copy password to clipboard", () => {
    it("should copy the selected password to the clipboard", function(done) {





    });
})




const copyToClipboard = (id) => {
    const toCopy = document.createElement('textarea');

    toCopy.value = id.parentElement.parentElement.children[1].title;
    document.body.appendChild(toCopy);
    toCopy.select();
    document.execCommand('copy');
    document.body.removeChild(toCopy);
};