/* ============================================================
   app.js — núcleo compartilhado
   Store (dados), formatação, header/footer, favoritos, toasts
   ============================================================ */
(function (w) {
  'use strict';

  /* ---------- configuração do corretor (edite aqui) ---------- */
  var CONFIG = {
    nome: 'Chico Marques',
    empresa: 'Chico Marques Corretor de Imóveis',
    creci: '',
    fone: '(35) 99986-1030',
    foneLink: '5535999861030',      // só dígitos, com DDI
    email: 'chicocomobroker@gmail.com',
    cidade: 'Itajubá',
    uf: 'MG',
    instagram: '',
    facebook: ''
  };

  /* ---------- helpers ---------- */
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] != null && attrs[k] !== '') n.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function debounce(fn, ms) {
    var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms || 220); };
  }
  function qs(name) {
    var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null;
  }

  /* ---------- ícones ---------- */
  var P = { fill: 'none', stroke: 'currentColor' };
  function ic(d, o) {
    o = o || {};
    return '<svg viewBox="0 0 24 24" fill="' + (o.fill || 'none') + '" stroke="' + (o.stroke || 'currentColor') +
      '" stroke-width="' + (o.sw || 1.8) + '" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  }
  var ICONS = {
    pin: ic('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'),
    search: ic('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    filter: ic('<path d="M3 5h18M6 12h12M10 19h4"/>'),
    bed: ic('<path d="M2 17v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5M2 17h20M2 20v-3M22 20v-3M6 10V7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3"/>'),
    bath: ic('<path d="M4 12V6a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z"/><path d="M6 19v2M18 19v2"/>'),
    car: ic('<path d="M5 17h14M6 17v2M18 17v2M4 13l1.5-4.5A2 2 0 0 1 7.4 7h9.2a2 2 0 0 1 1.9 1.5L20 13v4H4Z"/><path d="M4 13h16M7.5 15h.01M16.5 15h.01"/>'),
    area: ic('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/>'),
    heart: ic('<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1l8.8 8.8 8.8-8.8a5 5 0 0 0 0-7.1Z"/>'),
    heartF: ic('<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1l8.8 8.8 8.8-8.8a5 5 0 0 0 0-7.1Z"/>', { fill: 'currentColor' }),
    arrow: ic('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    chevR: ic('<path d="m9 18 6-6-6-6"/>'),
    chevL: ic('<path d="m15 18-6-6 6-6"/>'),
    chevD: ic('<path d="m6 9 6 6 6-6"/>'),
    x: ic('<path d="M18 6 6 18M6 6l12 12"/>'),
    phone: ic('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>'),
    mail: ic('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2.5 7 9.5 6 9.5-6"/>'),
    wa: ic('<path d="M12.04 2A9.9 9.9 0 0 0 2.1 11.9a9.8 9.8 0 0 0 1.35 4.96L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01a9.9 9.9 0 0 0 9.94-9.9A9.9 9.9 0 0 0 12.04 2Zm5.8 14.05c-.24.68-1.42 1.31-1.96 1.35-.5.04-.98.23-3.3-.69-2.78-1.1-4.55-3.94-4.69-4.13-.14-.19-1.12-1.49-1.12-2.84 0-1.35.71-2.01.96-2.29.25-.27.55-.34.73-.34h.52c.17 0 .4-.06.62.48.24.57.8 1.97.87 2.11.07.14.12.3.02.49-.09.19-.14.3-.28.47l-.42.49c-.14.14-.28.29-.12.57.16.28.72 1.18 1.54 1.91 1.06.94 1.95 1.23 2.23 1.37.28.14.44.12.6-.07.17-.19.7-.82.88-1.1.19-.28.37-.23.63-.14.25.09 1.64.77 1.92.91.28.14.47.21.54.33.07.11.07.65-.17 1.33Z"/>', { fill: 'currentColor', stroke: 'none' }),
    check: ic('<path d="M20 6 9 17l-5-5"/>'),
    checkC: ic('<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>'),
    info: ic('<circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/>'),
    alert: ic('<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>'),
    grid: ic('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
    list: ic('<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>'),
    plus: ic('<path d="M12 5v14M5 12h14"/>'),
    pencil: ic('<path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>'),
    trash: ic('<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"/>'),
    eye: ic('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>'),
    eyeOff: ic('<path d="M10.6 6.2A9.9 9.9 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-2.7 3.4M6.6 6.6A17 17 0 0 0 2 12s3.6 6 10 6a9.7 9.7 0 0 0 4.3-1M3 3l18 18M9.9 9.9a3 3 0 0 0 4.2 4.2"/>'),
    upload: ic('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v13"/>'),
    img: ic('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>'),
    save: ic('<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h8"/>'),
    down: ic('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>'),
    up: ic('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>'),
    out: ic('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'),
    home: ic('<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/>'),
    key: ic('<circle cx="8" cy="15" r="4"/><path d="m11 12 8-8 3 3-2 2 2 2-3 3-2-2-2 2"/>'),
    users: ic('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/>'),
    box: ic('<path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/>'),
    star: ic('<path d="m12 2.5 3 6.1 6.7 1-4.9 4.7 1.2 6.7L12 17.8 5.9 21l1.2-6.7L2.2 9.6l6.7-1Z"/>'),
    money: ic('<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.6-.9-1.7-1.5-3-1.5-1.9 0-3 1-3 2.2s1 1.8 3 2.3 3 1.1 3 2.3-1.1 2.2-3 2.2c-1.4 0-2.5-.6-3.1-1.5M12 6.5v11"/>'),
    chart: ic('<path d="M3 3v18h18"/><path d="m7 15 4-5 3 3 5-7"/>'),
    clock: ic('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    copy: ic('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
    refresh: ic('<path d="M21 12a9 9 0 1 1-2.6-6.4M21 3v6h-6"/>'),
    lock: ic('<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'),
    menu: ic('<path d="M4 6h16M4 12h16M4 18h16"/>'),
    ext: ic('<path d="M14 3h7v7M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>'),
    scale: ic('<path d="M12 3v18M7 21h10M3 8l4-3 4 3M13 8l4-3 4 3"/><path d="M3 8a4 4 0 0 0 8 0M13 8a4 4 0 0 0 8 0"/>'),
    tag: ic('<path d="M20.6 13.4 12 22l-9-9V3h10Z"/><circle cx="7.5" cy="7.5" r="1.5"/>')
  };

  /* ---------- formatação ---------- */
  var fmt = {
    moeda: function (n) {
      if (n == null || isNaN(n)) return 'Sob consulta';
      return 'R$ ' + Number(n).toLocaleString('pt-BR', { maximumFractionDigits: 0 });
    },
    moedaCurta: function (n) {
      if (n == null || isNaN(n)) return 'Sob consulta';
      n = Number(n);
      if (n >= 1000000) return 'R$ ' + (n / 1000000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mi';
      if (n >= 1000) return 'R$ ' + (n / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + ' mil';
      return 'R$ ' + n.toLocaleString('pt-BR');
    },
    area: function (n) { return n ? Number(n).toLocaleString('pt-BR') + ' m²' : '—'; },
    fim: function (f) { return f === 'aluguel' ? 'Aluguel' : 'Venda'; },
    fimTag: function (f) { return f === 'aluguel' ? 'aluguel' : 'venda'; },
    data: function (ts) { return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }); },
    titulo: function (p) {
      var t = p.tipo || 'Imóvel';
      return t.charAt(0).toUpperCase() + t.slice(1) + (p.bairro ? ' · ' + p.bairro : '');
    },
    /* Monta o link de WhatsApp já com a mensagem pronta. */
    wa: function (msg) {
      var m = msg || ('Olá ' + CONFIG.nome + '! Vim pelo site e gostaria de mais informações.');
      return 'https://wa.me/' + CONFIG.foneLink + '?text=' + encodeURIComponent(m);
    }
  };

  /* ---------- store ---------- */
  var KFAV = 'cm-favs-v1';

  /* ---------- Supabase: banco, login e fotos ---------- */
  var SB = w.CM_SUPABASE || {};
  var KSB = 'cm-sb-session';
  var remoteOk = false, cache = null, dirty = false, pushing = false;

  function normalizar(s) {
    s = s && typeof s === 'object' ? s : {};
    s.overrides = s.overrides || {}; s.extra = s.extra || []; s.trash = s.trash || {};
    return s;
  }
  function sb(path, o) {
    o = o || {};
    var h = { apikey: SB.key };
    for (var k in (o.headers || {})) h[k] = o.headers[k];
    return fetch(SB.url + path, { method: o.method || 'GET', headers: h, body: o.body, cache: 'no-store' });
  }
  function sess() { try { return JSON.parse(localStorage.getItem(KSB) || 'null'); } catch (e) { return null; } }
  function setSess(j) {
    var s = j && j.access_token ? { access_token: j.access_token, refresh_token: j.refresh_token,
      expires_at: j.expires_at || (Math.floor(Date.now() / 1000) + (j.expires_in || 3600)) } : null;
    try { if (s) localStorage.setItem(KSB, JSON.stringify(s)); else localStorage.removeItem(KSB); } catch (e) { }
    return s;
  }
  function token() {
    var s = sess();
    if (!s) return Promise.resolve(null);
    if (s.expires_at - 60 > Date.now() / 1000) return Promise.resolve(s.access_token);
    return sb('/auth/v1/token?grant_type=refresh_token', { method: 'POST',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: s.refresh_token }) })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { var n = setSess(j); return n ? n.access_token : null; })
      .catch(function () { return null; });
  }
  var Auth = {
    isLogged: function () { return !!sess(); },
    login: function (email, senha) {
      return sb('/auth/v1/token?grant_type=password', { method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email, password: senha }) })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error('login'); setSess(j); return true; }); });
    },
    logout: function () { setSess(null); },
    upload: function (blob) {
      var path = 'imoveis/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.jpg';
      return token().then(function (t) {
        if (!t) throw new Error('sessao');
        return sb('/storage/v1/object/fotos/' + path, { method: 'POST', body: blob,
          headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'image/jpeg', 'Cache-Control': 'max-age=31536000' } });
      }).then(function (r) {
        if (!r.ok) throw new Error('upload');
        return SB.url + '/storage/v1/object/public/fotos/' + path;
      });
    }
  };

  /* carrega o estado salvo (alterações do corretor) antes de desenhar as páginas */
  var ready = (function () {
    if (!SB.url || !SB.key) return Promise.resolve();
    var limite = new Promise(function (res) { setTimeout(res, 7000); });
    var carga = sb('/rest/v1/site_state?id=eq.1&select=data')
      .then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); })
      .then(function (rows) { cache = normalizar(rows[0] && rows[0].data); remoteOk = true; })
      .catch(function () { });
    return Promise.race([carga, limite]);
  })();
  w.CM = { run: function (src) { ready.then(function () {
    var s = document.createElement('script'); s.src = src; document.body.appendChild(s); }); } };
  w.addEventListener('beforeunload', function (e) { if (dirty || pushing) { e.preventDefault(); e.returnValue = ''; } });

  function readState() { return JSON.parse(JSON.stringify(cache || normalizar({}))); }
  function writeState(s) {
    if (!remoteOk || !Auth.isLogged()) { toast('Não foi possível salvar: recarregue a página e entre de novo.', 'err'); return false; }
    cache = normalizar(JSON.parse(JSON.stringify(s)));
    dirty = true; flush();
    return true;
  }
  function flush() {
    if (pushing) return;
    pushing = true;
    (function next() {
      if (!dirty) { pushing = false; return; }
      dirty = false;
      var body = JSON.stringify({ id: 1, data: cache, updated_at: new Date().toISOString() });
      token().then(function (t) {
        if (!t) throw new Error('sessao');
        return sb('/rest/v1/site_state?on_conflict=id', { method: 'POST', body: body,
          headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates,return=minimal' } });
      }).then(function (r) { if (!r.ok) throw new Error('http'); next(); })
        .catch(function () { dirty = true; pushing = false;
          toast('Não consegui salvar online. Confira a internet e salve de novo.', 'err'); });
    })();
  }

  var Store = {
    all: function () {
      var s = readState(), out = [];
      (w.IMOVEIS_SEED || []).forEach(function (p) {
        if (s.trash[p.id]) return;                                   // na lixeira
        out.push(s.overrides[p.id] ? Object.assign({}, p, s.overrides[p.id]) : p);
      });
      s.extra.forEach(function (p) { out.push(p); });                // criados no painel
      return out.filter(function (p) { return p.publicado !== false; });
    },
    allAdmin: function () {
      var s = readState(), map = {};
      (w.IMOVEIS_SEED || []).forEach(function (p) { map[p.id] = Object.assign({}, p, s.overrides[p.id] || {}); });
      s.extra.forEach(function (p) { map[p.id] = p; });
      var out = [];
      for (var k in map) out.push(map[k]);
      out.forEach(function (p) { p.removido = false; });
      // lixeira: o que foi excluído fica visível só no painel
      Object.keys(s.trash).forEach(function (id) {
        var snap = s.trash[id];
        if (map[id]) {
          map[id].removido = true;                                    // tinha original: guarda o que era
          out = out.map(function (p) { return p.id === id ? map[id] : p; });
        } else {
          out.push(Object.assign({}, snap, { removido: true, _parcial: false }));
        }
      });
      return out;
    },
    get: function (id) {
      var s = readState();
      if (s.trash[id]) return null;
      var base = (w.IMOVEIS_SEED || []).filter(function (p) { return p.id === id; })[0];
      if (base) return Object.assign({}, base, s.overrides[id] || {});
      return s.extra.filter(function (p) { return p.id === id; })[0] || null;
    },
    save: function (p) {
      var s = readState();
      var isSeed = (w.IMOVEIS_SEED || []).some(function (x) { return x.id === p.id; });
      var idx = -1;
      s.extra.forEach(function (x, i) { if (x.id === p.id) idx = i; });
      delete s.trash[p.id];                    // regravar tira da lixeira
      if (isSeed) s.overrides[p.id] = p;
      else if (idx > -1) s.extra[idx] = p;
      else s.extra.push(p);
      return writeState(s);
    },
    /* exclusão é sempre reversível: guardamos o imóvel inteiro na lixeira */
    remove: function (id) {
      var s = readState();
      var p = this.get(id);
      if (p) s.trash[id] = p;
      s.extra = s.extra.filter(function (x) { return x.id !== id; });
      delete s.overrides[id];
      return writeState(s);
    },
    restore: function (id) {
      var s = readState();
      var snap = s.trash[id];
      if (!snap) return false;
      var isSeed = (w.IMOVEIS_SEED || []).some(function (x) { return x.id === id; });
      if (isSeed || snap._parcial) {
        // volta ao lugar como override; se não houver snapshot, o seed original reaparece
        if (!snap._parcial) s.overrides[id] = snap;
        delete s.trash[id];
      } else {
        s.extra.push(snap);
        delete s.trash[id];
      }
      return writeState(s);
    },
    esvaziarLixeira: function () {
      var s = readState();
      s.trash = {};
      return writeState(s);
    },
    reset: function () { return writeState({ overrides: {}, trash: {}, extra: [] }); },
    state: readState,
    /* backup */
    exportAll: function () {
      return { _exportadoEm: new Date().toISOString(), _versao: 1, imoveis: this.allAdmin() };
    },
    importAll: function (data) {
      if (!data || !Array.isArray(data.imoveis)) throw new Error('Arquivo inválido: esperado { imoveis: [...] }');
      var s = readState();
      data.imoveis.forEach(function (p) {
        if (!p || !p.id) return;
        var isSeed = (w.IMOVEIS_SEED || []).some(function (x) { return x.id === p.id; });
        delete s.trash[p.id];                       // importar também restaura
        if (isSeed) s.overrides[p.id] = p;
        else {
          var i = s.extra.map(function (x) { return x.id; }).indexOf(p.id);
          if (i > -1) s.extra[i] = p; else s.extra.push(p);
        }
      });
      writeState(s);
      return data.imoveis.length;
    },
    nextCodigo: function (prefix) {
      var usados = {};
      this.allAdmin().forEach(function (p) { usados[p.codigo || p.id] = 1; });
      for (var i = 1; i < 9999; i++) {
        var c = prefix + '-' + ('00' + i).slice(-3);
        if (!usados[c]) return c;
      }
      return prefix + '-' + Date.now();
    }
  };

  /* ---------- favoritos ---------- */
  var Favs = {
    get: function () { try { return JSON.parse(localStorage.getItem(KFAV) || '[]'); } catch (e) { return []; } },
    has: function (id) { return this.get().indexOf(id) > -1; },
    toggle: function (id) {
      var l = this.get(), i = l.indexOf(id);
      if (i > -1) l.splice(i, 1); else l.push(id);
      try { localStorage.setItem(KFAV, JSON.stringify(l)); } catch (e) { }
      return i === -1;
    },
    clear: function () { localStorage.removeItem(KFAV); }
  };

  /* ---------- toasts ---------- */
  function toast(msg, type) {
    var box = $('#toasts');
    if (!box) { box = el('div', { id: 'toasts', class: 'toasts' }); document.body.appendChild(box); }
    var t = el('div', { class: 'toast ' + (type || 'ok') });
    t.innerHTML = (type === 'err' ? ICONS.alert : ICONS.checkC) + '<span>' + esc(msg) + '</span>';
    box.appendChild(t);
    setTimeout(function () {
      t.style.transition = 'opacity .3s,transform .3s';
      t.style.opacity = '0'; t.style.transform = 'translateY(10px)';
      setTimeout(function () { t.remove(); }, 320);
    }, 3200);
  }

  /* ---------- modal ---------- */
  function modal(opts) {
    var m = el('div', { class: 'modal' });
    var box = el('div', { class: 'modal-box' + (opts.wide ? ' wide' : '') });
    var head = el('div', { class: 'modal-head' }, [el('h3', { text: opts.title || '' })]);
    var x = el('button', { class: 'modal-x', html: ICONS.x, 'aria-label': 'Fechar' });
    head.appendChild(x);
    var body = el('div', { class: 'modal-body' });
    if (typeof opts.body === 'string') body.innerHTML = opts.body; else if (opts.body) body.appendChild(opts.body);
    box.appendChild(head); box.appendChild(body);
    if (opts.footer) {
      var f = el('div', { class: 'modal-foot' });
      (opts.footer || []).forEach(function (b) { f.appendChild(b); });
      box.appendChild(f);
    }
    m.appendChild(el('div', { class: 'modal-bd' }));
    m.appendChild(box);
    document.body.appendChild(m);
    document.body.classList.add('no-scroll');
    function close() {
      m.classList.remove('open');
      setTimeout(function () { m.remove(); document.body.classList.remove('no-scroll'); }, 250);
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    x.addEventListener('click', close);
    $('.modal-bd', m).addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(function () { m.classList.add('open'); });
    return { close: close, box: box, body: body };
  }

  function confirmar(msg, onSim, titulo) {
    var m = modal({
      title: titulo || 'Confirmar',
      body: '<p style="line-height:1.7">' + esc(msg) + '</p>',
      footer: [
        el('button', { class: 'btn btn-ghost', text: 'Cancelar', onclick: function () { m.close(); } }),
        el('button', {
          class: 'btn btn-danger', text: 'Sim, confirmar', onclick: function () { m.close(); onSim(); }
        })
      ]
    });
    return m;
  }

  /* ---------- fallback de imagem ----------
     Foto quebrada é a pior coisa numa lista de imóveis: vira um buraco cinza
     sem explicação. Trocamos por um bloco com o código do imóvel, mantendo a
     composição do grid intacta. */
  function imgFallback(img) {
    var box = img.parentElement;
    if (!box || box.querySelector('.img-fallback')) return;
    var f = document.createElement('div');
    f.className = 'img-fallback';
    f.innerHTML = ICONS.img +
      '<span>' + esc((img.getAttribute('alt') || '').split('·')[0].trim() || 'Foto indisponível') + '</span>';
    box.appendChild(f);
    img.style.visibility = 'hidden';
  }
  document.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t.tagName === 'IMG' && !t.dataset.fallback) {
      t.dataset.fallback = '1';
      imgFallback(t);
    }
  }, true);

  /* ---------- card ---------- */
  function cardHTML(p) {
    var fav = Favs.has(p.id);
    var specs = [
      p.quartos ? '<div class="spec"><b>' + p.quartos + '</b><span>Quartos</span></div>' : '',
      p.suites ? '<div class="spec"><b>' + p.suites + '</b><span>Suítes</span></div>' : '',
      p.banheiros ? '<div class="spec"><b>' + p.banheiros + '</b><span>Banheiros</span></div>' : '',
      p.area ? '<div class="spec"><b>' + Number(p.area).toLocaleString('pt-BR') + '<s>m²</s></b><span>Área</span></div>' : ''
    ].join('');
    return '' +
      '<article class="card" data-id="' + esc(p.id) + '">' +
        '<a class="card-media" href="imovel.html?id=' + encodeURIComponent(p.id) + '" aria-label="' + esc(fmt.titulo(p)) + '">' +
          '<img src="' + esc(p.fotos && p.fotos[0] ? p.fotos[0] : '') + '" alt="' + esc(fmt.titulo(p)) + '" loading="lazy" decoding="async">' +
          '<div class="card-badges">' +
            '<span class="badge ' + fmt.fimTag(p.finalidade) + '">' + fmt.fim(p.finalidade) + '</span>' +
            (p.destaque ? '<span class="badge destaque">Destaque</span>' : '') +
          '</div>' +
          '<div class="card-price"><small>' + fmt.fim(p.finalidade) + '</small>' + fmt.moeda(p.preco) + '</div>' +
        '</a>' +
        '<button class="card-fav' + (fav ? ' on' : '') + '" data-fav="' + esc(p.id) + '" aria-label="Favoritar" title="Favoritar">' + (fav ? ICONS.heartF : ICONS.heart) + '</button>' +
        '<div class="card-body">' +
          '<h3 class="card-title"><a href="imovel.html?id=' + encodeURIComponent(p.id) + '">' + esc(fmt.titulo(p)) + '</a></h3>' +
          '<div class="card-loc">' + ICONS.pin + '<span>' + esc(p.bairro) + ' · ' + esc(p.cidade) + '/' + esc(p.uf || 'MG') + '</span></div>' +
          (specs ? '<div class="card-specs">' + specs + '</div>' : '') +
          '<div class="card-foot">' +
            '<span class="card-code">Cód. ' + esc(p.codigo || p.id) + '</span>' +
            '<span class="card-cta">Ver imóvel ' + ICONS.arrow + '</span>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function gridHTML(lista) {
    return lista.map(cardHTML).join('');
  }

  /* delegação de favoritos */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-fav]');
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    var on = Favs.toggle(b.getAttribute('data-fav'));
    b.classList.toggle('on', on);
    b.innerHTML = on ? ICONS.heartF : ICONS.heart;
    b.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'ease-out' });
  });

  /* ---------- header / footer / drawer ---------- */
  var NAV = [
    { h: 'index.html', t: 'Início' },
    { h: 'index.html#imoveis', t: 'Imóveis' },
    { h: 'index.html#bairros', t: 'Bairros' },
    { h: 'index.html#sobre', t: 'Sobre' },
    { h: 'contato.html', t: 'Contato' }
  ];

  function mountChrome(opt) {
    opt = opt || {};
    var ini = document.createElement('a'); ini.href = 'index.html';
    if (document.body.getAttribute('data-page') === 'home') ini.href = '#top';

    var topbar = el('div', { class: 'topbar' });
    topbar.innerHTML =
      '<div class="wrap">' +
        '<div class="topbar-l">' +
          '<span class="hide-s">' + ICONS.pin + esc(CONFIG.cidade) + '/' + esc(CONFIG.uf) + '</span>' +
          '<a href="tel:+' + CONFIG.foneLink + '" class="hide-s">' + ICONS.phone + esc(CONFIG.fone) + '</a>' +
        '</div>' +
        '<div class="topbar-l"><a href="mailto:' + CONFIG.email + '">' + ICONS.mail + esc(CONFIG.email) + '</a></div>' +
      '</div>';

    var header = el('header', { class: 'header' });
    header.innerHTML =
      '<div class="wrap">' +
        '<a class="brand" href="index.html">' +
          '<span class="brand-mark">CM</span>' +
          '<span class="brand-txt"><strong>' + esc(CONFIG.nome) + '</strong><span>Corretor de Imóveis</span></span>' +
        '</a>' +
        '<nav class="nav" aria-label="Principal">' +
          NAV.map(function (n) {
            return '<a href="' + n.h + '"' + (n.t === opt.ativo ? ' class="on"' : '') + '>' + n.t + '</a>';
          }).join('') +
        '</nav>' +
        '<div class="header-cta">' +
          '<a class="btn btn-ghost btn-sm" href="corretor.html">' + ICONS.lock + 'Área do corretor</a>' +
          '<a class="btn btn-primary btn-sm" href="https://wa.me/' + CONFIG.foneLink + '" target="_blank" rel="noopener">' + ICONS.wa + 'WhatsApp</a>' +
          '<button class="burger" aria-label="Menu">' + ICONS.menu + '</button>' +
        '</div>' +
      '</div>';

    var drawer = el('div', { class: 'drawer' });
    drawer.innerHTML =
      '<div class="drawer-bd"></div>' +
      '<aside class="drawer-panel">' +
        '<div style="display:flex;align-items:center">' +
          '<a class="brand" href="index.html">' +
            '<span class="brand-mark">CM</span>' +
            '<span class="brand-txt"><strong>' + esc(CONFIG.nome) + '</strong><span>Corretor de Imóveis</span></span>' +
          '</a>' +
          '<button class="drawer-x" aria-label="Fechar">' + ICONS.x + '</button>' +
        '</div>' +
        '<nav>' + NAV.map(function (n) { return '<a href="' + n.h + '">' + n.t + '</a>'; }).join('') + '</nav>' +
        '<div class="drawer-foot">' +
          '<a class="btn btn-primary btn-block" href="https://wa.me/' + CONFIG.foneLink + '" target="_blank" rel="noopener">' + ICONS.wa + 'Falar no WhatsApp</a>' +
          '<a class="btn btn-ghost btn-block" href="tel:+' + CONFIG.foneLink + '">' + ICONS.phone + esc(CONFIG.fone) + '</a>' +
          '<a class="btn btn-ghost btn-block" href="corretor.html">' + ICONS.lock + 'Área do corretor</a>' +
        '</div>' +
      '</aside>';

    document.body.insertBefore(drawer, document.body.firstChild);
    document.body.insertBefore(header, document.body.firstChild);
    document.body.insertBefore(topbar, document.body.firstChild);

    var bd = $('.drawer-bd', drawer), dx = $('.drawer-x', drawer);
    function closeD() { drawer.classList.remove('open'); document.body.classList.remove('no-scroll'); }
    $('.burger', header).addEventListener('click', function () { drawer.classList.add('open'); document.body.classList.add('no-scroll'); });
    bd.addEventListener('click', closeD); dx.addEventListener('click', closeD);
    $$('a', $('.drawer-panel nav', drawer)).forEach(function (a) { a.addEventListener('click', closeD); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeD(); });

    // header stuck
    var hd = header;
    var onScroll = function () { hd.classList.toggle('stuck', w.scrollY > 8); };
    w.addEventListener('scroll', onScroll, { passive: true }); onScroll();

    // highlight nav ativa
    $$('.nav a', header).forEach(function (a) {
      if (a.textContent === opt.ativo) a.classList.add('on');
    });
  }

  function mountFooter() {
    var f = el('footer', { class: 'footer' });
    f.innerHTML =
      '<div class="wrap">' +
        '<div class="footer-grid">' +
          '<div>' +
            '<a class="brand" href="index.html" style="margin-bottom:14px">' +
              '<span class="brand-mark">CM</span>' +
              '<span class="brand-txt"><strong>' + esc(CONFIG.nome) + '</strong><span>Corretor de Imóveis</span></span>' +
            '</a>' +
            '<p style="max-width:34ch;line-height:1.7">Do sonho à realidade. Compra, venda e aluguel de imóveis em ' + esc(CONFIG.cidade) + ' e região com acompanhamento do início ao fim da negociação.</p>' +
          '</div>' +
          '<div><h4>Navegar</h4><div class="footer-links">' +
            '<a href="index.html">Início</a><a href="index.html#imoveis">Imóveis</a>' +
            '<a href="index.html#bairros">Bairros</a><a href="index.html#sobre">Sobre</a>' +
            '<a href="contato.html">Contato</a></div></div>' +
          '<div><h4>Atuação</h4><div class="footer-links">' +
            '<a href="index.html#imoveis">Casas</a><a href="index.html#imoveis">Apartamentos</a>' +
            '<a href="index.html#imoveis">Terrenos e lotes</a><a href="index.html#imoveis">Chácaras e sítios</a>' +
            '<a href="index.html#imoveis">Comerciais</a></div></div>' +
          '<div><h4>Contato</h4><div class="footer-contact">' +
            '<div>' + ICONS.pin + '<span>' + esc(CONFIG.cidade) + ' — ' + esc(CONFIG.uf) + '<br>e cidades da região</span></div>' +
            '<div>' + ICONS.phone + '<a href="tel:+' + CONFIG.foneLink + '">' + esc(CONFIG.fone) + '</a></div>' +
            '<div>' + ICONS.mail + '<a href="mailto:' + CONFIG.email + '">' + esc(CONFIG.email) + '</a></div>' +
            (CONFIG.creci ? '<div>' + ICONS.badge + '<span>CRECI ' + esc(CONFIG.creci) + '</span></div>' : '') +
          '</div></div>' +
        '</div>' +
        '<div class="footer-bottom">' +
          '<span>© ' + new Date().getFullYear() + ' ' + esc(CONFIG.empresa) + '. Todos os direitos reservados.</span>' +
          '<span>Imagens ilustrativas · <a href="corretor.html">Área do corretor</a></span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(f);
  }

  function mountWA() {
    var a = el('a', {
      class: 'wa-float', href: 'https://wa.me/' + CONFIG.foneLink,
      target: '_blank', rel: 'noopener', title: 'Falar no WhatsApp', 'aria-label': 'Falar no WhatsApp'
    });
    a.innerHTML = ICONS.wa;
    document.body.appendChild(a);
  }

  /* ---------- dados derivados ---------- */
  function faceis() {
    var l = Store.all();
    return {
      tipos: uniq(l.map(function (p) { return p.tipo; }).filter(Boolean)).sort(),
      cidades: uniq(l.map(function (p) { return p.cidade; }).filter(Boolean)).sort(),
      bairros: uniq(l.map(function (p) { return p.bairro; }).filter(Boolean)).sort(),
      precos: l.map(function (p) { return p.preco; }).filter(function (n) { return n != null && n > 0; })
    };
  }
  function uniq(a) { return a.filter(function (v, i) { return a.indexOf(v) === i; }); }

  /* ---------- export ---------- */
  w.App = {
    CONFIG: CONFIG, Auth: Auth, ICONS: ICONS, fmt: fmt, Store: Store, Favs: Favs,
    $: $, $$: $$, el: el, esc: esc, debounce: debounce, qs: qs,
    toast: toast, modal: modal, confirmar: confirmar,
    cardHTML: cardHTML, gridHTML: gridHTML,
    mountChrome: mountChrome, mountFooter: mountFooter, mountWA: mountWA,
    faceis: faceis, uniq: uniq
  };
})(window);
