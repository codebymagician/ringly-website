// Ringly Meta Pixel + helpers for ringly.in ad-landing pages.
//
// This is the RINGLY pixel and is intentionally separate from meta-pixel.js
// (window.zmeta), which carries the ZENA pixel id and belongs to the Zena
// free-trial page. Do not merge them -- they are different Meta ad accounts.
//
// The server-side Conversions API copy of the revenue event is sent by
// ringly-backend (the Purchase event on recharge) with a matching event id, so
// Meta dedupes the browser/server pair.
//
// Set PIXEL_ID to the Ringly pixel id to enable. While it is empty or still the
// REPLACE_ placeholder, every call here is a no-op (nothing is loaded, no event
// fires), so the page is safe to ship before the pixel id is provisioned.
(function () {
  var PIXEL_ID = "REPLACE_WITH_RINGLY_META_PIXEL_ID";
  var on = !!PIXEL_ID && PIXEL_ID.indexOf("REPLACE_") !== 0;

  if (on && !window.fbq) {
    var n = window.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) };
    window._fbq = n; n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
    var s = document.createElement("script");
    s.async = true; s.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(s);
    fbq("init", PIXEL_ID);
    fbq("track", "PageView");
  }

  function cookie(k) {
    var m = document.cookie.match(new RegExp("(?:^|; )" + k + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : "";
  }

  window.rmeta = {
    enabled: on,
    // _fbc/_fbp are the strongest match keys. Rebuild _fbc from the fbclid URL
    // param when the cookie has not been written yet (first landing), mirroring
    // how the Pixel itself would store it: fb.1.<ms>.<fbclid>.
    match: function () {
      var fbc = cookie("_fbc"), id = new URLSearchParams(location.search).get("fbclid");
      if (!fbc && id) fbc = "fb.1." + Date.now() + "." + id;
      return { fbc: fbc, fbp: cookie("_fbp"), fbclid: id, sourceUrl: location.href.split("#")[0] };
    },
    uuid: function () {
      return window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random().toString(16).slice(2);
    },
    // Fire a standard event. eventID lets ringly-backend send a deduped CAPI copy.
    track: function (name, eventID) {
      if (!on) return;
      try { fbq("track", name, {}, { eventID: eventID }); } catch (e) {}
    }
  };
})();
