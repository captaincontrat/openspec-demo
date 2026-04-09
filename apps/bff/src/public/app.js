(function () {
  "use strict";

  const map = L.map("map", {
    center: [20, 0],
    zoom: 2,
    minZoom: 2,
    worldCopyJump: true,
    zoomControl: true,
  });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19,
  }).addTo(map);

  const $overlay = document.getElementById("map-overlay");
  const $overlayIcon = document.getElementById("overlay-icon");
  const $overlayMsg = document.getElementById("overlay-message");
  const $overlayRetry = document.getElementById("overlay-retry");
  const $eventCount = document.getElementById("event-count");
  const $statusDot = document.getElementById("status-indicator");
  const $panel = document.getElementById("detail-panel");
  const $panelContent = document.getElementById("panel-content");
  const $panelLoading = document.getElementById("panel-loading");
  const $panelClose = document.getElementById("panel-close");
  const $panelTitle = document.getElementById("panel-title");
  const $panelCategory = document.getElementById("panel-category");
  const $locationBody = document.getElementById("location-body");
  const $weatherBody = document.getElementById("weather-body");
  const $airBody = document.getElementById("air-body");
  const $legendItems = document.getElementById("legend-items");

  let markersLayer = L.layerGroup().addTo(map);

  function showOverlay(icon, message, retryable) {
    $overlayIcon.textContent = icon;
    $overlayMsg.textContent = message;
    $overlayRetry.classList.toggle("hidden", !retryable);
    $overlay.classList.remove("hidden");
  }

  function hideOverlay() {
    $overlay.classList.add("hidden");
  }

  function openPanel() {
    $panel.classList.remove("hidden");
    requestAnimationFrame(function () {
      $panel.classList.add("open");
    });
  }

  function closePanel() {
    $panel.classList.remove("open");
    setTimeout(function () {
      $panel.classList.add("hidden");
    }, 300);
  }

  $panelClose.addEventListener("click", closePanel);

  function createMarkerIcon(color) {
    return L.divIcon({
      className: "event-marker",
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      html: "",
      // background-color set inline so each marker gets its category color
    });
  }

  function createColoredMarker(lat, lon, color) {
    var icon = L.divIcon({
      className: "",
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      html: '<div class="event-marker" style="width:14px;height:14px;background:' + color + '"></div>',
    });
    return L.marker([lat, lon], { icon: icon });
  }

  function buildLegend(events) {
    var seen = {};
    events.forEach(function (ev) {
      var cat = ev.category;
      if (cat && cat.id && !seen[cat.id]) {
        seen[cat.id] = cat;
      }
    });

    $legendItems.innerHTML = "";
    Object.values(seen).forEach(function (cat) {
      var item = document.createElement("div");
      item.className = "legend-item";
      item.innerHTML =
        '<span class="legend-dot" style="background:' + cat.color + '"></span>' +
        '<span>' + (cat.title || cat.id) + '</span>';
      $legendItems.appendChild(item);
    });
  }

  function row(label, value) {
    if (value == null) return "";
    return '<div class="row"><span class="label">' + label + '</span><span>' + value + "</span></div>";
  }

  function renderSection($el, section, renderFn) {
    if (section.status === "error") {
      $el.innerHTML = '<p class="section-error">Indisponible</p>';
      return;
    }
    $el.innerHTML = renderFn(section.data);
  }

  function renderLocation(data) {
    var parts = [data.name, data.admin, data.country].filter(Boolean);
    if (parts.length === 0) return '<p class="section-error">Aucune donnée</p>';
    return (
      '<div class="row"><span class="label">Lieu</span><span>' + parts.join(", ") + "</span></div>" +
      row("Code pays", data.countryCode)
    );
  }

  function renderWeather(data) {
    return (
      row("Température", data.temperature != null ? data.temperature + " °C" : null) +
      row("Humidité", data.humidity != null ? data.humidity + " %" : null) +
      row("Vent", data.windSpeed != null ? data.windSpeed + " km/h" : null) +
      row("Direction", data.windDirection != null ? data.windDirection + "°" : null) +
      row("Conditions", data.description)
    ) || '<p class="section-error">Aucune donnée</p>';
  }

  function renderAir(data) {
    return (
      row("AQI", data.aqi) +
      row("PM2.5", data.pm25 != null ? data.pm25 + " µg/m³" : null) +
      row("PM10", data.pm10 != null ? data.pm10 + " µg/m³" : null) +
      row("NO₂", data.no2 != null ? data.no2 + " µg/m³" : null) +
      row("O₃", data.o3 != null ? data.o3 + " µg/m³" : null)
    ) || '<p class="section-error">Aucune donnée</p>';
  }

  async function loadEventDetail(ev) {
    var coords = ev.geometry && ev.geometry.coordinates;
    if (!coords) return;

    openPanel();
    $panelContent.classList.add("hidden");
    $panelLoading.classList.remove("hidden");

    $panelTitle.textContent = ev.title || ev.id;
    $panelCategory.innerHTML =
      '<span class="cat-dot" style="background:' + ev.category.color + '"></span>' +
      '<span>' + (ev.category.title || ev.category.id || "Inconnu") + "</span>";

    try {
      var res = await fetch("/api/events/" + encodeURIComponent(ev.id) + "?lat=" + coords.lat + "&lon=" + coords.lon);
      var data = await res.json();

      renderSection($locationBody, data.location, renderLocation);
      renderSection($weatherBody, data.weather, renderWeather);
      renderSection($airBody, data.airQuality, renderAir);
    } catch (err) {
      $locationBody.innerHTML = '<p class="section-error">Erreur de connexion</p>';
      $weatherBody.innerHTML = '<p class="section-error">Erreur de connexion</p>';
      $airBody.innerHTML = '<p class="section-error">Erreur de connexion</p>';
    } finally {
      $panelLoading.classList.add("hidden");
      $panelContent.classList.remove("hidden");
    }
  }

  function placeMarkers(events) {
    markersLayer.clearLayers();

    events.forEach(function (ev) {
      var coords = ev.geometry && ev.geometry.coordinates;
      if (!coords || coords.lat == null || coords.lon == null) return;

      var color = (ev.category && ev.category.color) || "#A0AEC0";
      var marker = createColoredMarker(coords.lat, coords.lon, color);

      marker.bindTooltip(ev.title || ev.id, {
        direction: "top",
        offset: [0, -10],
        className: "",
      });

      marker.on("click", function () {
        loadEventDetail(ev);
      });

      markersLayer.addLayer(marker);
    });
  }

  async function loadEvents() {
    hideOverlay();
    $eventCount.textContent = "...";

    try {
      var res = await fetch("/api/events");

      if (!res.ok) {
        $eventCount.textContent = "0";
        showOverlay("⚠", "Service indisponible — impossible de récupérer les événements", true);
        return;
      }

      var data = await res.json();
      var events = data.events || [];

      $eventCount.textContent = events.length;

      if (events.length === 0) {
        showOverlay("🌍", "Aucun événement trouvé", true);
        return;
      }

      placeMarkers(events);
      buildLegend(events);
    } catch (err) {
      $eventCount.textContent = "0";
      showOverlay("⚠", "Service indisponible — impossible de récupérer les événements", true);
    }
  }

  async function checkHealth() {
    try {
      var res = await fetch("/health");
      var data = await res.json();
      $statusDot.className = "status-dot " + (data.status || "");
      $statusDot.title = "Services: " + data.status;
    } catch (e) {
      $statusDot.className = "status-dot unhealthy";
    }
  }

  $overlayRetry.addEventListener("click", function () {
    loadEvents();
  });

  loadEvents();
  checkHealth();
  setInterval(checkHealth, 30000);
})();
