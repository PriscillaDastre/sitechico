/* ============================================================
   detail.js — página de imóvel
   ============================================================ */
(function () {
  'use strict';
  var A = window.App, I = A.ICONS, esc = A.esc, fmt = A.fmt, $ = A.$;
  var app = $('#app');

  A.mountChrome({ ativo: 'Imóveis' });
  A.mountFooter();
  A.mountWA();

  var id = A.qs('id');
  var p = id ? A.Store.get(id) : null;

  if (!p) { renderNaoEncontrado(); }
  else { render(p); }

  /* ---------- imóvel não encontrado ---------- */
  function renderNaoEncontrado() {
    document.title = 'Imóvel não encontrado · Chico Marques';
    app.innerHTML =
      '<div class="wrap" style="padding-block:70px 90px">' +
        '<nav class="crumb"><a href="index.html">Início</a>' + I.chevR + '<span>Imóvel não encontrado</span></nav>' +
        '<div class="empty">' +
          '<div class="ico">' + I.alert + '</div>' +
          '<h3>Não achei este imóvel</h3>' +
          '<p>Ele pode ter sido removido ou despublicado pelo corretor. Dê uma olhada no restante do portfólio.</p>' +
          '<a class="btn btn-primary" href="index.html#imoveis">Ver imóveis disponíveis</a>' +
        '</div>' +
      '</div>';
  }

  /* ---------- imóvel ---------- */
  function render(p) {
    var C = A.CONFIG;
    document.title = fmt.titulo(p) + ' · ' + fmt.moeda(p.preco) + ' · Chico Marques';
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', p.tipo + ' em ' + p.bairro + ', ' + p.cidade + '/' + p.uf + '. ' + (p.area || 0) + ' m². ' + fmt.moeda(p.preco) + '.');

    var fotos = (p.fotos && p.fotos.length) ? p.fotos : [''];
    var waMsg = 'Olá ' + C.nome + '! Tenho interesse no imóvel ' + (p.codigo || p.id) +
      ' — ' + p.tipo + ' em ' + p.bairro + ' (' + fmt.moeda(p.preco) + '). Pode me passar mais informações?';
    var fav = A.Favs.has(p.id);

    var specs = [
      p.quartos ? { i: I.bed, v: p.quartos, t: p.quartos === 1 ? 'Dormitório' : 'Dormitórios' } : null,
      p.suites ? { i: I.check, v: p.suites, t: p.suites === 1 ? 'Suíte' : 'Suítes' } : null,
      p.banheiros ? { i: I.bath, v: p.banheiros, t: p.banheiros === 1 ? 'Banheiro' : 'Banheiros' } : null,
      p.vagas ? { i: I.car, v: p.vagas, t: p.vagas === 1 ? 'Vaga' : 'Vagas' } : null,
      p.area ? { i: I.area, v: p.area, t: 'm² de área' } : null
    ].filter(Boolean);

    var caracteristicas = (p.caracteristicas && p.caracteristicas.length) ? p.caracteristicas : null;

    // imóveis similares: mesma família de tipo ou mesmo bairro
    var similares = A.Store.all().filter(function (x) {
      return x.id !== p.id && (x.slug === p.slug || x.bairro === p.bairro);
    });
    if (similares.length < 3) {
      A.Store.all().forEach(function (x) {
        if (x.id !== p.id && similares.indexOf(x) < 0 && similares.length < 3 &&
          (x.finalidade === p.finalidade)) similares.push(x);
      });
    }
    similares = similares.slice(0, 3);

    var q = [p.bairro, p.cidade].filter(Boolean).join(', ') + ', ' + p.uf + ', Brasil';

    app.innerHTML =
      '<div class="wrap">' +
        '<nav class="crumb">' +
          '<a href="index.html">Início</a>' + I.chevR +
          '<a href="index.html#imoveis">Imóveis</a>' + I.chevR +
          '<a href="index.html#imoveis">' + esc(p.tipo) + '</a>' + I.chevR +
          '<span>' + esc(p.bairro) + '</span>' +
        '</nav>' +

        '<div class="detail detail-grid">' +
          /* ---------- coluna principal ---------- */
          '<div>' +
            '<div class="gallery" id="gal">' + galleryHTML(fotos) + '</div>' +

            '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:22px">' +
              '<span class="badge ' + fmt.fimTag(p.finalidade) + '" style="position:static;backdrop-filter:none">' + fmt.fim(p.finalidade) + '</span>' +
              (p.destaque ? '<span class="badge destaque" style="position:static">Destaque</span>' : '') +
              '<span class="tag">' + esc(p.tipo) + '</span>' +
            '</div>' +

            '<h1 class="detail-title">' + esc(fmt.titulo(p)) + '</h1>' +
            '<div class="detail-loc">' + I.pin + '<span>' + esc(p.bairro) + ' · ' + esc(p.cidade) + '/' + esc(p.uf || 'MG') + '</span></div>' +

            '<div class="price-box">' +
              '<div class="lbl">Valor de ' + fmt.fim(p.finalidade).toLowerCase() + '</div>' +
              '<div class="val">' + fmt.moeda(p.preco) + '</div>' +
              '<div class="note">' +
                (p.finalidade === 'aluguel' ? 'Valor mensal do aluguel.' : 'Valor de venda — condições de pagamento a combinar.') +
                ' Cód. ' + esc(p.codigo || p.id) +
              '</div>' +
            '</div>' +

            (specs.length ? '<div class="spec-grid">' + specs.map(function (s) {
              return '<div class="spec-item">' + s.i + '<b>' + esc(s.v) + '</b><span>' + s.t + '</span></div>';
            }).join('') + '</div>' : '') +

            '<div class="detail-block">' +
              '<h3>Sobre o imóvel</h3>' +
              '<p>' + esc(p.descricao || 'Imóvel sem descrição cadastrada. Fale com o corretor para mais informações.') + '</p>' +
              (caracteristicas ? '<div class="tags">' + caracteristicas.map(function (c) {
                return '<span class="tag">' + I.check + ' ' + esc(c) + '</span>';
              }).join('') + '</div>' : '') +
            '</div>' +

            '<div class="detail-block">' +
              '<h3>Localização</h3>' +
              '<div class="map" id="map" data-q="' + esc(q) + '"></div>' +
              '<div class="detail-loc" style="margin-top:12px;font-size:.87rem">' +
                I.pin + '<span>' + esc(p.bairro) + ', ' + esc(p.cidade) + '/' + esc(p.uf || 'MG') + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +

          /* ---------- sidebar ---------- */
          '<aside class="side">' +
            '<div class="side-card dark">' +
              '<div class="side-agent">' +
                '<span class="agent-av">CM</span>' +
                '<div><b>' + esc(C.nome) + '</b><span>Corretor de imóveis</span></div>' +
              '</div>' +
              '<div class="side-actions">' +
                '<a class="btn btn-gold btn-block" href="' + fmt.wa(waMsg) + '" target="_blank" rel="noopener">' + I.wa + 'Chamar no WhatsApp</a>' +
                '<a class="btn btn-light btn-block" href="tel:+' + C.foneLink + '">' + I.phone + esc(C.fone) + '</a>' +
              '</div>' +
              '<div class="ref-code"><span>Código do imóvel</span><b>' + esc(p.codigo || p.id) + '</b></div>' +
            '</div>' +

            '<div class="side-card">' +
              '<h3 style="margin-bottom:14px;font-size:1rem">Informações rápidas</h3>' +
              '<div class="side-info">' +
                '<div>' + I.pin + '<span>' + esc(p.bairro) + ' — ' + esc(p.cidade) + '/' + esc(p.uf || 'MG') + '</span></div>' +
                (p.area ? '<div>' + I.area + '<span>' + fmt.area(p.area) + ' de área total</span></div>' : '') +
                '<div>' + I.tag + '<span>' + esc(fmt.fim(p.finalidade)) + '</span></div>' +
                '<div>' + I.money + '<span>' + fmt.moeda(p.preco) + '</span></div>' +
              '</div>' +
              '<button class="btn btn-ghost btn-block" id="btnShare">' + I.copy + 'Copiar link do imóvel</button>' +
              '<button class="btn btn-ghost btn-block" id="btnFavDet" style="margin-top:9px">' +
                (fav ? I.heartF : I.heart) + (fav ? 'Remover dos favoritos' : 'Salvar nos favoritos') + '</button>' +
            '</div>' +

            '<div class="fav-note">' + I.info +
              '<span>As fotos e a área publicada aqui podem não corresponder exatamente ao imóvel. Confirme tudo na visita.</span>' +
            '</div>' +
          '</aside>' +
        '</div>' +
      '</div>' +

      (similares.length ? similaresHTML(p, similares) : '') +

      '<section class="cta" style="margin-top:clamp(48px,6vw,80px)">' +
        '<div class="wrap">' +
          '<div><h2>Gostou deste? Vamos ver os outros</h2>' +
          '<p>Me conta o que você procura — bairro, valor, número de quartos — que eu já separo as opções certas.</p></div>' +
          '<div class="cta-actions">' +
            '<a class="btn btn-white" href="' + fmt.wa(waMsg) + '" target="_blank" rel="noopener">' + I.wa + 'Falar agora</a>' +
            '<a class="btn btn-light" href="index.html#imoveis">Ver todos</a>' +
          '</div>' +
        '</div>' +
      '</section>';

    bindGaleria(fotos);
    bindMapa();
    bindSidebar(p, waMsg);
  }

  /* ---------- galeria ---------- */
  function galleryHTML(fotos) {
    var main = fotos[0];
    var thumbs = fotos.slice(1, 5);
    return '<div class="gal-main" id="galMain">' +
        '<img id="galImg" src="' + esc(main) + '" alt="Foto do imóvel">' +
        '<button class="gal-nav prev" aria-label="Foto anterior">' + I.chevL + '</button>' +
        '<button class="gal-nav next" aria-label="Próxima foto">' + I.chevR + '</button>' +
        '<span class="gal-counter" id="galCount">1 / ' + fotos.length + '</span>' +
      '</div>' +
      (thumbs.length ? '<div id="galThumbs">' + thumbs.map(function (f, i) {
        var extra = (i === 3 && fotos.length > 5) ? '<span class="gal-more">+' + (fotos.length - 5) + '</span>' : '';
        return '<div class="gal-thumb' + (i === 0 ? ' on' : '') + '" data-i="' + (i + 1) + '">' +
          '<img src="' + esc(f) + '" alt="Foto ' + (i + 2) + '" loading="lazy">' + extra + '</div>';
      }).join('') + '</div>' : '');
  }

  function bindGaleria(fotos) {
    if (fotos.length < 2) {
      var navs = A.$$('#galMain .gal-nav');
      navs.forEach(function (n) { n.style.display = 'none'; });
      return;
    }
    var idx = 0, img = $('#galImg'), count = $('#galCount');
    function go(i) {
      idx = (i + fotos.length) % fotos.length;
      img.style.opacity = '.35';
      setTimeout(function () { img.src = fotos[idx]; img.style.opacity = '1'; }, 130);
      img.style.transition = 'opacity .18s';
      count.textContent = (idx + 1) + ' / ' + fotos.length;
      A.$$('.gal-thumb').forEach(function (t) {
        t.classList.toggle('on', +t.getAttribute('data-i') === idx);
      });
    }
    $('#galMain').querySelector('.prev').addEventListener('click', function (e) { e.preventDefault(); go(idx - 1); });
    $('#galMain').querySelector('.next').addEventListener('click', function (e) { e.preventDefault(); go(idx + 1); });
    A.$$('.gal-thumb').forEach(function (t) {
      t.addEventListener('click', function () { go(+t.getAttribute('data-i')); });
    });
    // teclado
    document.addEventListener('keydown', function (e) {
      if (!$('#lightbox').classList.contains('open')) {
        if (e.key === 'ArrowLeft') go(idx - 1);
        if (e.key === 'ArrowRight') go(idx + 1);
      }
    });

    /* lightbox */
    var lb = $('#lightbox'), lbImg = lb.querySelector('img');
    lb.querySelector('.lb-x').innerHTML = I.x;
    lb.querySelector('.lb-prev').innerHTML = I.chevL;
    lb.querySelector('.lb-next').innerHTML = I.chevR;
    function open(i) { go(i); lbImg.src = fotos[idx]; lb.classList.add('open'); document.body.classList.add('no-scroll'); }
    function close() { lb.classList.remove('open'); document.body.classList.remove('no-scroll'); }
    $('#galMain').addEventListener('click', function (e) {
      if (e.target.closest('.gal-nav')) return;
      open(idx);
    });
    lb.querySelector('.lb-x').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function (e) { e.stopPropagation(); go(idx - 1); lbImg.src = fotos[idx]; });
    lb.querySelector('.lb-next').addEventListener('click', function (e) { e.stopPropagation(); go(idx + 1); lbImg.src = fotos[idx]; });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') { go(idx - 1); lbImg.src = fotos[idx]; }
      if (e.key === 'ArrowRight') { go(idx + 1); lbImg.src = fotos[idx]; }
    });
  }

  /* ---------- mapa (OpenStreetMap, sem chave) ---------- */
  function bindMapa() {
    var box = $('#map'); if (!box) return;
    var q = encodeURIComponent(box.getAttribute('data-q'));
    var html = '<iframe title="Mapa da localização" loading="lazy" referrerpolicy="no-referrer-when-downgrade" ' +
      'src="https://maps.google.com/maps?q=' + q + '&z=14&output=embed"></iframe>';
    // se a busca falhar, mostra link para abrir no mapa
    box.innerHTML = html +
      '<div style="position:absolute;bottom:10px;right:10px">' +
        '<a class="btn btn-white btn-sm" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=' + q + '">' +
          I.ext + 'Abrir mapa</a></div>';
    box.style.position = 'relative';
  }

  /* ---------- sidebar ---------- */
  function bindSidebar(p, waMsg) {
    var b = $('#btnShare');
    if (b) b.addEventListener('click', function () {
      var url = location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () { A.toast('Link copiado para a área de transferência.'); },
          function () { A.toast('Não foi possível copiar. O endereço já está na barra do navegador.', 'err'); });
      } else {
        A.modal({ title: 'Link do imóvel', body: '<input class="f" value="' + esc(url) + '" readonly onclick="this.select()">' });
      }
    });

    var bf = $('#btnFavDet');
    if (bf) bf.addEventListener('click', function () {
      var on = A.Favs.toggle(p.id);
      bf.innerHTML = (on ? I.heartF : I.heart) + (on ? 'Remover dos favoritos' : 'Salvar nos favoritos');
      A.toast(on ? 'Imóvel salvo nos favoritos.' : 'Removido dos favoritos.');
    });
  }

  /* ---------- similares ---------- */
  function similaresHTML(p, lista) {
    return '<section class="section" style="background:var(--surface);border-top:1px solid var(--line)">' +
      '<div class="wrap">' +
        '<div class="section-head">' +
          '<div><span class="eyebrow">Veja também</span><h2>Imóveis semelhantes</h2></div>' +
          '<a class="btn btn-ghost" href="index.html#imoveis">Ver todos ' + I.arrow + '</a>' +
        '</div>' +
        '<div class="grid">' + A.gridHTML(lista) + '</div>' +
      '</div></section>';
  }
})();
