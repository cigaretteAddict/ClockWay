const $ = (s) => document.querySelector(s),
  R = document.documentElement;
const money = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const norm = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
const clamp = (v) => Math.min(1, Math.max(0, v));
const ls = (k, v) => {
  try {
    return v ? localStorage.setItem(k, v) : localStorage.getItem(k);
  } catch {}
};

/* ---------- relógio desenhado em SVG (c = caixa, d = mostrador, s = pulseira, t = índices) ---------- */
let uid = 0;
function watchSVG(c, d, s, t) {
  const g = "g" + uid++;
  let marks = "";
  for (let i = 0; i < 12; i++)
    marks += `<rect x="98.5" y="${i % 3 ? 134 : 132}" width="3" height="${i % 3 ? 5 : 9}" fill="${t}" transform="rotate(${i * 30} 100 180)"/>`;
  const hand = (len, w, col, dur) =>
    `<path d="M100 186V${180 - len}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 100 180" to="360 100 180" dur="${dur}s" repeatCount="indefinite"/></path>`;
  const depth = `<g transform="translate(9 0)" fill="#171717">
<path d="M72 0h56l6 130H66zM66 230h68l-6 130H72z"/><rect x="160" y="171" width="12" height="18" rx="3"/>
<circle cx="100" cy="180" r="66"/></g>`;
  return `<svg viewBox="0 0 200 360" role="img" aria-label="Relógio de luxo"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient></defs>
${depth}
<path d="M72 0h56l6 130H66zM66 230h68l-6 130H72z" fill="${s}"/><rect x="160" y="171" width="12" height="18" rx="3" fill="${c}"/>
<circle cx="100" cy="180" r="66" fill="${c}"/><circle cx="100" cy="180" r="56" fill="${d}"/>${marks}
${hand(30, 4, t, 240)}${hand(42, 3, t, 30)}${hand(46, 1.5, "#d4af37", 6)}
<circle cx="100" cy="180" r="4" fill="#d4af37"/><circle cx="100" cy="180" r="66" fill="url(#${g})"/></svg>`;
}
$("#hero").innerHTML = watchSVG("#c9a24b", "#14110b", "#3a2616", "#f3ead2");

/* ---------- rolagem: logo em arco, giro do relógio e legendas ---------- */
const tour = $("#tour"),
  stage = $(".stage"),
  labs = document.querySelectorAll(".lab");
let tick = 0;
const frame = () => {
  tick = 0;
  const y = scrollY;
  const notice = $("#announcement");
  R.style.setProperty(
    "--notice-offset",
    `${notice ? Math.max(0, notice.getBoundingClientRect().bottom) : 0}px`,
  );
  const t = clamp((y - tour.offsetTop) / (tour.offsetHeight - innerHeight));
  const p = clamp(y / 320);
  const morph = clamp(p / 0.78);
  R.style.setProperty("--logo-shift", `${-45 * morph}%`);
  R.style.setProperty("--logo-scale", 1 - 0.88 * morph);
  R.style.setProperty("--logo-opacity", clamp((0.78 - p) / 0.2));
  R.style.setProperty("--bar-opacity", clamp((p - 0.78) / 0.22));
  stage.style.setProperty("--r", `${t * 720}deg`);
  labs.forEach((l, i) => l.classList.toggle("on", t > 0.08 + i * 0.14));
};
$("#closeAnnouncement").onclick = () => {
  $("#announcement").remove();
  frame();
};
addEventListener(
  "scroll",
  () => tick || (tick = requestAnimationFrame(frame)),
  { passive: true },
);
addEventListener("resize", frame);
frame();

/* ---------- modo escuro e claro ---------- */
const setTheme = (t) => {
  R.dataset.theme = t;
  $("#theme").textContent = t === "dark" ? "☀" : "☾";
  ls("cw-theme", t);
};
setTheme(
  ls("cw-theme") ||
    (matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light"),
);
$("#theme").onclick = () =>
  setTheme(R.dataset.theme === "dark" ? "light" : "dark");

/* ---------- coleção, pesquisa e carrinho ---------- */
const WATCHES = [
  {
    n: "Aurum Classic",
    p: 48900,
    k: "Ouro 18k, automático, mostrador champanhe",
    c: "#c9a24b",
    d: "#f3ead2",
    s: "#5a3a22",
    t: "#222",
  },
  {
    n: "Nocturne",
    p: 36500,
    k: "Aço 316L, automático, mostrador preto",
    c: "#bfc3c8",
    d: "#10151c",
    s: "#1b1b1b",
    t: "#fff",
  },
  {
    n: "Meridian GMT",
    p: 52900,
    k: "Aço, automático, segundo fuso horário",
    c: "#aeb4ba",
    d: "#1d3b5a",
    s: "#2b2b2b",
    t: "#fff",
  },
  {
    n: "Abyss Diver",
    p: 41200,
    k: "Aço, mergulho 300 m, coroa rosqueada",
    c: "#9aa1a8",
    d: "#0a2a2a",
    s: "#0f3d3d",
    t: "#fff",
  },
  {
    n: "Regent Skeleton",
    p: 87500,
    k: "Ouro rosé, esqueleto, corda manual",
    c: "#d1a29a",
    d: "#2a1a1a",
    s: "#3b1f1f",
    t: "#fff",
  },
  {
    n: "Sovereign Chrono",
    p: 64800,
    k: "Ouro, cronógrafo automático, pulseira de couro",
    c: "#c9a24b",
    d: "#101010",
    s: "#6b4a2b",
    t: "#f3ead2",
  },
];
const grid = $("#grid");
const draw = (q) => {
  const list = WATCHES.map((w, i) => ({ ...w, i })).filter((w) =>
    norm(w.n + " " + w.k).includes(q),
  );
  grid.innerHTML = list.length
    ? list
        .map(
          (w) =>
            `<article class="card"><div class="pic">${watchSVG(w.c, w.d, w.s, w.t)}</div><h3>${w.n}</h3><p class="mut">${w.k}</p><strong>${money(w.p)}</strong><button class="btn" data-i="${w.i}">Adicionar ao carrinho</button></article>`,
        )
        .join("")
    : '<p class="mut">Nenhum relógio encontrado. Tente outro nome ou material.</p>';
};
draw("");
$("#q").oninput = (e) => draw(norm(e.target.value.trim()));

let cart = [],
  coupon = false;
const upd = () => ($("#count").textContent = cart.length);
grid.onclick = (e) => {
  const b = e.target.closest(".btn");
  if (!b) return;
  cart.push(WATCHES[b.dataset.i]);
  upd();
  b.textContent = "Adicionado ✓";
  setTimeout(() => (b.textContent = "Adicionar ao carrinho"), 1200);
};
$("#cupom").onclick = (e) => {
  coupon = true;
  e.target.textContent = "Cupom CLOCK5 ativado ✓";
};

/* ---------- janela: carrinho, sobre e serviços ---------- */
const modal = $("#modal"),
  mb = $("#mbody");
const open = (html) => {
  mb.innerHTML = html;
  modal.showModal();
};
const cartHTML = () => {
  const sub = cart.reduce((a, w) => a + w.p, 0),
    off = coupon ? sub * 0.05 : 0;
  if (!cart.length)
    return '<h3>Carrinho</h3><p class="mut">Seu carrinho está vazio. Adicione um relógio da coleção.</p>';
  return (
    "<h3>Carrinho</h3>" +
    cart
      .map(
        (w, i) =>
          `<div class="row"><span>${w.n}</span><span>${money(w.p)}<button data-rm="${i}" aria-label="Remover ${w.n}">✕</button></span></div>`,
      )
      .join("") +
    (coupon
      ? `<div class="row"><span>Cupom CLOCK5 (5%)</span><span>-${money(off)}</span></div>`
      : "") +
    `<div class="row tot"><span>Total</span><span>${money(sub - off)}</span></div>` +
    '<p class="mut">Demonstração: a finalização da compra ainda não está conectada.</p>'
  );
};
const INFO = {
  sobre: `<h3>Sobre a Clockway</h3><p>A Clockway reúne relógios de luxo escolhidos um a um, com foco em mecânica bem feita e acabamento que dura décadas.</p><p>Cada peça passa por inspeção antes de chegar até você, e nossa equipe de relojoeiros acompanha o relógio depois da compra.</p>`,
  servicos: `<h3>Nossos serviços</h3><h4>Venda de relógios de luxo</h4><p>Modelos automáticos, manuais e cronógrafos em aço e ouro, com orientação para escolher o ideal para você.</p><h4>Manutenção</h4><p>Revisão completa, limpeza, lubrificação, troca de vidro e pulseira, polimento da caixa e teste de resistência à água.</p>`,
};
$("#cartBtn").onclick = () => open(cartHTML());
document
  .querySelectorAll("[data-m]")
  .forEach((b) => (b.onclick = () => open(INFO[b.dataset.m])));
modal.onclick = (e) => {
  if (e.target === modal || e.target.closest(".x")) return modal.close();
  const r = e.target.closest("[data-rm]");
  if (r) {
    cart.splice(+r.dataset.rm, 1);
    upd();
    mb.innerHTML = cartHTML();
  }
};

/* ---------- assistente de relógios ----------
   Responde com uma base local. Para usar uma IA de verdade, coloque aqui o endereço do seu
   servidor (ele chama o modelo). Nunca coloque chaves de API neste arquivo. */
const ENDPOINT = ""; // ex.: 'https://seu-servidor.com/api/chat' (recebe {pergunta}, devolve {resposta})
const KB = [
  [
    /^(oi|ola|bom dia|boa tarde|boa noite)/,
    "Olá! Pergunte sobre tipos de movimento, materiais, manutenção ou sobre os modelos da coleção.",
  ],
  [
    /quartzo|automatic|corda|movimento|bateria/,
    "O automático é mecânico e se carrega com o movimento do pulso. O manual precisa de corda diária. O quartzo usa bateria, é mais preciso e simples de manter. No alto luxo, a mecânica é a mais valorizada.",
  ],
  [
    /safira|vidro|risc/,
    "O vidro de safira é o mais duro entre os usados em relógios (9 na escala Mohs, atrás só do diamante). No dia a dia, praticamente não risca.",
  ],
  [
    /agua|mergulh|piscina|resist|estanque/,
    "100 m de resistência serve para natação. Para mergulho, escolha um modelo próprio, como o Abyss Diver (300 m). Rosqueie a coroa antes de molhar e teste a vedação a cada 2 anos.",
  ],
  [
    /manuten|revis|conserto|limpez|cuidad|polimento/,
    "Em relógios automáticos, faça uma revisão completa a cada 5 anos: desmontagem, limpeza, lubrificação e teste de vedação. No dia a dia, evite ímãs, choques e calor extremo. Fazemos esse serviço aqui na Clockway.",
  ],
  [
    /cupom|desconto|promo/,
    'Na primeira compra você ganha 5% de desconto com o cupom CLOCK5. É só clicar em "Ativar cupom" no banner da página.',
  ],
  [
    /ouro|aco|material|caixa/,
    "O aço 316L é resistente e discreto. O ouro 18k (75% de ouro) é mais macio, mas tem brilho único e valoriza. O ouro rosé leva cobre na liga, o que dá o tom avermelhado.",
  ],
  [
    /gmt|fuso|cronograf|esqueleto/,
    "GMT mostra um segundo fuso horário, o cronógrafo funciona como cronômetro e o esqueleto deixa o movimento à mostra pelo mostrador.",
  ],
  [
    /escolh|recomend|primeiro|iniciante|presente|comprar/,
    "Para o primeiro relógio de luxo, aço, mostrador sóbrio e movimento automático são uma boa base: veja o Nocturne ou o Meridian GMT. Para ocasiões formais, o Aurum Classic.",
  ],
  [
    /garantia|autentic|original|certific/,
    "Cada relógio da Clockway é inspecionado antes da venda. Para detalhes de garantia e certificado, consulte nossa equipe.",
  ],
];
const local = (q) => {
  const n = norm(q),
    hit = WATCHES.find((w) => n.includes(norm(w.n.split(" ")[0])));
  if (hit) return `${hit.n}: ${hit.k}. Preço: ${money(hit.p)}.`;
  for (const [re, a] of KB) if (re.test(n)) return a;
  return "Posso ajudar com tipos de movimento, materiais, resistência à água, manutenção e com os modelos da coleção. Pode reformular a pergunta?";
};
const reply = async (q) => {
  if (ENDPOINT) {
    try {
      const r = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pergunta: q }),
      });
      return (await r.json()).resposta;
    } catch {}
  }
  return local(q);
};
const log = $("#log");
const say = (t, me) => {
  const d = document.createElement("div");
  d.className = "msg" + (me ? " me" : "");
  d.textContent = t;
  log.append(d);
  log.scrollTop = log.scrollHeight;
  return d;
};
say("Olá! Sou o assistente da Clockway. Como posso ajudar?");
$("#chat").onsubmit = async (e) => {
  e.preventDefault();
  const i = $("#ask"),
    q = i.value.trim();
  if (!q) return;
  i.value = "";
  say(q, 1);
  const el = say("...");
  el.textContent = await reply(q);
  log.scrollTop = log.scrollHeight;
};
document.querySelectorAll(".chips button").forEach(
  (b) =>
    (b.onclick = () => {
      $("#ask").value = b.textContent;
      $("#chat").requestSubmit();
    }),
);
