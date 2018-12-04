// Create a menu for the addon
function onOpen() {
  DocumentApp.getUi().createMenu('Link changer')
    .addItem('Start', 'showSidebar')
    .addToUi();
}

// Open the sidebar
function showSidebar() {
  var template = HtmlService.createTemplateFromFile('index');
  var html = template.evaluate().setTitle('Link changer');
  DocumentApp.getUi()
    .showSidebar(html);
}

// Find all the links and store them in an array
function findLinks(element) {
  var links = [];
  element = element || DocumentApp.getActiveDocument().getBody();

  if (element.getType() === DocumentApp.ElementType.TEXT) {
    var textObj = element.editAsText();
    var text = element.getText();
    var inUrl = false;
    for (var ch = 0; ch < text.length; ch++) {
      var url = textObj.getLinkUrl(ch);
      if (url != null) {
        if (!inUrl) {
          inUrl = true;
          var curUrl = {};
          curUrl.element = element;
          curUrl.url = String(url);
          curUrl.startOffset = ch;
        } else {
          curUrl.endOffsetInclusive = ch;
        }
      } else {
        if (inUrl) {
          inUrl = false;
          links.push(curUrl);
          curUrl = {};
        }
      }
    }
  } else {
    try {
      var numChildren = element.getNumChildren();
    } catch (e) {
      numChildren = 0;
    }
    for (var i = 0; i < numChildren; i++) {
      links = links.concat(findLinks(element.getChild(i)));
    }
  }
  return links;
}

// Replace the urls
function replaceLinks(searchPattern, replacement) {
  var searchPattern = 'www.citizensadvice.org.uk';
  var replacement = 'edit.citizensadvice.org.uk';
  var links = findLinks();
  var numChanged = 0;

  for (var l = 0; l < links.length; l++) {
    var link = links[l];
    if (link.url.match(searchPattern)) {
      var newUrl = link.url.replace(searchPattern, replacement);
      link.element.setLinkUrl(link.startOffset, link.endOffsetInclusive, newUrl);
      numChanged++
    }
  }
  return numChanged;
}

// Tell me how many urls have changed - couldn't get counting to work to work :(
function resultsShow() {
  var template = HtmlService.createTemplateFromFile('index');
  var html = template.evaluate().setTitle('Link changer');
  var full = ["<h3>I've fixed your links</h3><p>Your page is now ready to copy and paste into EPi - enjoy!</p><p>Press the 'Fix me' button to run again.</p><p><img style='width:100%' src='https://media.giphy.com/media/NodvzZJVrWgKs/giphy.gif'></p>"];

  html.append(full);
  DocumentApp.getUi()
    .showSidebar(html);
}

// Run everything
function resultsRun() {
  findLinks();
  replaceLinks();
  resultsShow();
}
