const state = {
  selectedId: null,
  cart: []
};
const seatIndex = {};
const mapEl = document.getElementById("venue-map");
const detailsEl = document.getElementById("seat-details");
const addBtn = document.getElementById("add-to-cart");
const rowLetter = i => String.fromCharCode(65 + i);

function buildVenue() {
  mapEl.style.height = VENUE.height + "px";

  VENUE.landmarks.forEach(l => {
    const el = document.createElement("div");
    el.className = "landmark " + l.cls;
    el.textContent = l.label;
    if (l.title) el.setAttribute("aria-label", l.title);
    el.style.cssText = `left:${l.x}px;top:${l.y}px;width:${l.w}px;height:${l.h}px`;
    mapEl.appendChild(el);
  });

  VENUE.sections.forEach(sec => {
    const cat = VENUE.categories[sec.category];
    const secEl = document.createElement("div");
    secEl.className = "section";
    secEl.style.left = sec.x + "px";
    secEl.style.top = sec.y + "px";
    secEl.style.gridTemplateColumns = `repeat(${sec.seatsPerRow}, ${VENUE.seatSize}px)`;
    secEl.setAttribute("role", "group");
    secEl.setAttribute("aria-label", sec.name);

    for (let r = 0; r < sec.rows; r++) {
      for (let n = 1; n <= sec.seatsPerRow; n++) {
        const id = `${sec.id}-${rowLetter(r)}${n}`;
        const seat = { id, section: sec.name, row: rowLetter(r), number: n,
                       category: sec.category, label: cat.label, price: cat.price,
                       unavailable: VENUE.unavailable.includes(id) };
        seatIndex[id] = seat;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "seat available";
        btn.dataset.id = id;
        btn.style.setProperty("--cat", cat.color);
        secEl.appendChild(btn);
      }
    }
    mapEl.appendChild(secEl);
  });
}

function seatState(id) {
  if (seatIndex[id].unavailable) return "unavailable";
  if (state.cart.includes(id)) return "in-cart";
  if (state.selectedId === id) return "inspected";
  return "available";
}

function seatLabel(seat, s) {
  const status = { available: "available", inspected: "selected",
                   "in-cart": "in your cart", unavailable: "sold" }[s];
  return `${seat.section}, row ${seat.row}, seat ${seat.number}, ${seat.price} ${VENUE.currency}, ${status}`;
}

function renderSeats() {
  document.querySelectorAll(".seat").forEach(btn => {
    const seat = seatIndex[btn.dataset.id];
    const s = seatState(seat.id);
    btn.className = "seat " + s;
    btn.setAttribute("aria-pressed", s === "inspected");
    btn.setAttribute("aria-label", seatLabel(seat, s));
    btn.setAttribute("aria-disabled", s === "unavailable");
  });
}

function renderDetails() {
  const seat = seatIndex[state.selectedId];
  if (!seat) {
    detailsEl.innerHTML = "<p>Select a seat on the map to see its details.</p>";
    addBtn.disabled = true;
    return;
  }
  const s = seatState(seat.id);
  const notes = { available: "Available", inspected: "Available",
                  "in-cart": "Already in your cart", unavailable: "Sold, cannot be selected" };
  detailsEl.innerHTML = `
    <h3>${seat.section}</h3>
    <dl>
      <dt>Row</dt><dd>${seat.row}</dd>
      <dt>Seat</dt><dd>${seat.number}</dd>
      <dt>Category</dt><dd>${seat.label}</dd>
      <dt>Price</dt><dd>${seat.price} ${VENUE.currency}</dd>
      <dt>Status</dt><dd>${notes[s]}</dd>
    </dl>`;
  addBtn.disabled = !(s === "inspected" || s === "available");
}

mapEl.addEventListener("click", e => {
  const btn = e.target.closest(".seat");
  if (!btn) return;
  state.selectedId = btn.dataset.id;
  renderSeats();
  renderDetails();
});

function addToCart() {
  const id = state.selectedId;
  if (!id) return;
  if (seatIndex[id].unavailable) return;
  if (state.cart.includes(id)) return;
  state.cart.push(id);
  saveCart();
  renderCart();
  renderSeats();
  renderDetails();
}

addBtn.addEventListener("click", addToCart);

const cartListEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");

function renderCart() {
  cartListEl.innerHTML = "";
  let total = 0;

  if (state.cart.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "Your cart is empty.";
    cartListEl.appendChild(empty);
  }

  state.cart.forEach(id => {
    const seat = seatIndex[id];
    total += seat.price;

    const li = document.createElement("li");
    const info = document.createElement("span");
    info.textContent = `${seat.section}, Row ${seat.row}, Seat ${seat.number}: ${seat.price} ${VENUE.currency}`;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "Remove";
    removeBtn.dataset.id = id;
    removeBtn.setAttribute("aria-label", `Remove ${seat.section}, row ${seat.row}, seat ${seat.number}`);

    li.appendChild(info);
    li.appendChild(removeBtn);
    cartListEl.appendChild(li);
  });

  cartTotalEl.textContent = `Total: ${total} ${VENUE.currency}`;
}

function removeFromCart(id) {
  state.cart = state.cart.filter(seatId => seatId !== id);
  saveCart();
  renderCart();
  renderSeats();
  renderDetails();
}

cartListEl.addEventListener("click", e => {
  const btn = e.target.closest("button[data-id]");
  if (btn) removeFromCart(btn.dataset.id);
});

const STORAGE_KEY = "colosseum-cart";

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
  } catch (err) {
    console.warn("Could not save cart", err);
  }
}

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved)) return;
    state.cart = saved.filter((id, i) =>
      seatIndex[id] &&
      !seatIndex[id].unavailable &&
      saved.indexOf(id) === i
    );
    saveCart();
  } catch (err) {
    state.cart = [];
    saveCart();
  }
}

function buildLegend() {
  const items = Object.values(VENUE.categories)
    .map(c => `<li><span class="swatch" style="background:${c.color}"></span>${c.label} ${c.price} ${VENUE.currency}</li>`);
  document.getElementById("legend").innerHTML = items.join("") +
    `<li><span class="swatch unavailable"></span>Unavailable</li>
     <li><span class="swatch in-cart"></span>In cart</li>`;
}

const canvasEl = document.getElementById("venue-canvas");
const viewportEl = document.querySelector(".viewport");
const view = { x: 0, y: 0, zoom: 1 };
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.25;
const MOVE_STEP = 60;
const MOVE_LIMIT = 500;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function applyView() {
  canvasEl.style.transform =
    `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`;
}

function zoomBy(amount) {
  view.zoom = clamp(Math.round((view.zoom + amount) * 100) / 100, ZOOM_MIN, ZOOM_MAX);
  applyView();
}

function moveBy(dx, dy) {
  view.x = clamp(view.x + dx, -MOVE_LIMIT, MOVE_LIMIT);
  view.y = clamp(view.y + dy, -MOVE_LIMIT, MOVE_LIMIT);
  applyView();
}

function fitZoom() {
  const byWidth = viewportEl.clientWidth / VENUE.width;
  const byHeight = (viewportEl.clientHeight - 10) / (VENUE.height + 20);
  return Math.min(1, Math.floor(Math.min(byWidth, byHeight) * 100) / 100);
}

function resetView() {
  view.x = 0;
  view.y = 0;
  view.zoom = fitZoom();
  applyView();
}

let lastWidth = window.innerWidth;
window.addEventListener("resize", () => {
  if (window.innerWidth !== lastWidth) {
    lastWidth = window.innerWidth;
    resetView();
  }
});

document.getElementById("zoom-in").addEventListener("click", () => zoomBy(ZOOM_STEP));
document.getElementById("zoom-out").addEventListener("click", () => zoomBy(-ZOOM_STEP));
document.getElementById("move-up").addEventListener("click", () => moveBy(0, MOVE_STEP));
document.getElementById("move-down").addEventListener("click", () => moveBy(0, -MOVE_STEP));
document.getElementById("move-left").addEventListener("click", () => moveBy(MOVE_STEP, 0));
document.getElementById("move-right").addEventListener("click", () => moveBy(-MOVE_STEP, 0));
document.getElementById("reset-view").addEventListener("click", resetView);

const WHEEL_STEP = 0.1;
const DRAG_THRESHOLD = 5;
let dragStart = null;
let dragging = false;
let suppressClick = false;

viewportEl.addEventListener("wheel", e => {
  e.preventDefault();
  zoomBy(e.deltaY < 0 ? WHEEL_STEP : -WHEEL_STEP);
}, { passive: false });

viewportEl.addEventListener("pointerdown", e => {
  if (e.pointerType !== "mouse" || e.button !== 0) return;
  suppressClick = false;
  dragStart = { x: e.clientX, y: e.clientY, viewX: view.x, viewY: view.y };
});

window.addEventListener("pointermove", e => {
  if (!dragStart) return;
  const dx = e.clientX - dragStart.x;
  const dy = e.clientY - dragStart.y;
  if (!dragging && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
  dragging = true;
  viewportEl.classList.add("dragging");
  view.x = clamp(dragStart.viewX + dx, -MOVE_LIMIT, MOVE_LIMIT);
  view.y = clamp(dragStart.viewY + dy, -MOVE_LIMIT, MOVE_LIMIT);
  applyView();
});

window.addEventListener("pointerup", () => {
  if (dragging) {
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 0);
  }
  dragStart = null;
  dragging = false;
  viewportEl.classList.remove("dragging");
});

viewportEl.addEventListener("click", e => {
  if (suppressClick) {
    e.stopPropagation();
    e.preventDefault();
    suppressClick = false;
  }
}, true);

detailsEl.setAttribute("aria-live", "polite");
cartListEl.setAttribute("aria-live", "polite");

buildVenue();
buildLegend();
loadCart();
renderSeats();
renderDetails();
renderCart();
resetView();