/* ============================================================
   경상북도 영천시 의료기관 현황 – app.js
   공공데이터포털 REST API 연동
   ============================================================ */

const CONFIG = {
  endpoint: "https://apis.data.go.kr/5100000/YeongcheonMedicalfacility/getResult",
  apiKey:   "175f573c570576a4a89ae0f7140185c50e84ea6c216d1639b82bc244f985ec9c",
  pageSize: 20,   // 한 화면에 표시할 행 수
};

/* ── 상태 ── */
let allData    = [];   // 전체 원본 데이터
let filtered   = [];   // 검색/필터 결과
let currentPage = 1;

/* ── DOM 레퍼런스 ── */
const fetchBtn    = document.getElementById("fetch-btn");
const searchInput = document.getElementById("search-input");
const typeFilter  = document.getElementById("type-filter");
const tableBody   = document.getElementById("table-body");
const totalCount  = document.getElementById("total-count");
const statusMsg   = document.getElementById("status-msg");
const pagination  = document.getElementById("pagination");

/* ── 헬퍼: 상태 메시지 ── */
function setStatus(msg, type = "") {
  statusMsg.textContent = msg;
  statusMsg.className = "stat-item status-msg " + type;
}

/* ── 헬퍼: 총 건수 표시 ── */
function setCount(n) {
  totalCount.innerHTML = `총 <strong>${n.toLocaleString()}</strong>건`;
}

/* ── API 호출 ── */
async function fetchData() {
  fetchBtn.disabled = true;
  setStatus("데이터를 불러오는 중…", "loading");
  tableBody.innerHTML = `<tr class="empty-row"><td colspan="6"><div class="empty-state"><p>⏳ API 응답 대기 중입니다…</p></div></td></tr>`;
  pagination.innerHTML = "";

  try {
    /* 1차 호출 – numOfRows=1 로 totalCount 파악 */
    const probeUrl = buildUrl(1, 1);
    const probeRes = await fetch(probeUrl);
    if (!probeRes.ok) throw new Error(`HTTP ${probeRes.status}`);
    const probeJson = await probeRes.json();

    const total = extractTotal(probeJson);
    if (total === 0) throw new Error("데이터가 없습니다.");

    /* 2차 호출 – 전체 데이터 한 번에 */
    const fullUrl = buildUrl(1, total);
    const fullRes = await fetch(fullUrl);
    if (!fullRes.ok) throw new Error(`HTTP ${fullRes.status}`);
    const fullJson = await fullRes.json();

    allData = extractItems(fullJson);
    if (allData.length === 0) throw new Error("파싱된 항목이 없습니다.");

    populateTypeFilter(allData);
    applyFilter();
    setStatus(`✅ ${allData.length.toLocaleString()}건 로드 완료`, "success");
  } catch (err) {
    console.error(err);
    setStatus(`❌ 오류: ${err.message}`, "error");
    tableBody.innerHTML = `<tr class="empty-row"><td colspan="6"><div class="empty-state"><p>데이터를 불러오지 못했습니다: ${err.message}</p></div></td></tr>`;
  } finally {
    fetchBtn.disabled = false;
  }
}

/* ── URL 생성 ── */
function buildUrl(pageNo, numOfRows) {
  const params = new URLSearchParams({
    serviceKey: CONFIG.apiKey,
    pageNo,
    numOfRows,
    type: "json",
  });
  return `${CONFIG.endpoint}?${params.toString()}`;
}

/* ── JSON 구조 파싱 (공공데이터 포털 응답 구조 대응) ── */
function extractTotal(json) {
  try {
    return (
      json?.response?.body?.totalCount ||
      json?.getResult?.body?.totalCount ||
      json?.body?.totalCount ||
      json?.totalCount ||
      0
    );
  } catch { return 0; }
}

function extractItems(json) {
  try {
    const body =
      json?.response?.body ||
      json?.getResult?.body ||
      json?.body ||
      json;

    const items = body?.items?.item || body?.items || [];
    return Array.isArray(items) ? items : [items];
  } catch { return []; }
}

/* ── 종별 필터 옵션 생성 ── */
function populateTypeFilter(data) {
  const types = [...new Set(data.map(d => d.종별코드명 || d.clCdNm || d.type || "").filter(Boolean))].sort();
  typeFilter.innerHTML = `<option value="">전체 유형</option>`;
  types.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    typeFilter.appendChild(opt);
  });
}

/* ── 검색 + 필터 적용 ── */
function applyFilter() {
  const keyword = searchInput.value.trim().toLowerCase();
  const selectedType = typeFilter.value;

  filtered = allData.filter(item => {
    const name = (item.yadmNm || item.기관명 || item.name || "").toLowerCase();
    const addr = (item.addr || item.주소 || item.address || "").toLowerCase();
    const type = item.종별코드명 || item.clCdNm || item.type || "";

    const matchKeyword = !keyword || name.includes(keyword) || addr.includes(keyword);
    const matchType    = !selectedType || type === selectedType;
    return matchKeyword && matchType;
  });

  currentPage = 1;
  setCount(filtered.length);
  renderTable();
  renderPagination();
}

/* ── 테이블 렌더링 ── */
function renderTable() {
  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr class="empty-row"><td colspan="6"><div class="empty-state"><svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="16" width="48" height="36" rx="3" stroke="currentColor" stroke-width="2"/><path d="M22 32h20M32 22v20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><p>검색 결과가 없습니다.</p></div></td></tr>`;
    return;
  }

  const start = (currentPage - 1) * CONFIG.pageSize;
  const end   = start + CONFIG.pageSize;
  const pageItems = filtered.slice(start, end);

  tableBody.innerHTML = pageItems.map((item, idx) => {
    const num      = start + idx + 1;
    const name     = item.yadmNm   || item.기관명   || item.name     || "—";
    const typeName = item.clCdNm   || item.종별코드명 || item.type     || "—";
    const addr     = item.addr     || item.주소     || item.address  || "—";
    const tel      = item.telno    || item.전화번호   || item.tel      || "—";
    const dept     = item.dgsbjtCdNm || item.진료과목  || item.dept    || "—";

    return `
      <tr style="animation-delay:${(idx * 0.03).toFixed(2)}s">
        <td>${num}</td>
        <td><strong>${escHtml(name)}</strong></td>
        <td><span class="badge">${escHtml(typeName)}</span></td>
        <td>${escHtml(addr)}</td>
        <td style="font-family:var(--mono);font-size:0.8rem">${escHtml(tel)}</td>
        <td>${escHtml(dept)}</td>
      </tr>`;
  }).join("");
}

/* ── 페이지네이션 렌더링 ── */
function renderPagination() {
  const totalPages = Math.ceil(filtered.length / CONFIG.pageSize);
  if (totalPages <= 1) { pagination.innerHTML = ""; return; }

  const range = paginate(currentPage, totalPages);

  pagination.innerHTML = range.map(p => {
    if (p === "…") return `<span class="page-btn" style="cursor:default;opacity:.4">…</span>`;
    return `<button class="page-btn${p === currentPage ? " active" : ""}" data-page="${p}">${p}</button>`;
  }).join("");

  pagination.querySelectorAll("button[data-page]").forEach(btn => {
    btn.addEventListener("click", () => {
      currentPage = parseInt(btn.dataset.page);
      renderTable();
      renderPagination();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

/* ── 페이지 번호 범위 계산 ── */
function paginate(cur, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (cur <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (cur >= total - 3) return [1, "…", total-4, total-3, total-2, total-1, total];
  return [1, "…", cur-1, cur, cur+1, "…", total];
}

/* ── HTML 이스케이프 ── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ── 이벤트 바인딩 ── */
fetchBtn.addEventListener("click", fetchData);
searchInput.addEventListener("input", applyFilter);
typeFilter.addEventListener("change", applyFilter);

/* ── 초기화 ── */
setCount(0);
