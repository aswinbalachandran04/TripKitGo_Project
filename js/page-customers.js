(function () {
    const listBody = document.getElementById("customersListBody");
    const suggestionsList = document.getElementById("customer-suggestions");

    const totalCountEl = document.getElementById("totalCustomersCount");
    const repeatCountEl = document.getElementById("repeatCustomersCount");
    const activeCountEl = document.getElementById("activeCustomersCount");

    const searchInput = document.getElementById("custSearchInput");
    const statusFilter = document.getElementById("custStatusFilter");
    const filterBtn = document.getElementById("custFilterBtn");

    // Add Customer form elements
    const addForm = document.getElementById("addCustomerForm");
    const nameEl = document.getElementById("custFullName");
    const emailEl = document.getElementById("custEmail");
    const phoneEl = document.getElementById("custPhone");
    const cityEl = document.getElementById("custCity");
    const notesEl = document.getElementById("custNotes");

    // Find & Update Customer form elements
    const findForm = document.getElementById("findCustomerForm");
    const findQueryEl = document.getElementById("findCustomerQuery");
    const updateForm = document.getElementById("updateCustomerForm");
    const editIdEl = document.getElementById("editCustomerId");
    const editNameEl = document.getElementById("editCustName");
    const editStatusEl = document.getElementById("editCustStatus");
    const editEmailEl = document.getElementById("editCustEmail");
    const editPhoneEl = document.getElementById("editCustPhone");
    const editCityEl = document.getElementById("editCustCity");
    const editNotesEl = document.getElementById("editCustNotes");

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

    function statusBadgeHTML(status) {
        const val = (status || "").toLowerCase();
        if (val === "inactive") {
            return '<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">Inactive</span>';
        }
        return '<span class="badge bg-success-subtle text-success border border-success-subtle">Active</span>';
    }

    function validatePhoneValue(rawPhone, targetInput) {
        const trimmed = (rawPhone || "").trim();
        const compact = trimmed.replace(/[\s\-()]/g, "");
        if (!trimmed) {
            return setFieldError(targetInput, "Phone number is required.");
        }
        if (!/^(?:\+?\d{1,3})?\d{10}$/.test(compact)) {
            return setFieldError(targetInput, "Enter a 10-digit number or country code + 10 digits (e.g., +91 9847011204).");
        }
        return setFieldError(targetInput, "");
    }

    function syncSuggestions() {
        if (!listBody || !suggestionsList) return;
        suggestionsList.innerHTML = "";
        const rows = Array.from(listBody.querySelectorAll("tr[data-customer-id]"));
        rows.forEach((row) => {
            const id = row.dataset.customerId || "";
            const cells = row.querySelectorAll("td");
            const name = cells[1] ? cells[1].textContent.trim() : "";
            const email = cells[2] ? cells[2].textContent.trim() : "";
            const opt = document.createElement("option");
            opt.value = `${id} — ${name} (${email})`;
            suggestionsList.appendChild(opt);
        });
    }

    function updateCustomerCounts() {
        if (!listBody) return;
        const rows = Array.from(listBody.querySelectorAll("tr[data-customer-id]"));

        let total = rows.length;
        let repeat = 0;
        let active = 0;

        rows.forEach((row) => {
            const bookings = Number(row.dataset.bookings) || 0;
            const status = (row.dataset.status || "").toLowerCase();
            if (bookings > 1) repeat += 1;
            if (status === "active") active += 1;
        });

        if (totalCountEl) totalCountEl.textContent = total;
        if (repeatCountEl) repeatCountEl.textContent = repeat;
        if (activeCountEl) activeCountEl.textContent = active;
    }

    function applyCustomerFilters() {
        if (!listBody) return;
        const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        const selectedStatus = statusFilter ? statusFilter.value.trim().toLowerCase() : "";

        const rows = Array.from(listBody.querySelectorAll("tr[data-customer-id]"));
        let visibleCount = 0;

        rows.forEach((row) => {
            const rowStatus = (row.dataset.status || "").toLowerCase();
            const rowText = (row.textContent || "").toLowerCase();

            const matchesSearch = !query || rowText.includes(query);
            const matchesStatus = !selectedStatus || rowStatus === selectedStatus;
            const isMatch = matchesSearch && matchesStatus;

            row.style.display = isMatch ? "" : "none";
            if (isMatch) visibleCount += 1;
        });

        let emptyRow = document.getElementById("custFilterEmptyRow");
        if (visibleCount === 0) {
            if (!emptyRow) {
                emptyRow = document.createElement("tr");
                emptyRow.id = "custFilterEmptyRow";
                emptyRow.innerHTML = `
          <td colspan="7" class="text-center py-4 text-muted">
            No matching customers found. Try adjusting your search or status filter.
          </td>
        `;
                listBody.appendChild(emptyRow);
            }
            emptyRow.style.display = "";
        } else if (emptyRow) {
            emptyRow.style.display = "none";
        }
    }

    function validateAddCustomerForm() {
        let isValid = true;

        const nameVal = nameEl ? nameEl.value.trim() : "";
        if (!nameVal) {
            isValid = setFieldError(nameEl, "Full name is required.") && isValid;
        } else if (nameVal.length < 2) {
            isValid = setFieldError(nameEl, "Enter at least 2 characters.") && isValid;
        } else {
            setFieldError(nameEl, "");
        }

        const emailVal = emailEl ? emailEl.value.trim() : "";
        if (!emailVal) {
            isValid = setFieldError(emailEl, "Email address is required.") && isValid;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
            isValid = setFieldError(emailEl, "Enter a valid email address.") && isValid;
        } else {
            setFieldError(emailEl, "");
        }

        isValid = validatePhoneValue(phoneEl ? phoneEl.value : "", phoneEl) && isValid;

        const cityVal = cityEl ? cityEl.value.trim() : "";
        if (!cityVal) {
            isValid = setFieldError(cityEl, "City is required.") && isValid;
        } else if (cityVal.length < 2) {
            isValid = setFieldError(cityEl, "Enter a valid city name.") && isValid;
        } else {
            setFieldError(cityEl, "");
        }

        return isValid;
    }

    const addTrackedFields = [nameEl, emailEl, phoneEl, cityEl, notesEl];
    addTrackedFields.forEach((el) => {
        if (!el) return;
        el.addEventListener("input", () => setFieldError(el, ""));
    });

    if (addForm) {
        addForm.addEventListener("reset", function () {
            addTrackedFields.forEach((el) => setFieldError(el, ""));
        });

        addForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!validateAddCustomerForm()) {
                const firstInvalid = addForm.querySelector(".is-invalid");
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            const existingCount = listBody ? listBody.querySelectorAll("tr[data-customer-id]").length : 0;
            const customerId = "CUST-" + (201 + existingCount);

            const fullName = nameEl.value.trim();
            const email = emailEl.value.trim();
            const phone = phoneEl.value.trim();
            const city = cityEl.value.trim();
            const notes = notesEl ? notesEl.value.trim() : "";

            if (listBody) {
                const row = document.createElement("tr");
                row.dataset.customerId = customerId;
                row.dataset.status = "active";
                row.dataset.bookings = "0";
                row.dataset.notes = notes;
                row.innerHTML = `
          <td class="fw-bold">${customerId}</td>
          <td class="fw-semibold">${fullName}</td>
          <td>${email}</td>
          <td>${phone}</td>
          <td>${city}</td>
          <td>0</td>
          <td>${statusBadgeHTML("active")}</td>
        `;
                listBody.prepend(row);
            }

            updateCustomerCounts();
            syncSuggestions();
            applyCustomerFilters();
            addForm.reset();
        });
    }

    // Find Customer handler (#panel-4)
    if (findForm) {
        findForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const q = findQueryEl ? findQueryEl.value.trim().toLowerCase() : "";
            if (!q) {
                setFieldError(findQueryEl, "Enter a customer ID, name, email, or phone number.");
                if (findQueryEl) findQueryEl.focus();
                return;
            }
            setFieldError(findQueryEl, "");

            const rows = listBody ? Array.from(listBody.querySelectorAll("tr[data-customer-id]")) : [];
            const match = rows.find((r) => {
                const id = (r.dataset.customerId || "").toLowerCase();
                const text = (r.textContent || "").toLowerCase();
                return id === q || text.includes(q);
            });

            if (!match) {
                setFieldError(findQueryEl, "No matching customer found in the directory.");
                return;
            }

            const cells = match.querySelectorAll("td");
            if (editIdEl) editIdEl.value = match.dataset.customerId || "";
            if (editNameEl) editNameEl.value = cells[1] ? cells[1].textContent.trim() : "";
            if (editEmailEl) editEmailEl.value = cells[2] ? cells[2].textContent.trim() : "";
            if (editPhoneEl) editPhoneEl.value = cells[3] ? cells[3].textContent.trim() : "";
            if (editCityEl) editCityEl.value = cells[4] ? cells[4].textContent.trim() : "";
            if (editStatusEl) editStatusEl.value = match.dataset.status || "active";
            if (editNotesEl) editNotesEl.value = match.dataset.notes || "";
        });
    }

    // Update Customer handler (#panel-4)
    const updateTrackedFields = [editNameEl, editEmailEl, editPhoneEl, editCityEl];
    updateTrackedFields.forEach((el) => {
        if (!el) return;
        el.addEventListener("input", () => setFieldError(el, ""));
    });

    if (updateForm) {
        updateForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const targetId = editIdEl ? editIdEl.value.trim() : "";
            if (!targetId) {
                setFieldError(findQueryEl, "Find and select a customer first before updating.");
                return;
            }

            let isValid = true;
            const nameVal = editNameEl ? editNameEl.value.trim() : "";
            if (!nameVal || nameVal.length < 2) {
                isValid = setFieldError(editNameEl, "Enter a valid full name (at least 2 characters).") && isValid;
            } else {
                setFieldError(editNameEl, "");
            }

            const emailVal = editEmailEl ? editEmailEl.value.trim() : "";
            if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
                isValid = setFieldError(editEmailEl, "Enter a valid email address.") && isValid;
            } else {
                setFieldError(editEmailEl, "");
            }

            isValid = validatePhoneValue(editPhoneEl ? editPhoneEl.value : "", editPhoneEl) && isValid;

            const cityVal = editCityEl ? editCityEl.value.trim() : "";
            if (!cityVal || cityVal.length < 2) {
                isValid = setFieldError(editCityEl, "Enter a valid city name.") && isValid;
            } else {
                setFieldError(editCityEl, "");
            }

            if (!isValid) return;

            const row = listBody ? listBody.querySelector(`tr[data-customer-id="${targetId}"]`) : null;
            if (!row) return;

            const newStatus = editStatusEl ? editStatusEl.value : "active";
            const bookingsCount = row.dataset.bookings || "0";
            const notesVal = editNotesEl ? editNotesEl.value.trim() : "";

            row.dataset.status = newStatus;
            row.dataset.notes = notesVal;
            row.innerHTML = `
        <td class="fw-bold">${targetId}</td>
        <td class="fw-semibold">${nameVal}</td>
        <td>${emailVal}</td>
        <td>${editPhoneEl.value.trim()}</td>
        <td>${cityVal}</td>
        <td>${bookingsCount}</td>
        <td>${statusBadgeHTML(newStatus)}</td>
      `;

            updateCustomerCounts();
            syncSuggestions();
            applyCustomerFilters();
        });
    }

    if (searchInput) searchInput.addEventListener("input", applyCustomerFilters);
    if (statusFilter) statusFilter.addEventListener("change", applyCustomerFilters);
    if (filterBtn) filterBtn.addEventListener("click", applyCustomerFilters);

    updateCustomerCounts();
    syncSuggestions();
    applyCustomerFilters();
})();