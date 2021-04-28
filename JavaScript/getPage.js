var jQueryScript = document.createElement('script');
jQueryScript.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js";
document.head.appendChild(jQueryScript);

let baseTag = document.createElement('base');
baseTag.href = "//en.wikipedia.org";
baseTag.target = "_blank";
document.head.appendChild(baseTag);

let styles = document.createElement('link');
styles.rel = 'stylesheet';
styles.href = '/w/load.php?lang=en&modules=ext.cite.styles%7Cext.discussionTools.init.styles%7Cext.uls.interlanguage%7Cext.visualEditor.desktopArticleTarget.noscript%7Cext.wikimediaBadges%7Coojs-ui.styles.icons-moderation%7Cskins.vector.styles.legacy%7Cwikibase.client.init&only=styles&skin=vector';
document.head.appendChild(styles);

let randPage = 'Main Page';
let apiEndpoint = "https://en.wikipedia.org/w/api.php";
let params = "action=query&list=random&rnlimit=1&rnnamespace=0&format=json";

let rand = function(response) {
    randPage = response.query.random[0].title;
    let url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles=${randPage}&exchars=1550`;
    loadScript(url + '&callback=isShort');
}

let parser = function(response) {
    let htmlString = response.parse.text['*'];
    let headhtml = response.parse.headhtml['*'];
    $("head").append($($.parseHTML(headhtml.trim())));
    document.querySelector('link[href="/static/favicon/wikipedia.ico"]').remove();
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

function isShort(response) {
    for(let key in response.query.pages){
        if(response.query.pages[key].extract.contains('NewPP limit report')){}//TODO: break async function and re-call rand
    }
}

loadScript(apiEndpoint + "?" + params + "&callback=rand")
    .then(function(script) { //load title
        $("body").append(`<h1 id="firstHeading" class="firstHeading">${randPage}</h1>`);
        $("body").append('<div id="siteSub" class="noprint">From Wikipedia, the free encyclopedia</div>');
    })
    .then(function(script) {//wait for first script to load
        let url = "https://en.wikipedia.org/w/api.php?" +
            new URLSearchParams({
                action: "parse",
                page: randPage,
                format: "json",
                prop: "text|headhtml",
            });
        return loadScript(url + '&callback=parser')
    });


