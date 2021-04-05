var jQueryScript = document.createElement('script');
jQueryScript.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js";
document.head.appendChild(jQueryScript);


let randPage = 'Main Page';
let apiEndpoint = "https://en.wikipedia.org/w/api.php";
let params = "action=query&list=random&rnlimit=1&rnnamespace=0&format=json";

let rand = function(response) {
    randPage = response.query.random[0].title;
}

let parser = function(response) {
    let htmlString = response.parse.text['*'];
    $("body").append($($.parseHTML(htmlString.trim())));
}

function loadScript(url) {
    return new Promise(function(resolve, reject) {
        let script = document.createElement("script"); // Dynamically create a "script" tag
        script.src = url; // Point to the query string
        script.onload = () => resolve(script);
        script.onerror = () => reject(new Error(`Script load error for ${url}`));
        document.body.appendChild(script); // Add the script tag to the document
    })
}

loadScript(apiEndpoint + "?" + params + "&callback=rand")
    .then(function(script) {
        let url = "https://en.wikipedia.org/w/api.php?" +
            new URLSearchParams({
                action: "parse",
                page: randPage,
                format: "json",
            });
        return loadScript(url + '&callback=parser')
    });


