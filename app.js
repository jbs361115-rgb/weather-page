/* 실시간 날씨 현황 - app.js */

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
  "포항":  { lat: 36.0190, lon: 129.3435, name: "포항" }
};

function getWeatherInfo(code, isDay) {
  if (code === 0)  return { desc: "맑음",    icon: isDay ? "☀️" : "🌙" };
  if (code <= 2)   return { desc: "구름 조금", icon: "🌤️" };
  if (code === 3)  return { desc: "흐림",    icon: "☁️" };
  if (code <= 49)  return { desc: "안개",    icon: "🌫️" };
  if (code <= 59)  return { desc: "이슬비",  icon: "🌦️" };
  if (code <= 69)  return { desc: "비",      icon: "🌧️" };
  if (code <= 79)  return { desc: "눈",      icon: "❄️" };
  if (code <= 82)  return { desc: "소나기",  icon: "⛈️" };
  if (code <= 99)  return { desc: "뇌우",    icon: "⛈️" };
  return { desc: "알 수 없음", icon: "🌡️" };
}

var cityInput        = document.getElementById("city-input");
var searchBtn        = document.getElementById("search-btn");
var weatherContainer = document.getElementById("weather-container");
var statusArea       = document.getElementById("status-area");
var statusMsg        = document.getElementById("status-msg");
var presetBtns       = document.querySelectorAll(".preset-btn");

function setStatus(msg, loading) {
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
  setStatus(msg, false);
}

function fetchWeather(cityKey) {
  var city = CITY_COORDS[cityKey];
  if (!city) {
    showError('"' + cityKey + '" 도시를 찾을 수 없어요.');
    return;
  }
  showLoading();
  var url = "https://api.open-meteo.com/v1/forecast?"
    + "latitude=" + city.lat
    + "&longitude=" + city.lon
    + "&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,visibility,is_day"
    + "&hourly=temperature_2m,weather_code"
    + "&timezone=Asia%2FSeoul"
    + "&forecast_days=1";

  fetch(url)
    .then(function(res) {
      if (!res.ok) throw new Error("API 오류");
      return res.json();
    })
    .then(function(data) {
      renderWeather(data, city.name);
      showWeather();
    })
    .catch(function(err) {
      showError("날씨 데이터를 불러오지 못했습니다.");
      console.error(err);
    });
}

function renderWeather(data, cityName) {
  var c = data.current;
  var isDay = c.is_day === 1;
  var wInfo = getWeatherInfo(c.weather_code, isDay);

  document.getElementById("city-name").textContent    = cityName;
  document.getElementById("weather-icon").textContent = wInfo.icon;
  document.getElementById("temp-big").textContent     = Math.round(c.temperature_2m) + "°C";
  document.getElementById("weather-desc").textContent = wInfo.desc;
  document.getElementById("updated-time").textContent = "업데이트: " + new Date().toLocaleString("ko-KR");
  document.getElementById("humidity").textContent     = c.relative_humidity_2m + "%";
  document.getElementById("wind").textContent         = c.wind_speed_10m + " km/h";
  document.getElementById("feels-like").textContent   = Math.round(c.apparent_temperature) + "°C";
  document.getElementById("cloud").textContent        = c.cloud_cover + "%";
  document.getElementById("rain").textContent         = c.precipitation + " mm";
  document.getElementById("visibility").textContent   = c.visibility >= 1000
    ? (c.visibility / 1000).toFixed(1) + " km"
    : c.visibility + " m";

  var hourlyList = document.getElementById("hourly-list");
  var times = data.hourly.time;
  var temps = data.hourly.temperature_2m;
  var codes = data.hourly.weather_code;
  var now = new Date();
  hourlyList.innerHTML = "";
  var count = 0;
  for (var i = 0; i < times.length && count < 12; i++) {
    var t = new Date(times[i]);
    if (t < now) continue;
    count++;
    var hw = getWeatherInfo(codes[i], t.getHours() >= 6 && t.getHours() < 20);
    var div = document.createElement("div");
    div.className = "hourly-item";
    div.innerHTML = '<div class="h-time">' + t.getHours() + '시</div>'
      + '<div class="h-icon">' + hw.icon + '</div>'
      + '<div class="h-temp">' + Math.round(temps[i]) + '°</div>';
    hourlyList.appendChild(div);
  }
}

function search() {
  var val = cityInput.value.trim();
  if (!val) return;
  fetchWeather(val);
}

searchBtn.addEventListener("click", search);
cityInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") search();
});
presetBtns.forEach(function(btn) {
  btn.addEventListener("click", function() {
    cityInput.value = btn.dataset.city;
    fetchWeather(btn.dataset.city);
  });
});

fetchWeather("서울");
