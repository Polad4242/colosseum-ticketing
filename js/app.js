const state = {
    selectedId: null,   
    cart: []            
  };
  const seatIndex = {}; 
  const mapEl = document.getElementById("venue-map");
  const rowLetter = i => String.fromCharCode(65 + i);
  function buildVenue() {
    mapEl.style.height = VENUE.height + "px";
  
    // Arena floor and entrance gates
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
          btn.setAttribute("aria-label", `${sec.name}, row ${seat.row}, seat ${n}, ${cat.price} ${VENUE.currency}`);
          secEl.appendChild(btn);
        }
      }
      mapEl.appendChild(secEl);
    });
  }
  buildVenue();
