const KAKAO_KEY = '0e65654b7fcdafe6564733f28ee7b69f';

const CATEGORY_IMAGES = {
  '한식': 'https://images.unsplash.com/photo-1529417305485-480f579e7578?w=400&h=250&fit=crop',
  '일식': 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&h=250&fit=crop',
  '중식': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=250&fit=crop',
  '양식': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=250&fit=crop',
  '해산물': 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=250&fit=crop',
  '치킨': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=250&fit=crop',
  '술집': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=250&fit=crop',
  '고기': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=250&fit=crop',
  'default': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop'
};

function getImage(categoryName) {
  if (!categoryName) return CATEGORY_IMAGES.default;
  for (const [key, url] of Object.entries(CATEGORY_IMAGES)) {
    if (categoryName.includes(key)) return url;
  }
  return CATEGORY_IMAGES.default;
}

function buildQuery(district, cuisine, keyword) {
  let parts = ['인천'];
  if (district) parts.push(district);
  if (cuisine) parts.push(cuisine);
  if (keyword) parts.push(keyword);
  parts.push('회식');
  return parts.join(' ');
}

async function fetchKakao(query) {
  const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&category_group_code=FD6&size=15`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `KakaoAK ${KAKAO_KEY}` }
    });
    if (!res.ok) throw new Error('API 오류');
    const data = await res.json();
    return data.documents || [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

function renderCards(list) {
  const grid = document.getElementById('cards-grid');
  if (!list.length) {
    grid.innerHTML = `<div class="no-result" style="grid-column:1/-1">
      <div class="icon">🔍</div>
      <p>검색 결과가 없습니다.<br>조건을 변경해보세요.</p>
    </div>`;
    return;
  }

  grid.innerHTML = list.map(r => {
    const address = r.road_address_name || r.address_name || '';
    const categoryFull = r.category_name || '';
    const categoryShort = categoryFull.split('>').pop().trim();
    const img = getImage(categoryFull);
    const district = address.match(/(\S+구|\S+군)/)?.[0] || '';

    return `
    <div class="card">
      <img class="card-img" src="${img}" alt="${r.place_name}" loading="lazy"
        onerror="this.src='${CATEGORY_IMAGES.default}'">
      <div class="card-body">
        <div class="card-header">
          <div class="card-name">${r.place_name}</div>
          ${district ? `<span class="tag" style="white-space:nowrap">${district}</span>` : ''}
        </div>
        <div class="card-meta">📍 ${address}</div>
        <div class="card-meta" style="margin-top:4px">🍽 ${categoryShort}</div>
        <div class="card-footer" style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
          <div style="font-size:.85rem;color:var(--text-muted)">
            ${r.phone ? `📞 ${r.phone}` : '전화번호 미등록'}
          </div>
          <a href="${r.place_url}" target="_blank" rel="noopener" class="btn-detail">카카오맵 →</a>
        </div>
      </div>
    </div>`;
  }).join('');
}

function showLoading() {
  document.getElementById('cards-grid').innerHTML = `
    <div class="no-result" style="grid-column:1/-1">
      <div class="icon" style="animation:spin 1s linear infinite;display:inline-block">🔍</div>
      <p style="margin-top:12px">인천 회식 장소를 찾고 있습니다...</p>
    </div>`;
}

function updateCount(count) {
  document.getElementById('result-count').textContent = `총 ${count}개의 회식 장소`;
}

async function search() {
  const district = document.getElementById('region').value;
  const cuisine = document.getElementById('cuisine').value;
  const keyword = document.getElementById('keyword').value.trim();

  showLoading();

  const query = buildQuery(district, cuisine, keyword);
  const results = await fetchKakao(query);

  renderCards(results);
  updateCount(results.length);
  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function init() {
  showLoading();
  const results = await fetchKakao('인천 회식 단체 맛집');
  renderCards(results);
  updateCount(results.length);
}

document.addEventListener('DOMContentLoaded', init);
