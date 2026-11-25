(function () {
    const form = document.getElementById("buildCustomQuoteForm");
    if (!form) return;

    const requestsBody = document.getElementById("customRequestsBody");
    const approvedBody = document.getElementById("approvedCustomTripsBody");

    const openInquiriesEl = document.getElementById("openInquiriesCount");
    const quotesSentEl = document.getElementById("quotesSentCount");
    const approvedTripsEl = document.getElementById("approvedTripsCount");

    const nameEl = document.getElementById("cstClientName");
    const contactEl = document.getElementById("cstClientContact");
    const startDateEl = document.getElementById("cstStartDate");
    const endDateEl = document.getElementById("cstEndDate");
    const paxEl = document.getElementById("cstPax");
    const statusEl = document.getElementById("cstQuoteStatus");
    const routeEl = document.getElementById("cstRoute");
    const stayCostEl = document.getElementById("cstStayCost");
    const transportCostEl = document.getElementById("cstTransportCost");
    const activityCostEl = document.getElementById("cstActivityCost");
    const finalQuoteEl = document.getElementById("cstFinalQuote");
    const notesEl = document.getElementById("cstItineraryNotes");

    const searchInput = document.getElementById("customSearchInput");
    const stageFilter = document.getElementById("customStageFilter");
    const dateFilter = document.getElementById("customDateFilter");
    const filterBtn = document.getElementById("customFilterBtn");

    function formatINR(num) {
        return "&#8377;" + Math.round(Number(num) || 0).toLocaleString("en-IN");
    }

    function setFieldError(input, message) {
        if (!input) return true;
        const errEl = document.getElementById("err-" + input.id);
        if (message) {
            input.classList.add("is-invalid");
            if (errEl) {
                errEl.textContent = message;
                errEl.classList.add("active");
            }
            return false;
        }
        input.classList.remove("is-invalid");
        if (errEl) {
            errEl.textContent = "";
            errEl.classList.remove("active");
        }
        return true;
    }

    function stageBadgeHTML(stage) {
        const st = (stage || "").toLowerCase();
        if (st === "approved") {
            return '<span class="badge bg-success-subtle text-success border border-success-subtle">Approved</span>';
        }
        if (st === "sent") {
            return '<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">Quote Sent</span>';
        }
        if (st === "draft") {
            return '<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">Draft Quote</span>';
        }
        return '<span class="badge bg-info-subtle text-info-emphasis border border-info-subtle">New Inquiry</span>';
    }

    function updateCustomMetrics() {
        let openCount = 0;
        let sentCount = 0;
        let approvedCount = 0;

        if (requestsBody) {
            const rows = Array.from(requestsBody.querySelectorAll("tr[data-stage]"));
            rows.forEach((row) => {
                const st = (row.dataset.stage || "").toLowerCase();
                if (st === "new" || st === "draft") openCount += 1;
                else if (st === "sent") sentCount += 1;
                else if (st === "approved") approvedCount += 1;
            });
        }

        if (openInquiriesEl) openInquiriesEl.textContent = String(openCount);
        if (quotesSentEl) quotesSentEl.textContent = String(sentCount);
        if (approvedTripsEl) approvedTripsEl.textContent = String(approvedCount);
    }

    function applyCustomFilters() {
        if (!requestsBody) return;
        const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
        const stVal = stageFilter ? stageFilter.value.trim().toLowerCase() : "";
        const dtVal = dateFilter ? dateFilter.value : "";

        const rows = Array.from(requestsBody.querySelectorAll("tr[data-stage]"));
        let visibleCount = 0;

        rows.forEach((row) => {
            const rowStage = (row.dataset.stage || "").toLowerCase();
            const rowStart = row.dataset.startDate || "";
            const rowText = (row.textContent || "").toLowerCase();

            const matchesSearch = !q || rowText.includes(q);
            const matchesStage = !stVal || rowStage === stVal;
            const matchesDate = !dtVal || rowStart >= dtVal;
            const isMatch = matchesSearch && matchesStage && matchesDate;

            row.style.display = isMatch ? "" : "none";
            if (isMatch) visibleCount += 1;
        });

        let emptyRow = document.getElementById("customFilterEmptyRow");
        if (visibleCount === 0) {
            if (!emptyRow) {
                emptyRow = document.createElement("tr");
                emptyRow.id = "customFilterEmptyRow";
                emptyRow.innerHTML = `<td colspan="7" class="text-center py-4 text-muted">No matching custom package requests found.</td>`;
                requestsBody.appendChild(emptyRow);
            }
            emptyRow.style.display = "";
        } else if (emptyRow) {
            emptyRow.style.display = "none";
        }
    }

    function validateNonNegativeCost(input, labelText) {
        if (!input) return true;
        const raw = input.value.trim();
        if (raw === "") {
            return setFieldError(input, "");
        }
        const num = Number(raw);
        if (Number.isNaN(num) || num < 0) {
            return setFieldError(input, `${labelText} cannot be negative.`);
        }
        return setFieldError(input, "");
    }

    function validateCustomQuoteForm() {
        let isValid = true;

        const nameVal = nameEl ? nameEl.value.trim() : "";
        if (!nameVal) {
            isValid = setFieldError(nameEl, "Client full name is required.") && isValid;
        } else if (nameVal.length < 2) {
            isValid = setFieldError(nameEl, "Enter at least 2 characters.") && isValid;
        } else {
            setFieldError(nameEl, "");
        }

        const contactVal = contactEl ? contactEl.value.trim() : "";
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactVal);
        const isPhone = /^(?:\+?\d{1,3})?\d{10}$/.test(contactVal.replace(/[\s\-()]/g, ""));
        if (!contactVal) {
            isValid = setFieldError(contactEl, "Email or phone number is required.") && isValid;
        } else if (!isEmail && !isPhone) {
            isValid = setFieldError(contactEl, "Enter a valid email address or 10-digit phone number.") && isValid;
        } else {
            setFieldError(contactEl, "");
        }

        const startVal = startDateEl ? startDateEl.value : "";
        const endVal = endDateEl ? endDateEl.value : "";
        if (!startVal) {
            isValid = setFieldError(startDateEl, "Start date is required.") && isValid;
        } else {
            setFieldError(startDateEl, "");
        }

        if (!endVal) {
            isValid = setFieldError(endDateEl, "End date is required.") && isValid;
        } else if (startVal && endVal < startVal) {
            isValid = setFieldError(endDateEl, "End date must be on or after the start date.") && isValid;
        } else {
            setFieldError(endDateEl, "");
        }

        const paxRaw = paxEl ? paxEl.value.trim() : "";
        const paxNum = Number(paxRaw);
        if (!paxRaw || !Number.isInteger(paxNum) || paxNum < 1) {
            isValid = setFieldError(paxEl, "Enter at least 1 traveler (pax).") && isValid;
        } else {
            setFieldError(paxEl, "");
        }

        const routeVal = routeEl ? routeEl.value.trim() : "";
        if (!routeVal) {
            isValid = setFieldError(routeEl, "Custom route sequence is required.") && isValid;
        } else if (routeVal.length < 5) {
            isValid = setFieldError(routeEl, "Enter at least 5 characters for the route.") && isValid;
        } else {
            setFieldError(routeEl, "");
        }

        isValid = validateNonNegativeCost(stayCostEl, "Accommodation cost") && isValid;
        isValid = validateNonNegativeCost(transportCostEl, "Transport cost") && isValid;
        isValid = validateNonNegativeCost(activityCostEl, "Activities cost") && isValid;

        const quoteRaw = finalQuoteEl ? finalQuoteEl.value.trim() : "";
        const quoteNum = Number(quoteRaw);
        if (!quoteRaw || Number.isNaN(quoteNum) || quoteNum <= 0) {
            isValid = setFieldError(finalQuoteEl, "Final quoted total must be greater than ₹0.") && isValid;
        } else {
            setFieldError(finalQuoteEl, "");
        }

        return isValid;
    }

    const trackedFields = [
        nameEl,
        contactEl,
        startDateEl,
        endDateEl,
        paxEl,
        routeEl,
        stayCostEl,
        transportCostEl,
        activityCostEl,
        finalQuoteEl,
        notesEl
    ];
    trackedFields.forEach((el) => {
        if (!el) return;
        const evt = el.type === "date" ? "change" : "input";
        el.addEventListener(evt, () => setFieldError(el, ""));
    });

    form.addEventListener("reset", function () {
        trackedFields.forEach((el) => setFieldError(el, ""));
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!validateCustomQuoteForm()) {
            const firstInvalid = form.querySelector(".is-invalid");
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
                if (typeof firstInvalid.focus === "function") firstInvalid.focus();
            }
            return;
        }

        const clientName = nameEl.value.trim();
        const startDate = startDateEl.value;
        const endDate = endDateEl.value;
        const pax = Number(paxEl.value);
        const stage = statusEl ? statusEl.value : "draft";
        const route = routeEl.value.trim();
        const finalQuote = Number(finalQuoteEl.value);

        const existingCount = requestsBody ? requestsBody.querySelectorAll("tr[data-stage]").length : 0;
        const tripId = "CST-" + (501 + existingCount);

        if (requestsBody) {
            const row = document.createElement("tr");
            row.dataset.stage = stage;
            row.dataset.startDate = startDate;
            row.innerHTML = `
        <td class="fw-bold">${tripId}</td>
        <td class="fw-semibold">${clientName}</td>
        <td>${route}</td>
        <td class="small">${startDate} to ${endDate} &bull; ${pax} Pax</td>
        <td class="fw-semibold">${formatINR(finalQuote)}</td>
        <td>${stageBadgeHTML(stage)}</td>
        <td class="text-end">
          <label for="tab-3" class="btn-brand-outline py-1 px-2 small">Revise</label>
        </td>
      `;
            requestsBody.prepend(row);
        }

        if (stage === "approved" && approvedBody) {
            const approvedRow = document.createElement("tr");
            approvedRow.innerHTML = `
        <td class="fw-bold">${tripId}</td>
        <td class="fw-semibold">${clientName}</td>
        <td>${route}</td>
        <td>${startDate} to ${endDate}</td>
        <td class="fw-semibold">${formatINR(finalQuote)}</td>
        <td><span class="badge bg-success-subtle text-success border border-success-subtle">Approved</span></td>
        <td class="text-end">
          <a href="bookings.html" class="btn-brand-outline py-1 px-2 small">Book</a>
        </td>
      `;
            approvedBody.prepend(approvedRow);
        }

        updateCustomMetrics();
        applyCustomFilters();
        form.reset();
        if (statusEl) statusEl.value = "draft";
    });

    if (searchInput) searchInput.addEventListener("input", applyCustomFilters);
    if (stageFilter) stageFilter.addEventListener("change", applyCustomFilters);
    if (dateFilter) dateFilter.addEventListener("change", applyCustomFilters);
    if (filterBtn) filterBtn.addEventListener("click", applyCustomFilters);

    updateCustomMetrics();
    applyCustomFilters();
})();