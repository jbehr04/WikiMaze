let styles = document.createElement('link');
styles.rel = 'stylesheet';
styles.href = '//en.wikipedia.org/w/load.php?lang=en&modules=ext.cite.styles%7Cext.discussionTools.init.styles%7Cext.uls.interlanguage%7Cext.visualEditor.desktopArticleTarget.noscript%7Cext.wikimediaBadges%7Coojs-ui.styles.icons-moderation%7Cskins.vector.styles.legacy%7Cwikibase.client.init&only=styles&skin=vector';
document.head.appendChild(styles);

let randPage = 'Main Page';
let apiEndpoint = "https://en.wikipedia.org/w/api.php";
let params = "action=query&list=random&rnlimit=11&rnnamespace=0&format=json";
let randResp = ['penis muncher', 'beans', 'lmao'];
let randIndex = 0;

let isFirst = true;
let clicks = 0;
let time = 0;
let destination;

let rand = function(response) {
    randPage = response.query.random[0].title;
    randResp = response.query.random;
    destination = response.query.random[10].title;
    randIndex++;
}

let parser = function(response) {
    let htmlString = $($.parseHTML(response.parse.text['*']));
    let headhtml = $($.parseHTML(based(response.parse.headhtml['*'])));
    htmlString = prune(htmlString);
    if(isShort(htmlString) && isFirst) {
        randPage = randResp[randIndex].title;
        console.log(randPage);
        if(randIndex === 9) {
            throw new Error('Random page limit reached. Something has probably gone wrong.')
        }
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
        isFirst = false;
        $("#cpage").text(response.parse.title)
        $(".wikipage").append(`<h1 id="firstHeading" class="firstHeading">${response.parse.title}</h1>
                               <div id="siteSub" class="noprint">From Wikipedia, the free encyclopedia</div>`).append(htmlString).append('<span class="spacer"></span>');
        $("head").append(headhtml);
        listeners()
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

function prune(html) {
    html.find(".reference").remove();
    html.find("table[class*='ambox']").remove();
    html.find("div[class*='asbox']").remove();
    html.find("span[class*='editsection']").remove();
    html.find("span[class*='toctogglespan']").remove();
    html.find('h2 span#See_also').parent().nextAll().remove().end().remove();
    html.find('h2 span#Notes').parent().nextAll().remove().end().remove();
    html.find('h2 span#References').parent().nextAll().remove().end().remove();
    html.find('h2 span#Further_reading').parent().nextAll().remove().end().remove();
    html.find('h2 span#External_links').parent().nextAll().remove().end().remove();
    html.find('h2 span#Bibliography').parent().nextAll().remove().end().remove();
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

function listeners() {
    $('a:not([href*="/wiki/"])').click(function(e) {
        e.preventDefault();
        if($(this).attr('href').indexOf('#') === 0) {
            $(this).unbind('click').click();
        }
    });
    $('a[href*="/wiki/"]').click(function(e) {
        e.preventDefault();
        $("#clicker").text(++clicks);
        let page = $(this).attr('href').substring(6);
        let url = "https://en.wikipedia.org/w/api.php?" +
            new URLSearchParams({
                action: "parse",
                page: page,
                format: "json",
                prop: "text|headhtml",
            });
        $('h1#firstHeading').remove();
        $('div#siteSub').remove();
        $('div.mw-parser-output').remove();
        loadScript(url + '&callback=parser');
    });
}

loadScript(apiEndpoint + "?" + params + "&callback=rand")
    .then(function(script) {
        $("#dpage").text(destination);//add destination page to bar
        let mins = 0;
        let secs = 0;
        let minsString = "00";
        let secsString = "00";//initialize timer
        setInterval(() => {
            if(secs === 60) {
                mins++;
                secs = 0;
            }
            minsString = (mins < 10) ? "0" + mins : secs;
            secsString = (secs < 10) ? "0" + secs : secs;
            $("#time").text(minsString + ":" + secsString);
            secs++;
        }, 1000);
    })
    .then(function(script) {//wait for first script to load
        let url = "https://en.wikipedia.org/w/api.php?" +
            new URLSearchParams({
                action: "parse",
                page: randPage,
                format: "json",
                prop: "text|headhtml",
            });
        return loadScript(url + '&callback=parser');
    });