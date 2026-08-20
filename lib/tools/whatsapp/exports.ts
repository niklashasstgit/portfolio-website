// NOTE: server-only module (node:fs).
import { promises as fs } from "fs";
import path from "path";
import { formatDateHuman } from "./dates";
import type { ArchivedMessage, ChatArchive } from "./types";

/**
 * Plain-text and standalone-HTML copies written next to each chat.json.
 *
 * These exist so the archive does not depend on this website to be readable.
 * The folder syncs to OneDrive, so `chat.html` opens on a phone, years from
 * now, with no server, no build step and no network.
 */

const MEDIA_LABEL: Record<string, string> = {
  image: "<image omitted>",
  video: "<video omitted>",
  audio: "<voice message omitted>",
  document: "<document omitted>",
  sticker: "<sticker omitted>",
  gif: "<GIF omitted>",
  location: "<location omitted>",
  contact: "<contact card omitted>",
  poll: "<poll omitted>",
};

export function bodyText(m: ArchivedMessage): string {
  if (m.deleted) return "This message was deleted";
  let body = m.text || "";
  if (m.media && m.media.type !== "text") {
    const label = m.media.filename
      ? `<${m.media.filename} attached>`
      : MEDIA_LABEL[m.media.type] ?? `<${m.media.type} omitted>`;
    body = body ? `${label} ${body}` : label;
  }
  return body;
}

function senderOf(m: ArchivedMessage, archive: ChatArchive): string | null {
  if (m.kind === "system") return null;
  return m.sender ?? (m.direction === "out" ? archive.selfName : archive.title);
}

/** WhatsApp's own export shape, so existing parsers can read these files. */
export function toTxt(archive: ChatArchive): string {
  const lines: string[] = [];
  for (const m of archive.messages) {
    const d = m.ts ? formatDateHuman(m.ts.date).replace(/\./g, "/") : "??/??/????";
    const t = m.ts?.hasTime ? m.ts.time : "00:00";
    const who = senderOf(m, archive);
    const body = bodyText(m).replace(/\r/g, "");
    lines.push(who ? `${d}, ${t} - ${who}: ${body}` : `${d}, ${t} - ${body}`);
  }
  return lines.join("\n") + "\n";
}

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** JSON embedded in a <script> must not contain a literal </script>. */
function safeJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\u003c")
    .replace(/>/g, "\u003e")
    .replace(/\u2028/g, "\u2028")
    .replace(/\u2029/g, "\u2029");
}

const STYLE = `
:root{--bg:#0b141a;--panel:#111b21;--in:#202c33;--out:#005c4b;--txt:#e9edef;--dim:#8696a0;--accent:#00a884;--sys:#182229}
@media (prefers-color-scheme: light){:root{--bg:#efeae2;--panel:#f0f2f5;--in:#fff;--out:#d9fdd3;--txt:#111b21;--dim:#667781;--accent:#008069;--sys:#fff6d6}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--txt);font:15px/1.45 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
header{position:sticky;top:0;z-index:5;background:var(--panel);padding:12px 18px;border-bottom:1px solid rgba(134,150,160,.25)}
header h1{margin:0;font-size:17px}
header .meta{color:var(--dim);font-size:12px;margin-top:3px}
header input{margin-top:8px;width:100%;max-width:420px;padding:7px 10px;border-radius:8px;border:1px solid rgba(134,150,160,.35);background:var(--bg);color:var(--txt)}
main{max-width:900px;margin:0 auto;padding:18px 14px 60px}
.day{text-align:center;margin:18px 0 10px}
.day span{background:var(--sys);color:var(--dim);font-size:12px;padding:5px 12px;border-radius:8px}
.row{display:flex;margin:2px 0}.row.out{justify-content:flex-end}
.bubble{max-width:78%;padding:6px 9px;border-radius:8px;background:var(--in);box-shadow:0 1px 0 rgba(0,0,0,.12);white-space:pre-wrap;overflow-wrap:anywhere}
.row.out .bubble{background:var(--out)}
.who{font-size:12.5px;font-weight:600;color:var(--accent);margin-bottom:2px}
.time{font-size:11px;color:var(--dim);float:right;margin:6px 0 0 10px}
.sys{text-align:center;margin:10px 0}
.sys span{background:var(--sys);color:var(--dim);font-size:12px;padding:5px 12px;border-radius:8px;display:inline-block;max-width:80%}
.quote{border-left:3px solid var(--accent);background:rgba(134,150,160,.14);padding:4px 8px;border-radius:4px;margin-bottom:4px;font-size:13px;color:var(--dim)}
.att{display:inline-block;font-size:12.5px;color:var(--dim);font-style:italic}
.att img{display:block;max-width:280px;border-radius:6px;margin:4px 0}
.react{font-size:12px;background:var(--sys);border-radius:10px;padding:1px 6px;margin-top:3px;display:inline-block}
footer{text-align:center;color:var(--dim);font-size:12px;padding:20px}
`;

const SCRIPT = `
(function(){
  var data = window.__CHAT__, main = document.getElementById('log');
  var search = document.getElementById('q'), count = document.getElementById('count');
  function esc(s){var d=document.createElement('div');d.textContent=s==null?'':s;return d.innerHTML;}
  function render(filter){
    var f=(filter||'').toLowerCase(), html=[], day=null, shown=0;
    data.messages.forEach(function(m){
      var body=m._body||'';
      if(f && body.toLowerCase().indexOf(f)===-1 && String(m.sender||'').toLowerCase().indexOf(f)===-1) return;
      shown++;
      var d=m.ts?m.ts.date:'undated';
      if(d!==day){day=d;html.push('<div class="day"><span>'+esc(day)+'</span></div>');}
      if(m.kind==='system'){html.push('<div class="sys"><span>'+esc(body)+'</span></div>');return;}
      var t=(m.ts&&m.ts.hasTime)?m.ts.time:'';
      var p=['<div class="row '+(m.direction==='out'?'out':'in')+'"><div class="bubble">'];
      if(data.isGroup&&m.direction!=='out'&&m.sender)p.push('<div class="who">'+esc(m.sender)+'</div>');
      if(m.quoted)p.push('<div class="quote"><b>'+esc(m.quoted.author||'')+'</b><br>'+esc(m.quoted.text||'')+'</div>');
      if(m.media&&m.media.file)p.push('<span class="att"><img loading="lazy" src="'+esc(m.media.file)+'" alt=""></span>');
      else if(m.media&&m.media.type!=='text')p.push('<span class="att">'+esc(m._att)+'</span><br>');
      p.push(esc(m.text||''));
      if(m.reactions&&m.reactions.length)p.push('<div class="react">'+esc(m.reactions.join(' '))+'</div>');
      if(t)p.push('<span class="time">'+esc(t)+'</span>');
      p.push('</div></div>');
      html.push(p.join(''));
    });
    main.innerHTML=html.join('');
    count.textContent=shown+' / '+data.messages.length+' shown';
  }
  var timer;
  search.addEventListener('input',function(){clearTimeout(timer);timer=setTimeout(function(){render(search.value);},120);});
  render('');
})();
`;

export function toHtml(archive: ChatArchive): string {
  const payload = {
    title: archive.title,
    isGroup: archive.isGroup,
    updatedAt: archive.updatedAt,
    messages: archive.messages.map((m) => ({
      ...m,
      _body: bodyText(m),
      _att:
        m.media && m.media.type !== "text"
          ? m.media.filename ?? m.media.type + (m.media.duration ? ` (${m.media.duration})` : "")
          : "",
      sender: m.sender ?? senderOf(m, archive),
    })),
  };
  const range = archive.stats.firstDate
    ? `${archive.stats.firstDate} &rarr; ${archive.stats.lastDate}`
    : "date range unknown";

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(archive.title)} — WhatsApp archive</title>
<style>${STYLE}</style></head>
<body>
<header>
  <h1>${esc(archive.title)}</h1>
  <div class="meta">${range} &middot; <span id="count"></span> &middot; updated ${esc(
    new Date(archive.updatedAt).toLocaleString()
  )}</div>
  <input id="q" type="search" placeholder="Search this chat…">
</header>
<main id="log"></main>
<footer>Offline copy — open this file anywhere, no server needed</footer>
<script>window.__CHAT__ = ${safeJson(payload)};</script>
<script>${SCRIPT}</script>
</body></html>
`;
}

export async function writeExports(dir: string, archive: ChatArchive): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "chat.txt"), toTxt(archive), "utf8");
  await fs.writeFile(path.join(dir, "chat.html"), toHtml(archive), "utf8");
}
