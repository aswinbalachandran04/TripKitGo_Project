(function () {
    const form = document.getElementById("recordPaymentForm");
    if (!form) return;

    const ledgerBody = document.getElementById("paymentsLedgerBody");
    const duesBody = document.getElementById("pendingDuesBody");
    const suggestionsList = document.getElementById("booking-payment-suggestions");

    const totalCollectedEl = document.getElementById("totalCollectedAmount");
    const pendingBalanceEl = document.getElementById("pendingBalanceAmount");
    const advanceCountEl = document.getElementById("advancePaymentsCount");
    const refundsIssuedEl = document.getElementById("refundsIssuedAmount");

    const lookupEl = document.getElementById("payBookingLookup");
    const typeEl = document.getElementById("payType");
    const statusEl = document.getElementById("payStatus");
    const amountEl = document.getElementById("payAmount");
    const refEl = document.getElementById("payReference");
    const dateEl = document.getElementById("payDate");
    const notesEl = document.getElementById("payNotes");

    const searchInput = document.getElementById("paySearchInput");
    const modeFilter = document.getElementById("payModeFilter");
    const typeFilter = document.getElementById("payTypeFilter");
    const filterBtn = document.getElementById("payFilterBtn");

    const MODE_LABELS = {
        upi: "UPI / QR Transfer",
        bank: "Bank Transfer (NEFT/IMPS)",
        card: "Credit / Debit Card",
        cash: "Cash",
        gateway: "Online Payment Link"
    };

    const TYPE_LABELS = {
        advance: "Advance Deposit",
        balance: "Balance Installment",
        full: "Full Payment",
        addon: "Add-On / Upgrade Fee",
        refund: "Refund"
    };

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

    function parseBookingAndCustomer(rawLookup) {
        const clean = (rawLookup || "").trim();
        const idMatch = clean.match(/\b(BKG-\d+)\b/i);
        const bookingId = idMatch ? idMatch[1].toUpperCase() : "BKG-" + (1050 + (ledgerBody ? ledgerBody.querySelectorAll("tr[data-mode]").length : 0));

        let customerName = clean;
        if (clean.includes("—")) {
            customerName = clean.split("—")[1].split("(")[0].trim();
        } else if (idMatch) {
            customerName = clean.replace(idMatch[0], "").replace(/^[\s\-–—:]+/, "").split("(")[0].trim();
        }
        if (!customerName) customerName = "Walk-In Traveler";

        return { bookingId, customerName };
    }

    function updatePaymentMetrics() {
        let collected = 0;
        let advanceCount = 0;
        let refunds = 0;

        if (ledgerBody) {
            const rows = Array.from(ledgerBody.querySelectorAll("tr[data-mode]"));
            rows.forEach((row) => {
                const amt = Number(row.dataset.amount) || 0;
                const pType = (row.dataset.type || "").toLowerCase();
                const pStatus = (row.dataset.status || "").toLowerCase();

                if (pType === "refund" || pStatus === "refunded") {
                    refunds += Math.abs(amt);
                } else if (pStatus === "completed") {
                    collected += amt;
                }
                if (pType === "advance") {
                    advanceCount += 1;
                }
            });
        }

        let pendingBalance = 0;
        if (duesBody) {
            const dueRows = Array.from(duesBody.querySelectorAll("tr[data-booking-id]"));
            dueRows.forEach((row) => {
                pendingBalance += Number(row.dataset.balance) || 0;
            });
        }

        if (totalCollectedEl) totalCollectedEl.innerHTML = formatINR(collected);
        if (pendingBalanceEl) pendingBalanceEl.innerHTML = formatINR(pendingBalance);
        if (advanceCountEl) advanceCountEl.textContent = String(advanceCount);
        if (refundsIssuedEl) refundsIssuedEl.innerHTML = formatINR(refunds);
    }

    function applyPaymentFilters() {
        if (!ledgerBody) return;
        const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
        const modeVal = modeFilter ? modeFilter.value.trim().toLowerCase() : "";
        const typeVal = typeFilter ? typeFilter.value.trim().toLowerCase() : "";

        const rows = Array.from(ledgerBody.querySelectorAll("tr[data-mode]"));
        let visibleCount = 0;

        rows.forEach((row) => {
            const rowMode = (row.dataset.mode || "").toLowerCase();
            const rowType = (row.dataset.type || "").toLowerCase();
            const rowText = (row.textContent || "").toLowerCase();

            const matchesSearch = !q || rowText.includes(q);
            const matchesMode = !modeVal || rowMode === modeVal;
            const matchesType = !typeVal || rowType === typeVal;
            const isMatch = matchesSearch && matchesMode && matchesType;

            row.style.display = isMatch ? "" : "none";
            if (isMatch) visibleCount += 1;
        });

        let emptyRow = document.getElementById("payFilterEmptyRow");
        if (visibleCount === 0) {
            if (!emptyRow) {
                emptyRow = document.createElement("tr");
                emptyRow.id = "payFilterEmptyRow";
                emptyRow.innerHTML = `
          <td colspan="8" class="text-center py-4 text-muted">
            No matching transactions found. Try adjusting your search or filters.
          </td>
        `;
                ledgerBody.appendChild(emptyRow);
            }
            emptyRow.style.display = "";
        } else if (emptyRow) {
            emptyRow.style.display = "none";
        }
    }

    function validatePaymentForm() {
        let isValid = true;

        const lookupVal = lookupEl ? lookupEl.value.trim() : "";
        if (!lookupVal) {
            isValid = setFieldError(lookupEl, "Enter a Booking ID or customer name.") && isValid;
        } else if (lookupVal.length < 2) {
            isValid = setFieldError(lookupEl, "Enter at least 2 characters.") && isValid;
        } else {
            setFieldError(lookupEl, "");
        }

        if (typeEl && !typeEl.value) {
            isValid = setFieldError(typeEl, "Select a payment type.") && isValid;
        } else {
            setFieldError(typeEl, "");
        }

        const amtRaw = amountEl ? amountEl.value.trim() : "";
        const amtNum = Number(amtRaw);
        if (!amtRaw || Number.isNaN(amtNum) || amtNum <= 0) {
            isValid = setFieldError(amountEl, "Enter a valid amount greater than ₹0.") && isValid;
        } else {
            setFieldError(amountEl, "");
        }

        const refVal = refEl ? refEl.value.trim() : "";
        if (refVal && !/^[A-Za-z0-9_-]{4,30}$/.test(refVal)) {
            isValid = setFieldError(refEl, "Use 4–30 letters, numbers, hyphens, or underscores.") && isValid;
        } else {
            setFieldError(refEl, "");
        }

        const dateVal = dateEl ? dateEl.value : "";
        if (!dateVal) {
            isValid = setFieldError(dateEl, "Payment date is required.") && isValid;
        } else {
            setFieldError(dateEl, "");
        }

        return isValid;
    }

    [lookupEl, typeEl, amountEl, refEl, dateEl, notesEl].forEach((el) => {
        if (!el) return;
        const evt = el.tagName === "SELECT" || el.type === "date" ? "change" : "input";
        el.addEventListener(evt, () => setFieldError(el, ""));
    });

    form.addEventListener("reset", function () {
        [lookupEl, typeEl, amountEl, refEl, dateEl, notesEl].forEach((el) => setFieldError(el, ""));
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!validatePaymentForm()) {
            const firstInvalid = form.querySelector(".is-invalid");
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
                if (typeof firstInvalid.focus === "function") firstInvalid.focus();
            }
            return;
        }

        const { bookingId, customerName } = parseBookingAndCustomer(lookupEl.value);
        const paymentType = typeEl ? typeEl.value : "advance";
        const paymentTypeLabel = TYPE_LABELS[paymentType] || paymentType;
        const paymentStatus = statusEl ? statusEl.value : "completed";
        const checkedMode = form.querySelector('input[name="payment_mode"]:checked');
        const modeKey = checkedMode ? checkedMode.value : "upi";
        const modeLabel = MODE_LABELS[modeKey] || modeKey;
        const amount = Number(amountEl.value);
        const payDate = dateEl.value;
        const txnId = "TXN-" + (9001 + (ledgerBody ? ledgerBody.querySelectorAll("tr[data-mode]").length : 0));

        const statusBadge =
            paymentStatus === "completed"
                ? '<span class="badge bg-success-subtle text-success border border-success-subtle">Completed</span>'
                : '<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">Pending</span>';

        if (ledgerBody) {
            const row = document.createElement("tr");
            row.dataset.mode = modeKey;
            row.dataset.type = paymentType;
            row.dataset.status = paymentStatus;
            row.dataset.amount = String(amount);
            row.innerHTML = `
        <td class="fw-bold">${txnId}</td>
        <td>${bookingId}</td>
        <td class="fw-semibold">${customerName}</td>
        <td>${modeLabel}</td>
        <td>${paymentTypeLabel}</td>
        <td class="fw-semibold">${formatINR(amount)}</td>
        <td>${payDate}</td>
        <td>${statusBadge}</td>
      `;
            ledgerBody.prepend(row);
        }

        if (duesBody && paymentStatus === "completed") {
            const matchingDueRow = duesBody.querySelector(`tr[data-booking-id="${bookingId}"]`);
            if (matchingDueRow) {
                const currentPaid = Number(matchingDueRow.dataset.paid) || 0;
                const currentBalance = Number(matchingDueRow.dataset.balance) || 0;
                const updatedPaid = currentPaid + amount;
                const updatedBalance = Math.max(0, currentBalance - amount);

                matchingDueRow.dataset.paid = String(updatedPaid);
                matchingDueRow.dataset.balance = String(updatedBalance);

                const paidCell = matchingDueRow.querySelector(".dues-paid");
                const balCell = matchingDueRow.querySelector(".dues-balance");
                const stCell = matchingDueRow.querySelector(".dues-status");

                if (paidCell) paidCell.innerHTML = formatINR(updatedPaid);
                if (balCell) balCell.innerHTML = formatINR(updatedBalance);
                if (stCell) {
                    stCell.innerHTML =
                        updatedBalance === 0
                            ? '<span class="badge bg-success-subtle text-success border border-success-subtle">Settled</span>'
                            : '<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">Balance Due</span>';
                }
            }
        }

        if (suggestionsList) {
            const exists = Array.from(suggestionsList.options).some((o) =>
                o.value.toUpperCase().startsWith(bookingId)
            );
            if (!exists) {
                const opt = document.createElement("option");
                opt.value = `${bookingId} — ${customerName}`;
                suggestionsList.appendChild(opt);
            }
        }

        updatePaymentMetrics();
        applyPaymentFilters();
        form.reset();
        if (typeEl) typeEl.value = "advance";
        if (statusEl) statusEl.value = "completed";
    });

    if (searchInput) searchInput.addEventListener("input", applyPaymentFilters);
    if (modeFilter) modeFilter.addEventListener("change", applyPaymentFilters);
    if (typeFilter) typeFilter.addEventListener("change", applyPaymentFilters);
    if (filterBtn) filterBtn.addEventListener("click", applyPaymentFilters);

    updatePaymentMetrics();
    applyPaymentFilters();
})();