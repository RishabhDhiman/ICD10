const express = require("express");
const bodyParser = require("body-parser");
var app = express();
var fs = require("fs");
const got = require("got");
var request = require("sync-request");
app.use(bodyParser.json());
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var ArrayList = require("arraylist");
const { Logger } = require("mongodb");
var address = new ArrayList();
var zx = 0;
var count = 1;
var file = 0;
var previous = "";
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(process.env.PORT || 3003);
subCategory();
var abc;
var jIndex;
var json;

var fileName;
function subCategory() {
  abc = 0;


  jIndex = 18;

  fileName = "S00-T88.json";

  var fileContent = fs.readFileSync("data.json");
  var stringContent = fileContent.toString();
  var json = JSON.parse(stringContent);
  var categoryName = json.ICD10CM.chapter[jIndex].desc.substring(json.ICD10CM.chapter[jIndex].desc.lastIndexOf(" ") + 1) + " " + json.ICD10CM.chapter[jIndex].desc.substring(0, json.ICD10CM.chapter[jIndex].desc.lastIndexOf(" ") - 1)
  //var array = json.ICD10CM.chapter[jIndex].sectionIndex.sectionRef;
  var array = json.ICD10CM.chapter[jIndex].section;
  if (array instanceof Array) {
    for (z in array) {
      var mItem = {};
      mItem["category"] = categoryName;
      mItem["subCat"] = array[z].desc.substring(array[z].desc.indexOf("(")+1,array[z].desc.indexOf(")")) + " " + array[z].desc.substring(0,array[z].desc.indexOf("(")-1);
      var subCat = json.ICD10CM.chapter[jIndex].section[z].diag;
      if (subCat != null) {
        if (subCat instanceof Array) {
          insertIntoDb(mItem, subCat, true);
        }
        else {
          insertIntoDbNonArray(mItem, subCat, true);
        }
      }
    }
  }
  else {
    var mItem = {};
    mItem["category"] = categoryName;
    mItem["subCat"] = array["-first"] + "-" + array["-last"] + " " + array["#text"].trim();
    var subCat = json.ICD10CM.chapter[jIndex].section.diag;
    if (subCat != null) {
      if (subCat instanceof Array) {
        insertIntoDb(mItem, subCat, true);
      }
      else {
        insertIntoDbNonArray(mItem, subCat, true);
      }
    }
  }
  fs.appendFileSync(fileName, "]", (err) => {
    if (err) {
      console.log("Failed");
      return;
    }
    console.log("Inserted");
  });

  console.log("completed");
  sub2Category();
}

function insertIntoDb(mItem, subCat, run) {
  for (k in subCat) {
    mItem["disease"] = subCat[k].name + " " + subCat[k].desc;
    if (run) {
      mItem["url"] = "https://www.icd10data.com/ICD10CM/Codes/A00-B99/" + mItem.subCat.substring(0, mItem.subCat.indexOf(" ")) + "/" + mItem.disease
        .substring(0, mItem.disease.indexOf(" ")) + "-/";
      previous = mItem["url"];
    }
    else {
      mItem["url"] = previous + mItem.disease.substring(0, mItem.disease.indexOf(" ")) + "/"
    }
    subSubCategory(mItem);
    zx++;
    if (subCat[k].diag != null) {
      if (subCat[k].diag instanceof Array) {
        insertIntoDb(mItem, subCat[k].diag, false);
      }
      else {
        insertIntoDbNonArray(mItem, subCat[k].diag, false);
      }
    }
  }
}


function insertIntoDbNonArray(mItem, subCat, run) {
  mItem["disease"] = subCat.name + " " + subCat.desc;
  if (mItem["disease"] == "Y36.6 War operations involving biological weapons") {
    console.log("de");
  }
  if (run) {
    mItem["url"] = "https://www.icd10data.com/ICD10CM/Codes/A00-B99/" + mItem.subCat.substring(0, mItem.subCat.indexOf(" ")) + "/" + mItem.disease.substring(0, mItem.disease.indexOf(" ")) + "-/";
    previous = mItem["url"];
  }
  else {
    mItem["url"] = previous + mItem.disease.substring(0, mItem.disease.indexOf(" ")) + "/"
  }
  subSubCategory(mItem);
  zx++;
  if (subCat.diag != null) {
    if (subCat.diag instanceof Array) {
      insertIntoDb(mItem, subCat.diag, false);
    }
    else {
      insertIntoDbNonArray(mItem, subCat.diag, false);
    }
  }
}

function subSubCategory(mItem) {
  // var res = request("GET", mItem.url);
  //var site = new JSDOM(res.getBody().toString());
  //var items = site.window.document.getElementsByClassName("body-content")
  //var key = "";
  mItem["description"] = "";
  /*for (i in items) {
    for (j in items[i].childNodes) {
      if (items[i].childNodes[j].innerHTML != null) {
        var html = items[i].childNodes[j].innerHTML;
        if (html.trim() == "Clinical Information") {
          for (let step = parseInt(j) + 1; j < items[i].childNodes; step++) {
            if (items[i].childNodes[step].innerHTML != null) {
              mItem["description"] = mItem["description"] + "<p>" + html.trim() + "</p><ul>" + items[i].childNodes[step].innerHTML + "</ul>";
              break;
            }
          }
        }
        else if (html.trim().includes("<span>Applicable To</span>")) {
          mItem["description"] = mItem["description"] + html.trim().replaceAll("span","p");
        }
        else if (html.trim() == "Approximate Synonyms") {
          for (let step = parseInt(j) + 1; j < items[i].childNodes; step++) {
            if (items[i].childNodes[step].innerHTML != null) {
              mItem["description"] = mItem["description"] + "<p>" + html.trim() + "</p><ul>" + items[i].childNodes[step].innerHTML + "</ul>";
              break;
            }
          }
        }
      }
    }
  }*/
  if (zx == 0) {
    fs.appendFileSync(fileName, "[" + JSON.stringify(mItem), (err) => {
      if (err) {
        console.log("Failed");
        return;
      }
      console.log("Inserted");
    });
    console.log("Inserted " + zx);
  }
  else {
    fs.appendFileSync(fileName, "," + JSON.stringify(mItem), (err) => {
      if (err) {
        console.log("Failed");
        return;
      }
      console.log("Inserted");
    });
  }
  console.log("Inserted " + zx);
}





function sub2Category() {
  var fileContent = fs.readFileSync(fileName);
  var stringContent = fileContent.toString();
  json = JSON.parse(stringContent);

  var z = 11000;
  abc = z;
function f() {
    setTimeout(()=>{
    subSub2Category(json[z].url, z);
    if (z++ < json.length)
      setImmediate(f);
    else {
      console.log("completed");
    }
    },500);
    
  } f();
}

function subSub2Category(url, index) {


  var fileContent = fs.readFileSync(fileName);
  var stringContent = fileContent.toString();
  json = JSON.parse(stringContent);

  var res = request("GET", url);
  var site = new JSDOM(res.getBody().toString(), { runScripts: "outside-only" });
  var items = site.window.document.getElementsByClassName("body-content");
  for (i in items) {
    for (j in items[i].childNodes) {
      if (items[i].childNodes[j].innerHTML != null) {
        var html = items[i].childNodes[j].innerHTML;
        if (html.trim() == "Clinical Information") {
          for (let step = parseInt(j) + 1; j < items[i].childNodes; step++) {
            if (items[i].childNodes[step].innerHTML != null) {
              json[index].description = json[index].description + "<p>" + html.trim() + "</p><ul>" + items[i].childNodes[step].innerHTML + "</ul>";
              break;
            }
          }
        }
        else if (html.trim().includes("<span>Applicable To</span>") && html.trim().indexOf("<span>Applicable To</span>") == 0) {
          json[index].description = json[index].description + html.trim().replace(/span/g, "p");
        }
        else if (html.trim() == "Approximate Synonyms") {
          for (let step = parseInt(j) + 1; j < items[i].childNodes; step++) {
            if (items[i].childNodes[step].innerHTML != null) {
              json[index].description = json[index].description + "<p>" + html.trim() + "</p><ul>" + items[i].childNodes[step].innerHTML + "</ul>";
              break;
            }
          }
        }
      }
    }
  }
  fs.writeFileSync(fileName, JSON.stringify(json), (err) => {
    if (err) {
      console.log("Failed");
      return;
    }
    console.log("Inserted");
  });
  site = null;
  items = null;
  console.log("Inserted " + abc + "/" + zx);
  abc++;
}
