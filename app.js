/* ============================================================
   실시간 날씨 현황 – app.js
   Open-Meteo API (무료, API키 불필요)
   Geocoding API로 도시명 → 위경도 변환
   ============================================================ */

// 도시명 → 위경도 매핑 (한국 주요 도시)
const CITY_COORDS = {
  "서울":  { lat: 37.5665, lon: 126.9780, name: "서울" },
  "부산":  { lat: 35.1796, lon: 129.0756, name: "부산" },
  "대구":  { lat: 35.8714, lon: 128.6014, name: "대구" },
  "인천":  { lat: 37.4563, lon: 126.7052, name: "인천" },
  "광주":  { lat: 35.1595, lon: 126.8526, name: "광주" },
  "대전":  { lat: 36.3504, lon: 127.3845, name: "대전" },
  "울산":  { lat: 35.5384, lon: 129.3114, name: "울산" },
  "제주":  { lat: 33.4996, lon: 126.5312, name: "제주" },
  "수원":  { lat: 37.2636, lon: 127.0286, name: "수원" },
  "영천":  { lat: 35.9733, lon: 128.9386, name: "영천" },
  "강릉":  { lat: 37.7519, lon: 128.8761, name: "강릉" },
  "전주":  { lat: 35.8242, lon: 127.1480, name: "전주" },
  "익산":  { lat: 35.9483, lon: 126.9578, name: "익산" },
  "춘천":  { lat: 37.8813, lon: 127.7298, name: "춘천" },
  "포항":  { lat: 36.0190, lon: 129.3435, name: "포항" },
};
// 날씨 코드 → 설명 + 이모지
function getWeatherInfo(code, isDay) {
  const d = isDay;
  if (code === 0)              return { desc: "맑음",          icon: d ? "☀️" : "🌙" };
  if (code <= 2)               return { desc: "구름 조금",      icon: d ? "🌤️" : "🌤️" };
  if (code === 3)              return { desc: "흐림",           icon: "☁️" };
  if (code <= 49)              return { desc: "안개",           icon: "🌫️" };
  if (code <= 59)              return { desc: "이슬비",         icon: "🌦️" };
  if (code <= 69)              return { desc: "비",             icon: "🌧️" };
  if (code <= 79)              return { desc: "눈",             icon: "❄️" };
  if (code <= 82)              return { desc: "소나기",         icon: "⛈️" };
  if (code <= 99)              return { desc: "뇌우",           icon: "⛈️" };
  return { desc: "알 수 없음", icon: "🌡️" };
}

// DOM
const cityInput       = document.getElementById("city-input");
const searchBtn       = document.getElementById("search-btn");
const weatherContainer= document.getElementById("weather-container");
const statusArea      = document.getElementById("status-area");
const statusMsg       = document.getElementById("status-msg");
const presetBtns      = document.querySelectorAll(".preset-btn");

function setStatus(msg, loading = false) {
  statusMsg.textContent = msg;
  document.querySelector(".status-icon").textContent = loading ? "⏳" : "🌤️";
}

function showLoading() {
  weatherContainer.classList.add("hidden");
  statusArea.style.display = "block";
  setStatus("날씨 데이터를 불러오는 중...", true);
}

function showWeather() {
  weatherContainer.classList.remove("hidden");
  statusArea.style.display = "none";
}

function showError(msg) {
  weatherContainer.classList.add("hidden");
  statusArea.style.display = "block";
  setStatus(msg);
}

async function fetchWeather(cityKey) {
  const city = CITY_COORDS[cityKey];
  if (!city) {
    showError(`"${cityKey}" 도시를 찾을 수 없어요.\n서울, 부산, 대구, 인천, 제주, 영천 등으로 검색해보세요.`);
    return;
  }

  showLoading();

  try {
    const url = `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${city.lat}&longitude=${city.lon}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,visibility,is_day` +
      `&hourly=temperature_2m,weather_code` +
      `&timezone=Asia%2FSeoul` +
      `&forecast_days=1`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("API 응답 오류");
    const data = await res.json();

    renderWeather(data, city.name);
    showWeather();
  } catch (err) {
    showError("날씨 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    console.error(err);
  }
}

function renderWeather(data, cityName) {
  const c = data.current;
  const isDay = c.is_day === 1;
  const wInfo = getWeatherInfo(c.weather_code, isDay);

  document.getElementById("city-name").textContent    = cityName;
  document.getElementById("weather-icon").textContent = wInfo.icon;
  document.getElementById("temp-big").textContent     = `${Math.round(c.temperature_2m)}°C`;
  document.getElementById("weather-desc").textContent = wInfo.desc;
  document.getElementById("updated-time").textContent = `업데이트: ${new Date().toLocaleString("ko-KR")}`;

  document.getElementById("humidity").textContent   = `${c.relative_humidity_2m}%`;
  document.getElementById("wind").textContent       = `${c.wind_speed_10m} km/h`;
  document.getElementById("feels-like").textContent = `${Math.round(c.apparent_temperature)}°C`;
  document.getElementById("cloud").textContent      = `${c.cloud_cover}%`;
  document.getElementById("rain").textContent       = `${c.precipitation} mm`;
  document.getElementById("visibility").textContent = c.visibility >= 1000
    ? `${(c.visibility / 1000).toFixed(1)} km`
    : `${c.visibility} m`;

  // 시간별 예보
  const hourlyList = document.getElementById("hourly-list");
  const times = data.hourly.time;
  const temps = data.hourly.temperature_2m;
  const codes = data.hourly.weather_code;
  const now   = new Date();

  hourlyList.innerHTML = "";
  let count = 0;
  for (let i = 0; i < times.length && count < 12; i++) {
    const t = new Date(times[i]);
    if (t < now) continue;
    count++;
    const hw = getWeatherInfo(codes[i], t.getHours() >= 6 && t.getHours() < 20);
    const div = document.createElement("div");
    div.className = "hourly-item";
    div.innerHTML = `
      <div class="h-time">${t.getHours()}시</div>
      <div class="h-icon">${hw.icon}</div>
      <div class="h-temp">${Math.round(temps[i])}°</div>
    `;
    hourlyList.appendChild(div);
  }
}

function search() {
  const val = cityInput.value.trim();
  if (!val) return;
  fetchWeather(val);
}

searchBtn.addEventListener("click", search);
cityInput.addEventListener("keydown", e => { if (e.key === "Enter") search(); });
presetBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    cityInput.value = btn.dataset.city;
    fetchWeather(btn.dataset.city);
  });
});

// 처음에 서울 날씨 자동 로드
fetchWeather("서울");
