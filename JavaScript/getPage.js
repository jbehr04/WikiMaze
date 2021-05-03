/**TODO:
 *      >Fix contents table
 *      >Remove tone tag
 *      >Remove edit tags
 *      >Remove bottom links:
 *          -See also
 *          -External Links
 *          -References
 *          -Other Sources
 *          -Appendices
 *      >Link changing
**/

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
let params = "action=query&list=random&rnlimit=10&rnnamespace=0&format=json";
let randResp = ['penis muncher', 'beans', 'lmao'];
let randIndex = 0;

let rand = function(response) {
    randPage = response.query.random[0].title;
    randResp = response.query.random;
    randIndex++;
}

let parser = function(response) {
    let htmlString = $($.parseHTML(response.parse.text['*']));
    let headhtml = response.parse.headhtml['*'];
    htmlString = prune(htmlString);
    if(isShort(htmlString)) {
        randPage = randResp[randIndex].title;
        console.log(randPage);
        randIndex++;
        let url = "https://en.wikipedia.org/w/api.php?" +
            new URLSearchParams({
                action: "parse",
                page: randPage,
                format: "json",
                prop: "text|headhtml",
            });
        loadScript(url + "&callback=parser");
    } else {
        $("body").append(`<h1 id="firstHeading" class="firstHeading">${randPage}</h1>`);
        $("body").append('<div id="siteSub" class="noprint">From Wikipedia, the free encyclopedia</div>');
        $("head").append($($.parseHTML(headhtml.trim())));
        document.querySelector('link[href="/static/favicon/wikipedia.ico"]').remove();
        $("body").append($($.parseHTML(htmlString.trim())));
    }
}

function isShort(html) { //TODO: Make this work with html object
    let count = 0;
    let str = html;
    while(str.indexOf('<a href="/wiki/') !== str.lastIndexOf('<a href="/wiki/')) {
        count++;
        let sub = str.substring((str.indexOf('<a href="/wiki/')));
        str = sub.substring(sub.indexOf('</a>') + 4);
    }
    return count < 12;
}

function prune(html) { //TODO: see top list
    html.filter(':contains("ambox")').remove();
    html.filter(':contains("asbox")').remove();
    return html;
}

function loadScript(url) {
    return new Promise(function(resolve, reject) {
        let script = document.createElement("script"); // Dynamically create a "script" tag
        script.src = url; // Point to the query string
        document.body.appendChild(script); // Add the script tag to the document
        script.onload = () => resolve(script);
        script.onerror = () => reject(new Error(`Script load error for ${url}`));
    })
}

loadScript(apiEndpoint + "?" + params + "&callback=rand")
    .then(function(script) {//wait for first script to load
        let url = "https://en.wikipedia.org/w/api.php?" +
            new URLSearchParams({
                action: "parse",
                page: randPage,
                format: "json",
                prop: "text|headhtml",
            });
        return loadScript(url + '&callback=parser');
    })


