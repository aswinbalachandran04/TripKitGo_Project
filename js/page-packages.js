(function () {
    const form = document.getElementById("createPackageForm");
    if (!form) return;

    const catalogList = document.getElementById("packagesCatalogList");
    const overviewBody = document.getElementById("packagesOverviewBody");

    const totalCountEl = document.getElementById("totalPackagesCount");
    const publishedCountEl = document.getElementById("publishedPackagesCount");
    const featuredCountEl = document.getElementById("featuredPackagesCount");
    const draftCountEl = document.getElementById("draftPackagesCount");

    // Success message elements inside Panel 3
    const newPkgSuccessBox = document.getElementById("newPackageSuccess");
    const newPkgSuccessTitle = document.getElementById("newPackageSuccessTitle");
    const newPkgSuccessText = document.getElementById("newPackageSuccessText");
    const closeNewPkgSuccessBtn = document.getElementById("closeNewPackageSuccessBtn");

    // Catalog filter elements
    const searchInput = document.getElementById("pkgSearchInput");
    const categoryFilter = document.getElementById("pkgCategoryFilter");
    const statusFilter = document.getElementById("pkgStatusFilter");
    const filterBtn = document.getElementById("pkgFilterBtn");

    const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

    // Create Package form elements
    const titleEl = document.getElementById("pkgTitle");
    const codeEl = document.getElementById("pkgCode");
    const categoryEl = document.getElementById("pkgCategory");
    const durationEl = document.getElementById("pkgDuration");
    const maxPaxEl = document.getElementById("pkgMaxPax");
    const priceEl = document.getElementById("pkgPrice");
    const difficultyEl = document.getElementById("pkgDifficulty");
    const inclusionBoxes = Array.from(form.querySelectorAll('input[name="inc"]'));
    const inclusionErrEl = document.getElementById("err-pkgInclusions");

    // Multi-photo upload elements
    const mediaInput = document.getElementById("pkgMediaInput");
    const mediaDropzone = document.getElementById("pkgMediaDropzone");
    const mediaLabel = document.getElementById("pkgMediaLabel");
    const bulkInput = document.getElementById("pkgGalleryBulk");
    const bulkLabel = document.getElementById("pkgBulkLabel");
    const slot1Input = document.getElementById("pkgGallerySlot1");
    const slot1Label = document.getElementById("pkgSlot1Label");
    const slot2Input = document.getElementById("pkgGallerySlot2");
    const slot2Label = document.getElementById("pkgSlot2Label");
    const slot3Input = document.getElementById("pkgGallerySlot3");
    const slot3Label = document.getElementById("pkgSlot3Label");
    const previewWrap = document.getElementById("pkgSelectedPreviewWrap");
    const previewCountText = document.getElementById("pkgPreviewCountText");
    const previewGrid = document.getElementById("pkgSelectedPreviewGrid");
    const clearPhotosBtn = document.getElementById("clearPkgPhotosBtn");
    const captionsEl = document.getElementById("pkgGalleryCaptions");
    const itineraryEl = document.getElementById("pkgItinerary");

    // View Package Modal elements
    const viewModal = document.getElementById("packageDetailsModal");
    const closeViewBtn = document.getElementById("closePkgViewBtn");
    const cancelViewBtn = document.getElementById("cancelPkgViewBtn");
    const editFromViewBtn = document.getElementById("editFromPkgViewBtn");
    const viewCodeEl = document.getElementById("pkgViewCode");
    const viewStatusEl = document.getElementById("pkgViewStatus");
    const viewTitleEl = document.getElementById("pkgViewTitle");
    const viewMetaEl = document.getElementById("pkgViewMeta");
    const viewCarouselImg = document.getElementById("pkgViewCarouselImg");
    const viewCarouselPrev = document.getElementById("pkgViewCarouselPrev");
    const viewCarouselNext = document.getElementById("pkgViewCarouselNext");
    const viewCarouselCaption = document.getElementById("pkgViewCarouselCaption");
    const viewCarouselCounter = document.getElementById("pkgViewCarouselCounter");
    const viewCarouselThumbs = document.getElementById("pkgViewCarouselThumbs");
    const viewDurationEl = document.getElementById("pkgViewDuration");
    const viewPaxEl = document.getElementById("pkgViewPax");
    const viewPriceEl = document.getElementById("pkgViewPrice");
    const viewDifficultyEl = document.getElementById("pkgViewDifficulty");
    const viewInclusionsEl = document.getElementById("pkgViewInclusions");
    const viewItineraryEl = document.getElementById("pkgViewItinerary");

    // Edit Package Modal elements
    const editModal = document.getElementById("editPackageModal");
    const closeEditBtn = document.getElementById("closeEditPkgBtn");
    const cancelEditBtn = document.getElementById("cancelEditPkgBtn");
    const editForm = document.getElementById("editPackageForm");
    const editOriginalCodeEl = document.getElementById("editPkgOriginalCode");
    const editTitleEl = document.getElementById("editPkgTitle");
    const editCodeEl = document.getElementById("editPkgCode");
    const editStatusEl = document.getElementById("editPkgStatus");
    const editCategoryEl = document.getElementById("editPkgCategory");
    const editDurationEl = document.getElementById("editPkgDuration");
    const editMaxPaxEl = document.getElementById("editPkgMaxPax");
    const editPriceEl = document.getElementById("editPkgPrice");
    const editDifficultyEl = document.getElementById("editPkgDifficulty");
    const editMediaInput = document.getElementById("editPkgMediaInput");
    const editInclusionBoxes = editForm ? Array.from(editForm.querySelectorAll('input[name="edit_inc"]')) : [];
    const editInclusionErrEl = document.getElementById("err-editPkgInclusions");
    const editItineraryEl = document.getElementById("editPkgItinerary");

    let activeViewPkgCode = "";
    let activeViewSlides = [];
    let activeViewSlideIndex = 0;

    const CATEGORY_LABELS = {
        hills: "Hill Stations",
        beach: "Beach & Coastal",
        adventure: "Adventure & Trek",
        heritage: "Heritage & Culture",
        honeymoon: "Honeymoon & Romance"
    };

    const DIFFICULTY_LABELS = {
        easy: "Easy / Leisure",
        moderate: "Moderate Activity",
        challenging: "Challenging Trek"
    };

    function showNewPackageSuccess(pkg) {
        if (!newPkgSuccessBox || !newPkgSuccessTitle || !newPkgSuccessText) return;
        newPkgSuccessTitle.textContent = `Package Published — ${pkg.code}`;
        newPkgSuccessText.textContent = `${pkg.title} (${pkg.categoryLabel} • ${pkg.duration} • ₹${Number(pkg.price).toLocaleString("en-IN")}/person • ${pkg.photoCount} ${pkg.photoCount === 1 ? "photo" : "photos"}) is now live in the catalog.`;
        newPkgSuccessBox.classList.remove("d-none");
        newPkgSuccessBox.classList.add("d-flex");
        newPkgSuccessBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (closeNewPkgSuccessBtn && newPkgSuccessBox) {
        closeNewPkgSuccessBtn.addEventListener("click", () => {
            newPkgSuccessBox.classList.add("d-none");
            newPkgSuccessBox.classList.remove("d-flex");
        });
    }

    function formatINR(num) {
        return "&#8377;" + Math.round(Number(num) || 0).toLocaleString("en-IN");
    }

    function statusBadgeHTML(status) {
        const st = (status || "").toLowerCase();
        if (st === "featured") {
            return '<span class="badge bg-danger-subtle text-danger border border-danger-subtle">Featured</span>';
        }
        if (st === "draft") {
            return '<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">Draft</span>';
        }
        return '<span class="badge bg-success-subtle text-success border border-success-subtle">Published</span>';
    }

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

    function getAllSelectedFiles() {
        const collected = [];
        if (mediaInput && mediaInput.files && mediaInput.files[0]) {
            collected.push({ file: mediaInput.files[0], role: "Cover" });
        }
        if (bulkInput && bulkInput.files) {
            Array.from(bulkInput.files).forEach((f, idx) => {
                collected.push({ file: f, role: `Gallery ${idx + 1}` });
            });
        }
        [slot1Input, slot2Input, slot3Input].forEach((inp, idx) => {
            if (inp && inp.files && inp.files[0]) {
                collected.push({ file: inp.files[0], role: `Slot ${idx + 1}` });
            }
        });
        return collected;
    }

    function renderSelectedPhotosPreview() {
        if (!previewWrap || !previewGrid || !previewCountText) return;
        const files = getAllSelectedFiles();
        previewGrid.innerHTML = "";

        if (!files.length) {
            previewWrap.classList.add("d-none");
            return;
        }

        previewWrap.classList.remove("d-none");
        previewCountText.textContent = `${files.length} ${files.length === 1 ? "photo" : "photos"} ready for carousel`;

        files.forEach(({ file, role }) => {
            if (!file.type || !file.type.startsWith("image/")) return;
            const thumbBox = document.createElement("div");
            thumbBox.className = "position-relative rounded-2 overflow-hidden border bg-white";
            thumbBox.style.width = "68px";
            thumbBox.style.height = "52px";
            thumbBox.title = `${role}: ${file.name}`;
            thumbBox.innerHTML = `
        <img src="${URL.createObjectURL(file)}" alt="${file.name}" class="w-100 h-100" style="object-fit: cover;">
        <span class="badge bg-dark bg-opacity-75 position-absolute bottom-0 start-0 end-0 rounded-0" style="font-size: 0.6rem;">${role}</span>
      `;
            previewGrid.appendChild(thumbBox);
        });
    }

    function resetPhotoInputsAndLabels() {
        [mediaInput, bulkInput, slot1Input, slot2Input, slot3Input].forEach((inp) => {
            if (inp) inp.value = "";
        });
        setFieldError(mediaInput, "", mediaDropzone);
        setFieldError(bulkInput, "");
        if (mediaLabel) mediaLabel.textContent = "Upload Primary Cover Photo";
        if (bulkLabel) bulkLabel.textContent = "Add Multiple Photos";
        if (slot1Label) slot1Label.textContent = "Scenic Viewpoint";
        if (slot2Label) slot2Label.textContent = "Stay / Experience";
        if (slot3Label) slot3Label.textContent = "Activity / Dining";
        renderSelectedPhotosPreview();
    }

    if (clearPhotosBtn) {
        clearPhotosBtn.addEventListener("click", resetPhotoInputsAndLabels);
    }

    function updatePackageCounts() {
        if (!overviewBody) return;
        const rows = Array.from(overviewBody.querySelectorAll("tr[data-status]"));

        let published = 0;
        let featured = 0;
        let drafts = 0;

        rows.forEach((row) => {
            const st = (row.dataset.status || "").toLowerCase();
            if (st === "published") published += 1;
            else if (st === "featured") featured += 1;
            else if (st === "draft") drafts += 1;
        });

        if (totalCountEl) totalCountEl.textContent = String(rows.length);
        if (publishedCountEl) publishedCountEl.textContent = String(published);
        if (featuredCountEl) featuredCountEl.textContent = String(featured);
        if (draftCountEl) draftCountEl.textContent = String(drafts);
    }

    function applyPackageFilters() {
        if (!catalogList) return;
        const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
        const catVal = categoryFilter ? categoryFilter.value.trim().toLowerCase() : "";
        const stVal = statusFilter ? statusFilter.value.trim().toLowerCase() : "";

        const cards = Array.from(catalogList.querySelectorAll(".pkg-card-col"));
        let visibleCount = 0;

        cards.forEach((card) => {
            const cCat = (card.dataset.category || "").toLowerCase();
            const cSt = (card.dataset.status || "").toLowerCase();
            const cText = (card.textContent || "").toLowerCase() + " " + (card.dataset.itinerary || "").toLowerCase();

            const matchesSearch = !q || cText.includes(q);
            const matchesCat = !catVal || cCat === catVal;
            const matchesSt = !stVal || cSt === stVal;
            const isMatch = matchesSearch && matchesCat && matchesSt;

            card.style.display = isMatch ? "" : "none";
            if (isMatch) visibleCount += 1;
        });

        let emptyNotice = document.getElementById("pkgFilterEmptyNotice");
        if (visibleCount === 0) {
            if (!emptyNotice) {
                emptyNotice = document.createElement("div");
                emptyNotice.id = "pkgFilterEmptyNotice";
                emptyNotice.className = "col-12 text-center py-4 text-muted";
                emptyNotice.textContent = "No matching packages found. Adjust your search or filters.";
                catalogList.appendChild(emptyNotice);
            }
            emptyNotice.style.display = "";
        } else if (emptyNotice) {
            emptyNotice.style.display = "none";
        }
    }

    function getPackageSlides(card) {
        if (!card) return [];
        try {
            const parsed = JSON.parse(card.dataset.slides || "[]");
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (_) {
            // Fallback below
        }
        const thumb = card.querySelector(".pkg-card-thumb");
        return [
            {
                src: thumb ? thumb.src : "../images/packages.avif",
                caption: card.dataset.title || "Package Cover"
            }
        ];
    }

    function renderViewCarouselSlide(index) {
        if (!activeViewSlides.length) return;
        const len = activeViewSlides.length;
        activeViewSlideIndex = ((index % len) + len) % len;
        const slide = activeViewSlides[activeViewSlideIndex];

        if (viewCarouselImg) viewCarouselImg.src = slide.src;
        if (viewCarouselCaption) viewCarouselCaption.textContent = slide.caption || `Photo ${activeViewSlideIndex + 1}`;
        if (viewCarouselCounter) viewCarouselCounter.textContent = `${activeViewSlideIndex + 1} / ${len}`;

        if (viewCarouselThumbs) {
            Array.from(viewCarouselThumbs.children).forEach((btn, idx) => {
                btn.style.borderColor = idx === activeViewSlideIndex ? "var(--teal-primary)" : "transparent";
                btn.style.opacity = idx === activeViewSlideIndex ? "1" : "0.65";
            });
        }
    }

    function openPackageViewModal(card) {
        if (!viewModal || !card) return;
        const code = card.dataset.pkgCode || "";
        const title = card.dataset.title || "Package";
        const status = card.dataset.status || "published";
        const categoryLabel = card.dataset.categoryLabel || "";
        const difficultyLabel = card.dataset.difficultyLabel || "";
        const duration = card.dataset.duration || "—";
        const pax = card.dataset.pax || "—";
        const price = card.dataset.price || "0";
        const itinerary = card.dataset.itinerary || "No itinerary details provided.";
        const inclusions = (card.dataset.inclusions || "")
            .split("|")
            .map((s) => s.trim())
            .filter(Boolean);

        activeViewPkgCode = code;
        activeViewSlides = getPackageSlides(card);
        activeViewSlideIndex = 0;

        if (viewCodeEl) viewCodeEl.textContent = code;
        if (viewStatusEl) viewStatusEl.innerHTML = statusBadgeHTML(status);
        if (viewTitleEl) viewTitleEl.textContent = title;
        if (viewMetaEl) viewMetaEl.textContent = `${categoryLabel} • ${difficultyLabel}`;
        if (viewDurationEl) viewDurationEl.textContent = duration;
        if (viewPaxEl) viewPaxEl.textContent = `Max ${pax} Pax`;
        if (viewPriceEl) viewPriceEl.innerHTML = `${formatINR(price)} / person`;
        if (viewDifficultyEl) viewDifficultyEl.textContent = difficultyLabel;
        if (viewItineraryEl) viewItineraryEl.textContent = itinerary;

        if (viewInclusionsEl) {
            viewInclusionsEl.innerHTML = "";
            inclusions.forEach((inc) => {
                const badge = document.createElement("span");
                badge.className = "badge rounded-pill px-3 py-2";
                badge.style.background = "rgba(14, 159, 154, 0.12)";
                badge.style.color = "var(--teal-primary)";
                badge.innerHTML = `<i class="bi bi-check2 me-1"></i>${inc}`;
                viewInclusionsEl.appendChild(badge);
            });
        }

        if (viewCarouselThumbs) {
            viewCarouselThumbs.innerHTML = "";
            activeViewSlides.forEach((slide, idx) => {
                const thumbBtn = document.createElement("button");
                thumbBtn.type = "button";
                thumbBtn.className = "p-0 rounded-2 overflow-hidden bg-transparent flex-shrink-0";
                thumbBtn.style.width = "76px";
                thumbBtn.style.height = "50px";
                thumbBtn.style.border = "2px solid transparent";
                thumbBtn.innerHTML = `<img src="${slide.src}" alt="${slide.caption || title}" class="w-100 h-100" style="object-fit: cover;">`;
                thumbBtn.addEventListener("click", () => renderViewCarouselSlide(idx));
                viewCarouselThumbs.appendChild(thumbBtn);
            });
        }

        renderViewCarouselSlide(0);
        viewModal.classList.remove("d-none");
    }

    function closePackageViewModal() {
        if (!viewModal) return;
        viewModal.classList.add("d-none");
    }

    function openPackageEditModal(card) {
        if (!editModal || !card) return;
        const code = card.dataset.pkgCode || "";
        if (editOriginalCodeEl) editOriginalCodeEl.value = code;
        if (editCodeEl) editCodeEl.value = code;
        if (editTitleEl) editTitleEl.value = card.dataset.title || "";
        if (editStatusEl) editStatusEl.value = card.dataset.status || "published";
        if (editCategoryEl) editCategoryEl.value = card.dataset.category || "hills";
        if (editDurationEl) editDurationEl.value = card.dataset.duration || "";
        if (editMaxPaxEl) editMaxPaxEl.value = card.dataset.pax || "";
        if (editPriceEl) editPriceEl.value = card.dataset.price || "";
        if (editDifficultyEl) editDifficultyEl.value = card.dataset.difficulty || "easy";
        if (editItineraryEl) editItineraryEl.value = card.dataset.itinerary || "";
        if (editMediaInput) editMediaInput.value = "";

        const activeIncs = (card.dataset.inclusions || "")
            .split("|")
            .map((s) => s.trim().toLowerCase());

        editInclusionBoxes.forEach((cb) => {
            cb.checked = activeIncs.includes(cb.value.toLowerCase());
        });

        [editTitleEl, editDurationEl, editMaxPaxEl, editPriceEl, editMediaInput, editItineraryEl].forEach((el) =>
            setFieldError(el, "")
        );
        if (editInclusionErrEl) {
            editInclusionErrEl.textContent = "";
            editInclusionErrEl.classList.remove("active");
        }

        editModal.classList.remove("d-none");
    }

    function closePackageEditModal() {
        if (!editModal) return;
        editModal.classList.add("d-none");
    }

    function renderPackageCardInnerHTML(data) {
        const slidesCount = data.slides.length;
        const coverSrc = data.slides[0] ? data.slides[0].src : "../images/packages.avif";
        return `
      <div class="metric-glass-card flex-column align-items-start h-100 p-0 overflow-hidden">
        <div class="position-relative w-100" style="height: 185px; background: #0b1f3a;">
          <img src="${coverSrc}" alt="${data.title}" class="w-100 h-100 pkg-card-thumb" style="object-fit: cover;">
          <span class="badge bg-dark bg-opacity-75 position-absolute top-0 end-0 m-2">
            <i class="bi bi-images me-1"></i> <span class="pkg-slide-count">${slidesCount} ${slidesCount === 1 ? "Photo" : "Photos"}</span>
          </span>
        </div>
        <div class="p-4 w-100 d-flex flex-column flex-grow-1">
          <div class="d-flex justify-content-between align-items-center w-100 mb-2">
            <span class="fw-bold small" style="color: var(--teal-primary);">${data.code}</span>
            ${statusBadgeHTML(data.status)}
          </div>
          <h6 class="fw-bold mb-1" style="color: var(--navy-primary);">${data.title}</h6>
          <div class="small text-muted mb-2">${data.categoryLabel} &bull; ${data.difficultyLabel}</div>
          <div class="small mb-2"><i class="bi bi-clock me-1"></i> ${data.duration} &bull; Max ${data.pax} Pax</div>
          <div class="fw-bold mb-2" style="color: var(--navy-primary);">${formatINR(data.price)} <span class="fw-normal small text-muted">/ person</span></div>
          <div class="small text-muted mb-3">Includes: ${data.inclusions.join(", ")}</div>

          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-3 mt-auto border-top w-100">
            <div class="d-flex gap-2">
              <button type="button" class="btn-brand-teal py-1 px-3 small js-view-package">
                <i class="bi bi-eye me-1"></i> View
              </button>
              <button type="button" class="btn-brand-outline py-1 px-3 small js-edit-package">
                <i class="bi bi-pencil-square me-1"></i> Edit
              </button>
            </div>
            <button type="button" class="btn-brand-outline py-1 px-3 small text-danger border-danger-subtle js-delete-package">
              <i class="bi bi-trash3 me-1"></i> Delete
            </button>
          </div>
        </div>
      </div>
    `;
    }

    // Catalog card actions (View, Edit, Delete)
    if (catalogList) {
        catalogList.addEventListener("click", function (event) {
            const card = event.target.closest(".pkg-card-col");
            if (!card) return;

            if (event.target.closest(".js-view-package")) {
                openPackageViewModal(card);
                return;
            }

            if (event.target.closest(".js-edit-package")) {
                openPackageEditModal(card);
                return;
            }

            if (event.target.closest(".js-delete-package")) {
                const code = card.dataset.pkgCode || "";
                card.remove();
                if (overviewBody && code) {
                    const overviewRow = overviewBody.querySelector(`tr[data-pkg-code="${code}"]`);
                    if (overviewRow) overviewRow.remove();
                }
                updatePackageCounts();
                applyPackageFilters();
            }
        });
    }

    // View Modal controls
    if (viewCarouselPrev) {
        viewCarouselPrev.addEventListener("click", () => renderViewCarouselSlide(activeViewSlideIndex - 1));
    }
    if (viewCarouselNext) {
        viewCarouselNext.addEventListener("click", () => renderViewCarouselSlide(activeViewSlideIndex + 1));
    }
    if (closeViewBtn) closeViewBtn.addEventListener("click", closePackageViewModal);
    if (cancelViewBtn) cancelViewBtn.addEventListener("click", closePackageViewModal);
    if (viewModal) {
        viewModal.addEventListener("click", (event) => {
            if (event.target === viewModal) closePackageViewModal();
        });
    }
    if (editFromViewBtn) {
        editFromViewBtn.addEventListener("click", () => {
            if (!activeViewPkgCode || !catalogList) return;
            const card = catalogList.querySelector(`.pkg-card-col[data-pkg-code="${activeViewPkgCode}"]`);
            closePackageViewModal();
            openPackageEditModal(card);
        });
    }

    // Edit Modal controls
    if (closeEditBtn) closeEditBtn.addEventListener("click", closePackageEditModal);
    if (cancelEditBtn) cancelEditBtn.addEventListener("click", closePackageEditModal);
    if (editModal) {
        editModal.addEventListener("click", (event) => {
            if (event.target === editModal) closePackageEditModal();
        });
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            if (editModal && !editModal.classList.contains("d-none")) closePackageEditModal();
            else if (viewModal && !viewModal.classList.contains("d-none")) closePackageViewModal();
        }
    });

    // Edit Package validation & submit
    if (editForm) {
        [editTitleEl, editDurationEl, editMaxPaxEl, editPriceEl, editItineraryEl].forEach((el) => {
            if (!el) return;
            el.addEventListener("input", () => setFieldError(el, ""));
        });

        editInclusionBoxes.forEach((cb) => {
            cb.addEventListener("change", () => {
                if (editInclusionErrEl && editInclusionBoxes.some((b) => b.checked)) {
                    editInclusionErrEl.textContent = "";
                    editInclusionErrEl.classList.remove("active");
                }
            });
        });

        if (editMediaInput) {
            editMediaInput.addEventListener("change", () => setFieldError(editMediaInput, ""));
        }

        editForm.addEventListener("submit", function (event) {
            event.preventDefault();
            let isValid = true;

            const tVal = editTitleEl ? editTitleEl.value.trim() : "";
            if (!tVal || tVal.length < 4) {
                isValid = setFieldError(editTitleEl, "Enter at least 4 characters for package title.") && isValid;
            } else {
                setFieldError(editTitleEl, "");
            }

            const dVal = editDurationEl ? editDurationEl.value.trim() : "";
            if (!dVal) {
                isValid = setFieldError(editDurationEl, "Duration is required.") && isValid;
            } else {
                setFieldError(editDurationEl, "");
            }

            const pNum = Number(editMaxPaxEl ? editMaxPaxEl.value.trim() : "");
            if (!Number.isInteger(pNum) || pNum < 1) {
                isValid = setFieldError(editMaxPaxEl, "Enter at least 1 traveler.") && isValid;
            } else {
                setFieldError(editMaxPaxEl, "");
            }

            const prNum = Number(editPriceEl ? editPriceEl.value.trim() : "");
            if (Number.isNaN(prNum) || prNum <= 0) {
                isValid = setFieldError(editPriceEl, "Base price must be greater than ₹0.") && isValid;
            } else {
                setFieldError(editPriceEl, "");
            }

            const selectedIncs = editInclusionBoxes.filter((cb) => cb.checked).map((cb) => cb.value);
            if (!selectedIncs.length) {
                if (editInclusionErrEl) {
                    editInclusionErrEl.textContent = "Select at least one package inclusion.";
                    editInclusionErrEl.classList.add("active");
                }
                isValid = false;
            } else if (editInclusionErrEl) {
                editInclusionErrEl.textContent = "";
                editInclusionErrEl.classList.remove("active");
            }

            if (editMediaInput && editMediaInput.files && editMediaInput.files.length > 0) {
                for (let i = 0; i < editMediaInput.files.length; i += 1) {
                    const f = editMediaInput.files[i];
                    if (!f.type || !f.type.startsWith("image/")) {
                        isValid = setFieldError(editMediaInput, `"${f.name}" must be an image file.`) && isValid;
                        break;
                    }
                    if (f.size > MAX_IMAGE_BYTES) {
                        isValid = setFieldError(editMediaInput, `"${f.name}" exceeds the 5 MB limit.`) && isValid;
                        break;
                    }
                }
            }

            const itVal = editItineraryEl ? editItineraryEl.value.trim() : "";
            if (!itVal || itVal.length < 15) {
                isValid = setFieldError(editItineraryEl, "Enter at least 15 characters for itinerary details.") && isValid;
            } else {
                setFieldError(editItineraryEl, "");
            }

            if (!isValid) return;

            const targetCode = editOriginalCodeEl ? editOriginalCodeEl.value : "";
            const card = catalogList ? catalogList.querySelector(`.pkg-card-col[data-pkg-code="${targetCode}"]`) : null;
            if (!card) return;

            const newStatus = editStatusEl ? editStatusEl.value : "published";
            const newCatKey = editCategoryEl ? editCategoryEl.value : "hills";
            const newCatLabel = CATEGORY_LABELS[newCatKey] || newCatKey;
            const newDiffKey = editDifficultyEl ? editDifficultyEl.value : "easy";
            const newDiffLabel = DIFFICULTY_LABELS[newDiffKey] || newDiffKey;

            let updatedSlides = getPackageSlides(card);
            if (editMediaInput && editMediaInput.files && editMediaInput.files.length > 0) {
                updatedSlides = Array.from(editMediaInput.files).map((file, idx) => ({
                    src: URL.createObjectURL(file),
                    caption: `${tVal} — Photo ${idx + 1}`
                }));
            }

            card.dataset.status = newStatus;
            card.dataset.category = newCatKey;
            card.dataset.categoryLabel = newCatLabel;
            card.dataset.title = tVal;
            card.dataset.duration = dVal;
            card.dataset.pax = String(pNum);
            card.dataset.price = String(prNum);
            card.dataset.difficulty = newDiffKey;
            card.dataset.difficultyLabel = newDiffLabel;
            card.dataset.inclusions = selectedIncs.join("|");
            card.dataset.itinerary = itVal;
            card.dataset.slides = JSON.stringify(updatedSlides);

            card.innerHTML = renderPackageCardInnerHTML({
                code: targetCode,
                status: newStatus,
                title: tVal,
                categoryLabel: newCatLabel,
                difficultyLabel: newDiffLabel,
                duration: dVal,
                pax: pNum,
                price: prNum,
                inclusions: selectedIncs,
                slides: updatedSlides
            });

            if (overviewBody) {
                const row = overviewBody.querySelector(`tr[data-pkg-code="${targetCode}"]`);
                if (row) {
                    row.dataset.status = newStatus;
                    row.innerHTML = `
            <td class="fw-bold">${targetCode}</td>
            <td>
              <div class="fw-semibold">${tVal}</div>
              <div class="small text-muted">${selectedIncs.join(" &bull; ")}</div>
            </td>
            <td>${newCatLabel}</td>
            <td>${dVal}</td>
            <td class="fw-semibold">${formatINR(prNum)}</td>
            <td>${pNum}</td>
            <td>${statusBadgeHTML(newStatus)}</td>
          `;
                }
            }

            updatePackageCounts();
            applyPackageFilters();
            closePackageEditModal();
        });
    }

    // Create Package validation & submit
    function validateInclusions() {
        if (!inclusionBoxes.length) return true;
        const anyChecked = inclusionBoxes.some((cb) => cb.checked);
        if (!anyChecked) {
            if (inclusionErrEl) {
                inclusionErrEl.textContent = "Select at least one package inclusion.";
                inclusionErrEl.classList.add("active");
            }
            return false;
        }
        if (inclusionErrEl) {
            inclusionErrEl.textContent = "";
            inclusionErrEl.classList.remove("active");
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

    function validatePackageForm() {
        let isValid = true;

        const titleVal = titleEl ? titleEl.value.trim() : "";
        if (!titleVal) {
            isValid = setFieldError(titleEl, "Package title is required.") && isValid;
        } else if (titleVal.length < 4) {
            isValid = setFieldError(titleEl, "Enter at least 4 characters.") && isValid;
        } else {
            setFieldError(titleEl, "");
        }

        const codeVal = codeEl ? codeEl.value.trim().toUpperCase() : "";
        if (!codeVal) {
            isValid = setFieldError(codeEl, "Package code is required.") && isValid;
        } else if (!/^[A-Z0-9_-]{3,16}$/.test(codeVal)) {
            isValid = setFieldError(codeEl, "Use 3–16 uppercase letters, numbers, or hyphens (e.g., PKG-MNR01).") && isValid;
        } else {
            if (codeEl) codeEl.value = codeVal;
            setFieldError(codeEl, "");
        }

        const durVal = durationEl ? durationEl.value.trim() : "";
        if (!durVal) {
            isValid = setFieldError(durationEl, "Duration is required (e.g., 4 Days / 3 Nights).") && isValid;
        } else {
            setFieldError(durationEl, "");
        }

        const paxRaw = maxPaxEl ? maxPaxEl.value.trim() : "";
        const paxNum = Number(paxRaw);
        if (!paxRaw || !Number.isInteger(paxNum) || paxNum < 1) {
            isValid = setFieldError(maxPaxEl, "Enter a group size of at least 1.") && isValid;
        } else {
            setFieldError(maxPaxEl, "");
        }

        const priceRaw = priceEl ? priceEl.value.trim() : "";
        const priceNum = Number(priceRaw);
        if (!priceRaw || Number.isNaN(priceNum) || priceNum <= 0) {
            isValid = setFieldError(priceEl, "Base price must be greater than ₹0.") && isValid;
        } else {
            setFieldError(priceEl, "");
        }

        isValid = validateInclusions() && isValid;
        isValid = validateFileList(mediaInput ? mediaInput.files : null, "pkgMediaInput", mediaDropzone) && isValid;
        isValid = validateFileList(bulkInput ? bulkInput.files : null, "pkgGalleryBulk", null) && isValid;
        isValid = validateFileList(slot1Input ? slot1Input.files : null, "pkgGalleryBulk", null) && isValid;
        isValid = validateFileList(slot2Input ? slot2Input.files : null, "pkgGalleryBulk", null) && isValid;
        isValid = validateFileList(slot3Input ? slot3Input.files : null, "pkgGalleryBulk", null) && isValid;

        const itinVal = itineraryEl ? itineraryEl.value.trim() : "";
        if (!itinVal) {
            isValid = setFieldError(itineraryEl, "Itinerary overview is required.") && isValid;
        } else if (itinVal.length < 15) {
            isValid = setFieldError(itineraryEl, "Enter at least 15 characters for the itinerary highlights.") && isValid;
        } else {
            setFieldError(itineraryEl, "");
        }

        return isValid;
    }

    [titleEl, codeEl, durationEl, maxPaxEl, priceEl, captionsEl, itineraryEl].forEach((el) => {
        if (!el) return;
        el.addEventListener("input", () => setFieldError(el, ""));
    });

    inclusionBoxes.forEach((cb) => {
        cb.addEventListener("change", validateInclusions);
    });

    if (mediaInput) {
        mediaInput.addEventListener("change", () => {
            setFieldError(mediaInput, "", mediaDropzone);
            if (mediaLabel && mediaInput.files && mediaInput.files[0]) {
                mediaLabel.textContent = mediaInput.files[0].name;
            }
            renderSelectedPhotosPreview();
        });
    }

    if (bulkInput) {
        bulkInput.addEventListener("change", () => {
            setFieldError(bulkInput, "");
            if (bulkLabel && bulkInput.files && bulkInput.files.length > 0) {
                bulkLabel.textContent = `${bulkInput.files.length} gallery photos selected`;
            }
            renderSelectedPhotosPreview();
        });
    }

    [
        [slot1Input, slot1Label],
        [slot2Input, slot2Label],
        [slot3Input, slot3Label]
    ].forEach(([inp, lbl]) => {
        if (!inp) return;
        inp.addEventListener("change", () => {
            setFieldError(bulkInput, "");
            if (lbl && inp.files && inp.files[0]) {
                lbl.textContent = inp.files[0].name;
            }
            renderSelectedPhotosPreview();
        });
    });

    form.addEventListener("reset", function () {
        [titleEl, codeEl, durationEl, maxPaxEl, priceEl, captionsEl, itineraryEl].forEach((el) => {
            setFieldError(el, "");
        });
        if (inclusionErrEl) {
            inclusionErrEl.textContent = "";
            inclusionErrEl.classList.remove("active");
        }
        resetPhotoInputsAndLabels();
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!validatePackageForm()) {
            const firstInvalid = form.querySelector(".is-invalid");
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
                if (typeof firstInvalid.focus === "function") firstInvalid.focus();
            }
            return;
        }

        const title = titleEl.value.trim();
        const code = codeEl.value.trim().toUpperCase();
        const catKey = categoryEl ? categoryEl.value : "hills";
        const catLabel = CATEGORY_LABELS[catKey] || catKey;
        const duration = durationEl.value.trim();
        const maxPax = Number(maxPaxEl.value);
        const price = Number(priceEl.value);
        const diffKey = difficultyEl ? difficultyEl.value : "easy";
        const diffLabel = DIFFICULTY_LABELS[diffKey] || diffKey;
        const itinerary = itineraryEl.value.trim();

        const selectedInclusions = inclusionBoxes
            .filter((cb) => cb.checked)
            .map((cb) => (cb.nextElementSibling ? cb.nextElementSibling.textContent.trim() : cb.value));

        const customCaptions = (captionsEl ? captionsEl.value.trim() : "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

        const collectedFiles = getAllSelectedFiles();
        let slides = [];
        if (collectedFiles.length > 0) {
            slides = collectedFiles.map(({ file }, idx) => ({
                src: URL.createObjectURL(file),
                caption: customCaptions[idx] || `${title} — Photo ${idx + 1}`
            }));
        } else {
            slides = [
                { src: "../images/packages.avif", caption: customCaptions[0] || `${title} — Cover View` },
                { src: "../images/destinations.avif", caption: customCaptions[1] || `${title} — Scenic Highlights` }
            ];
        }

        if (overviewBody) {
            const tr = document.createElement("tr");
            tr.dataset.pkgCode = code;
            tr.dataset.status = "published";
            tr.innerHTML = `
        <td class="fw-bold">${code}</td>
        <td>
          <div class="fw-semibold">${title}</div>
          <div class="small text-muted">${selectedInclusions.join(" &bull; ")}</div>
        </td>
        <td>${catLabel}</td>
        <td>${duration}</td>
        <td class="fw-semibold">${formatINR(price)}</td>
        <td>${maxPax}</td>
        <td>${statusBadgeHTML("published")}</td>
      `;
            overviewBody.prepend(tr);
        }

        if (catalogList) {
            const col = document.createElement("div");
            col.className = "col-12 col-md-6 pkg-card-col";
            col.dataset.pkgCode = code;
            col.dataset.status = "published";
            col.dataset.category = catKey;
            col.dataset.categoryLabel = catLabel;
            col.dataset.title = title;
            col.dataset.duration = duration;
            col.dataset.pax = String(maxPax);
            col.dataset.price = String(price);
            col.dataset.difficulty = diffKey;
            col.dataset.difficultyLabel = diffLabel;
            col.dataset.inclusions = selectedInclusions.join("|");
            col.dataset.itinerary = itinerary;
            col.dataset.slides = JSON.stringify(slides);

            col.innerHTML = renderPackageCardInnerHTML({
                code,
                status: "published",
                title,
                categoryLabel: catLabel,
                difficultyLabel: diffLabel,
                duration,
                pax: maxPax,
                price,
                inclusions: selectedInclusions,
                slides
            });
            catalogList.prepend(col);
        }

        updatePackageCounts();
        applyPackageFilters();
        showNewPackageSuccess({ code, title, categoryLabel: catLabel, duration, price, photoCount: slides.length });
        form.reset();
        resetPhotoInputsAndLabels();
    });

    if (searchInput) searchInput.addEventListener("input", applyPackageFilters);
    if (categoryFilter) categoryFilter.addEventListener("change", applyPackageFilters);
    if (statusFilter) statusFilter.addEventListener("change", applyPackageFilters);
    if (filterBtn) filterBtn.addEventListener("click", applyPackageFilters);

    updatePackageCounts();
    applyPackageFilters();
})();