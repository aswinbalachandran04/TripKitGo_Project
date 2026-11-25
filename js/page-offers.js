(function () {
    const promoBody = document.getElementById("promoCodesBody");
    const giftBody = document.getElementById("giftCardsBody");

    const activePromoEl = document.getElementById("activePromoCodesCount");
    const issuedCardsEl = document.getElementById("issuedGiftCardsCount");
    const redemptionsEl = document.getElementById("totalRedemptionsCount");
    const voucherValueEl = document.getElementById("activeVoucherValue");

    // Promo form & filters
    const promoForm = document.getElementById("createPromoForm");
    const promoCodeEl = document.getElementById("promoCode");
    const promoTitleEl = document.getElementById("promoTitle");
    const promoTypeEl = document.getElementById("promoDiscountType");
    const promoValueEl = document.getElementById("promoDiscountValue");
    const promoMinEl = document.getElementById("promoMinAmount");
    const promoLimitEl = document.getElementById("promoUsageLimit");
    const promoStartEl = document.getElementById("promoStartDate");
    const promoExpiryEl = document.getElementById("promoExpiryDate");
    const promoStatusEl = document.getElementById("promoStatus");

    const promoSearchEl = document.getElementById("promoSearchInput");
    const promoTypeFilterEl = document.getElementById("promoTypeFilter");
    const promoStatusFilterEl = document.getElementById("promoStatusFilter");
    const promoFilterBtn = document.getElementById("promoFilterBtn");

    // Gift card form & filters
    const giftForm = document.getElementById("issueGiftCardForm");
    const giftCodeEl = document.getElementById("giftCode");
    const giftAmountEl = document.getElementById("giftAmount");
    const giftExpiryEl = document.getElementById("giftExpiry");
    const giftRecipientNameEl = document.getElementById("giftRecipientName");
    const giftRecipientEmailEl = document.getElementById("giftRecipientEmail");
    const giftSenderNameEl = document.getElementById("giftSenderName");
    const giftMessageEl = document.getElementById("giftMessage");

    const giftSearchEl = document.getElementById("giftSearchInput");
    const giftStatusFilterEl = document.getElementById("giftStatusFilter");
    const giftFilterBtn = document.getElementById("giftFilterBtn");

    // Edit Promo Modal elements
    const editPromoModal = document.getElementById("editPromoModal");
    const closeEditPromoBtn = document.getElementById("closeEditPromoBtn");
    const cancelEditPromoBtn = document.getElementById("cancelEditPromoBtn");
    const editPromoForm = document.getElementById("editPromoForm");
    const editPromoCodeBadge = document.getElementById("editPromoCodeBadge");
    const editPromoOriginalCodeEl = document.getElementById("editPromoOriginalCode");
    const editPromoTitleEl = document.getElementById("editPromoTitle");
    const editPromoTypeEl = document.getElementById("editPromoType");
    const editPromoValueEl = document.getElementById("editPromoValue");
    const editPromoExpiryEl = document.getElementById("editPromoExpiry");
    const editPromoLimitEl = document.getElementById("editPromoLimit");
    const editPromoStatusEl = document.getElementById("editPromoStatus");

    // Edit Gift Card Modal elements
    const editGiftModal = document.getElementById("editGiftModal");
    const closeEditGiftBtn = document.getElementById("closeEditGiftBtn");
    const cancelEditGiftBtn = document.getElementById("cancelEditGiftBtn");
    const editGiftForm = document.getElementById("editGiftForm");
    const editGiftCodeBadge = document.getElementById("editGiftCodeBadge");
    const editGiftOriginalCodeEl = document.getElementById("editGiftOriginalCode");
    const editGiftRecipientEl = document.getElementById("editGiftRecipient");
    const editGiftSenderEl = document.getElementById("editGiftSender");
    const editGiftBalanceEl = document.getElementById("editGiftBalance");
    const editGiftExpiryEl = document.getElementById("editGiftExpiry");
    const editGiftStatusEl = document.getElementById("editGiftStatus");

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

    function promoStatusBadgeHTML(status) {
        const st = (status || "").toLowerCase();
        if (st === "active") {
            return '<span class="badge bg-success-subtle text-success border border-success-subtle">Active</span>';
        }
        if (st === "scheduled") {
            return '<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">Scheduled</span>';
        }
        return '<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">Paused</span>';
    }

    function giftStatusBadgeHTML(status) {
        const st = (status || "").toLowerCase();
        if (st === "partial") {
            return '<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">Partially Used</span>';
        }
        if (st === "redeemed") {
            return '<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">Redeemed</span>';
        }
        return '<span class="badge bg-success-subtle text-success border border-success-subtle">Active</span>';
    }

    function promoActionsHTML(status) {
        const toggleBtn =
            status === "active"
                ? '<button type="button" class="btn-brand-outline py-1 px-2 small js-toggle-promo">Pause</button>'
                : '<button type="button" class="btn-brand-teal py-1 px-2 small js-toggle-promo">Activate</button>';
        return `
      <div class="d-inline-flex gap-1">
        ${toggleBtn}
        <button type="button" class="btn-brand-outline py-1 px-2 small js-edit-promo" title="Edit promo"><i class="bi bi-pencil-square"></i></button>
        <button type="button" class="btn-brand-outline py-1 px-2 small text-danger border-danger-subtle js-delete-promo" title="Delete promo"><i class="bi bi-trash3"></i></button>
      </div>
    `;
    }

    function giftActionsHTML() {
        return `
      <div class="d-inline-flex gap-1">
        <button type="button" class="btn-brand-outline py-1 px-2 small js-edit-gift" title="Edit gift card"><i class="bi bi-pencil-square"></i></button>
        <button type="button" class="btn-brand-outline py-1 px-2 small text-danger border-danger-subtle js-delete-gift" title="Delete gift card"><i class="bi bi-trash3"></i></button>
      </div>
    `;
    }

    function buildPromoRowHTML(data) {
        const discountText =
            data.discountType === "percent" ? `${data.discountValue}% Off` : `${formatINR(data.discountValue)} Off`;
        return `
      <td class="fw-bold">${data.code}</td>
      <td class="fw-semibold">${data.title}</td>
      <td>${discountText}</td>
      <td>${data.validUntil}</td>
      <td>${data.usage} / ${data.limit}</td>
      <td class="promo-status">${promoStatusBadgeHTML(data.status)}</td>
      <td class="text-end">${promoActionsHTML(data.status)}</td>
    `;
    }

    function buildGiftRowHTML(data) {
        return `
      <td class="fw-bold">${data.code}</td>
      <td class="fw-semibold">${data.recipient}</td>
      <td>${data.sender}</td>
      <td>${formatINR(data.value)}</td>
      <td class="fw-semibold">${formatINR(data.balance)}</td>
      <td>${data.expiry}</td>
      <td>${giftStatusBadgeHTML(data.status)}</td>
      <td class="text-end">${giftActionsHTML()}</td>
    `;
    }

    function updateOffersOverviewMetrics() {
        let activePromos = 0;
        let totalRedemptions = 0;

        if (promoBody) {
            const promoRows = Array.from(promoBody.querySelectorAll("tr[data-status]"));
            promoRows.forEach((row) => {
                const st = (row.dataset.status || "").toLowerCase();
                if (st === "active") activePromos += 1;
                totalRedemptions += Number(row.dataset.usage) || 0;
            });
        }

        let issuedCount = 0;
        let activeVoucherBalance = 0;

        if (giftBody) {
            const giftRows = Array.from(giftBody.querySelectorAll("tr[data-status]"));
            issuedCount = giftRows.length;
            giftRows.forEach((row) => {
                const st = (row.dataset.status || "").toLowerCase();
                const bal = Number(row.dataset.balance) || 0;
                if (st !== "redeemed") {
                    activeVoucherBalance += bal;
                }
            });
        }

        if (activePromoEl) activePromoEl.textContent = String(activePromos);
        if (issuedCardsEl) issuedCardsEl.textContent = String(issuedCount);
        if (redemptionsEl) redemptionsEl.textContent = String(totalRedemptions);
        if (voucherValueEl) voucherValueEl.innerHTML = formatINR(activeVoucherBalance);
    }

    function applyPromoFilters() {
        if (!promoBody) return;
        const q = promoSearchEl ? promoSearchEl.value.trim().toLowerCase() : "";
        const dType = promoTypeFilterEl ? promoTypeFilterEl.value.trim().toLowerCase() : "";
        const stFilter = promoStatusFilterEl ? promoStatusFilterEl.value.trim().toLowerCase() : "";

        const rows = Array.from(promoBody.querySelectorAll("tr[data-status]"));
        let visibleCount = 0;

        rows.forEach((row) => {
            const rowType = (row.dataset.discountType || "").toLowerCase();
            const rowStatus = (row.dataset.status || "").toLowerCase();
            const text = (row.textContent || "").toLowerCase();

            const matchesSearch = !q || text.includes(q);
            const matchesType = !dType || rowType === dType;
            const matchesStatus = !stFilter || rowStatus === stFilter;
            const isMatch = matchesSearch && matchesType && matchesStatus;

            row.style.display = isMatch ? "" : "none";
            if (isMatch) visibleCount += 1;
        });

        let emptyRow = document.getElementById("promoFilterEmptyRow");
        if (visibleCount === 0) {
            if (!emptyRow) {
                emptyRow = document.createElement("tr");
                emptyRow.id = "promoFilterEmptyRow";
                emptyRow.innerHTML = `<td colspan="7" class="text-center py-4 text-muted">No matching promo codes found.</td>`;
                promoBody.appendChild(emptyRow);
            }
            emptyRow.style.display = "";
        } else if (emptyRow) {
            emptyRow.style.display = "none";
        }
    }

    function applyGiftFilters() {
        if (!giftBody) return;
        const q = giftSearchEl ? giftSearchEl.value.trim().toLowerCase() : "";
        const stFilter = giftStatusFilterEl ? giftStatusFilterEl.value.trim().toLowerCase() : "";

        const rows = Array.from(giftBody.querySelectorAll("tr[data-status]"));
        let visibleCount = 0;

        rows.forEach((row) => {
            const rowStatus = (row.dataset.status || "").toLowerCase();
            const text = (row.textContent || "").toLowerCase();

            const matchesSearch = !q || text.includes(q);
            const matchesStatus = !stFilter || rowStatus === stFilter;
            const isMatch = matchesSearch && matchesStatus;

            row.style.display = isMatch ? "" : "none";
            if (isMatch) visibleCount += 1;
        });

        let emptyRow = document.getElementById("giftFilterEmptyRow");
        if (visibleCount === 0) {
            if (!emptyRow) {
                emptyRow = document.createElement("tr");
                emptyRow.id = "giftFilterEmptyRow";
                emptyRow.innerHTML = `<td colspan="8" class="text-center py-4 text-muted">No matching gift cards found.</td>`;
                giftBody.appendChild(emptyRow);
            }
            emptyRow.style.display = "";
        } else if (emptyRow) {
            emptyRow.style.display = "none";
        }
    }

    function openEditPromoModal(row) {
        if (!editPromoModal || !row) return;
        const code = row.dataset.promoCode || row.querySelector("td")?.textContent.trim() || "";
        const cells = row.querySelectorAll("td");

        if (editPromoOriginalCodeEl) editPromoOriginalCodeEl.value = code;
        if (editPromoCodeBadge) editPromoCodeBadge.textContent = `(${code})`;
        if (editPromoTitleEl) editPromoTitleEl.value = cells[1] ? cells[1].textContent.trim() : "";
        if (editPromoTypeEl) editPromoTypeEl.value = row.dataset.discountType || "percent";
        if (editPromoValueEl) editPromoValueEl.value = row.dataset.discountValue || "10";
        if (editPromoExpiryEl) editPromoExpiryEl.value = row.dataset.validUntil || (cells[3] ? cells[3].textContent.trim() : "");
        if (editPromoLimitEl) editPromoLimitEl.value = row.dataset.limit || "50";
        if (editPromoStatusEl) editPromoStatusEl.value = row.dataset.status || "active";

        [editPromoTitleEl, editPromoValueEl, editPromoExpiryEl, editPromoLimitEl].forEach((el) => setFieldError(el, ""));
        editPromoModal.classList.remove("d-none");
    }

    function closeEditPromoModal() {
        if (!editPromoModal) return;
        editPromoModal.classList.add("d-none");
    }

    function openEditGiftModal(row) {
        if (!editGiftModal || !row) return;
        const code = row.dataset.giftCode || row.querySelector("td")?.textContent.trim() || "";

        if (editGiftOriginalCodeEl) editGiftOriginalCodeEl.value = code;
        if (editGiftCodeBadge) editGiftCodeBadge.textContent = `(${code})`;
        if (editGiftRecipientEl) editGiftRecipientEl.value = row.dataset.recipient || "";
        if (editGiftSenderEl) editGiftSenderEl.value = row.dataset.sender || "";
        if (editGiftBalanceEl) editGiftBalanceEl.value = row.dataset.balance || "0";
        if (editGiftExpiryEl) editGiftExpiryEl.value = row.dataset.expiry || "";
        if (editGiftStatusEl) editGiftStatusEl.value = row.dataset.status || "active";

        [editGiftRecipientEl, editGiftSenderEl, editGiftBalanceEl, editGiftExpiryEl].forEach((el) => setFieldError(el, ""));
        editGiftModal.classList.remove("d-none");
    }

    function closeEditGiftModal() {
        if (!editGiftModal) return;
        editGiftModal.classList.add("d-none");
    }

    // Promo row actions: Toggle status, Edit, Delete
    if (promoBody) {
        promoBody.addEventListener("click", function (event) {
            const row = event.target.closest("tr[data-status]");
            if (!row) return;

            if (event.target.closest(".js-edit-promo")) {
                openEditPromoModal(row);
                return;
            }

            if (event.target.closest(".js-delete-promo")) {
                row.remove();
                updateOffersOverviewMetrics();
                applyPromoFilters();
                return;
            }

            const toggleBtn = event.target.closest(".js-toggle-promo");
            if (toggleBtn) {
                const currentStatus = (row.dataset.status || "").toLowerCase();
                const nextStatus = currentStatus === "active" ? "paused" : "active";
                row.dataset.status = nextStatus;

                const statusCell = row.querySelector(".promo-status");
                if (statusCell) statusCell.innerHTML = promoStatusBadgeHTML(nextStatus);

                const actionsCell = toggleBtn.closest("td");
                if (actionsCell) actionsCell.innerHTML = promoActionsHTML(nextStatus);

                updateOffersOverviewMetrics();
                applyPromoFilters();
            }
        });
    }

    // Gift card row actions: Edit, Delete
    if (giftBody) {
        giftBody.addEventListener("click", function (event) {
            const row = event.target.closest("tr[data-status]");
            if (!row) return;

            if (event.target.closest(".js-edit-gift")) {
                openEditGiftModal(row);
                return;
            }

            if (event.target.closest(".js-delete-gift")) {
                row.remove();
                updateOffersOverviewMetrics();
                applyGiftFilters();
            }
        });
    }

    // Modal close listeners
    if (closeEditPromoBtn) closeEditPromoBtn.addEventListener("click", closeEditPromoModal);
    if (cancelEditPromoBtn) cancelEditPromoBtn.addEventListener("click", closeEditPromoModal);
    if (editPromoModal) {
        editPromoModal.addEventListener("click", (e) => {
            if (e.target === editPromoModal) closeEditPromoModal();
        });
    }

    if (closeEditGiftBtn) closeEditGiftBtn.addEventListener("click", closeEditGiftModal);
    if (cancelEditGiftBtn) cancelEditGiftBtn.addEventListener("click", closeEditGiftModal);
    if (editGiftModal) {
        editGiftModal.addEventListener("click", (e) => {
            if (e.target === editGiftModal) closeEditGiftModal();
        });
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            if (editPromoModal && !editPromoModal.classList.contains("d-none")) closeEditPromoModal();
            else if (editGiftModal && !editGiftModal.classList.contains("d-none")) closeEditGiftModal();
        }
    });

    // Edit Promo Form submit
    if (editPromoForm) {
        [editPromoTitleEl, editPromoValueEl, editPromoExpiryEl, editPromoLimitEl].forEach((el) => {
            if (!el) return;
            const evt = el.type === "date" ? "change" : "input";
            el.addEventListener(evt, () => setFieldError(el, ""));
        });

        editPromoForm.addEventListener("submit", function (event) {
            event.preventDefault();
            let isValid = true;

            const tVal = editPromoTitleEl ? editPromoTitleEl.value.trim() : "";
            if (!tVal || tVal.length < 3) {
                isValid = setFieldError(editPromoTitleEl, "Enter at least 3 characters for campaign title.") && isValid;
            } else {
                setFieldError(editPromoTitleEl, "");
            }

            const dType = editPromoTypeEl ? editPromoTypeEl.value : "percent";
            const valNum = Number(editPromoValueEl ? editPromoValueEl.value.trim() : "");
            if (Number.isNaN(valNum) || valNum <= 0) {
                isValid = setFieldError(editPromoValueEl, "Enter a discount value greater than 0.") && isValid;
            } else if (dType === "percent" && valNum > 80) {
                isValid = setFieldError(editPromoValueEl, "Percentage discount cannot exceed 80%.") && isValid;
            } else {
                setFieldError(editPromoValueEl, "");
            }

            const expVal = editPromoExpiryEl ? editPromoExpiryEl.value : "";
            if (!expVal) {
                isValid = setFieldError(editPromoExpiryEl, "Expiry date is required.") && isValid;
            } else {
                setFieldError(editPromoExpiryEl, "");
            }

            const limNum = Number(editPromoLimitEl ? editPromoLimitEl.value.trim() : "");
            if (!Number.isInteger(limNum) || limNum < 1) {
                isValid = setFieldError(editPromoLimitEl, "Usage limit must be at least 1.") && isValid;
            } else {
                setFieldError(editPromoLimitEl, "");
            }

            if (!isValid) return;

            const code = editPromoOriginalCodeEl ? editPromoOriginalCodeEl.value : "";
            const row = promoBody ? promoBody.querySelector(`tr[data-promo-code="${code}"]`) : null;
            if (!row) return;

            const usageNum = Number(row.dataset.usage) || 0;
            const stVal = editPromoStatusEl ? editPromoStatusEl.value : "active";

            row.dataset.discountType = dType;
            row.dataset.discountValue = String(valNum);
            row.dataset.validUntil = expVal;
            row.dataset.limit = String(limNum);
            row.dataset.status = stVal;
            row.innerHTML = buildPromoRowHTML({
                code,
                title: tVal,
                discountType: dType,
                discountValue: valNum,
                validUntil: expVal,
                usage: usageNum,
                limit: limNum,
                status: stVal
            });

            updateOffersOverviewMetrics();
            applyPromoFilters();
            closeEditPromoModal();
        });
    }

    // Edit Gift Card Form submit
    if (editGiftForm) {
        [editGiftRecipientEl, editGiftSenderEl, editGiftBalanceEl, editGiftExpiryEl].forEach((el) => {
            if (!el) return;
            const evt = el.type === "date" ? "change" : "input";
            el.addEventListener(evt, () => setFieldError(el, ""));
        });

        editGiftForm.addEventListener("submit", function (event) {
            event.preventDefault();
            let isValid = true;

            const recVal = editGiftRecipientEl ? editGiftRecipientEl.value.trim() : "";
            if (!recVal || recVal.length < 2) {
                isValid = setFieldError(editGiftRecipientEl, "Enter recipient full name.") && isValid;
            } else {
                setFieldError(editGiftRecipientEl, "");
            }

            const sndVal = editGiftSenderEl ? editGiftSenderEl.value.trim() : "";
            if (!sndVal) {
                isValid = setFieldError(editGiftSenderEl, "Enter sender name.") && isValid;
            } else {
                setFieldError(editGiftSenderEl, "");
            }

            const balRaw = editGiftBalanceEl ? editGiftBalanceEl.value.trim() : "";
            const balNum = Number(balRaw);
            if (balRaw === "" || Number.isNaN(balNum) || balNum < 0) {
                isValid = setFieldError(editGiftBalanceEl, "Balance must be ₹0 or higher.") && isValid;
            } else {
                setFieldError(editGiftBalanceEl, "");
            }

            const expVal = editGiftExpiryEl ? editGiftExpiryEl.value : "";
            if (!expVal) {
                isValid = setFieldError(editGiftExpiryEl, "Expiry date is required.") && isValid;
            } else {
                setFieldError(editGiftExpiryEl, "");
            }

            if (!isValid) return;

            const code = editGiftOriginalCodeEl ? editGiftOriginalCodeEl.value : "";
            const row = giftBody ? giftBody.querySelector(`tr[data-gift-code="${code}"]`) : null;
            if (!row) return;

            const origValue = Number(row.dataset.value) || balNum;
            const stVal = editGiftStatusEl ? editGiftStatusEl.value : "active";

            row.dataset.recipient = recVal;
            row.dataset.sender = sndVal;
            row.dataset.balance = String(balNum);
            row.dataset.expiry = expVal;
            row.dataset.status = stVal;
            row.innerHTML = buildGiftRowHTML({
                code,
                recipient: recVal,
                sender: sndVal,
                value: origValue,
                balance: balNum,
                expiry: expVal,
                status: stVal
            });

            updateOffersOverviewMetrics();
            applyGiftFilters();
            closeEditGiftModal();
        });
    }

    // Create Promo validation & submit
    function validatePromoForm() {
        let isValid = true;

        const codeVal = promoCodeEl ? promoCodeEl.value.trim().toUpperCase() : "";
        if (!codeVal) {
            isValid = setFieldError(promoCodeEl, "Promo code is required.") && isValid;
        } else if (!/^[A-Z0-9_-]{3,20}$/.test(codeVal)) {
            isValid = setFieldError(promoCodeEl, "Use 3–20 uppercase letters, numbers, or hyphens.") && isValid;
        } else {
            if (promoCodeEl) promoCodeEl.value = codeVal;
            setFieldError(promoCodeEl, "");
        }

        const titleVal = promoTitleEl ? promoTitleEl.value.trim() : "";
        if (!titleVal) {
            isValid = setFieldError(promoTitleEl, "Campaign title is required.") && isValid;
        } else if (titleVal.length < 3) {
            isValid = setFieldError(promoTitleEl, "Enter at least 3 characters.") && isValid;
        } else {
            setFieldError(promoTitleEl, "");
        }

        const dType = promoTypeEl ? promoTypeEl.value : "percent";
        const valRaw = promoValueEl ? promoValueEl.value.trim() : "";
        const valNum = Number(valRaw);
        if (!valRaw || Number.isNaN(valNum) || valNum <= 0) {
            isValid = setFieldError(promoValueEl, "Enter a discount value greater than 0.") && isValid;
        } else if (dType === "percent" && valNum > 80) {
            isValid = setFieldError(promoValueEl, "Percentage discount cannot exceed 80%.") && isValid;
        } else {
            setFieldError(promoValueEl, "");
        }

        const minRaw = promoMinEl ? promoMinEl.value.trim() : "";
        if (minRaw !== "") {
            const minNum = Number(minRaw);
            if (Number.isNaN(minNum) || minNum < 0) {
                isValid = setFieldError(promoMinEl, "Minimum amount cannot be negative.") && isValid;
            } else {
                setFieldError(promoMinEl, "");
            }
        } else {
            setFieldError(promoMinEl, "");
        }

        const limitRaw = promoLimitEl ? promoLimitEl.value.trim() : "";
        if (limitRaw !== "") {
            const limitNum = Number(limitRaw);
            if (!Number.isInteger(limitNum) || limitNum < 1) {
                isValid = setFieldError(promoLimitEl, "Usage limit must be at least 1.") && isValid;
            } else {
                setFieldError(promoLimitEl, "");
            }
        } else {
            setFieldError(promoLimitEl, "");
        }

        const startVal = promoStartEl ? promoStartEl.value : "";
        const expiryVal = promoExpiryEl ? promoExpiryEl.value : "";

        if (!startVal) {
            isValid = setFieldError(promoStartEl, "Start date is required.") && isValid;
        } else {
            setFieldError(promoStartEl, "");
        }

        if (!expiryVal) {
            isValid = setFieldError(promoExpiryEl, "Expiry date is required.") && isValid;
        } else if (startVal && expiryVal < startVal) {
            isValid = setFieldError(promoExpiryEl, "Expiry date must be on or after the start date.") && isValid;
        } else {
            setFieldError(promoExpiryEl, "");
        }

        return isValid;
    }

    const promoTracked = [promoCodeEl, promoTitleEl, promoValueEl, promoMinEl, promoLimitEl, promoStartEl, promoExpiryEl];
    promoTracked.forEach((el) => {
        if (!el) return;
        const evt = el.type === "date" ? "change" : "input";
        el.addEventListener(evt, () => setFieldError(el, ""));
    });
    if (promoTypeEl) {
        promoTypeEl.addEventListener("change", () => setFieldError(promoValueEl, ""));
    }

    if (promoForm) {
        promoForm.addEventListener("reset", function () {
            promoTracked.forEach((el) => setFieldError(el, ""));
        });

        promoForm.addEventListener("submit", function (event) {
            event.preventDefault();
            if (!validatePromoForm()) {
                const firstInvalid = promoForm.querySelector(".is-invalid");
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            const code = promoCodeEl.value.trim().toUpperCase();
            const title = promoTitleEl.value.trim();
            const dType = promoTypeEl ? promoTypeEl.value : "percent";
            const valNum = Number(promoValueEl.value);
            const limitNum = promoLimitEl && promoLimitEl.value.trim() !== "" ? Number(promoLimitEl.value) : 100;
            const expiryVal = promoExpiryEl.value;
            const stVal = promoStatusEl ? promoStatusEl.value : "active";

            if (promoBody) {
                const row = document.createElement("tr");
                row.dataset.promoCode = code;
                row.dataset.discountType = dType;
                row.dataset.discountValue = String(valNum);
                row.dataset.validUntil = expiryVal;
                row.dataset.usage = "0";
                row.dataset.limit = String(limitNum);
                row.dataset.status = stVal;
                row.innerHTML = buildPromoRowHTML({
                    code,
                    title,
                    discountType: dType,
                    discountValue: valNum,
                    validUntil: expiryVal,
                    usage: 0,
                    limit: limitNum,
                    status: stVal
                });
                promoBody.prepend(row);
            }

            updateOffersOverviewMetrics();
            applyPromoFilters();
            promoForm.reset();
            if (promoTypeEl) promoTypeEl.value = "percent";
            if (promoStatusEl) promoStatusEl.value = "active";
        });
    }

    // Create Gift Card validation & submit
    function validateGiftCardForm() {
        let isValid = true;

        const codeVal = giftCodeEl ? giftCodeEl.value.trim().toUpperCase() : "";
        if (!codeVal) {
            isValid = setFieldError(giftCodeEl, "Gift card code is required.") && isValid;
        } else if (!/^[A-Z0-9_-]{4,24}$/.test(codeVal)) {
            isValid = setFieldError(giftCodeEl, "Use 4–24 uppercase letters, numbers, or hyphens.") && isValid;
        } else {
            if (giftCodeEl) giftCodeEl.value = codeVal;
            setFieldError(giftCodeEl, "");
        }

        const amtRaw = giftAmountEl ? giftAmountEl.value.trim() : "";
        const amtNum = Number(amtRaw);
        if (!amtRaw || Number.isNaN(amtNum) || amtNum < 500) {
            isValid = setFieldError(giftAmountEl, "Gift card amount must be at least ₹500.") && isValid;
        } else {
            setFieldError(giftAmountEl, "");
        }

        const expiryVal = giftExpiryEl ? giftExpiryEl.value : "";
        if (!expiryVal) {
            isValid = setFieldError(giftExpiryEl, "Valid until date is required.") && isValid;
        } else {
            setFieldError(giftExpiryEl, "");
        }

        const recNameVal = giftRecipientNameEl ? giftRecipientNameEl.value.trim() : "";
        if (!recNameVal) {
            isValid = setFieldError(giftRecipientNameEl, "Recipient full name is required.") && isValid;
        } else if (recNameVal.length < 2) {
            isValid = setFieldError(giftRecipientNameEl, "Enter at least 2 characters.") && isValid;
        } else {
            setFieldError(giftRecipientNameEl, "");
        }

        const recEmailVal = giftRecipientEmailEl ? giftRecipientEmailEl.value.trim() : "";
        if (!recEmailVal) {
            isValid = setFieldError(giftRecipientEmailEl, "Recipient email is required.") && isValid;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recEmailVal)) {
            isValid = setFieldError(giftRecipientEmailEl, "Enter a valid email address.") && isValid;
        } else {
            setFieldError(giftRecipientEmailEl, "");
        }

        return isValid;
    }

    const giftTracked = [giftCodeEl, giftAmountEl, giftExpiryEl, giftRecipientNameEl, giftRecipientEmailEl, giftSenderNameEl, giftMessageEl];
    giftTracked.forEach((el) => {
        if (!el) return;
        const evt = el.type === "date" ? "change" : "input";
        el.addEventListener(evt, () => setFieldError(el, ""));
    });

    if (giftForm) {
        giftForm.addEventListener("reset", function () {
            giftTracked.forEach((el) => setFieldError(el, ""));
        });

        giftForm.addEventListener("submit", function (event) {
            event.preventDefault();
            if (!validateGiftCardForm()) {
                const firstInvalid = giftForm.querySelector(".is-invalid");
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            const code = giftCodeEl.value.trim().toUpperCase();
            const amount = Number(giftAmountEl.value);
            const expiryVal = giftExpiryEl.value;
            const recipient = giftRecipientNameEl.value.trim();
            const sender = giftSenderNameEl && giftSenderNameEl.value.trim() !== "" ? giftSenderNameEl.value.trim() : "TripKitGo Admin";

            if (giftBody) {
                const row = document.createElement("tr");
                row.dataset.giftCode = code;
                row.dataset.recipient = recipient;
                row.dataset.sender = sender;
                row.dataset.value = String(amount);
                row.dataset.balance = String(amount);
                row.dataset.expiry = expiryVal;
                row.dataset.status = "active";
                row.innerHTML = buildGiftRowHTML({
                    code,
                    recipient,
                    sender,
                    value: amount,
                    balance: amount,
                    expiry: expiryVal,
                    status: "active"
                });
                giftBody.prepend(row);
            }

            updateOffersOverviewMetrics();
            applyGiftFilters();
            giftForm.reset();
        });
    }

    if (promoSearchEl) promoSearchEl.addEventListener("input", applyPromoFilters);
    if (promoTypeFilterEl) promoTypeFilterEl.addEventListener("change", applyPromoFilters);
    if (promoStatusFilterEl) promoStatusFilterEl.addEventListener("change", applyPromoFilters);
    if (promoFilterBtn) promoFilterBtn.addEventListener("click", applyPromoFilters);

    if (giftSearchEl) giftSearchEl.addEventListener("input", applyGiftFilters);
    if (giftStatusFilterEl) giftStatusFilterEl.addEventListener("change", applyGiftFilters);
    if (giftFilterBtn) giftFilterBtn.addEventListener("click", applyGiftFilters);

    updateOffersOverviewMetrics();
    applyPromoFilters();
    applyGiftFilters();
})();