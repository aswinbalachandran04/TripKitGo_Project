(function () {
    const listBody = document.getElementById("policiesListBody");
    const suggestionsList = document.getElementById("policy-suggestions");

    const pubCountEl = document.getElementById("publishedPoliciesCount");
    const draftCountEl = document.getElementById("draftPoliciesCount");
    const lastUpdatedEl = document.getElementById("lastUpdatedDate");

    // Add Policy form elements
    const addForm = document.getElementById("addPolicyForm");
    const titleEl = document.getElementById("polTitle");
    const versionEl = document.getElementById("polVersion");
    const dateEl = document.getElementById("polEffectiveDate");
    const statusEl = document.getElementById("polStatus");
    const contentEl = document.getElementById("polContent");

    // Find & Edit Policy form elements
    const findForm = document.getElementById("findPolicyForm");
    const findQueryEl = document.getElementById("findPolicyQuery");
    const editForm = document.getElementById("editPolicyForm");
    const editIdEl = document.getElementById("editPolicyId");
    const editTitleEl = document.getElementById("editPolTitle");
    const editVersionEl = document.getElementById("editPolVersion");
    const editDateEl = document.getElementById("editPolEffectiveDate");
    const editCategoryEl = document.getElementById("editPolCategory");
    const editStatusEl = document.getElementById("editPolStatus");
    const editContentEl = document.getElementById("editPolContent");

    // Policy Document Modal elements
    const polModal = document.getElementById("policyDocumentModal");
    const closePolModalBtn = document.getElementById("closePolModalBtn");
    const cancelPolModalBtn = document.getElementById("cancelPolModalBtn");
    const editFromPolModalBtn = document.getElementById("editFromPolModalBtn");
    const deleteFromPolModalBtn = document.getElementById("deleteFromPolModalBtn");
    const modalIdEl = document.getElementById("polModalId");
    const modalStatusEl = document.getElementById("polModalStatus");
    const modalTitleEl = document.getElementById("polModalTitle");
    const modalCategoryEl = document.getElementById("polModalCategory");
    const modalVersionEl = document.getElementById("polModalVersion");
    const modalDateEl = document.getElementById("polModalDate");
    const modalContentEl = document.getElementById("polModalContent");

    let activeModalPolicyId = "";

    const CATEGORY_LABELS = {
        booking_terms: "Booking & Payments",
        cancellation: "Cancellation & Refunds",
        custom_trips: "Custom Packages",
        privacy: "Privacy & Liability"
    };

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
        const st = (status || "").toLowerCase();
        if (st === "published") {
            return '<span class="badge bg-success-subtle text-success border border-success-subtle">Published</span>';
        }
        if (st === "draft") {
            return '<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">Draft</span>';
        }
        return '<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">Archived</span>';
    }

    function policyRowHTML({ polId, title, catLabel, version, effDate, status }) {
        return `
      <td class="fw-bold">${polId}</td>
      <td class="fw-semibold">${title}</td>
      <td>${catLabel}</td>
      <td>${version}</td>
      <td>${effDate}</td>
      <td>${statusBadgeHTML(status)}</td>
      <td class="text-end">
        <div class="d-inline-flex gap-1">
          <button type="button" class="btn-brand-outline py-1 px-2 small js-view-policy"><i
              class="bi bi-eye me-1"></i> View</button>
          <button type="button" class="btn-brand-outline py-1 px-2 small text-danger border-danger-subtle js-delete-policy"
            title="Delete policy"><i class="bi bi-trash3"></i></button>
        </div>
      </td>
    `;
    }

    function syncPolicySuggestions() {
        if (!listBody || !suggestionsList) return;
        suggestionsList.innerHTML = "";
        const rows = Array.from(listBody.querySelectorAll("tr[data-policy-id]"));
        rows.forEach((row) => {
            const id = row.dataset.policyId || "";
            const cells = row.querySelectorAll("td");
            const title = cells[1] ? cells[1].textContent.trim() : "";
            const opt = document.createElement("option");
            opt.value = `${id} — ${title}`;
            suggestionsList.appendChild(opt);
        });
    }

    function updatePoliciesMetrics() {
        if (!listBody) return;
        const rows = Array.from(listBody.querySelectorAll("tr[data-policy-id]"));

        let published = 0;
        let drafts = 0;
        let latestDate = "";

        rows.forEach((row) => {
            const st = (row.dataset.status || "").toLowerCase();
            if (st === "published") published += 1;
            if (st === "draft") drafts += 1;

            const cells = row.querySelectorAll("td");
            const effDate = cells[4] ? cells[4].textContent.trim() : "";
            if (effDate && effDate !== "—" && effDate > latestDate) {
                latestDate = effDate;
            }
        });

        if (pubCountEl) pubCountEl.textContent = String(published);
        if (draftCountEl) draftCountEl.textContent = String(drafts);
        if (lastUpdatedEl) lastUpdatedEl.textContent = latestDate || "—";
    }

    function deletePolicyById(polId) {
        if (!listBody || !polId) return;
        const row = listBody.querySelector(`tr[data-policy-id="${polId}"]`);
        if (row) row.remove();

        if (editIdEl && editIdEl.value === polId) {
            editIdEl.value = "";
            if (editForm) editForm.reset();
        }

        updatePoliciesMetrics();
        syncPolicySuggestions();
    }

    function loadPolicyIntoEditForm(row) {
        if (!row) return;
        const cells = row.querySelectorAll("td");
        if (editIdEl) editIdEl.value = row.dataset.policyId || "";
        if (editTitleEl) editTitleEl.value = cells[1] ? cells[1].textContent.trim() : "";
        if (editVersionEl) editVersionEl.value = cells[3] ? cells[3].textContent.trim() : "";
        if (editDateEl) editDateEl.value = cells[4] ? cells[4].textContent.trim() : "";
        if (editCategoryEl) editCategoryEl.value = row.dataset.category || "booking_terms";
        if (editStatusEl) editStatusEl.value = row.dataset.status || "published";
        if (editContentEl) editContentEl.value = row.dataset.content || "";
    }

    function openPolicyModal(row) {
        if (!polModal || !row) return;
        const cells = row.querySelectorAll("td");
        const polId = row.dataset.policyId || "";
        const title = cells[1] ? cells[1].textContent.trim() : "—";
        const category = cells[2] ? cells[2].textContent.trim() : "—";
        const version = cells[3] ? cells[3].textContent.trim() : "v1.0";
        const effDate = cells[4] ? cells[4].textContent.trim() : "—";
        const status = row.dataset.status || "published";
        const content = row.dataset.content || "No clauses recorded.";

        activeModalPolicyId = polId;
        if (modalIdEl) modalIdEl.textContent = polId;
        if (modalStatusEl) modalStatusEl.innerHTML = statusBadgeHTML(status);
        if (modalTitleEl) modalTitleEl.textContent = title;
        if (modalCategoryEl) modalCategoryEl.textContent = category;
        if (modalVersionEl) modalVersionEl.textContent = version;
        if (modalDateEl) modalDateEl.textContent = effDate;
        if (modalContentEl) modalContentEl.textContent = content;

        polModal.classList.remove("d-none");
    }

    function closePolicyModal() {
        if (!polModal) return;
        polModal.classList.add("d-none");
    }

    if (listBody) {
        listBody.addEventListener("click", function (event) {
            const row = event.target.closest("tr[data-policy-id]");
            if (!row) return;

            if (event.target.closest(".js-delete-policy")) {
                deletePolicyById(row.dataset.policyId);
                return;
            }

            if (event.target.closest(".js-view-policy")) {
                openPolicyModal(row);
            }
        });
    }

    if (closePolModalBtn) closePolModalBtn.addEventListener("click", closePolicyModal);
    if (cancelPolModalBtn) cancelPolModalBtn.addEventListener("click", closePolicyModal);
    if (polModal) {
        polModal.addEventListener("click", function (event) {
            if (event.target === polModal) closePolicyModal();
        });
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && polModal && !polModal.classList.contains("d-none")) {
            closePolicyModal();
        }
    });

    if (editFromPolModalBtn) {
        editFromPolModalBtn.addEventListener("click", function () {
            if (!activeModalPolicyId || !listBody) return;
            const row = listBody.querySelector(`tr[data-policy-id="${activeModalPolicyId}"]`);
            closePolicyModal();
            const editTabRadio = document.getElementById("tab-4");
            if (editTabRadio) editTabRadio.checked = true;
            if (findQueryEl) findQueryEl.value = activeModalPolicyId;
            loadPolicyIntoEditForm(row);
        });
    }

    if (deleteFromPolModalBtn) {
        deleteFromPolModalBtn.addEventListener("click", function () {
            if (!activeModalPolicyId) return;
            const idToDelete = activeModalPolicyId;
            activeModalPolicyId = "";
            closePolicyModal();
            deletePolicyById(idToDelete);
        });
    }

    function validatePolicyFields(tInput, vInput, dInput, cInput) {
        let isValid = true;

        const titleVal = tInput ? tInput.value.trim() : "";
        if (!titleVal) {
            isValid = setFieldError(tInput, "Policy title is required.") && isValid;
        } else if (titleVal.length < 4) {
            isValid = setFieldError(tInput, "Enter at least 4 characters.") && isValid;
        } else {
            setFieldError(tInput, "");
        }

        const verVal = vInput ? vInput.value.trim() : "";
        if (!verVal) {
            isValid = setFieldError(vInput, "Version label is required (e.g., v1.0).") && isValid;
        } else if (!/^v?\d+(\.\d+){0,2}$/i.test(verVal)) {
            isValid = setFieldError(vInput, "Use a valid version format such as v1.0 or v1.2.") && isValid;
        } else {
            setFieldError(vInput, "");
        }

        const dateVal = dInput ? dInput.value : "";
        if (!dateVal) {
            isValid = setFieldError(dInput, "Effective date is required.") && isValid;
        } else {
            setFieldError(dInput, "");
        }

        const contentVal = cInput ? cInput.value.trim() : "";
        if (!contentVal) {
            isValid = setFieldError(cInput, "Policy clauses and content are required.") && isValid;
        } else if (contentVal.length < 20) {
            isValid = setFieldError(cInput, "Enter at least 20 characters for the policy clauses.") && isValid;
        } else {
            setFieldError(cInput, "");
        }

        return isValid;
    }

    [titleEl, versionEl, dateEl, contentEl].forEach((el) => {
        if (!el) return;
        const evt = el.type === "date" ? "change" : "input";
        el.addEventListener(evt, () => setFieldError(el, ""));
    });

    if (addForm) {
        addForm.addEventListener("reset", function () {
            [titleEl, versionEl, dateEl, contentEl].forEach((el) => setFieldError(el, ""));
        });

        addForm.addEventListener("submit", function (event) {
            event.preventDefault();
            if (!validatePolicyFields(titleEl, versionEl, dateEl, contentEl)) {
                const firstInvalid = addForm.querySelector(".is-invalid");
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            const title = titleEl.value.trim();
            const rawVersion = versionEl.value.trim();
            const version = rawVersion.toLowerCase().startsWith("v") ? rawVersion : `v${rawVersion}`;
            const effDate = dateEl.value;
            const status = statusEl ? statusEl.value : "published";
            const content = contentEl.value.trim();
            const checkedCat = addForm.querySelector('input[name="new_policy_category"]:checked');
            const catKey = checkedCat ? checkedCat.value : "booking_terms";
            const catLabel = CATEGORY_LABELS[catKey] || catKey;

            const existingCount = listBody ? listBody.querySelectorAll("tr[data-policy-id]").length : 0;
            const polId = "POL-" + (101 + existingCount);

            if (listBody) {
                const row = document.createElement("tr");
                row.dataset.policyId = polId;
                row.dataset.category = catKey;
                row.dataset.status = status;
                row.dataset.content = content;
                row.innerHTML = policyRowHTML({ polId, title, catLabel, version, effDate, status });
                listBody.prepend(row);
            }

            updatePoliciesMetrics();
            syncPolicySuggestions();
            addForm.reset();
            if (statusEl) statusEl.value = "published";
        });
    }

    // Find Policy handler (#panel-4)
    if (findForm) {
        findForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const q = findQueryEl ? findQueryEl.value.trim().toLowerCase() : "";
            if (!q) {
                setFieldError(findQueryEl, "Enter a policy ID, title, or category to search.");
                if (findQueryEl) findQueryEl.focus();
                return;
            }
            setFieldError(findQueryEl, "");

            const rows = listBody ? Array.from(listBody.querySelectorAll("tr[data-policy-id]")) : [];
            const match = rows.find((r) => {
                const id = (r.dataset.policyId || "").toLowerCase();
                const text = (r.textContent || "").toLowerCase();
                return id === q || text.includes(q);
            });

            if (!match) {
                setFieldError(findQueryEl, "No matching policy found.");
                return;
            }

            loadPolicyIntoEditForm(match);
        });
    }

    // Edit Policy handler (#panel-4)
    [editTitleEl, editVersionEl, editDateEl, editContentEl].forEach((el) => {
        if (!el) return;
        const evt = el.type === "date" ? "change" : "input";
        el.addEventListener(evt, () => setFieldError(el, ""));
    });

    if (editForm) {
        editForm.addEventListener("reset", function () {
            [editTitleEl, editVersionEl, editDateEl, editContentEl].forEach((el) => setFieldError(el, ""));
        });

        editForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const targetId = editIdEl ? editIdEl.value.trim() : "";
            if (!targetId) {
                setFieldError(findQueryEl, "Find and load a policy first before updating.");
                return;
            }

            if (!validatePolicyFields(editTitleEl, editVersionEl, editDateEl, editContentEl)) {
                const firstInvalid = editForm.querySelector(".is-invalid");
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            const row = listBody ? listBody.querySelector(`tr[data-policy-id="${targetId}"]`) : null;
            if (!row) return;

            const title = editTitleEl.value.trim();
            const rawVersion = editVersionEl.value.trim();
            const version = rawVersion.toLowerCase().startsWith("v") ? rawVersion : `v${rawVersion}`;
            const effDate = editDateEl.value;
            const catKey = editCategoryEl ? editCategoryEl.value : "booking_terms";
            const catLabel = CATEGORY_LABELS[catKey] || catKey;
            const status = editStatusEl ? editStatusEl.value : "published";
            const content = editContentEl.value.trim();

            row.dataset.category = catKey;
            row.dataset.status = status;
            row.dataset.content = content;
            row.innerHTML = policyRowHTML({
                polId: targetId,
                title,
                catLabel,
                version,
                effDate,
                status
            });

            updatePoliciesMetrics();
            syncPolicySuggestions();
        });
    }

    updatePoliciesMetrics();
    syncPolicySuggestions();
})();