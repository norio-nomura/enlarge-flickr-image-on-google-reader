/*

 The MIT License

 Copyright (c) 2011 Norio Nomura

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

if (window.top === window) {

  var largerSrcs = {};

  function replaceElementSrc(element, largerSrc) {
    if (largerSrc.isVideo) {
      var re = /^(.*\/stewart\.swf\?v=71377)&(.*)$/;
      var srcs = re.exec(largerSrc.newSrc);
      if (srcs != null) {
        var embed = document.createElement("embed");
        embed.type = "application/x-shockwave-flash";
        embed.src = srcs[1] + '&flickr_show_info_box=true&hd_default=' + largerSrc.hd_default;
        embed.setAttribute("flashvars", srcs[2]);
        embed.setAttribute("height", largerSrc.newHeight);
        embed.setAttribute("width", largerSrc.newWidth);
        embed.setAttribute("allowfullscreen", "true");
        element.parentNode.parentNode.replaceChild(embed, element.parentNode);
      } else {
        var video = document.createElement("video");
        video.src = largerSrc.newSrc;
        video.setAttribute("poster", element.src);
        video.setAttribute("width", "100%");
        video.setAttribute("preload");
        video.setAttribute("autobuffer");
        video.setAttribute("controls");
        element.parentNode.parentNode.replaceChild(video, element.parentNode);
      }
    } else {
      element.src = largerSrc.newSrc;
    }
  }

  function getLargerSrc(event) {
    var element = largerSrcs[event.name].element;
    var largerSrc = event.message;
    largerSrcs[event.name] = largerSrc;
    replaceElementSrc(element, largerSrc);
  }

  function handleBeforeLoadEvent(messageEvent) {
    var element = messageEvent.target;
    if ((element.nodeName == "IMG" && messageEvent.url.search(/http:\/\/farm.*\.static\.?flickr\.com\/.*\.jpg$/i) != -1) ||
        ((element.nodeName == "OBJECT" || element.nodeName == "EMBED") && messageEvent.url.search(/http:\/\/www\.flickr\.com\/apps\/video\/stewart\.swf\?.*$/i) != -1)) {
      if (messageEvent.url in largerSrcs) {
        var largerSrc = largerSrcs[messageEvent.url];
        replaceElementSrc(element, largerSrc);
      } else {
        largerSrcs[messageEvent.url] = {"element":element};
        if (typeof(safari) != "undefined") {
          safari.self.tab.dispatchMessage("Enlarge", messageEvent.url);
        } else if (typeof(chrome) != "undefined") {
          chrome.extension.sendRequest({"name":"Enlarge", "message":messageEvent.url}, getLargerSrc);
        }
      }
      if (element.nodeName == "IMG") {
        if (element.hasAttribute("height")) {
          element.removeAttribute("height");
        }
        element.setAttribute("width", "100%");
      } else {
        messageEvent.preventDefault();
      }
    }
  }

  document.addEventListener("beforeload", handleBeforeLoadEvent, true);
  if (typeof(safari) != "undefined") {
    safari.self.addEventListener("message", getLargerSrc, true);
  }

}