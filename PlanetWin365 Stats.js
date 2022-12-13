// ==UserScript==
// @name         PlanetWin365 Stats
// @namespace    https://s5.sir.sportradar.com/planetwin365hosted/it/1
// @version      0.2
// @description  try to take over the world!
// @author       You
// @match        https://s5.sir.sportradar.com/planetwin365hosted/it/1
// @icon         https://www.planetwin365.it/App_Themes/PlanetWin365ITVU/Images/Icons/favicon.ico
// @grant        none
// ==/UserScript==


// test per Davide
let Davide
let navbar = document.getElementsByClassName("row buttons flex-items-xs-middle flex-xs-nowrap");
let bloccoMio;
let tabella;
let arrayRighe = [];

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';


setTimeout(() => {
var imported = document.createElement('script');
imported.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
document.head.appendChild(imported);
  navbar[0].appendChild(createButton());
}, 1000)


function createButton() {
  let button = document.createElement("button");
  button.className = "btn btn-default mobile-width-100 tablet-width-auto";
  button.innerText = "Statistiche";
  button.addEventListener("click", grabbiamo);
  return button;
}


let nazioni = ["Austria", "Croazia", "Francia", "Germania", "Inghilterra", "Irlanda del Nord", "Italia", "Olanda", "Repubblica Ceca", "Scozia", "Spagna", "Svizzera"];
let linkPag2 = [];


let link = [
    // "https://s5.sir.sportradar.com/planetwin365hosted/it/season/93741", //Premier League
    // "https://s5.sir.sportradar.com/planetwin365hosted/it/season/93753", //Bundesliga
    // "https://s5.sir.sportradar.com/planetwin365hosted/it/season/94215", //LaLiga
    // "https://s5.sir.sportradar.com/planetwin365hosted/it/season/94203", //Serie A
    // "https://s5.sir.sportradar.com/planetwin365hosted/it/season/94033", //Liga 1
    // "https://s5.sir.sportradar.com/planetwin365hosted/it/1/season/94217", //Austria
    // "https://s5.sir.sportradar.com/planetwin365hosted/it/1/season/94283", //Croazia
    // "https://s5.sir.sportradar.com/planetwin365hosted/it/1/season/94691", //Irlanda del Nord
    // "https://s5.sir.sportradar.com/planetwin365hosted/it/1/season/94439", //Olanda
    // "https://s5.sir.sportradar.com/planetwin365hosted/it/1/season/94281", //Rep Ceca
    // "https://s5.sir.sportradar.com/planetwin365hosted/it/1/season/93979", //Scozia
    // "https://s5.sir.sportradar.com/planetwin365hosted/it/1/season/94261", //Svizzera1
    // "https://s5.sir.sportradar.com/planetwin365hosted/it/1/season/94667" //Svizzera2
]



async function grabbiamo() {
    prendiLinkPerNazione();
}

async function scrapeData(){
  for (let x = 0; x < link.length; x++) {
    openAndPush(link[x]);
    await new Promise(resolve => setTimeout(resolve, 4000));
  }
  downloadAsExcel();
}


function sleep(fn, parameters) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(fn(parameters)), 4000);
  });
}

function openAndPush(url) {
  const newPage = window.open(url, "_blank");
  sleep(grab, newPage);
}

function openAndTakeCampionato(url) {
  const newPageLink = window.open(url, "_blank");
  sleep(grabLinkCampionato, newPageLink);
}

function prendiLinkPerNazione(){
  let linkPag1 = document.getElementsByClassName("list-group-item");
  for (let i = 0; i < linkPag1.length; i++) {
    if(nazioni.includes(linkPag1[i].text))
    linkPag2.push(linkPag1[i].href);
  }
  prendiLinkPerCampionato();
}

async function prendiLinkPerCampionato()
{
  for (let x = 0; x < linkPag2.length; x++) {
    openAndTakeCampionato(linkPag2[x]);
    await new Promise(resolve => setTimeout(resolve, 4000));
  }
  
  scrapeData()
  
}

async function grabLinkCampionato(webpage) {
  await webpage.document.readyState === 'complete'
  if (webpage.document.readyState === 'complete'){
      let nazione = webpage.document.getElementsByClassName("padding-top  text-uppercase size-m")[0].children[4].textContent;
      let campionati = webpage.document.getElementsByClassName("list-group-item");
      link.push(campionati[0].href);
      if(nazione == "Svizzera")
      link.push(campionati[1].href);
      webpage.close();
  }  
}




async function grab(webpage) {
    await webpage.document.readyState === 'complete'
    if (webpage.document.readyState === 'complete'){
        
        let tutti_i_blocchi = webpage.document.getElementsByClassName("col-xs-12");
        
        //mi seleziono il blocco under ed over
        for(let i = 0; i<tutti_i_blocchi.length; i++){
            if(tutti_i_blocchi[i].innerText == "Under/Over")
            bloccoMio = tutti_i_blocchi[i].parentElement.parentElement.parentElement.parentElement.parentElement;
        }

        //mi salvo la tabella
        tabella = bloccoMio.getElementsByClassName("table table-condensed")[0];
        let btn_dove = bloccoMio.getElementsByClassName("OVERUNDER text-center")
        
        //prendo gli over 2,5
        for(let x = 0; x < 3; x++){
          btn_dove[x].children[0].click()
          //mi prendo solo le righe > 80%
          for(let i = 0; i<tabella.children[1].childElementCount; i++){
            let numero = parseFloat(tabella.getElementsByClassName("hidden-xs-up visible-md-up")[i].textContent);
            if(numero >= 80)
            arrayRighe.push({
                Nazione: webpage.document.getElementsByClassName("padding-top  text-uppercase size-m")[0].children[4].textContent,
                Campionato: webpage.document.getElementsByClassName("padding-bottom size-xl cursor-pointer")[0].textContent.substring(0, (webpage.document.getElementsByClassName("padding-bottom size-xl cursor-pointer")[0].textContent.length-6)),
                Squadra: tabella.getElementsByClassName("hidden-xs-up visible-md-up")[i].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[2].textContent,
                Giocate: tabella.getElementsByClassName("hidden-xs-up visible-md-up")[i].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[3].textContent,
                Percentuale: tabella.getElementsByClassName("hidden-xs-up visible-md-up")[i].textContent+"%",
                Over: webpage.document.getElementById("dropDownSelector").innerText,
                Dove: btn_dove[x].textContent
            });
          }
        }

        //prendo gli over 1,5
        let ov15 = bloccoMio.getElementsByClassName("col-xs flex-xs-no-grow");
        ov15[0].click();

        for(let x = 0; x < 3; x++){
          btn_dove[x].children[0].click()

          //mi prendo solo le righe > 80%
          for(let i = 0; i<tabella.children[1].childElementCount; i++){
            let numero = parseFloat(tabella.getElementsByClassName("hidden-xs-up visible-md-up")[i].textContent);
            if(numero >= 80)
            arrayRighe.push({
                Nazione: webpage.document.getElementsByClassName("padding-top  text-uppercase size-m")[0].children[4].textContent,
                Campionato: webpage.document.getElementsByClassName("padding-bottom size-xl cursor-pointer")[0].textContent.substring(0, (webpage.document.getElementsByClassName("padding-bottom size-xl cursor-pointer")[0].textContent.length-6)),
                Squadra: tabella.getElementsByClassName("hidden-xs-up visible-md-up")[i].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[2].textContent,
                Giocate: tabella.getElementsByClassName("hidden-xs-up visible-md-up")[i].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[3].textContent,
                Percentuale: tabella.getElementsByClassName("hidden-xs-up visible-md-up")[i].textContent+"%",
                Over: webpage.document.getElementById("dropDownSelector").innerText,
                Dove: btn_dove[x].textContent
            });
          }
        }
      webpage.close();
    }  
}


function downloadAsExcel(){
  const worksheet = XLSX.utils.json_to_sheet(arrayRighe);
  const workbook = {
    Sheets: {
      'Statistiche': worksheet
    },
    SheetNames : ['Statistiche']
  };
  const excelBuffer = XLSX.write(workbook,{bookType:'xlsx', type:'array'});
  saveAsExcel(excelBuffer, 'Statistiche PlanetWin365 ')
}

function saveAsExcel (buffer, filename){
  const data = new Blob ([buffer], {type: EXCEL_TYPE});
  let d = new Date ()
  let datacompleta = d.getDate().toString() + '-' + (d.getMonth()+1).toString() + '-' + d.getFullYear().toString()
  saveAs(data, filename + datacompleta + EXCEL_EXTENSION)
}
  

//FILESAVER

/*
* FileSaver.js
* A saveAs() FileSaver implementation.
*
* By Eli Grey, http://eligrey.com
*
* License : https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md (MIT)
* source  : http://purl.eligrey.com/github/FileSaver.js
*/

// The one and only way of getting global scope in all environments
// https://stackoverflow.com/q/3277182/1008999
var _global = typeof window === 'object' && window.window === window
  ? window : typeof self === 'object' && self.self === self
  ? self : typeof global === 'object' && global.global === global
  ? global
  : this

function bom (blob, opts) {
  if (typeof opts === 'undefined') opts = { autoBom: false }
  else if (typeof opts !== 'object') {
    console.warn('Deprecated: Expected third argument to be a object')
    opts = { autoBom: !opts }
  }

  // prepend BOM for UTF-8 XML and text/* types (including HTML)
  // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
  if (opts.autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
    return new Blob([String.fromCharCode(0xFEFF), blob], { type: blob.type })
  }
  return blob
}

function download (url, name, opts) {
  var xhr = new XMLHttpRequest()
  xhr.open('GET', url)
  xhr.responseType = 'blob'
  xhr.onload = function () {
    saveAs(xhr.response, name, opts)
  }
  xhr.onerror = function () {
    console.error('could not download file')
  }
  xhr.send()
}

function corsEnabled (url) {
  var xhr = new XMLHttpRequest()
  // use sync to avoid popup blocker
  xhr.open('HEAD', url, false)
  try {
    xhr.send()
  } catch (e) {}
  return xhr.status >= 200 && xhr.status <= 299
}

// `a.click()` doesn't work for all browsers (#465)
function click (node) {
  try {
    node.dispatchEvent(new MouseEvent('click'))
  } catch (e) {
    var evt = document.createEvent('MouseEvents')
    evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80,
                          20, false, false, false, false, 0, null)
    node.dispatchEvent(evt)
  }
}

// Detect WebView inside a native macOS app by ruling out all browsers
// We just need to check for 'Safari' because all other browsers (besides Firefox) include that too
// https://www.whatismybrowser.com/guides/the-latest-user-agent/macos
var isMacOSWebView = /Macintosh/.test(navigator.userAgent) && /AppleWebKit/.test(navigator.userAgent) && !/Safari/.test(navigator.userAgent)

var saveAs = _global.saveAs || (
  // probably in some web worker
  (typeof window !== 'object' || window !== _global)
    ? function saveAs () { /* noop */ }

  // Use download attribute first if possible (#193 Lumia mobile) unless this is a macOS WebView
  : ('download' in HTMLAnchorElement.prototype && !isMacOSWebView)
  ? function saveAs (blob, name, opts) {
    var URL = _global.URL || _global.webkitURL
    var a = document.createElement('a')
    name = name || blob.name || 'download'

    a.download = name
    a.rel = 'noopener' // tabnabbing

    // TODO: detect chrome extensions & packaged apps
    // a.target = '_blank'

    if (typeof blob === 'string') {
      // Support regular links
      a.href = blob
      if (a.origin !== location.origin) {
        corsEnabled(a.href)
          ? download(blob, name, opts)
          : click(a, a.target = '_blank')
      } else {
        click(a)
      }
    } else {
      // Support blobs
      a.href = URL.createObjectURL(blob)
      setTimeout(function () { URL.revokeObjectURL(a.href) }, 4E4) // 40s
      setTimeout(function () { click(a) }, 0)
    }
  }

  // Use msSaveOrOpenBlob as a second approach
  : 'msSaveOrOpenBlob' in navigator
  ? function saveAs (blob, name, opts) {
    name = name || blob.name || 'download'

    if (typeof blob === 'string') {
      if (corsEnabled(blob)) {
        download(blob, name, opts)
      } else {
        var a = document.createElement('a')
        a.href = blob
        a.target = '_blank'
        setTimeout(function () { click(a) })
      }
    } else {
      navigator.msSaveOrOpenBlob(bom(blob, opts), name)
    }
  }

  // Fallback to using FileReader and a popup
  : function saveAs (blob, name, opts, popup) {
    // Open a popup immediately do go around popup blocker
    // Mostly only available on user interaction and the fileReader is async so...
    popup = popup || open('', '_blank')
    if (popup) {
      popup.document.title =
      popup.document.body.innerText = 'downloading...'
    }

    if (typeof blob === 'string') return download(blob, name, opts)

    var force = blob.type === 'application/octet-stream'
    var isSafari = /constructor/i.test(_global.HTMLElement) || _global.safari
    var isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent)

    if ((isChromeIOS || (force && isSafari) || isMacOSWebView) && typeof FileReader !== 'undefined') {
      // Safari doesn't allow downloading of blob URLs
      var reader = new FileReader()
      reader.onloadend = function () {
        var url = reader.result
        url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, 'data:attachment/file;')
        if (popup) popup.location.href = url
        else location = url
        popup = null // reverse-tabnabbing #460
      }
      reader.readAsDataURL(blob)
    } else {
      var URL = _global.URL || _global.webkitURL
      var url = URL.createObjectURL(blob)
      if (popup) popup.location = url
      else location.href = url
      popup = null // reverse-tabnabbing #460
      setTimeout(function () { URL.revokeObjectURL(url) }, 4E4) // 40s
    }
  }
)

_global.saveAs = saveAs.saveAs = saveAs

if (typeof module !== 'undefined') {
  module.exports = saveAs;
}
