(function () {
    const form = document.getElementById("createCategoryForm");
    if (!form) return;

    const directoryBody = document.getElementById("categoriesDirectoryBody");
    const activeCountEl = document.getElementById("activeCategoriesCount");
    const featuredCountEl = document.getElementById("featuredCategoriesCount");
    const mappedPackagesEl = document.getElementById("mappedPackagesCount");
    const seasonalCountEl = document.getElementById("seasonalCollectionsCount");

    const MAX_COVER_BYTES = 5 * 1024 * 1024; // 5 MB

    const nameEl = document.getElementById("catName");
    const slugEl = document.getElementById("catSlug");
    const visibilityEl = document.getElementById("catVisibility");
    const subtitleEl = document.getElementById("catSubtitle");
    const paceEl = document.getElementById("catPace");
    const priorityEl = document.getElementById("catPriority");
    const audienceBoxes = Array.from(form.querySelectorAll('input[name="audience"]'));
    const audienceErrEl = document.getElementById("err-catAudience");
    const coverEl = document.getElementById("catCoverInput");
    const coverDropzone = document.getElementById("catCoverDropzone");
    const coverLabel = document.getElementById("catCoverLabel");
    const descriptionEl = document.getElementById("catDescription");

    const searchInput = document.getElementById("catSearchInput");
    const audienceFilter = document.getElementById("catAudienceFilter");
    const statusFilter = document.getElementById("catStatusFilter");
    const filterBtn = document.getElementById("catFilterBtn");

    const ICON_CLASS_MAP = {
        mountain: "bi-tsunami text-primary",
        hills: "bi-tree text-success",
        romance: "bi-heart text-danger",
        roadtrip: "bi-compass",
        heritage: "bi-bank text-warning",
        family: "bi-people text-info"
    };

    function statusBadgeHTML(status) {
        const val = (status || "").toLowerCase();
        if (val === "featured") {
            return '<span class="badge bg-danger-subtle text-danger border border-danger-subtle">Featured</span>';
        }
        if (val === "draft") {
            return '<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">Hidden</span>';
        }
        return '<span class="badge bg-success-subtle text-success border border-success-subtle">Active</span>';
    }

    function updateCategoryCounts() {
        if (!directoryBody) return;
        const rows = Array.from(directoryBody.querySelectorAll("tr[data-status]"));

        let activeCount = 0;
        let featuredCount = 0;
        let mappedPackages = 0;
        let seasonalCount = 0;

        rows.forEach((row) => {
            const st = (row.dataset.status || "").toLowerCase();
            if (st === "active" || st === "featured") activeCount += 1;
            if (st === "featured") featuredCount += 1;
            mappedPackages += Number(row.dataset.linked) || 0;
            if (row.dataset.seasonal === "true") seasonalCount += 1;
        });

        if (activeCountEl) activeCountEl.textContent = activeCount;
        if (featuredCountEl) featuredCountEl.textContent = featuredCount;
        if (mappedPackagesEl) mappedPackagesEl.textContent = mappedPackages;
        if (seasonalCountEl) seasonalCountEl.textContent = seasonalCount;
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

    function validateAudience() {
        if (!audienceBoxes.length) return true;
        const anyChecked = audienceBoxes.some((cb) => cb.checked);
        if (!anyChecked) {
            if (audienceErrEl) {
                audienceErrEl.textContent = "Select at least one suitable traveler tag.";
                audienceErrEl.classList.add("active");
            }
            return false;
        }
        if (audienceErrEl) {
            audienceErrEl.textContent = "";
            audienceErrEl.classList.remove("active");
        }
        return true;
    }

    function validateCategoryForm() {
        let isValid = true;

        const nameVal = nameEl ? nameEl.value.trim() : "";
        if (!nameVal) {
            isValid = setFieldError(nameEl, "Category name is required.") && isValid;
        } else if (nameVal.length < 3) {
            isValid = setFieldError(nameEl, "Enter at least 3 characters.") && isValid;
        } else {
            setFieldError(nameEl, "");
        }

        const slugVal = slugEl ? slugEl.value.trim().toLowerCase() : "";
        if (!slugVal) {
            isValid = setFieldError(slugEl, "Category slug is required.") && isValid;
        } else if (!/^[a-z0-9-]{2,30}$/.test(slugVal)) {
            isValid = setFieldError(slugEl, "Use 2–30 lowercase letters, numbers, or hyphens (e.g., hill-stations).") && isValid;
        } else {
            if (slugEl) slugEl.value = slugVal;
            setFieldError(slugEl, "");
        }

        const subtitleVal = subtitleEl ? subtitleEl.value.trim() : "";
        if (!subtitleVal) {
            isValid = setFieldError(subtitleEl, "Short subtitle is required.") && isValid;
        } else if (subtitleVal.length < 8) {
            isValid = setFieldError(subtitleEl, "Subtitle should be at least 8 characters.") && isValid;
        } else {
            setFieldError(subtitleEl, "");
        }

        const prioRaw = priorityEl ? priorityEl.value.trim() : "";
        if (prioRaw !== "") {
            const prioNum = Number(prioRaw);
            if (!Number.isInteger(prioNum) || prioNum < 1) {
                isValid = setFieldError(priorityEl, "Display priority must be a whole number of 1 or higher.") && isValid;
            } else {
                setFieldError(priorityEl, "");
            }
        } else {
            setFieldError(priorityEl, "");
        }

        isValid = validateAudience() && isValid;

        if (coverEl && coverEl.files && coverEl.files.length > 0) {
            const file = coverEl.files[0];
            if (!file.type || !file.type.startsWith("image/")) {
                isValid = setFieldError(coverEl, `"${file.name}" must be an image file.`, coverDropzone) && isValid;
            } else if (file.size > MAX_COVER_BYTES) {
                isValid = setFieldError(coverEl, `"${file.name}" exceeds the 5 MB limit.`, coverDropzone) && isValid;
            } else {
                setFieldError(coverEl, "", coverDropzone);
            }
        } else {
            setFieldError(coverEl, "", coverDropzone);
        }

        const descVal = descriptionEl ? descriptionEl.value.trim() : "";
        if (!descVal) {
            isValid = setFieldError(descriptionEl, "Category description is required.") && isValid;
        } else if (descVal.length < 15) {
            isValid = setFieldError(descriptionEl, "Enter at least 15 characters for the category story.") && isValid;
        } else {
            setFieldError(descriptionEl, "");
        }

        return isValid;
    }

    function applyCategoryFilters() {
        if (!directoryBody) return;

        const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        const selectedAudience = audienceFilter ? audienceFilter.value.trim().toLowerCase() : "";
        const selectedStatus = statusFilter ? statusFilter.value.trim().toLowerCase() : "";

        const rows = Array.from(directoryBody.querySelectorAll("tr[data-status]"));
        let visibleCount = 0;

        rows.forEach((row) => {
            const rowStatus = (row.dataset.status || "").toLowerCase();
            const rowText = (row.textContent || "").toLowerCase();

            const matchesSearch = !query || rowText.includes(query);
            const matchesAudience = !selectedAudience || rowText.includes(selectedAudience);
            const matchesStatus = !selectedStatus || rowStatus === selectedStatus;

            const isMatch = matchesSearch && matchesAudience && matchesStatus;
            row.style.display = isMatch ? "" : "none";
            if (isMatch) visibleCount += 1;
        });

        let emptyRow = document.getElementById("catFilterEmptyRow");
        if (visibleCount === 0) {
            if (!emptyRow) {
                emptyRow = document.createElement("tr");
                emptyRow.id = "catFilterEmptyRow";
                emptyRow.innerHTML = `
          <td colspan="7" class="text-center py-4 text-muted">
            No matching categories found. Adjust your search or filters.
          </td>
        `;
                directoryBody.appendChild(emptyRow);
            }
            emptyRow.style.display = "";
        } else if (emptyRow) {
            emptyRow.style.display = "none";
        }
    }

    [nameEl, slugEl, subtitleEl, priorityEl, descriptionEl].forEach((el) => {
        if (!el) return;
        el.addEventListener("input", () => setFieldError(el, ""));
    });

    audienceBoxes.forEach((cb) => {
        cb.addEventListener("change", validateAudience);
    });

    if (coverEl) {
        coverEl.addEventListener("change", () => {
            setFieldError(coverEl, "", coverDropzone);
            if (coverLabel && coverEl.files && coverEl.files[0]) {
                coverLabel.textContent = coverEl.files[0].name;
            }
        });
    }

    if (searchInput) searchInput.addEventListener("input", applyCategoryFilters);
    if (audienceFilter) audienceFilter.addEventListener("change", applyCategoryFilters);
    if (statusFilter) statusFilter.addEventListener("change", applyCategoryFilters);
    if (filterBtn) filterBtn.addEventListener("click", applyCategoryFilters);

    form.addEventListener("reset", function () {
        [nameEl, slugEl, subtitleEl, priorityEl, descriptionEl].forEach((el) => {
            setFieldError(el, "");
        });
        setFieldError(coverEl, "", coverDropzone);
        if (audienceErrEl) {
            audienceErrEl.textContent = "";
            audienceErrEl.classList.remove("active");
        }
        if (coverLabel) coverLabel.textContent = "Upload Category Cover";
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!validateCategoryForm()) {
            const firstInvalid = form.querySelector(".is-invalid");
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
                if (typeof firstInvalid.focus === "function") firstInvalid.focus();
            }
            return;
        }

        const name = nameEl.value.trim();
        const slug = slugEl.value.trim().toLowerCase();
        const visibility = visibilityEl ? visibilityEl.value : "active";
        const subtitle = subtitleEl.value.trim();
        const paceText = paceEl ? paceEl.options[paceEl.selectedIndex].text : "Balanced Explorer";
        const priorityNum =
            priorityEl && priorityEl.value.trim() !== ""
                ? Number(priorityEl.value)
                : (directoryBody ? directoryBody.querySelectorAll("tr[data-status]").length + 1 : 1);

        const checkedIcon = form.querySelector('input[name="category_icon"]:checked');
        const iconKey = checkedIcon ? checkedIcon.value : "hills";
        const iconClasses = ICON_CLASS_MAP[iconKey] || "bi-grid-1x2";

        const selectedAudience = audienceBoxes
            .filter((cb) => cb.checked)
            .map((cb) => (cb.nextElementSibling ? cb.nextElementSibling.textContent.trim() : cb.value));

        if (directoryBody) {
            const row = document.createElement("tr");
            row.dataset.status = visibility;
            row.dataset.linked = "0";
            row.dataset.seasonal = "false";
            row.innerHTML = `
        <td class="fw-bold">${slug}</td>
        <td>
          <div class="fw-semibold"><i class="bi ${iconClasses} me-1"></i> ${name}</div>
          <div class="small text-muted">${subtitle}</div>
        </td>
        <td>${selectedAudience.join(", ")} &bull; ${paceText}</td>
        <td>0 Packages</td>
        <td>#${priorityNum}</td>
        <td>${statusBadgeHTML(visibility)}</td>
        <td class="text-end small text-muted">New</td>
      `;
            directoryBody.prepend(row);
        }

        updateCategoryCounts();
        applyCategoryFilters();
        form.reset();
        if (visibilityEl) visibilityEl.value = "active";
    });

    updateCategoryCounts();
    applyCategoryFilters();
})();