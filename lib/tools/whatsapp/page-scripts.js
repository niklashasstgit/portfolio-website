/* eslint-disable */
// Ported verbatim from the standalone WhatsApp Chat Extractor, where it is
// covered by an end-to-end test suite against a mock of WhatsApp Web that
// reproduces virtualised lists and lazily loaded history.
//
// Everything below runs INSIDE the web.whatsapp.com page: Playwright
// serialises `installScraper` with .toString(), so it must stay entirely
// self-contained - no imports, no closures over module scope, no TS syntax.
/*
 * page-scripts.js
 * -----------------------------------------------------------------------------
 * Everything in here runs INSIDE the web.whatsapp.com page.
 *
 * It is used two ways, which is why it is written as one self-contained
 * function with no imports and no closure over anything outside itself:
 *
 *   1. Driver mode  - Playwright serialises `installScraper` with .toString()
 *                     and evaluates it in the page.
 *   2. Bridge mode  - this file is served verbatim to the browser at
 *                     /bridge/page-scripts.js and executed there.
 *
 * WhatsApp Web ships obfuscated class names that change every few weeks, so
 * every selector below is chosen from things that are part of the *contract*
 * with assistive tech or with copy/paste, which change far more slowly:
 *
 *   #pane-side                 the chat list scroll container
 *   div[role="listitem"]       one chat row
 *   #main                      the open conversation
 *   div[role="row"]            one message row
 *   [data-id]                  stable message id, e.g. "true_49...@c.us_3A9F"
 *   div.copyable-text          the element clipboard-copy reads
 *   [data-pre-plain-text]      "[21:34, 12/05/2024] Niklas: "   <- the gold
 *   span.selectable-text       the message body
 *
 * `data-pre-plain-text` is the single most valuable attribute on the page: it
 * is what WhatsApp itself prepends when you copy a message, so it carries the
 * timestamp and the sender name already formatted, in the user's own locale.
 * -----------------------------------------------------------------------------
 */

function installScraper() {
  if (window.__WCE && window.__WCE.__ready) return window.__WCE.version;

  var WCE = { __ready: true, version: '1.0.0' };
  window.__WCE = WCE;

  /* ------------------------------------------------------------------ utils */

  function qs(sel, root) { try { return (root || document).querySelector(sel); } catch (e) { return null; } }
  function qsa(sel, root) { try { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); } catch (e) { return []; } }
  function attr(el, name) { return el ? (el.getAttribute(name) || '') : ''; }

  /* Emoji-aware text extraction.
     WhatsApp renders emoji as <img alt="(emoji)"> and newlines as <br>, so
     innerText alone silently drops emoji and mangles multi-line messages. */
  function nodeText(node) {
    if (!node) return '';
    var out = '';
    var kids = node.childNodes;
    for (var i = 0; i < kids.length; i++) {
      var c = kids[i];
      if (c.nodeType === 3) {
        out += c.nodeValue;
      } else if (c.nodeType === 1) {
        var tag = c.tagName.toLowerCase();
        if (tag === 'img') {
          out += attr(c, 'alt') || attr(c, 'data-plain-text') || '';
        } else if (tag === 'br') {
          out += '\n';
        } else if (tag === 'style' || tag === 'script') {
          /* skip */
        } else {
          out += nodeText(c);
        }
      }
    }
    return out;
  }

  function hash(str) {
    var h = 5381, i = str.length;
    while (i) h = (h * 33) ^ str.charCodeAt(--i);
    return (h >>> 0).toString(36);
  }

  /* --------------------------------------------------------------- surfaces */

  function chatListPane() {
    return qs('#pane-side') ||
           qs('div[aria-label="Chat list"]') ||
           qs('[data-testid="chat-list"]');
  }

  function mainPanel() {
    return qs('#main') || qs('[data-testid="conversation-panel-wrapper"]');
  }

  /* Find the element that actually scrolls inside a container.
     WhatsApp nests half a dozen divs and the scroller is not the outermost,
     so pick the tallest candidate that has a real overflow style. */
  function findScroller(root) {
    if (!root) return null;
    if (root.scrollHeight > root.clientHeight + 30) {
      var rs = getComputedStyle(root);
      if (/(auto|scroll)/.test(rs.overflowY)) return root;
    }
    var best = null;
    var all = qsa('div', root);
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.clientHeight < 150) continue;
      if (el.scrollHeight <= el.clientHeight + 30) continue;
      var st = getComputedStyle(el);
      if (!/(auto|scroll)/.test(st.overflowY)) continue;
      if (!best || el.scrollHeight > best.scrollHeight) best = el;
    }
    return best;
  }

  WCE.status = function () {
    var pane = chatListPane();
    var canvas = qs('canvas[aria-label]') || qs('[data-testid="qrcode"]') || qs('canvas');
    return {
      url: location.href,
      title: document.title,
      loggedIn: !!pane,
      qrVisible: !pane && !!canvas,
      hasMain: !!mainPanel(),
      scraper: WCE.version
    };
  };

  /* -------------------------------------------------------------- chat list */

  /*
   * Finding "one row in the chat list" is the single most fragile thing here,
   * because WhatsApp has shipped several different shapes for it:
   *
   *   older builds   #pane-side  >  div[role="listitem"]
   *   newer builds   #pane-side  >  div[role="grid"] > div[role="row"]
   *   some builds    rows identified only by a cell-frame test id
   *
   * Rather than betting on one, try them all and keep whichever yields the
   * most rows that actually carry a chat name. A wrong guess here shows up as
   * "found 0 chats", so this stays deliberately generous.
   */
  function findChatRows(pane) {
    if (!pane) return { rows: [], strategy: 'no-pane' };

    var strategies = [
      ['listitem', function () { return qsa('div[role="listitem"]', pane); }],
      ['grid-row', function () {
        var grid = qs('div[role="grid"]', pane) || qs('[aria-label]', pane) || pane;
        return qsa('div[role="row"]', grid);
      }],
      ['pane-row', function () { return qsa('div[role="row"]', pane); }],
      ['cell-frame', function () {
        return qsa('[data-testid="cell-frame-container"], [data-testid="cell-frame-title"]', pane)
          .map(function (el) {
            return (el.closest && el.closest('div[role="row"], div[role="listitem"]')) || el.parentElement;
          })
          .filter(Boolean);
      }],
      ['gridcell', function () {
        return qsa('div[role="gridcell"]', pane)
          .map(function (el) { return (el.closest && el.closest('div[role="row"]')) || el; });
      }]
    ];

    var best = { rows: [], strategy: 'none' };
    for (var i = 0; i < strategies.length; i++) {
      var rows;
      try { rows = strategies[i][1]() || []; } catch (e) { rows = []; }
      var named = [];
      var seen = [];
      for (var j = 0; j < rows.length; j++) {
        if (!rows[j] || seen.indexOf(rows[j]) !== -1) continue;
        seen.push(rows[j]);
        if (rowName(rows[j]).name) named.push(rows[j]);
      }
      if (named.length > best.rows.length) best = { rows: named, strategy: strategies[i][0] };
    }
    return best;
  }

  /* Pull the chat title (and the preview line) out of one row. The title
     attribute is the reliable source; the rest are fallbacks for builds that
     stop setting it. */
  function rowName(row) {
    var name = '';
    var preview = '';
    var titles = qsa('span[title]', row);
    for (var t = 0; t < titles.length; t++) {
      var v = (attr(titles[t], 'title') || nodeText(titles[t])).trim();
      if (!v) continue;
      if (!name) name = v; else if (!preview) preview = v;
    }
    if (!name) {
      var titleEl = qs('[data-testid="cell-frame-title"]', row);
      if (titleEl) name = nodeText(titleEl).trim();
    }
    if (!name) {
      /* last resort: the first text-bearing span in the row's first cell */
      var cell = qs('div[role="gridcell"]', row) || row;
      var spans = qsa('span[dir="auto"], span', cell);
      for (var k = 0; k < spans.length; k++) {
        var txt = nodeText(spans[k]).trim();
        if (txt && txt.length < 80 && !/^\d{1,2}[:.]\d{2}$/.test(txt)) { name = txt; break; }
      }
    }
    if (!preview) {
      var prev = qs('[data-testid="last-msg-status"], span[dir="ltr"]', row);
      if (prev) preview = nodeText(prev).trim();
    }
    return { name: name, preview: preview };
  }

  WCE.readChatListPage = function () {
    var pane = chatListPane();
    if (!pane) return { error: 'chat-list-not-found', items: [] };
    var sc = findScroller(pane) || pane;
    var found = findChatRows(pane);
    var rows = found.rows;
    var items = [];

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var named = rowName(row);
      var name = named.name;
      var preview = named.preview;
      if (!name) continue;

      /* The virtual list positions rows with translateY(<px>). That offset is a
         stable sort key across scroll steps, unlike DOM order, which shuffles
         as rows get recycled. */
      var offsetY = null;
      var host = row.parentElement;
      for (var h = 0; h < 3 && host; h++) {
        var tr = host.style && host.style.transform;
        if (tr && tr.indexOf('translateY') !== -1) {
          var m = tr.match(/-?[\d.]+/);
          if (m) { offsetY = parseFloat(m[0]); break; }
        }
        host = host.parentElement;
      }

      var unread = 0;
      var uls = qsa('span[aria-label]', row);
      for (var u = 0; u < uls.length; u++) {
        var lab = attr(uls[u], 'aria-label');
        if (/unread|ungelesen|no le[ii]d/i.test(lab)) {
          var num = (nodeText(uls[u]) || lab).replace(/\D/g, '');
          unread = parseInt(num, 10) || 0;
          break;
        }
      }

      var timeEl = null;
      var spans = qsa('span', row);
      for (var s = 0; s < spans.length; s++) {
        var txt = nodeText(spans[s]).trim();
        if (/^(\d{1,2}[:.]\d{2}(\s?[AaPp][Mm])?|gestern|yesterday|heute|today)$/i.test(txt) ||
            /^\d{1,2}[./-]\d{1,2}[./-]\d{2,4}$/.test(txt)) { timeEl = spans[s]; break; }
      }

      items.push({
        name: name,
        preview: preview,
        unread: unread,
        lastActivity: timeEl ? nodeText(timeEl).trim() : '',
        isGroup: !!qs('[data-icon="default-group"], [data-icon="group"]', row),
        muted: !!qs('[data-icon="muted"]', row),
        pinned: !!qs('[data-icon="pinned2"], [data-icon="pinned"]', row),
        offsetY: offsetY
      });
    }

    return {
      items: items,
      strategy: found.strategy,
      scroll: { top: sc.scrollTop, height: sc.scrollHeight, client: sc.clientHeight },
      atBottom: sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 8
    };
  };

  /* Enumerating the chat list is only complete if the search box is empty:
     leftover text filters the list, and a backup would then silently skip
     every chat that does not match. Never assume it is clear - clear it. */
  WCE.clearSearch = function () {
    var box = qs('#side div[contenteditable="true"][data-tab]') ||
              qs('div[contenteditable="true"][data-tab="3"]') ||
              qs('#side div[contenteditable="true"]');
    if (!box) return false;
    var had = (box.textContent || '').trim();
    if (!had) return false;

    try {
      box.focus();
      /* execCommand is deprecated but is what contenteditable editors listen
         to; it produces the same events a human backspacing would. */
      if (document.execCommand) {
        document.execCommand('selectAll', false, null);
        document.execCommand('delete', false, null);
      }
    } catch (e) { /* fall through to the blunt path */ }

    if ((box.textContent || '').trim()) {
      box.textContent = '';
      try {
        box.dispatchEvent(new InputEvent('input', { bubbles: true }));
      } catch (e) {
        var ev = document.createEvent('Event');
        ev.initEvent('input', true, true);
        box.dispatchEvent(ev);
      }
    }
    return had;
  };

  WCE.scrollChatList = function (opts) {
    opts = opts || {};
    var pane = chatListPane();
    if (!pane) return { error: 'chat-list-not-found' };
    var sc = findScroller(pane) || pane;
    var before = sc.scrollTop;
    if (opts.top === true) sc.scrollTop = 0;
    else if (typeof opts.to === 'number') sc.scrollTop = opts.to;
    else sc.scrollTop = sc.scrollTop + (opts.delta || sc.clientHeight * 0.75);
    return {
      before: before, after: sc.scrollTop,
      height: sc.scrollHeight, client: sc.clientHeight,
      atBottom: sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 8
    };
  };

  /* Bring a chat row into view so a real click can land on it. Returns the
     row's centre in viewport coordinates, or null if it is not rendered. */
  WCE.locateChatRow = function (name) {
    var pane = chatListPane();
    if (!pane) return null;
    var rows = findChatRows(pane).rows;
    for (var i = 0; i < rows.length; i++) {
      var candidates = [rowName(rows[i]).name];
      for (var t = 0; t < candidates.length; t++) {
        var v = candidates[t];
        if (v === name) {
          try { rows[i].scrollIntoView({ block: 'center' }); } catch (e) {}
          var r = rows[i].getBoundingClientRect();
          return {
            x: r.x + Math.min(120, r.width / 2),
            y: r.y + r.height / 2,
            width: r.width,
            height: r.height
          };
        }
      }
    }
    return null;
  };

  WCE.currentChat = function () {
    var main = mainPanel();
    if (!main) return null;
    var header = qs('header', main);
    if (!header) return null;
    var titleEl = qs('span[title]', header);
    var name = titleEl ? (attr(titleEl, 'title') || nodeText(titleEl)).trim() : '';
    var full = nodeText(header).trim();
    var subtitle = name ? full.replace(name, '').trim() : full;
    return {
      name: name,
      subtitle: subtitle.slice(0, 200),
      isGroup: /participant|teilnehmer|miembro/i.test(subtitle)
    };
  };

  /* --------------------------------------------------------------- messages */

  function parsePrePlainText(pre) {
    /* "[21:34, 12/05/2024] Niklas Blattner: "  - order and separators vary by
       locale, so detect which half looks like a clock rather than assuming. */
    if (!pre) return {};
    var m = pre.match(/^\s*\[([^\]]+)\]\s*([\s\S]*?):\s*$/);
    if (!m) return { raw: pre };
    var stamp = m[1];
    var sender = m[2].trim();
    var parts = stamp.split(',');
    var a = (parts[0] || '').trim();
    var b = (parts.slice(1).join(',') || '').trim();
    var timeLike = /^\d{1,2}[:.]\d{2}(:\d{2})?(\s*[APap]\.?[Mm]\.?)?$/;
    var time = '', date = '';
    if (timeLike.test(a)) { time = a; date = b; }
    else if (timeLike.test(b)) { time = b; date = a; }
    else { date = a; time = b; }
    return { raw: pre, time: time, date: date, sender: sender };
  }

  /* Media bubbles without a caption carry no data-pre-plain-text, so fall back
     to the small timestamp rendered in the bubble footer. */
  function visibleTime(row) {
    var spans = qsa('span', row);
    for (var i = spans.length - 1; i >= 0; i--) {
      var txt = nodeText(spans[i]).trim();
      if (/^\d{1,2}[:.]\d{2}(\s*[APap]\.?[Mm]\.?)?$/.test(txt)) return txt;
    }
    return '';
  }

  function iconNames(row) {
    var out = [];
    var els = qsa('[data-icon]', row);
    for (var i = 0; i < els.length; i++) out.push(attr(els[i], 'data-icon'));
    return out;
  }

  /* Emoji are <img> too. Only treat an image as an attachment when it is not
     an inline emoji: emoji live inside the message body, carry an emoji class,
     and are tiny. Missing this makes every message containing an emoji look
     like a photo. */
  function contentImage(row) {
    var imgs = qsa('img[src]', row);
    for (var i = 0; i < imgs.length; i++) {
      var im = imgs[i];
      var src = im.getAttribute('src') || '';
      if (src.slice(0, 5) !== 'blob:' && src.slice(0, 5) !== 'data:') continue;
      var cls = (im.getAttribute('class') || '') + ' ' + (im.getAttribute('data-testid') || '');
      if (/emoji/i.test(cls)) continue;
      if (im.closest && im.closest('.selectable-text, .copyable-text > span')) continue;
      var w = im.clientWidth || im.naturalWidth || 0;
      var h = im.clientHeight || im.naturalHeight || 0;
      if (w && h && w < 48 && h < 48) continue;
      return im;
    }
    return null;
  }

  function detectMedia(row) {
    var icons = iconNames(row);
    function has() {
      for (var i = 0; i < arguments.length; i++) {
        for (var j = 0; j < icons.length; j++) {
          if (icons[j] && icons[j].indexOf(arguments[i]) !== -1) return true;
        }
      }
      return false;
    }
    var img = contentImage(row);
    var type = 'text';

    if (qs('[data-testid="audio-play"], [aria-label*="voice message" i], [aria-label*="Sprachnachricht" i]', row) ||
        has('audio-play', 'ptt-status', 'audio-pause', 'mic')) type = 'audio';
    else if (has('media-play', 'video-status', 'msg-video')) type = 'video';
    else if (has('document', 'doc-generic', 'doc-pdf', 'doc-image', 'doc-sheet', 'doc-text')) type = 'document';
    else if (qs('[data-testid="sticker"], img[data-testid="sticker"]', row) || has('sticker')) type = 'sticker';
    else if (has('location', 'pin')) type = 'location';
    else if (qs('[data-testid="contact-card"]', row) || has('vcard', 'contact')) type = 'contact';
    else if (qs('[data-testid^="poll"], [aria-label*="poll" i], [aria-label*="Umfrage" i]', row) || has('poll')) type = 'poll';
    else if (has('gif')) type = 'gif';
    else if (img) type = 'image';

    if (type === 'text') return { type: 'text' };

    var media = { type: type };
    if (img) media.thumb = img.getAttribute('src');

    if (type === 'document') {
      var titles = qsa('span[title]', row);
      for (var i = 0; i < titles.length; i++) {
        var v = attr(titles[i], 'title').trim();
        if (v && /\.[A-Za-z0-9]{1,6}$/.test(v)) { media.filename = v; break; }
      }
      if (!media.filename && titles.length) media.filename = attr(titles[0], 'title').trim();
    }

    if (type === 'audio' || type === 'video' || type === 'gif') {
      var all = (row.innerText || '').match(/\b\d{1,2}:\d{2}\b/g);
      if (all && all.length) media.duration = all[0];
    }
    return media;
  }

  function parseQuoted(row) {
    var q = qs('[aria-label="Quoted message"], [data-testid="quoted-message"], .quoted-mention', row);
    if (!q) return null;
    var texts = qsa('span[dir="auto"], span.quoted-mention', q)
      .map(function (e) { return nodeText(e).trim(); })
      .filter(Boolean);
    if (!texts.length) {
      var t = nodeText(q).trim();
      if (t) texts = [t];
    }
    return texts.length ? { author: texts[0] || '', text: texts.slice(1).join('\n') || '' } : null;
  }

  function parseReactions(row) {
    var els = qsa('[aria-label*="reaction" i], [aria-label*="Reaktion" i]', row);
    var out = [];
    for (var i = 0; i < els.length; i++) {
      var txt = nodeText(els[i]).trim();
      if (txt) out.push(txt);
    }
    return out.length ? out : null;
  }

  var DIVIDER_RX = /^(today|yesterday|heute|gestern|hoy|ayer|hier|\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\w+\s\d{1,2},\s\d{4})$/i;

  /* System rows and date dividers have no data-id of their own. Hashing their
     position in the current DOM window would give them a different id on every
     scroll step, so they would pile up as duplicates. Anchor them to the
     nearest neighbouring message id instead, which is stable. */
  function anchorFor(rows, index) {
    for (var j = index + 1; j < rows.length; j++) {
      var below = qs('[data-id]', rows[j]);
      if (below) return 'b' + attr(below, 'data-id');
    }
    for (var k = index - 1; k >= 0; k--) {
      var above = qs('[data-id]', rows[k]);
      if (above) return 'a' + attr(above, 'data-id');
    }
    return 'x';
  }

  function parseRow(row, index, rows) {
    var holder = qs('[data-id]', row) || (row.closest ? row.closest('[data-id]') : null);
    var dataId = holder ? attr(holder, 'data-id') : '';

    var bubbleIn = qs('.message-in', row);
    var bubbleOut = qs('.message-out', row);
    var copyable = qs('div.copyable-text[data-pre-plain-text]', row);
    var pre = copyable ? attr(copyable, 'data-pre-plain-text') : '';
    var meta = parsePrePlainText(pre);

    var textEl = copyable
      ? (qs('span.selectable-text', copyable) || qs('.selectable-text', copyable))
      : qs('span.selectable-text', row);
    var text = textEl ? nodeText(textEl) : '';

    var rawRowText = (nodeText(row) || '').trim();
    var isSystem = !bubbleIn && !bubbleOut && !dataId;

    if (isSystem) {
      if (!rawRowText) return null;
      var kind = (rawRowText.length < 32 && DIVIDER_RX.test(rawRowText)) ? 'date' : 'system';
      return {
        id: 'sys_' + hash(kind + '|' + rawRowText + '|' + anchorFor(rows || [], index)),
        kind: kind,
        text: rawRowText,
        sender: null,
        outgoing: false,
        stamp: null
      };
    }

    var outgoing = dataId ? dataId.slice(0, 5) === 'true_' : !!bubbleOut;
    var media = detectMedia(row);
    var time = meta.time || visibleTime(row);

    var msg = {
      id: dataId || ('row_' + hash((meta.raw || '') + '|' + text + '|' + index)),
      kind: 'message',
      outgoing: outgoing,
      sender: meta.sender || null,
      stamp: { time: time || '', date: meta.date || '', raw: meta.raw || '' },
      type: media.type,
      text: text.replace(/ /g, ' ')
    };

    if (media.type !== 'text') msg.media = media;

    if (qs('[data-icon="status-deleted"]', row) ||
        /this message was deleted|diese nachricht wurde gel/i.test(rawRowText)) {
      msg.deleted = true;
    }
    var quoted = parseQuoted(row);
    if (quoted) msg.quoted = quoted;
    var reactions = parseReactions(row);
    if (reactions) msg.reactions = reactions;
    if (/^\s*(forwarded|weitergeleitet|reenviado)/i.test(rawRowText)) msg.forwarded = true;

    var ack = qs('[data-icon^="msg-"]', row);
    if (ack) {
      var a = attr(ack, 'data-icon');
      if (a === 'msg-check') msg.ack = 'sent';
      else if (a === 'msg-dblcheck') msg.ack = 'delivered';
      else if (a === 'msg-time') msg.ack = 'pending';
    }
    if (qs('[data-icon="status-dblcheck"]', row)) msg.ack = 'read';

    return msg;
  }

  /* Harvest every message row currently mounted in the virtual list. */
  WCE.harvest = function () {
    var main = mainPanel();
    if (!main) return { error: 'no-conversation-open', messages: [] };
    var rows = qsa('div[role="row"]', main);
    var messages = [];
    for (var i = 0; i < rows.length; i++) {
      var m = null;
      try { m = parseRow(rows[i], i, rows); } catch (e) { m = null; }
      if (m) messages.push(m);
    }
    var sc = findScroller(main);
    return {
      messages: messages,
      rowCount: rows.length,
      chat: WCE.currentChat(),
      scroll: sc ? { top: sc.scrollTop, height: sc.scrollHeight, client: sc.clientHeight } : null,
      loading: !!qs('[data-icon="loading"], [role="progressbar"]', main)
    };
  };

  WCE.scrollMessages = function (opts) {
    opts = opts || {};
    var main = mainPanel();
    if (!main) return { error: 'no-conversation-open' };
    var sc = findScroller(main);
    if (!sc) return { error: 'no-scroller' };
    var before = sc.scrollTop;
    if (opts.top === true) sc.scrollTop = 0;
    else if (opts.bottom === true) sc.scrollTop = sc.scrollHeight;
    else sc.scrollTop = Math.max(0, sc.scrollTop - (opts.delta || Math.floor(sc.clientHeight * (opts.factor || 0.8))));
    return {
      before: before, after: sc.scrollTop,
      height: sc.scrollHeight, client: sc.clientHeight,
      atTop: sc.scrollTop <= 2
    };
  };

  /* WhatsApp sometimes parks older history behind an explicit button. */
  WCE.clickLoadMore = function () {
    var main = mainPanel();
    if (!main) return false;
    var btns = qsa('button, [role="button"]', main);
    var rx = /(load (more|earlier)|click here to load|aeltere nachrichten|mehr laden|cargar m[ai]s|charger plus)/i;
    for (var i = 0; i < btns.length; i++) {
      var t = (btns[i].innerText || '').trim();
      if (t && t.length < 80 && rx.test(t)) { btns[i].click(); return t; }
    }
    return false;
  };

  /* WhatsApp only drives one tab at a time. If the user logged in somewhere
     else, this tab shows a "Use here" screen and every list is empty. */
  WCE.clickUseHere = function () {
    var rx = /^(use here|hier verwenden|usar aqu|utiliser ici|usa qui|usar aqui)/i;
    var btns = qsa('button, [role="button"], div[tabindex]', document);
    for (var i = 0; i < btns.length; i++) {
      var t = (btns[i].innerText || '').trim();
      if (t && t.length < 40 && rx.test(t)) { btns[i].click(); return t; }
    }
    return false;
  };

  /*
   * Structural report for troubleshooting. Deliberately does NOT dump message
   * text or full chat names: names are truncated to their first two characters
   * plus a length, which is enough to tell "it found the right element" from
   * "it found nothing" without copying a conversation into a log.
   */
  WCE.diagnose = function () {
    function peek(str) {
      var v = String(str == null ? '' : str).trim();
      if (!v) return '';
      return v.slice(0, 2) + '***(' + v.length + ')';
    }

    function describe(el, depth) {
      if (!el || depth > 3) return null;
      var out = { tag: el.tagName ? el.tagName.toLowerCase() : '?', attrs: {} };
      ['role', 'title', 'aria-label', 'data-id', 'data-testid', 'data-icon', 'dir', 'aria-rowindex']
        .forEach(function (a) {
          var v = el.getAttribute && el.getAttribute(a);
          if (v) out.attrs[a] = (a === 'title' || a === 'aria-label') ? peek(v) : v;
        });
      var cls = el.getAttribute && el.getAttribute('class');
      if (cls) out.attrs['class'] = cls.slice(0, 50);
      var kids = el.children ? Array.prototype.slice.call(el.children, 0, 4) : [];
      if (kids.length && depth < 3) {
        out.children = kids.map(function (k) { return describe(k, depth + 1); }).filter(Boolean);
      }
      return out;
    }

    var pane = chatListPane();
    var main = mainPanel();
    var body = document.body ? (document.body.innerText || '') : '';

    var counts = {};
    ['#pane-side', 'div[aria-label="Chat list"]', '[role="grid"]', 'div[role="listitem"]',
     '#pane-side div[role="row"]', '#pane-side div[role="gridcell"]', '#pane-side span[title]',
     '[data-testid="cell-frame-container"]', '#main', '#main div[role="row"]',
     '#main [data-id]', '#main [data-pre-plain-text]', 'canvas'
    ].forEach(function (sel) { counts[sel] = qsa(sel, document).length; });

    var report = {
      url: location.href,
      title: document.title,
      loggedIn: !!pane,
      paneFound: !!pane,
      counts: counts,
      hints: {
        openInOtherTab: /open in another (window|tab)|in einem anderen (fenster|tab)|abierto en otra/i.test(body),
        useHereButton: /use here|hier verwenden|usar aqu|utiliser ici/i.test(body),
        qrLikely: !pane && /scan|qr[- ]?code|verkn/i.test(body.slice(0, 800)),
        loading: /loading|wird geladen|cargando/i.test(body.slice(0, 300))
      }
    };

    if (pane) {
      var found = findChatRows(pane);
      report.chatList = {
        strategy: found.strategy,
        rowsWithNames: found.rows.length,
        firstRowStructure: found.rows[0] ? describe(found.rows[0], 0) : null,
        firstRowName: found.rows[0] ? peek(rowName(found.rows[0]).name) : null
      };
      var sc = findScroller(pane) || pane;
      report.chatList.scroll = { height: sc.scrollHeight, client: sc.clientHeight };
    }

    if (main) {
      var mrows = qsa('div[role="row"]', main);
      report.conversation = {
        open: true,
        name: peek((WCE.currentChat() || {}).name),
        rows: mrows.length,
        withDataId: qsa('[data-id]', main).length,
        withPrePlainText: qsa('[data-pre-plain-text]', main).length,
        firstRowStructure: mrows[0] ? describe(mrows[0], 0) : null
      };
    } else {
      report.conversation = { open: false };
    }

    return report;
  };

  /* Pull a loaded blob: thumbnail out of the page as a data URL.
     Only works while the bubble is still mounted - blob URLs are revoked when
     the virtual list unmounts the row, so this must run during the sweep. */
  WCE.fetchBlob = function (url) {
    return fetch(url).then(function (r) { return r.blob(); }).then(function (b) {
      return new Promise(function (resolve) {
        var fr = new FileReader();
        fr.onload = function () { resolve({ ok: true, dataUrl: String(fr.result), mime: b.type, size: b.size }); };
        fr.onerror = function () { resolve({ ok: false, error: 'read-failed' }); };
        fr.readAsDataURL(b);
      });
    }).catch(function (e) { return { ok: false, error: String((e && e.message) || e) }; });
  };

  return WCE.version;
}

export { installScraper };
