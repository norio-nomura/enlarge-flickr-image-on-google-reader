/*

The MIT License

Copyright (c) 2010 Norio Nomura

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

var largerImages = {};

document.addEventListener("beforeload", handleBeforeLoadEvent, true);
if (typeof(safari) != "undefined") {
    safari.self.addEventListener("message", replaceImgSrc, true);
}

function handleBeforeLoadEvent(messageEvent) {
    var element = messageEvent.target;
    if (element.nodeName === "IMG" && element.src.search(/http:\/\/.*.flickr\.com\/.*_m\.jpg$/i) != -1) {
        if (element.hasAttribute("height")) element.removeAttribute("height");
        element.setAttribute("width", "100%");
        if (element.src in largerImages) {
            element.src = largerImages[element.src].newSrc;
        } else {
            largerImages[element.src] = {"element":element};
            if (typeof(safari) != "undefined") {
                safari.self.tab.dispatchMessage("Enlarge", element.src);
            } else if (typeof(chrome) != "undefined") {
                chrome.extension.sendRequest({"name":"Enlarge", "message":element.src}, replaceImgSrc);
            }
        }
    }
}

function replaceImgSrc(event) {
    var largerImage = largerImages[event.name];
    largerImage.newSrc = event.message;
    largerImage.element.src = event.message;
    largerImage.element = null;
}