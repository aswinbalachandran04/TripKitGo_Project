(function () {
  const form = document.getElementById("createDestinationForm");
  if (!form) return;

  const directoryList = document.getElementById("destinationsDirectoryList");
  const overviewBody = document.getElementById("destinationsOverviewBody");

  const totalEl = document.getElementById("totalDestinationsCount");
  const activeEl = document.getElementById("activeDestinationsCount");
  const trendingEl = document.getElementById("trendingDestinationsCount");
  const draftEl = document.getElementById("draftDestinationsCount");

  const searchInput = document.getElementById("destSearchInput");
  const terrainFilter = document.getElementById("destTerrainFilter");
  const statusFilter = document.getElementById("destStatusFilter");
  const filterBtn = document.getElementById("destFilterBtn");

  const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

  const nameEl = document.getElementById("destName");
  const codeEl = document.getElementById("destCode");
  const visibilityEl = document.getElementById("destVisibility");
  const stateEl = document.getElementById("destState");
  const circuitEl = document.getElementById("destCircuit");
  const durationEl = document.getElementById("destDuration");
  const bestMonthsEl = document.getElementById("destBestMonths");
  const airportEl = document.getElementById("destAirport");
  const railwayEl = document.getElementById("destRailway");
  const heroInput = document.getElementById("destHeroInput");
  const heroDropzone = document.getElementById("destHeroDropzone");
  const heroLabel = document.getElementById("destHeroLabel");
  const bulkInput = document.getElementById("destGalleryBulk");
  const bulkLabel = document.getElementById("destBulkLabel");
  const spot1Input = document.getElementById("destSpot1");
  const spot1Label = document.getElementById("destSpot1Label");
  const spot2Input = document.getElementById("destSpot2");
  const spot2Label = document.getElementById("destSpot2Label");
  const spot3Input = document.getElementById("destSpot3");
  const spot3Label = document.getElementById("destSpot3Label");
  const hookEl = document.getElementById("destHook");
  const captionsEl = document.getElementById("destCaptions");
  const overviewEl = document.getElementById("destOverview");

  // Details modal elements
  const detailsModal = document.getElementById("destinationDetailsModal");
  const closeModalBtn = document.getElementById("closeDestModalBtn");
  const cancelModalBtn = document.getElementById("cancelDestModalBtn");
  const modalCodeEl = document.getElementById("destModalCode");
  const modalStatusEl = document.getElementById("destModalStatus");
  const modalTitleEl = document.getElementById("destModalTitle");
  const modalHookEl = document.getElementById("destModalHook");
  const modalGalleryEl = document.getElementById("destModalGallery");
  const modalCircuitEl = document.getElementById("destModalCircuit");
  const modalTerrainStayEl = document.getElementById("destModalTerrainStay");
  const modalMonthsEl = document.getElementById("destModalMonths");
  const modalAirportEl = document.getElementById("destModalAirport");
  const modalRailwayEl = document.getElementById("destModalRailway");
  const modalOverviewEl = document.getElementById("destModalOverview");

  const TERRAIN_LABELS = {
    hills: "Misty Hills & Tea Estates",
    backwaters: "Backwaters & Lagoons",
    beach: "Coastal & Beaches",
    wildlife: "Forest & Wildlife Reserve",
    heritage: "Heritage & Architecture"
  };

  function statusBadgeHTML(status) {
    const st = (status || "").toLowerCase();
    if (st === "trending") {
      return '<span class="badge bg-danger-subtle text-danger border border-danger-subtle">Featured / Trending</span>';
    }
    if (st === "draft") {
      return '<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">Save as Draft</span>';
    }
    return '<span class="badge bg-success-subtle text-success border border-success-subtle">Active (Bookable)</span>';
  }

  function updateDestinationCounts() {
    if (!overviewBody) return;
    const rows = Array.from(overviewBody.querySelectorAll("tr[data-status]"));

    let active = 0;
    let trending = 0;
    let drafts = 0;

    rows.forEach((row) => {
      const st = (row.dataset.status || "").toLowerCase();
      if (st === "active") active += 1;
      else if (st === "trending") trending += 1;
      else if (st === "draft") drafts += 1;
    });

    if (totalEl) totalEl.textContent = String(rows.length);
    if (activeEl) activeEl.textContent = String(active);
    if (trendingEl) trendingEl.textContent = String(trending);
    if (draftEl) draftEl.textContent = String(drafts);
  }

  function applyDestinationFilters() {
    if (!directoryList) return;
    const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const tVal = terrainFilter ? terrainFilter.value.trim().toLowerCase() : "";
    const stVal = statusFilter ? statusFilter.value.trim().toLowerCase() : "";

    const cards = Array.from(directoryList.querySelectorAll(".dest-card-col"));
    let visibleCount = 0;

    cards.forEach((card) => {
      const cTerrain = (card.dataset.terrain || "").toLowerCase();
      const cStatus = (card.dataset.status || "").toLowerCase();
      const cText = (card.textContent || "").toLowerCase() + " " + (card.dataset.overview || "").toLowerCase();

      const matchesSearch = !q || cText.includes(q);
      const matchesTerrain = !tVal || cTerrain === tVal;
      const matchesStatus = !stVal || cStatus === stVal;
      const isMatch = matchesSearch && matchesTerrain && matchesStatus;

      card.style.display = isMatch ? "" : "none";
      if (isMatch) visibleCount += 1;
    });

    let emptyMsg = document.getElementById("destFilterEmptyMsg");
    if (visibleCount === 0) {
      if (!emptyMsg) {
        emptyMsg = document.createElement("div");
        emptyMsg.id = "destFilterEmptyMsg";
        emptyMsg.className = "col-12 text-center py-4 text-muted";
        emptyMsg.textContent = "No matching destinations found. Adjust your search or filters.";
        directoryList.appendChild(emptyMsg);
      }
      emptyMsg.style.display = "";
    } else if (emptyMsg) {
      emptyMsg.style.display = "none";
    }
  }

  function getCardSlides(card) {
    if (!card) return [];
    try {
      const parsed = JSON.parse(card.dataset.slides || "[]");
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (_) {
      // Fallback below
    }
    const imgEl = card.querySelector(".dest-carousel-img");
    return [
      {
        src: imgEl ? imgEl.src : "../images/destinations.avif",
        caption: card.dataset.name || "Destination View"
      }
    ];
  }

  function renderCardSlide(card, index) {
    const slides = getCardSlides(card);
    if (!slides.length) return;
    const safeIndex = ((index % slides.length) + slides.length) % slides.length;
    card.dataset.slideIndex = String(safeIndex);

    const activeSlide = slides[safeIndex];
    const imgEl = card.querySelector(".dest-carousel-img");
    const capEl = card.querySelector(".dest-carousel-caption");
    const counterEl = card.querySelector(".dest-carousel-counter");

    if (imgEl && activeSlide.src) imgEl.src = activeSlide.src;
    if (capEl) capEl.textContent = activeSlide.caption || `Photo ${safeIndex + 1}`;
    if (counterEl) counterEl.textContent = `${safeIndex + 1} / ${slides.length}`;
  }

  function openDestinationModal(card) {
    if (!detailsModal || !card) return;
    const code = card.dataset.destCode || "";
    const name = card.dataset.name || "Destination";
    const state = card.dataset.state || "";
    const circuit = card.dataset.circuit || "";
    const terrainLabel = card.dataset.terrainLabel || "";
    const duration = card.dataset.duration || "";
    const bestMonths = card.dataset.bestMonths || "";
    const airport = card.dataset.airport || "Not specified";
    const railway = card.dataset.railway || "Not specified";
    const hook = card.dataset.hook || "";
    const overview = card.dataset.overview || "No overview notes added.";
    const status = card.dataset.status || "active";
    const slides = getCardSlides(card);

    if (modalCodeEl) modalCodeEl.textContent = code;
    if (modalStatusEl) modalStatusEl.innerHTML = statusBadgeHTML(status);
    if (modalTitleEl) modalTitleEl.textContent = state ? `${name} — ${state}` : name;
    if (modalHookEl) modalHookEl.textContent = hook;
    if (modalCircuitEl) modalCircuitEl.textContent = state ? `${state} • ${circuit}` : circuit;
    if (modalTerrainStayEl) modalTerrainStayEl.textContent = duration ? `${terrainLabel} • ${duration}` : terrainLabel;
    if (modalMonthsEl) modalMonthsEl.textContent = bestMonths;
    if (modalAirportEl) modalAirportEl.textContent = airport;
    if (modalRailwayEl) modalRailwayEl.textContent = railway;
    if (modalOverviewEl) modalOverviewEl.textContent = overview;

    if (modalGalleryEl) {
      modalGalleryEl.innerHTML = "";
      slides.forEach((slide) => {
        const col = document.createElement("div");
        col.className = "col-12 col-sm-4";
        col.innerHTML = `
          <div class="rounded-3 overflow-hidden border">
            <img src="${slide.src}" alt="${slide.caption || name}" class="w-100" style="height: 115px; object-fit: cover;">
            <div class="px-2 py-1 small text-muted text-truncate">${slide.caption || name}</div>
          </div>
        `;
        modalGalleryEl.appendChild(col);
      });
    }

    detailsModal.classList.remove("d-none");
  }

  function closeDestinationModal() {
    if (!detailsModal) return;
    detailsModal.classList.add("d-none");
  }

  if (directoryList) {
    directoryList.addEventListener("click", function (event) {
      const card = event.target.closest(".dest-card-col");
      if (!card) return;

      if (event.target.closest(".js-carousel-prev")) {
        const current = Number(card.dataset.slideIndex) || 0;
        renderCardSlide(card, current - 1);
        return;
      }

      if (event.target.closest(".js-carousel-next")) {
        const current = Number(card.dataset.slideIndex) || 0;
        renderCardSlide(card, current + 1);
        return;
      }

      if (event.target.closest(".js-view-destination")) {
        openDestinationModal(card);
        return;
      }

      if (event.target.closest(".js-delete-destination")) {
        const code = card.dataset.destCode || "";
        card.remove();
        if (overviewBody && code) {
          const matchingRow = overviewBody.querySelector(`tr[data-dest-code="${code}"]`);
          if (matchingRow) matchingRow.remove();
        }
        updateDestinationCounts();
        applyDestinationFilters();
      }
    });
  }

  if (closeModalBtn) closeModalBtn.addEventListener("click", closeDestinationModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeDestinationModal);
  if (detailsModal) {
    detailsModal.addEventListener("click", function (event) {
      if (event.target === detailsModal) closeDestinationModal();
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && detailsModal && !detailsModal.classList.contains("d-none")) {
      closeDestinationModal();
    }
  });

  function setFieldError(input, message, visualTarget) {
    if (!input) return true;
    const errEl = document.getElementById("err-" + input.id);
    const target = visualTarget || input;

    if (message) {
      target.classList.add("is-invalid");
      if (errEl) {
        errEl.textContent = message;
        errEl.classList.add("active");
      }
      return false;
    }

    target.classList.remove("is-invalid");
    if (errEl) {
      errEl.textContent = "";
      errEl.classList.remove("active");
    }
    return true;
  }

  function validateFileList(fileList, errorInputId, visualTarget) {
    if (!fileList || fileList.length === 0) {
      setFieldError(document.getElementById(errorInputId), "", visualTarget);
      return true;
    }
    for (let i = 0; i < fileList.length; i += 1) {
      const file = fileList[i];
      if (!file.type || !file.type.startsWith("image/")) {
        return setFieldError(document.getElementById(errorInputId), `"${file.name}" must be an image file.`, visualTarget);
      }
      if (file.size > MAX_IMAGE_BYTES) {
        return setFieldError(document.getElementById(errorInputId), `"${file.name}" exceeds the 5 MB limit.`, visualTarget);
      }
    }
    setFieldError(document.getElementById(errorInputId), "", visualTarget);
    return true;
  }

  function validateDestinationForm() {
    let isValid = true;

    const nameVal = nameEl ? nameEl.value.trim() : "";
    if (!nameVal) {
      isValid = setFieldError(nameEl, "Destination name is required.") && isValid;
    } else if (nameVal.length < 2) {
      isValid = setFieldError(nameEl, "Enter at least 2 characters.") && isValid;
    } else {
      setFieldError(nameEl, "");
    }

    const codeVal = codeEl ? codeEl.value.trim().toUpperCase() : "";
    if (!codeVal) {
      isValid = setFieldError(codeEl, "Location code is required.") && isValid;
    } else if (!/^[A-Z0-9_-]{3,20}$/.test(codeVal)) {
      isValid = setFieldError(codeEl, "Use 3–20 uppercase letters, numbers, or hyphens (e.g., DEST-MNR).") && isValid;
    } else {
      if (codeEl) codeEl.value = codeVal;
      setFieldError(codeEl, "");
    }

    const stateVal = stateEl ? stateEl.value.trim() : "";
    if (!stateVal) {
      isValid = setFieldError(stateEl, "State or province is required.") && isValid;
    } else {
      setFieldError(stateEl, "");
    }

    const durVal = durationEl ? durationEl.value.trim() : "";
    if (!durVal) {
      isValid = setFieldError(durationEl, "Recommended stay duration is required.") && isValid;
    } else {
      setFieldError(durationEl, "");
    }

    const monthsVal = bestMonthsEl ? bestMonthsEl.value.trim() : "";
    if (!monthsVal) {
      isValid = setFieldError(bestMonthsEl, "Peak / best months are required.") && isValid;
    } else {
      setFieldError(bestMonthsEl, "");
    }

    isValid = validateFileList(heroInput ? heroInput.files : null, "destHeroInput", heroDropzone) && isValid;
    isValid = validateFileList(bulkInput ? bulkInput.files : null, "destGalleryBulk", null) && isValid;
    isValid = validateFileList(spot1Input ? spot1Input.files : null, "destGalleryBulk", null) && isValid;
    isValid = validateFileList(spot2Input ? spot2Input.files : null, "destGalleryBulk", null) && isValid;
    isValid = validateFileList(spot3Input ? spot3Input.files : null, "destGalleryBulk", null) && isValid;

    const hookVal = hookEl ? hookEl.value.trim() : "";
    if (!hookVal) {
      isValid = setFieldError(hookEl, "One-line destination hook is required.") && isValid;
    } else if (hookVal.length < 8) {
      isValid = setFieldError(hookEl, "Hook should be at least 8 characters.") && isValid;
    } else {
      setFieldError(hookEl, "");
    }

    const overviewVal = overviewEl ? overviewEl.value.trim() : "";
    if (!overviewVal) {
      isValid = setFieldError(overviewEl, "Destination overview is required.") && isValid;
    } else if (overviewVal.length < 15) {
      isValid = setFieldError(overviewEl, "Enter at least 15 characters for the overview.") && isValid;
    } else {
      setFieldError(overviewEl, "");
    }

    return isValid;
  }

  [nameEl, codeEl, stateEl, durationEl, bestMonthsEl, airportEl, railwayEl, hookEl, captionsEl, overviewEl].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", () => setFieldError(el, ""));
  });

  if (heroInput) {
    heroInput.addEventListener("change", () => {
      setFieldError(heroInput, "", heroDropzone);
      if (heroLabel && heroInput.files && heroInput.files[0]) {
        heroLabel.textContent = heroInput.files[0].name;
      }
    });
  }

  if (bulkInput) {
    bulkInput.addEventListener("change", () => {
      setFieldError(bulkInput, "");
      if (bulkLabel && bulkInput.files && bulkInput.files.length > 0) {
        bulkLabel.textContent = `${bulkInput.files.length} gallery photos selected`;
      }
    });
  }

  [
    [spot1Input, spot1Label, "Landscape / Viewpoint"],
    [spot2Input, spot2Label, "Activity / Waterway"],
    [spot3Input, spot3Label, "Culture / Local Stay"]
  ].forEach(([inp, lbl]) => {
    if (!inp) return;
    inp.addEventListener("change", () => {
      setFieldError(bulkInput, "");
      if (lbl && inp.files && inp.files[0]) {
        lbl.textContent = inp.files[0].name;
      }
    });
  });

  form.addEventListener("reset", function () {
    [nameEl, codeEl, stateEl, durationEl, bestMonthsEl, airportEl, railwayEl, hookEl, captionsEl, overviewEl].forEach((el) => {
      setFieldError(el, "");
    });
    setFieldError(heroInput, "", heroDropzone);
    setFieldError(bulkInput, "");
    if (heroLabel) heroLabel.textContent = "Upload Main Cover Photo";
    if (bulkLabel) bulkLabel.textContent = "Add Multiple Photos";
    if (spot1Label) spot1Label.textContent = "Landscape / Viewpoint";
    if (spot2Label) spot2Label.textContent = "Activity / Waterway";
    if (spot3Label) spot3Label.textContent = "Culture / Local Stay";
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!validateDestinationForm()) {
      const firstInvalid = form.querySelector(".is-invalid");
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        if (typeof firstInvalid.focus === "function") firstInvalid.focus();
      }
      return;
    }

    const name = nameEl.value.trim();
    const code = codeEl.value.trim().toUpperCase();
    const visibility = visibilityEl ? visibilityEl.value : "active";
    const state = stateEl.value.trim();
    const circuitText = circuitEl ? circuitEl.options[circuitEl.selectedIndex].text : "South India Circuit";
    const duration = durationEl.value.trim();
    const bestMonths = bestMonthsEl.value.trim();
    const airport = airportEl ? airportEl.value.trim() : "";
    const railway = railwayEl ? railwayEl.value.trim() : "";
    const hook = hookEl.value.trim();
    const overview = overviewEl.value.trim();

    const checkedTerrain = form.querySelector('input[name="terrain_type"]:checked');
    const terrainKey = checkedTerrain ? checkedTerrain.value : "hills";
    const terrainLabel = TERRAIN_LABELS[terrainKey] || terrainKey;

    const customCaptions = (captionsEl ? captionsEl.value.trim() : "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const slides = [];
    if (heroInput && heroInput.files && heroInput.files[0]) {
      slides.push({
        src: URL.createObjectURL(heroInput.files[0]),
        caption: customCaptions[0] || `${name} Cover View`
      });
    }
    if (bulkInput && bulkInput.files) {
      Array.from(bulkInput.files).forEach((file, idx) => {
        slides.push({
          src: URL.createObjectURL(file),
          caption: customCaptions[slides.length] || `${name} Gallery ${idx + 1}`
        });
      });
    }
    [spot1Input, spot2Input, spot3Input].forEach((spotInp, idx) => {
      if (spotInp && spotInp.files && spotInp.files[0]) {
        slides.push({
          src: URL.createObjectURL(spotInp.files[0]),
          caption: customCaptions[slides.length] || `${name} Highlight ${idx + 1}`
        });
      }
    });
    if (!slides.length) {
      slides.push(
        { src: "../images/destinations.avif", caption: customCaptions[0] || `${name} Scenic View` },
        { src: "../images/packages.avif", caption: customCaptions[1] || `${name} Travel Trail` }
      );
    }

    if (overviewBody) {
      const tr = document.createElement("tr");
      tr.dataset.destCode = code;
      tr.dataset.status = visibility;
      tr.innerHTML = `
        <td class="fw-bold">${code}</td>
        <td>
          <div class="fw-semibold">${name}</div>
          <div class="small text-muted">${hook}</div>
        </td>
        <td>${state} &bull; ${circuitText}</td>
        <td>${terrainLabel}</td>
        <td>${bestMonths}</td>
        <td>${duration}</td>
        <td>${statusBadgeHTML(visibility)}</td>
      `;
      overviewBody.prepend(tr);
    }

    if (directoryList) {
      const col = document.createElement("div");
      col.className = "col-12 col-md-6 dest-card-col";
      col.dataset.destCode = code;
      col.dataset.status = visibility;
      col.dataset.terrain = terrainKey;
      col.dataset.name = name;
      col.dataset.state = state;
      col.dataset.circuit = circuitText;
      col.dataset.terrainLabel = terrainLabel;
      col.dataset.duration = duration;
      col.dataset.bestMonths = bestMonths;
      col.dataset.airport = airport;
      col.dataset.railway = railway;
      col.dataset.hook = hook;
      col.dataset.overview = overview;
      col.dataset.slides = JSON.stringify(slides);
      col.dataset.slideIndex = "0";

      const transitLine = [airport, railway].filter(Boolean).join(" &bull; ");

      col.innerHTML = `
        <div class="metric-glass-card flex-column align-items-start h-100 p-0 overflow-hidden">
          <div class="position-relative w-100" style="height: 190px; background: #0b1f3a;">
            <img src="${slides[0].src}" alt="${name}" class="w-100 h-100 dest-carousel-img" style="object-fit: cover;">
            <button type="button" class="btn btn-sm btn-dark bg-opacity-75 border-0 position-absolute top-50 start-0 translate-middle-y ms-2 js-carousel-prev" aria-label="Previous image">
              <i class="bi bi-chevron-left"></i>
            </button>
            <button type="button" class="btn btn-sm btn-dark bg-opacity-75 border-0 position-absolute top-50 end-0 translate-middle-y me-2 js-carousel-next" aria-label="Next image">
              <i class="bi bi-chevron-right"></i>
            </button>
            <div class="position-absolute bottom-0 start-0 end-0 px-3 py-2 d-flex justify-content-between align-items-center text-white small" style="background: linear-gradient(transparent, rgba(11,31,58,0.82));">
              <span class="dest-carousel-caption">${slides[0].caption}</span>
              <span class="badge bg-dark bg-opacity-75 dest-carousel-counter">1 / ${slides.length}</span>
            </div>
          </div>

          <div class="p-4 w-100 d-flex flex-column flex-grow-1">
            <div class="d-flex justify-content-between align-items-center w-100 mb-2">
              <span class="fw-bold small" style="color: var(--teal-primary);">${code}</span>
              ${statusBadgeHTML(visibility)}
            </div>
            <h6 class="fw-bold mb-1" style="color: var(--navy-primary);">${name} &mdash; ${state}</h6>
            <div class="small fw-semibold mb-2">${hook}</div>
            <div class="small mb-1"><i class="bi bi-trees me-1"></i> ${terrainLabel} &bull; ${duration}</div>
            <div class="small mb-1"><i class="bi bi-calendar3 me-1"></i> Peak: ${bestMonths}</div>
            ${transitLine ? `<div class="small text-muted mb-3"><i class="bi bi-airplane me-1"></i> ${transitLine}</div>` : ""}

            <div class="d-flex justify-content-between align-items-center gap-2 pt-3 mt-auto border-top w-100">
              <button type="button" class="btn-brand-teal py-1 px-3 small js-view-destination">
                <i class="bi bi-eye me-1"></i> View
              </button>
              <button type="button" class="btn-brand-outline py-1 px-3 small text-danger border-danger-subtle js-delete-destination">
                <i class="bi bi-trash3 me-1"></i> Delete
              </button>
            </div>
          </div>
        </div>
      `;
      directoryList.prepend(col);
    }

    updateDestinationCounts();
    applyDestinationFilters();
    form.reset();
    if (visibilityEl) visibilityEl.value = "active";
  });

  if (searchInput) searchInput.addEventListener("input", applyDestinationFilters);
  if (terrainFilter) terrainFilter.addEventListener("change", applyDestinationFilters);
  if (statusFilter) statusFilter.addEventListener("change", applyDestinationFilters);
  if (filterBtn) filterBtn.addEventListener("click", applyDestinationFilters);

  updateDestinationCounts();
  applyDestinationFilters();
})();