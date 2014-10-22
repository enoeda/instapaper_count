
var base_url = "https://www.instapaper.com/u";
var isLogged;

function loginAndGetCount() {
    chrome.browserAction.setBadgeText({text:"-"});
    checkLogin();
    if (isLogged) {
        var num_count = countAllItems();
        setBadge(num_count);
    } else {
        chrome.browserAction.setBadgeText({text:"!"});
        chrome.browserAction.setTitle({title:"You need to log in into Instapaper to count its items."});
        chrome.tabs.create({ url: base_url });
    }
}

function getCount() {
    checkLogin();
    if (isLogged) {
        var num_count = countAllItems();
        setBadge(num_count);
    } else {
        chrome.browserAction.setBadgeText({text:"!"});
        chrome.browserAction.setTitle({title:"Click here and log in into Instapaper to count its items."});
    }
}


function checkLogin () {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", base_url, false);
    xhr.onload = checkLoggedIn;
    xhr.send(null);
}


function checkLoggedIn () {
    if (this.responseURL == base_url) {
        // logged in
        isLogged = true;
    } else {
        isLogged = false;
    }

}

function setBadge(num_count) {
    var txt_count = "" + num_count;
    if (num_count>999) {
        txt_count = "999+";
    }
    chrome.browserAction.setBadgeText({text:txt_count});
    chrome.browserAction.setTitle({title:"" + num_count + " Instapaper items (click to refresh)"});
}

function countAllItems() {
    var count = 0;
    var temp_count = 0;
    var page = "1";
    do {

        temp_count = countPageItems(page);
        count += temp_count;
        setBadge(count);

        page++;

        //console.log("ALL: result: " + temp_count + ", total: " + count);
        // if (page%2 === 0) {
        //     chrome.browserAction.setBadgeText({text:"."});
        // } else {
        //     chrome.browserAction.setBadgeText({text:"·"});
        // }
    } while (temp_count>0 && page <= 25);
    return (count);
}


function countPageItems(page) {
  var pageCount = 0;
  var xhr = new XMLHttpRequest();

  try {
    xhr.onerror = function(error) {
      console.log("err1");
      pageCount = 0;

    };

    xhr.onreadystatechange = function() {

      //console.log("Status: " + xhr.readyState + ", " + xhr.status);

      if (xhr.readyState!=4) {

      } else {

        if (xhr.responseText) {

            var matches = xhr.responseText.match(/<div class="article_preview">/g);
            if (matches) {
                pageCount = matches.length;
            } else {
                pageCount = 0;
            }
        } else {
            console.log("err3");
            pageCount = 0;
        }
      }

    };
    
    if (page > 1) {
        url = base_url + "/" + page;
    } else {
        url = base_url;
    }
    xhr.open("GET", url, false);
    xhr.send(null);
    return(pageCount);

  } catch(e) {
    console.error("Error loading Instapaper page");
  }
}
    

chrome.browserAction.onClicked.addListener(loginAndGetCount);
chrome.browserAction.setBadgeBackgroundColor({color:[100,100,100, 80]});
chrome.browserAction.setBadgeText({text:"-"});
getCount();
