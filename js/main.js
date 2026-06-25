let allRestaurants = [];
let filtered = [];
let sortBy = 'rating';

async function init() {
  const res = await fetch('./data/restaurants.json');
  allRestaurants = await res.json();
  filtered = [...allRestaurants];
  renderCards(filtered);
  updateCount(filtered.length);
}

function search() {
  const region = document.getElementById('region').value;
  const cuisine = document.getElementById('cuisine').value;
  const people = parseInt(document.getElementById('people').value) || 0;
  const budget = parseInt(document.getElementById('budget').value) || 0;
  const mood = document.getElementById('mood').value;

  filtered = allRestaurants.filter(r => {
    if (region && r.district !== region) return false;
    if (cuisine && r.cuisine !== cuisine) return false;
    if (people && (r.minPeople > people || r.maxPeople < people)) return false;
    if (budget && r.budgetMax > budget) return false;
    if (mood && !r.mood.includes(mood)) return false;
    return true;
  });

  applySort();
  renderCards(filtered);
  updateCount(filtered.length);
  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function applySort() {
  if (sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'review') {
    filtered.sort((a, b) => b.reviewCount - a.reviewCount);
  } else if (sortBy === 'budget-asc') {
    filtered.sort((a, b) => a.budgetMin - b.budgetMin);
  } else if (sortBy === 'budget-desc') {
    filtered.sort((a, b) => b.budgetMax - a.budgetMax);
  }
}

function setSort(type) {
  sortBy = type;
  document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-sort="${type}"]`).classList.add('active');
  applySort();
  renderCards(filtered);
}

function renderCards(list) {
  const grid = document.getElementById('cards-grid');
  if (list.length === 0) {
    grid.innerHTML = `<div class="no-result" style="grid-column:1/-1">
      <div class="icon">🔍</div>
      <p>검색 조건에 맞는 회식 장소가 없습니다.<br>조건을 변경해보세요.</p>
    </div>`;
    return;
  }
  grid.innerHTML = list.map(r => `
    <div class="card" onclick="openModal(${r.id})">
      <img class="card-img" src="${r.image}" alt="${r.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=250&fit=crop'">
      <div class="card-body">
        <div class="card-header">
          <div class="card-name">${r.name}</div>
          <div class="card-rating">⭐ ${r.rating} <span style="color:#9ca3af;font-weight:400">(${r.reviewCount})</span></div>
        </div>
        <div class="card-meta">📍 ${r.region} ${r.district} &nbsp;·&nbsp; 🍽 ${r.cuisine}</div>
        <div class="card-desc">${r.description}</div>
        <div class="card-tags">${r.tags.slice(0,3).map(t => `<span class="tag">${t}</span>`).join('')}</div>
        <div class="card-footer">
          <div>
            <div class="card-budget">1인 <strong>${r.budgetMin.toLocaleString()}~${r.budgetMax.toLocaleString()}원</strong></div>
            <div class="card-people">👥 ${r.minPeople}~${r.maxPeople}인</div>
          </div>
          <button class="btn-detail">자세히 보기</button>
        </div>
      </div>
    </div>
  `).join('');
}

function updateCount(count) {
  document.getElementById('result-count').textContent = `총 ${count}개의 회식 장소`;
}

function openModal(id) {
  const r = allRestaurants.find(x => x.id === id);
  if (!r) return;
  document.getElementById('modal-img').src = r.image;
  document.getElementById('modal-img').alt = r.name;
  document.getElementById('modal-title').textContent = r.name;
  document.getElementById('modal-meta').textContent = `📍 ${r.region} ${r.district}  ·  🍽 ${r.cuisine}  ·  ⭐ ${r.rating} (${r.reviewCount}개 리뷰)`;
  document.getElementById('modal-desc').textContent = r.description;
  document.getElementById('modal-address').textContent = r.address;
  document.getElementById('modal-phone').textContent = r.phone;
  document.getElementById('modal-budget').textContent = `${r.budgetMin.toLocaleString()}~${r.budgetMax.toLocaleString()}원`;
  document.getElementById('modal-people').textContent = `${r.minPeople}~${r.maxPeople}인`;
  document.getElementById('modal-tags').innerHTML = r.tags.map(t => `<span class="tag">${t}</span>`).join('');
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
  init();
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
});
