(function () {
    const reviewsBody = document.getElementById("reviewsListBody");
    const storiesBody = document.getElementById("storiesListBody");

    const pubReviewsEl = document.getElementById("publishedReviewsCount");
    const avgRatingEl = document.getElementById("averageRatingValue");
    const storiesCountEl = document.getElementById("customerStoriesCount");
    const pendingCountEl = document.getElementById("pendingApprovalCount");

    // Review filters
    const revSearchEl = document.getElementById("revSearchInput");
    const revRatingEl = document.getElementById("revRatingFilter");
    const revStatusEl = document.getElementById("revStatusFilter");
    const revFilterBtn = document.getElementById("revFilterBtn");

    // Story filters
    const storySearchEl = document.getElementById("storySearchInput");
    const storyDestEl = document.getElementById("storyDestFilter");
    const storyStatusEl = document.getElementById("storyStatusFilter");
    const storyFilterBtn = document.getElementById("storyFilterBtn");

    // Story publish form
    const storyForm = document.getElementById("publishStoryForm");
    const authorEl = document.getElementById("storyAuthor");
    const titleEl = document.getElementById("storyTitle");
    const destEl = document.getElementById("storyDestination");
    const photosEl = document.getElementById("storyPhotosInput");
    const photosDropzone = document.getElementById("storyPhotosDropzone");
    const photosLabel = document.getElementById("storyPhotosLabel");
    const contentEl = document.getElementById("storyContent");

    // Story Viewer Modal elements
    const storyModal = document.getElementById("customerStoryModal");
    const closeStoryModalBtn = document.getElementById("closeStoryModalBtn");
    const cancelStoryModalBtn = document.getElementById("cancelStoryModalBtn");
    const storyModalIdEl = document.getElementById("storyModalId");
    const storyModalStatusEl = document.getElementById("storyModalStatus");
    const storyModalTitleEl = document.getElementById("storyModalTitle");
    const storyModalAuthorEl = document.getElementById("storyModalAuthor");
    const storyModalDestEl = document.getElementById("storyModalDestination");
    const storyModalDateEl = document.getElementById("storyModalDate");
    const storyModalGalleryEl = document.getElementById("storyModalGallery");
    const storyModalPhotosCountEl = document.getElementById("storyModalPhotosCount");
    const storyModalContentEl = document.getElementById("storyModalContent");

    const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB

    function getTodayISO() {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, "0");
        const d = String(now.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
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

    function statusBadgeHTML(status) {
        const st = (status || "").toLowerCase();
        if (st === "published") {
            return '<span class="badge bg-success-subtle text-success border border-success-subtle">Published</span>';
        }
        if (st === "pending") {
            return '<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">Pending</span>';
        }
        return '<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">Hidden</span>';
    }

    function storyActionButtonsHTML(status) {
        const isPublished = (status || "").toLowerCase() === "published";
        const toggleBtn = isPublished
            ? '<button type="button" class="btn-brand-outline py-1 px-2 small js-toggle-story">Hide</button>'
            : '<button type="button" class="btn-brand-teal py-1 px-2 small js-toggle-story">Publish</button>';
        return `<div class="d-inline-flex gap-1"><button type="button" class="btn-brand-outline py-1 px-2 small js-view-story"><i class="bi bi-eye me-1"></i> View</button>${toggleBtn}</div>`;
    }

    function openStoryModal(row) {
        if (!storyModal || !row) return;
        const cells = row.querySelectorAll("td");
        const storyId = row.dataset.storyId || (cells[0] ? cells[0].textContent.trim() : "STR");
        const author = cells[1] ? cells[1].textContent.trim() : "—";
        const title = cells[2] ? cells[2].textContent.trim() : "—";
        const destination = cells[3] ? cells[3].textContent.trim() : "—";
        const photosText = cells[4] ? cells[4].textContent.trim() : "0 Photos";
        const dateText = cells[5] ? cells[5].textContent.trim() : "—";
        const status = row.dataset.status || "published";
        const content = row.dataset.content || "No story body recorded.";
        const photoUrls = (row.dataset.photoUrls || "")
            .split("|")
            .map((u) => u.trim())
            .filter(Boolean);

        if (storyModalIdEl) storyModalIdEl.textContent = storyId;
        if (storyModalStatusEl) storyModalStatusEl.innerHTML = statusBadgeHTML(status);
        if (storyModalTitleEl) storyModalTitleEl.textContent = title;
        if (storyModalAuthorEl) storyModalAuthorEl.textContent = author;
        if (storyModalDestEl) storyModalDestEl.textContent = destination;
        if (storyModalDateEl) storyModalDateEl.textContent = dateText;
        if (storyModalPhotosCountEl) storyModalPhotosCountEl.textContent = photosText;
        if (storyModalContentEl) storyModalContentEl.textContent = content;

        if (storyModalGalleryEl) {
            storyModalGalleryEl.innerHTML = "";
            if (photoUrls.length > 0) {
                photoUrls.forEach((url) => {
                    const col = document.createElement("div");
                    col.className = "col-6 col-sm-4";
                    col.innerHTML = `<img src="${url}" alt="${title}" class="w-100 rounded-3" style="height: 110px; object-fit: cover;">`;
                    storyModalGalleryEl.appendChild(col);
                });
                storyModalGalleryEl.classList.remove("d-none");
            } else {
                storyModalGalleryEl.classList.add("d-none");
            }
        }

        storyModal.classList.remove("d-none");
    }

    function closeStoryModal() {
        if (!storyModal) return;
        storyModal.classList.add("d-none");
    }

    function updateOverviewMetrics() {
        let publishedReviews = 0;
        let ratingSum = 0;
        let pendingTotal = 0;

        if (reviewsBody) {
            const revRows = Array.from(reviewsBody.querySelectorAll("tr[data-status]"));
            revRows.forEach((row) => {
                const st = (row.dataset.status || "").toLowerCase();
                const rating = Number(row.dataset.rating) || 0;
                if (st === "published") {
                    publishedReviews += 1;
                    ratingSum += rating;
                } else if (st === "pending") {
                    pendingTotal += 1;
                }
            });
        }

        let publishedStories = 0;
        if (storiesBody) {
            const storyRows = Array.from(storiesBody.querySelectorAll("tr[data-status]"));
            storyRows.forEach((row) => {
                const st = (row.dataset.status || "").toLowerCase();
                if (st === "published") publishedStories += 1;
                else if (st === "pending") pendingTotal += 1;
            });
        }

        if (pubReviewsEl) pubReviewsEl.textContent = String(publishedReviews);
        if (avgRatingEl) {
            avgRatingEl.textContent = publishedReviews > 0 ? (ratingSum / publishedReviews).toFixed(1) : "—";
        }
        if (storiesCountEl) storiesCountEl.textContent = String(publishedStories);
        if (pendingCountEl) pendingCountEl.textContent = String(pendingTotal);
    }

    function applyReviewFilters() {
        if (!reviewsBody) return;
        const q = revSearchEl ? revSearchEl.value.trim().toLowerCase() : "";
        const minRating = revRatingEl ? revRatingEl.value : "";
        const stFilter = revStatusEl ? revStatusEl.value.toLowerCase() : "";

        const rows = Array.from(reviewsBody.querySelectorAll("tr[data-status]"));
        let visibleCount = 0;

        rows.forEach((row) => {
            const rating = Number(row.dataset.rating) || 0;
            const st = (row.dataset.status || "").toLowerCase();
            const text = (row.textContent || "").toLowerCase();

            const matchesSearch = !q || text.includes(q);
            const matchesStatus = !stFilter || st === stFilter;
            let matchesRating = true;
            if (minRating === "5") matchesRating = rating >= 5;
            else if (minRating === "4") matchesRating = rating >= 4;
            else if (minRating === "3") matchesRating = rating <= 3;

            const isMatch = matchesSearch && matchesStatus && matchesRating;
            row.style.display = isMatch ? "" : "none";
            if (isMatch) visibleCount += 1;
        });

        let emptyRow = document.getElementById("revFilterEmptyRow");
        if (visibleCount === 0) {
            if (!emptyRow) {
                emptyRow = document.createElement("tr");
                emptyRow.id = "revFilterEmptyRow";
                emptyRow.innerHTML = `<td colspan="8" class="text-center py-4 text-muted">No matching reviews found.</td>`;
                reviewsBody.appendChild(emptyRow);
            }
            emptyRow.style.display = "";
        } else if (emptyRow) {
            emptyRow.style.display = "none";
        }
    }

    function applyStoryFilters() {
        if (!storiesBody) return;
        const q = storySearchEl ? storySearchEl.value.trim().toLowerCase() : "";
        const destFilter = storyDestEl ? storyDestEl.value.trim().toLowerCase() : "";
        const stFilter = storyStatusEl ? storyStatusEl.value.trim().toLowerCase() : "";

        const rows = Array.from(storiesBody.querySelectorAll("tr[data-status]"));
        let visibleCount = 0;

        rows.forEach((row) => {
            const st = (row.dataset.status || "").toLowerCase();
            const text = (row.textContent || "").toLowerCase();

            const matchesSearch = !q || text.includes(q);
            const matchesDest = !destFilter || text.includes(destFilter);
            const matchesStatus = !stFilter || st === stFilter;

            const isMatch = matchesSearch && matchesDest && matchesStatus;
            row.style.display = isMatch ? "" : "none";
            if (isMatch) visibleCount += 1;
        });

        let emptyRow = document.getElementById("storyFilterEmptyRow");
        if (visibleCount === 0) {
            if (!emptyRow) {
                emptyRow = document.createElement("tr");
                emptyRow.id = "storyFilterEmptyRow";
                emptyRow.innerHTML = `<td colspan="8" class="text-center py-4 text-muted">No matching customer stories found.</td>`;
                storiesBody.appendChild(emptyRow);
            }
            emptyRow.style.display = "";
        } else if (emptyRow) {
            emptyRow.style.display = "none";
        }
    }

    // Review status moderation (Approve / Hide / Publish)
    if (reviewsBody) {
        reviewsBody.addEventListener("click", function (event) {
            const btn = event.target.closest(".js-toggle-review");
            if (!btn) return;
            const row = btn.closest("tr[data-status]");
            if (!row) return;

            const currentStatus = (row.dataset.status || "").toLowerCase();
            const nextStatus = currentStatus === "published" ? "hidden" : "published";
            row.dataset.status = nextStatus;

            const statusCell = row.querySelector(".rev-status");
            if (statusCell) statusCell.innerHTML = statusBadgeHTML(nextStatus);

            if (nextStatus === "published") {
                btn.className = "btn-brand-outline py-1 px-2 small js-toggle-review";
                btn.textContent = "Hide";
            } else {
                btn.className = "btn-brand-teal py-1 px-2 small js-toggle-review";
                btn.textContent = "Publish";
            }

            updateOverviewMetrics();
            applyReviewFilters();
        });
    }

    // Story view & status moderation
    if (storiesBody) {
        storiesBody.addEventListener("click", function (event) {
            const viewBtn = event.target.closest(".js-view-story");
            if (viewBtn) {
                const row = viewBtn.closest("tr[data-status]");
                openStoryModal(row);
                return;
            }

            const btn = event.target.closest(".js-toggle-story");
            if (!btn) return;
            const row = btn.closest("tr[data-status]");
            if (!row) return;

            const currentStatus = (row.dataset.status || "").toLowerCase();
            const nextStatus = currentStatus === "published" ? "hidden" : "published";
            row.dataset.status = nextStatus;

            const statusCell = row.querySelector(".story-status");
            if (statusCell) statusCell.innerHTML = statusBadgeHTML(nextStatus);

            const actionsCell = btn.closest("td");
            if (actionsCell) {
                actionsCell.innerHTML = storyActionButtonsHTML(nextStatus);
            }

            updateOverviewMetrics();
            applyStoryFilters();
        });
    }

    if (closeStoryModalBtn) closeStoryModalBtn.addEventListener("click", closeStoryModal);
    if (cancelStoryModalBtn) cancelStoryModalBtn.addEventListener("click", closeStoryModal);
    if (storyModal) {
        storyModal.addEventListener("click", function (event) {
            if (event.target === storyModal) closeStoryModal();
        });
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && storyModal && !storyModal.classList.contains("d-none")) {
            closeStoryModal();
        }
    });

    // Story form validation & live DOM insertion
    function validateStoryForm() {
        let isValid = true;

        const authorVal = authorEl ? authorEl.value.trim() : "";
        if (!authorVal) {
            isValid = setFieldError(authorEl, "Customer / author name is required.") && isValid;
        } else if (authorVal.length < 2) {
            isValid = setFieldError(authorEl, "Enter at least 2 characters.") && isValid;
        } else {
            setFieldError(authorEl, "");
        }

        const titleVal = titleEl ? titleEl.value.trim() : "";
        if (!titleVal) {
            isValid = setFieldError(titleEl, "Story title is required.") && isValid;
        } else if (titleVal.length < 5) {
            isValid = setFieldError(titleEl, "Story title should be at least 5 characters.") && isValid;
        } else {
            setFieldError(titleEl, "");
        }

        const destVal = destEl ? destEl.value.trim() : "";
        if (!destVal) {
            isValid = setFieldError(destEl, "Destination or package name is required.") && isValid;
        } else if (destVal.length < 2) {
            isValid = setFieldError(destEl, "Enter a valid destination or package.") && isValid;
        } else {
            setFieldError(destEl, "");
        }

        if (photosEl && photosEl.files && photosEl.files.length > 0) {
            let photoErr = "";
            for (let i = 0; i < photosEl.files.length; i += 1) {
                const file = photosEl.files[i];
                if (!file.type || !file.type.startsWith("image/")) {
                    photoErr = `"${file.name}" must be an image file.`;
                    break;
                }
                if (file.size > MAX_PHOTO_BYTES) {
                    photoErr = `"${file.name}" exceeds the 5 MB limit.`;
                    break;
                }
            }
            if (photoErr) {
                isValid = setFieldError(photosEl, photoErr, photosDropzone) && isValid;
            } else {
                setFieldError(photosEl, "", photosDropzone);
            }
        } else {
            setFieldError(photosEl, "", photosDropzone);
        }

        const contentVal = contentEl ? contentEl.value.trim() : "";
        if (!contentVal) {
            isValid = setFieldError(contentEl, "Story content is required.") && isValid;
        } else if (contentVal.length < 20) {
            isValid = setFieldError(contentEl, "Write at least 20 characters for the travel story.") && isValid;
        } else {
            setFieldError(contentEl, "");
        }

        return isValid;
    }

    [authorEl, titleEl, destEl, contentEl].forEach((el) => {
        if (!el) return;
        el.addEventListener("input", () => setFieldError(el, ""));
    });

    if (photosEl) {
        photosEl.addEventListener("change", () => {
            setFieldError(photosEl, "", photosDropzone);
            if (photosLabel && photosEl.files && photosEl.files.length > 0) {
                photosLabel.textContent =
                    photosEl.files.length === 1
                        ? photosEl.files[0].name
                        : `${photosEl.files.length} photos selected`;
            }
        });
    }

    if (storyForm) {
        storyForm.addEventListener("reset", function () {
            [authorEl, titleEl, destEl, contentEl].forEach((el) => setFieldError(el, ""));
            setFieldError(photosEl, "", photosDropzone);
            if (photosLabel) photosLabel.textContent = "Upload Story Gallery";
        });

        storyForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!validateStoryForm()) {
                const firstInvalid = storyForm.querySelector(".is-invalid");
                if (firstInvalid) {
                    firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
                    if (typeof firstInvalid.focus === "function") firstInvalid.focus();
                }
                return;
            }

            const author = authorEl.value.trim();
            const title = titleEl.value.trim();
            const destination = destEl.value.trim();
            const content = contentEl.value.trim();
            const selectedFiles = photosEl && photosEl.files ? Array.from(photosEl.files) : [];
            const photoCount = selectedFiles.length;
            const photoUrls = selectedFiles.map((f) => URL.createObjectURL(f)).join("|");
            const submittedDate = getTodayISO();
            const existingCount = storiesBody ? storiesBody.querySelectorAll("tr[data-status]").length : 0;
            const storyId = "STR-" + (101 + existingCount);

            if (storiesBody) {
                const row = document.createElement("tr");
                row.dataset.storyId = storyId;
                row.dataset.status = "published";
                row.dataset.content = content;
                row.dataset.photoUrls = photoUrls;
                row.innerHTML = `
          <td class="fw-bold">${storyId}</td>
          <td class="fw-semibold">${author}</td>
          <td>${title}</td>
          <td>${destination}</td>
          <td>${photoCount} ${photoCount === 1 ? "Photo" : "Photos"}</td>
          <td>${submittedDate}</td>
          <td class="story-status">${statusBadgeHTML("published")}</td>
          <td class="text-end">${storyActionButtonsHTML("published")}</td>
        `;
                storiesBody.prepend(row);
            }

            if (storyDestEl) {
                const destKey = destination.split(",")[0].trim().toLowerCase();
                const exists = Array.from(storyDestEl.options).some((opt) => opt.value.toLowerCase() === destKey);
                if (destKey && !exists) {
                    const opt = document.createElement("option");
                    opt.value = destKey;
                    opt.textContent = destination.split(",")[0].trim();
                    storyDestEl.appendChild(opt);
                }
            }

            updateOverviewMetrics();
            applyStoryFilters();
            storyForm.reset();
        });
    }

    if (revSearchEl) revSearchEl.addEventListener("input", applyReviewFilters);
    if (revRatingEl) revRatingEl.addEventListener("change", applyReviewFilters);
    if (revStatusEl) revStatusEl.addEventListener("change", applyReviewFilters);
    if (revFilterBtn) revFilterBtn.addEventListener("click", applyReviewFilters);

    if (storySearchEl) storySearchEl.addEventListener("input", applyStoryFilters);
    if (storyDestEl) storyDestEl.addEventListener("change", applyStoryFilters);
    if (storyStatusEl) storyStatusEl.addEventListener("change", applyStoryFilters);
    if (storyFilterBtn) storyFilterBtn.addEventListener("click", applyStoryFilters);

    updateOverviewMetrics();
    applyReviewFilters();
    applyStoryFilters();
})();