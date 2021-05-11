/**TODO:
 *      >Fix contents table
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

let styles = document.createElement('link');
styles.rel = 'stylesheet';
styles.href = '//en.wikipedia.org/w/load.php?lang=en&modules=ext.cite.styles%7Cext.discussionTools.init.styles%7Cext.uls.interlanguage%7Cext.visualEditor.desktopArticleTarget.noscript%7Cext.wikimediaBadges%7Coojs-ui.styles.icons-moderation%7Cskins.vector.styles.legacy%7Cwikibase.client.init&only=styles&skin=vector';
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
    let headhtml = $($.parseHTML(based(response.parse.headhtml['*'])));
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
        $("head").append(headhtml);
        $("body").append(htmlString);
    }
}

function based(str) {
    while(str.indexOf('"/w/') !== -1) {
        let str1 = str.substring(0, str.indexOf('"/w/') + 1);
        let str2 = str.substring(str.indexOf('"/w/') + 1);
        str = str1 + "//en.wikipedia.org" + str2;
    }
    return str;
}

function isShort(html) {
    let count = 0;
    html.find("a[href*='/wiki/']").each(function (){count++;});
    return count < 12;
}

function prune(html) { //TODO: see top list
    html.find("table[class*='ambox']").remove();
    html.find("div[class*='asbox']").remove();
    html.find("span[class*='editsection']").remove();
    html.find("span[class*='toctogglespan']").remove();
    let children = html[0].childNodes
    for(let h = 0; h < children.length; h++) {
        try {
            if(children[h].outerHTML.indexOf('<h2>') === 0) {
                console.log(children[h].childNodes[0].id);
                if(children[h].childNodes[0].id === 'See_also') delete children[h];
                if(children[h].childNodes[0].id === 'Notes') delete children[h];
                if(children[h].childNodes[0].id === 'References') delete children[h];//TODO: figure  out how to deleteeeeeeeee
                if(children[h].childNodes[0].id === 'Further_reading') delete children[h];
                if(children[h].childNodes[0].id === 'External_links') delete children[h];
                console.log(children[h].childNodes[0].id);
            }
        } catch {}

    }
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


