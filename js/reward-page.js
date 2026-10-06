/* Public reward catalogue and a visual preview of the future private mailbox.
   This page does not authenticate viewers or grant access to private files. */
(function () {
  'use strict';
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const iconPaths = {
    envelope: '<rect x="3" y="6" width="26" height="20" rx="3"/><path d="m4 8 12 10L28 8M4 25l9-9m15 9-9-9"/>',
    gift: '<path d="M5 15h22v14H5ZM3 8h26v7H3Zm13 0v21M16 8C8 9 5 5 8 2s6 1 8 6Zm0 0c8 1 11-3 8-6s-6 3-8 6Z"/>',
    lock: '<rect x="7" y="13" width="18" height="15" rx="3"/><path d="M11 13V8a5 5 0 0 1 10 0v5m-5 6v4"/>',
    search: '<circle cx="13" cy="13" r="9"/><path d="m20 20 8 8"/>',
    info: '<circle cx="16" cy="16" r="13"/><path d="M16 14v9m0-14v1"/>',
    close: '<path d="m7 7 18 18M7 25 25 7"/>'
  };
  const icon = name => '<svg viewBox="0 0 32 32" aria-hidden="true">' + iconPaths[name] + '</svg>';
  function imageUrl(value) {
    if (!value || typeof value !== 'string') return '';
    if (window.YamhaUI && typeof window.YamhaUI.safeUrl === 'function') return window.YamhaUI.safeUrl(value, { image: true }) || '';
    try {
      const url = new URL(value, document.baseURI);
      return /^(https?:|file:)$/.test(url.protocol) ? url.href : '';
    } catch (_) { return ''; }
  }
  function mount(container, options) {
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container) return null;
    options = options || {};
    const preview = new URLSearchParams(location.search).get('preview') === '1';
    const assetBase = options.assetBase || '../assets/';
    const state = { tab: new URLSearchParams(location.search).get('tab') === 'photos' ? 'photos' : 'rewards', tier: 'all', query: '', tag: 'all' };
    let lastTrigger = null;
    let data = options;
    const getRows = () => {
      const rows = typeof data.getRewards === 'function' ? data.getRewards() : data.rewards;
      return Array.isArray(rows) ? rows.filter(row => row && row.published !== false) : [];
    };
    const previewRewards = [
      { id: 'preview-first', title: '첫 번째 편지', description: '마냥단에게 전하는 작은 선물', tier: 1, required_months: 1, preview_url: assetBase + 'photo-01.png', sample: true },
      { id: 'preview-sweet', title: '달콤한 하루', description: '함께한 시간을 차곡차곡', tier: 1, required_months: 3, preview_url: assetBase + 'photo-02.png', sample: true },
      { id: 'preview-special', title: '너에게 보내는 마음', description: '소중한 순간을 담아 보냈어요', tier: 2, required_months: 1, preview_url: assetBase + 'photo-04.png', sample: true },
      { id: 'preview-anniversary', title: '우리의 계절', description: '오래오래 꺼내 보고 싶은 편지', tier: 2, required_months: 6, preview_url: assetBase + 'photo-05.png', sample: true }
    ];
    const previewPhotos = [
      { id: 'photo-1', title: '마냥단에게, 브이!', tags: ['도토리바구니', '얌하'], preview_url: assetBase + 'photo-01.png' },
      { id: 'photo-2', title: '웃음 가득한 오후', tags: ['도토리바구니', '여름'], preview_url: assetBase + 'photo-02.png' },
      { id: 'photo-3', title: '오늘도 안녕!', tags: ['얌하', '여름'], preview_url: assetBase + 'photo-03.png' },
      { id: 'photo-4', title: '분홍빛으로 물든 순간', tags: ['도토리바구니', '얌하'], preview_url: assetBase + 'photo-04.png' },
      { id: 'photo-5', title: '햇살 좋은 날', tags: ['여름', '얌하'], preview_url: assetBase + 'photo-05.png' }
    ];
    let visibleRewards = [];
    let visiblePhotos = [];
    const dialog = document.createElement('dialog');
    dialog.className = 'yr-dialog';
    dialog.setAttribute('aria-label', '리워드 미리보기');
    document.body.appendChild(dialog);
    function cleanImages(scope) {
      scope.querySelectorAll('img').forEach(img => img.addEventListener('error', () => {
        const parent = img.parentElement;
        if (parent && parent.classList.contains('yr-preview-image')) { img.remove(); parent.insertAdjacentHTML('beforeend', icon('envelope')); }
        else { img.alt = '이미지를 불러올 수 없습니다'; }
      }, { once: true }));
    }
    function showDialog(title, body, className, trigger) {
      lastTrigger = trigger;
      dialog.className = 'yr-dialog ' + (className || '');
      dialog.setAttribute('aria-label', title);
      dialog.innerHTML = '<div class="yr-dialog-top"><span>' + esc(title) + '</span><button class="yr-dialog-close" type="button" aria-label="닫기">' + icon('close') + '</button></div><div class="yr-dialog-body">' + body + '</div>';
      dialog.querySelector('.yr-dialog-close').addEventListener('click', () => dialog.close());
      cleanImages(dialog);
      dialog.showModal();
    }
    dialog.addEventListener('close', () => { if (lastTrigger && lastTrigger.isConnected) lastTrigger.focus(); });
    dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); } });
    function getRewards() {
      const actual = getRows();
      return (preview && !actual.length ? previewRewards : actual).map((row, index) => ({
        id: String(row.id == null ? index : row.id),
        title: String(row.title || '구독 리워드'), description: String(row.description || ''),
        tier: Number(row.tier) === 2 ? 2 : 1,
        required_months: Math.max(1, parseInt(row.required_months, 10) || 1),
        preview_url: imageUrl(row.preview_url || row.image_url || ''),
        sample: row.sample === true,
        sort_order: Number.isFinite(Number(row.sort_order)) ? Number(row.sort_order) : index
      })).sort((a, b) => a.sort_order - b.sort_order);
    }
    function getPhotos() {
      if (!preview) return [];
      const rows = typeof data.getPhotos === 'function' ? data.getPhotos() : data.photos;
      const actual = Array.isArray(rows) ? rows.filter(row => row && typeof row === 'object') : [];
      return (actual.length ? actual : previewPhotos).map((row, index) => ({
        id: String(row.id == null ? index : row.id),
        title: String(row.title || '얌하의 순간'),
        tags: [...new Set((Array.isArray(row.tags) ? row.tags : String(row.tags || '').split(/[,#\n]/)).map(tag => String(tag).replace(/^#+/, '').trim()).filter(Boolean))],
        preview_url: imageUrl(row.preview_url || row.image_url || ''),
        sort_order: Number.isFinite(Number(row.sort_order)) ? Number(row.sort_order) : index
      })).sort((a, b) => a.sort_order - b.sort_order);
    }
    function empty(title, description, locked) {
      return '<div class="yr-empty' + (locked ? ' yr-locked' : '') + '"><div class="yr-letter-illustration" aria-hidden="true">' + icon('envelope') + '</div><h3>' + esc(title) + '</h3><p>' + esc(description) + '</p>' + (locked ? '<button class="yr-login" type="button" disabled>' + icon('lock') + '치지직 로그인 준비 중</button><p class="yr-lock-note">로그인 기능은 추후 연결됩니다.</p>' : '') + '</div>';
    }
    function renderRewards() {
      visibleRewards = getRewards().filter(row => state.tier === 'all' || String(row.tier) === state.tier);
      const count = container.querySelector('[data-yr-count]');
      if (count) count.innerHTML = '<b>' + visibleRewards.length + '</b>개의 편지';
      const list = container.querySelector('[data-yr-list]');
      if (!list) return;
      if (!visibleRewards.length) {
        list.className = '';
        list.innerHTML = empty('마냥단의 선물을 준비하고 있어요', '새로운 구독 리워드가 도착하면 이곳에서 소개해 드릴게요.');
        return;
      }
      list.className = 'yr-card-grid';
      list.innerHTML = visibleRewards.map((row, index) => '<article class="yr-reward-card"><div class="yr-preview-image">' + (row.preview_url ? '<img src="' + esc(row.preview_url) + '" alt="' + esc(row.title) + ' 미리보기" loading="lazy">' : icon('envelope')) + '<span class="yr-card-tier' + (row.tier === 2 ? ' is-two' : '') + '">' + row.tier + ' TIER</span></div><div class="yr-card-body"><div class="yr-card-number"><strong>' + String(row.required_months).padStart(2, '0') + '</strong><span>개월</span></div><h3>' + esc(row.title) + '</h3><p class="yr-card-description">' + esc(row.description || '마냥단에게 전하는 구독 선물') + '</p><button class="yr-detail-button" type="button" data-yr-detail="' + index + '">선물 안내 보기</button>' + (row.sample ? '<span class="yr-sample-tag">디자인 미리보기</span>' : '') + '</div></article>').join('');
      cleanImages(list);
      list.querySelectorAll('[data-yr-detail]').forEach(button => button.addEventListener('click', () => {
        const row = visibleRewards[Number(button.dataset.yrDetail)];
        if (!row) return;
        showDialog('FOR. 마냥단', (row.preview_url ? '<img src="' + esc(row.preview_url) + '" alt="' + esc(row.title) + '">' : '') + '<h2>' + esc(row.title) + '</h2><div class="yr-dialog-facts"><span>' + row.tier + '티어</span><span>' + row.required_months + '개월 구독 리워드</span></div><p class="yr-dialog-description">' + esc(row.description || '리워드 상세 안내를 준비하고 있어요.') + '</p><div class="yr-dialog-bottom">' + (row.sample ? '<strong>디자인 확인용 샘플입니다.</strong><br>실제 리워드나 수령 조건이 아닙니다.' : '리워드 수령은 치지직 로그인 연결 후 이용할 수 있어요.') + '</div>', '', button);
      }));
    }
    function renderPhotos() {
      const needle = state.query.trim().toLocaleLowerCase('ko-KR').replace(/^#/, '');
      visiblePhotos = getPhotos().filter(row => (state.tag === 'all' || row.tags.includes(state.tag)) && (!needle || [row.title].concat(row.tags).join(' ').toLocaleLowerCase('ko-KR').includes(needle)));
      const list = container.querySelector('[data-yr-list]');
      if (!list) return;
      const count = container.querySelector('[data-yr-count]');
      if (count) count.innerHTML = '미리보기 <b>' + visiblePhotos.length + '</b>장';
      list.innerHTML = visiblePhotos.length ? visiblePhotos.map((row, index) => '<article class="yr-photo-card"><button class="yr-photo-open" type="button" data-yr-photo="' + index + '" aria-label="' + esc(row.title) + ' 크게 보기">' + (row.preview_url ? '<img src="' + esc(row.preview_url) + '" alt="' + esc(row.title) + '" loading="lazy">' : '<span>사진 준비 중</span>') + '</button><h3>' + esc(row.title) + '</h3><p class="yr-photo-tags">' + row.tags.map(tag => '<span>#' + esc(tag) + '</span>').join('') + '</p><span class="yr-sample-tag">디자인 미리보기</span></article>').join('') : '<p class="yr-empty-search">검색한 제목이나 태그의 사진이 없어요.<br>다른 단어로 찾아보세요.</p>';
      cleanImages(list);
      list.querySelectorAll('[data-yr-photo]').forEach(button => button.addEventListener('click', () => {
        const row = visiblePhotos[Number(button.dataset.yrPhoto)];
        if (!row) return;
        showDialog('PHOTO PREVIEW', (row.preview_url ? '<img src="' + esc(row.preview_url) + '" alt="' + esc(row.title) + '">' : '') + '<div class="yr-image-caption">' + esc(row.title) + '<span>화면 확인용 미리보기입니다. 실제 수령 내역이 아닙니다.</span></div>', 'yr-image-dialog', button);
      }));
    }
    function renderPanel() {
      const panel = container.querySelector('[data-yr-panel]');
      container.querySelectorAll('[data-yr-tab]').forEach(button => { const current = button.dataset.yrTab === state.tab; button.setAttribute('aria-selected', String(current)); button.tabIndex = current ? 0 : -1; });
      panel.setAttribute('aria-labelledby', state.tab === 'photos' ? 'yr-tab-photos' : 'yr-tab-rewards');
      if (state.tab === 'rewards') {
        panel.innerHTML = '<div class="yr-toolbar"><div class="yr-tier-filter" aria-label="구독 티어 필터"><button type="button" data-yr-tier="all" aria-pressed="' + (state.tier === 'all') + '">전체</button><button type="button" data-yr-tier="1" aria-pressed="' + (state.tier === '1') + '">1티어</button><button type="button" data-yr-tier="2" aria-pressed="' + (state.tier === '2') + '">2티어</button></div><span class="yr-count" data-yr-count aria-live="polite"></span></div><div data-yr-list></div><div class="yr-information">' + icon('info') + '<p>리워드마다 구독 티어와 수령 조건이 다를 수 있어요.<br>각 선물의 상세 안내를 확인해 주세요.</p></div>';
        panel.querySelectorAll('[data-yr-tier]').forEach(button => button.addEventListener('click', () => { state.tier = button.dataset.yrTier; panel.querySelectorAll('[data-yr-tier]').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.yrTier === state.tier))); renderRewards(); }));
        renderRewards();
      } else if (!preview) {
        panel.innerHTML = empty('마냥단만의 편지함', '나에게 도착한 방셀을 모아 보고, 제목과 태그로 소중한 순간을 찾을 수 있는 공간이에요.', true);
      } else {
        const tags = ['all', ...new Set(getPhotos().flatMap(row => row.tags))];
        if (!tags.includes(state.tag)) state.tag = 'all';
        panel.innerHTML = '<div class="yr-toolbar"><label class="yr-photo-search">' + icon('search') + '<span class="sr-only">사진 제목 또는 태그 검색</span><input type="search" value="' + esc(state.query) + '" data-yr-search placeholder="제목이나 #태그로 찾아보기" autocomplete="off"></label><span class="yr-count" data-yr-count aria-live="polite"></span></div><div class="yr-tag-filter" aria-label="태그 필터">' + tags.map(tag => '<button type="button" data-yr-tag="' + esc(tag) + '" aria-pressed="' + (state.tag === tag) + '">' + (tag === 'all' ? '전체' : '#' + esc(tag)) + '</button>').join('') + '</div><div class="yr-card-grid" data-yr-list></div><div class="yr-information">' + icon('info') + '<p>사진의 제목과 태그를 살펴보는 디자인 미리보기예요.<br>실제 개인 방셀과 다운로드는 로그인 연결 후 제공됩니다.</p></div>';
        panel.querySelector('[data-yr-search]').addEventListener('input', event => { state.query = event.target.value; renderPhotos(); });
        panel.querySelectorAll('[data-yr-tag]').forEach(button => button.addEventListener('click', () => { state.tag = button.dataset.yrTag; panel.querySelectorAll('[data-yr-tag]').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.yrTag === state.tag))); renderPhotos(); }));
        renderPhotos();
      }
    }
    container.innerHTML = '<section class="yr" aria-labelledby="yr-title"><header class="yr-heading"><div><p class="yr-kicker">DEAR. 마냥단</p><h1 id="yr-title">마음을 담은 선물</h1><p class="yr-lede">함께한 시간을 편지 한 장, 사진 한 장에 담았어요.</p></div><div class="yr-stamp" aria-hidden="true"><span>' + icon('envelope') + '</span></div></header>' + (preview ? '<div class="yr-preview-note"><strong>디자인 미리보기</strong><span>샘플 목록이며 실제 리워드·수령 내역이 아닙니다.</span></div>' : '') + '<div class="yr-layout"><aside><div class="yr-pass"><div class="yr-pass-postmark">YAMHA POST OFFICE</div><div class="yr-pass-avatar" aria-hidden="true">' + icon('envelope') + '</div><h2>마냥단 앞으로</h2><p>작고 다정한 마음을 담아,<br>얌하가 보낸 편지예요.</p><button class="yr-login" type="button" disabled>' + icon('lock') + '치지직 로그인 준비 중</button><p class="yr-pass-foot">로그인 기능은 추후 연결됩니다.</p></div><p class="yr-aside-note"><span>♡</span>함께해 준 모든 순간,<br>고마운 마음을 보내요.</p></aside><div class="yr-content"><div class="yr-tabs" role="tablist" aria-label="리워드와 방셀"><button class="yr-tab" id="yr-tab-rewards" data-yr-tab="rewards" type="button" role="tab" aria-controls="yr-panel">' + icon('gift') + '구독 리워드</button><button class="yr-tab" id="yr-tab-photos" data-yr-tab="photos" type="button" role="tab" aria-controls="yr-panel">' + icon('envelope') + '방셀 보관함</button></div><div id="yr-panel" data-yr-panel role="tabpanel"></div></div></div></section>';
    container.querySelectorAll('[data-yr-tab]').forEach(button => {
      button.addEventListener('click', () => { state.tab = button.dataset.yrTab; renderPanel(); });
      button.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        state.tab = event.key === 'Home' ? 'rewards' : event.key === 'End' ? 'photos' : state.tab === 'rewards' ? 'photos' : 'rewards';
        renderPanel();
        container.querySelector('[data-yr-tab="' + state.tab + '"]').focus();
      });
    });
    renderPanel();
    return {
      update(nextData) { if (nextData) data = Object.assign({}, data, nextData); renderPanel(); },
      destroy() { dialog.remove(); container.innerHTML = ''; },
      selectTab(tab) { if (tab === 'photos' || tab === 'rewards') { state.tab = tab; renderPanel(); } }
    };
  }
  window.YAMHAReward = { mount };
})();
