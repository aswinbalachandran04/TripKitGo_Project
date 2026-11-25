(function () {
    const listBody = document.getElementById("notesListBody");
    const suggestionsList = document.getElementById("note-suggestions");

    const totalCountEl = document.getElementById("totalNotesCount");
    const highPrioCountEl = document.getElementById("highPriorityNotesCount");
    const remindersCountEl = document.getElementById("scheduledRemindersCount");

    const searchInput = document.getElementById("noteSearchInput");
    const categoryFilter = document.getElementById("noteCategoryFilter");
    const filterBtn = document.getElementById("noteFilterBtn");

    // Create Note form elements
    const createForm = document.getElementById("createNoteForm");
    const titleEl = document.getElementById("noteTitle");
    const priorityEl = document.getElementById("notePriority");
    const reminderEl = document.getElementById("noteReminderDate");
    const detailsEl = document.getElementById("noteDetails");

    // Find & Update Note form elements
    const findForm = document.getElementById("findNoteForm");
    const findQueryEl = document.getElementById("findNoteQuery");
    const updateForm = document.getElementById("updateNoteForm");
    const editIdEl = document.getElementById("editNoteId");
    const editTitleEl = document.getElementById("editNoteTitle");
    const editPriorityEl = document.getElementById("editNotePriority");
    const editReminderEl = document.getElementById("editNoteReminderDate");
    const editDetailsEl = document.getElementById("editNoteDetails");

    // Note Details Modal elements
    const noteModal = document.getElementById("noteDetailsModal");
    const closeNoteModalBtn = document.getElementById("closeNoteModalBtn");
    const cancelNoteModalBtn = document.getElementById("cancelNoteModalBtn");
    const editFromModalBtn = document.getElementById("editFromNoteModalBtn");
    const deleteFromModalBtn = document.getElementById("deleteFromNoteModalBtn");
    const modalIdEl = document.getElementById("noteModalId");
    const modalPriorityEl = document.getElementById("noteModalPriority");
    const modalTitleEl = document.getElementById("noteModalTitle");
    const modalCategoryEl = document.getElementById("noteModalCategory");
    const modalReminderEl = document.getElementById("noteModalReminder");
    const modalCreatedEl = document.getElementById("noteModalCreated");
    const modalDetailsEl = document.getElementById("noteModalDetails");

    let activeModalNoteId = "";

    const CATEGORY_LABELS = {
        operations: "Operations",
        vendors: "Hotels & Vendors",
        followup: "Client Follow-Up",
        general: "General"
    };

    function getTodayISO() {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, "0");
        const d = String(now.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
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

    function priorityBadgeHTML(priority) {
        const p = (priority || "").toLowerCase();
        if (p === "high") {
            return '<span class="badge bg-danger-subtle text-danger border border-danger-subtle">High Priority</span>';
        }
        if (p === "low") {
            return '<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">Low</span>';
        }
        return '<span class="badge bg-info-subtle text-info-emphasis border border-info-subtle">Normal</span>';
    }

    function noteRowHTML({ noteId, title, catLabel, priority, reminder, createdDate }) {
        return `
      <td class="fw-bold">${noteId}</td>
      <td class="fw-semibold">${title}</td>
      <td>${catLabel}</td>
      <td>${priorityBadgeHTML(priority)}</td>
      <td>${reminder || "&mdash;"}</td>
      <td>${createdDate}</td>
      <td class="text-end">
        <div class="d-inline-flex gap-1">
          <button type="button" class="btn-brand-outline py-1 px-2 small js-view-note"><i class="bi bi-eye me-1"></i> View</button>
          <button type="button" class="btn-brand-outline py-1 px-2 small text-danger border-danger-subtle js-delete-note"
            title="Delete note"><i class="bi bi-trash3"></i></button>
        </div>
      </td>
    `;
    }

    function syncNoteSuggestions() {
        if (!listBody || !suggestionsList) return;
        suggestionsList.innerHTML = "";
        const rows = Array.from(listBody.querySelectorAll("tr[data-note-id]"));
        rows.forEach((row) => {
            const id = row.dataset.noteId || "";
            const cells = row.querySelectorAll("td");
            const title = cells[1] ? cells[1].textContent.trim() : "";
            const opt = document.createElement("option");
            opt.value = `${id} — ${title}`;
            suggestionsList.appendChild(opt);
        });
    }

    function updateNotesMetrics() {
        if (!listBody) return;
        const rows = Array.from(listBody.querySelectorAll("tr[data-note-id]"));

        let total = rows.length;
        let highPrio = 0;
        let reminders = 0;

        rows.forEach((row) => {
            const prio = (row.dataset.priority || "").toLowerCase();
            const rem = (row.dataset.reminder || "").trim();
            if (prio === "high") highPrio += 1;
            if (rem !== "") reminders += 1;
        });

        if (totalCountEl) totalCountEl.textContent = String(total);
        if (highPrioCountEl) highPrioCountEl.textContent = String(highPrio);
        if (remindersCountEl) remindersCountEl.textContent = String(reminders);
    }

    function applyNotesFilters() {
        if (!listBody) return;
        const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
        const catVal = categoryFilter ? categoryFilter.value.trim().toLowerCase() : "";

        const rows = Array.from(listBody.querySelectorAll("tr[data-note-id]"));
        let visibleCount = 0;

        rows.forEach((row) => {
            const rowCat = (row.dataset.category || "").toLowerCase();
            const detailsText = (row.dataset.details || "").toLowerCase();
            const rowText = (row.textContent || "").toLowerCase() + " " + detailsText;

            const matchesSearch = !q || rowText.includes(q);
            const matchesCat = !catVal || rowCat === catVal;
            const isMatch = matchesSearch && matchesCat;

            row.style.display = isMatch ? "" : "none";
            if (isMatch) visibleCount += 1;
        });

        let emptyRow = document.getElementById("noteFilterEmptyRow");
        if (visibleCount === 0) {
            if (!emptyRow) {
                emptyRow = document.createElement("tr");
                emptyRow.id = "noteFilterEmptyRow";
                emptyRow.innerHTML = `<td colspan="7" class="text-center py-4 text-muted">No matching notes found.</td>`;
                listBody.appendChild(emptyRow);
            }
            emptyRow.style.display = "";
        } else if (emptyRow) {
            emptyRow.style.display = "none";
        }
    }

    function deleteNoteById(noteId) {
        if (!listBody || !noteId) return;
        const row = listBody.querySelector(`tr[data-note-id="${noteId}"]`);
        if (row) row.remove();

        if (editIdEl && editIdEl.value === noteId) {
            editIdEl.value = "";
            if (updateForm) updateForm.reset();
        }

        updateNotesMetrics();
        syncNoteSuggestions();
        applyNotesFilters();
    }

    function loadNoteIntoUpdateForm(row) {
        if (!row) return;
        const cells = row.querySelectorAll("td");
        if (editIdEl) editIdEl.value = row.dataset.noteId || "";
        if (editTitleEl) editTitleEl.value = cells[1] ? cells[1].textContent.trim() : "";
        if (editPriorityEl) editPriorityEl.value = row.dataset.priority || "normal";
        if (editReminderEl) editReminderEl.value = row.dataset.reminder || "";
        if (editDetailsEl) editDetailsEl.value = row.dataset.details || "";

        const catKey = row.dataset.category || "operations";
        if (updateForm) {
            const catRadio = updateForm.querySelector(`input[name="update_note_category"][value="${catKey}"]`);
            if (catRadio) catRadio.checked = true;
        }
    }

    function openNoteModal(row) {
        if (!noteModal || !row) return;
        const cells = row.querySelectorAll("td");
        const noteId = row.dataset.noteId || "";
        const title = cells[1] ? cells[1].textContent.trim() : "—";
        const category = cells[2] ? cells[2].textContent.trim() : "—";
        const reminder = row.dataset.reminder || "None";
        const created = cells[5] ? cells[5].textContent.trim() : "—";
        const priority = row.dataset.priority || "normal";
        const details = row.dataset.details || "No details recorded.";

        activeModalNoteId = noteId;
        if (modalIdEl) modalIdEl.textContent = noteId;
        if (modalPriorityEl) modalPriorityEl.innerHTML = priorityBadgeHTML(priority);
        if (modalTitleEl) modalTitleEl.textContent = title;
        if (modalCategoryEl) modalCategoryEl.textContent = category;
        if (modalReminderEl) modalReminderEl.textContent = reminder;
        if (modalCreatedEl) modalCreatedEl.textContent = created;
        if (modalDetailsEl) modalDetailsEl.textContent = details;

        noteModal.classList.remove("d-none");
    }

    function closeNoteModal() {
        if (!noteModal) return;
        noteModal.classList.add("d-none");
    }

    if (listBody) {
        listBody.addEventListener("click", function (event) {
            const row = event.target.closest("tr[data-note-id]");
            if (!row) return;

            if (event.target.closest(".js-delete-note")) {
                deleteNoteById(row.dataset.noteId);
                return;
            }

            if (event.target.closest(".js-view-note")) {
                openNoteModal(row);
            }
        });
    }

    if (closeNoteModalBtn) closeNoteModalBtn.addEventListener("click", closeNoteModal);
    if (cancelNoteModalBtn) cancelNoteModalBtn.addEventListener("click", closeNoteModal);
    if (noteModal) {
        noteModal.addEventListener("click", function (event) {
            if (event.target === noteModal) closeNoteModal();
        });
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && noteModal && !noteModal.classList.contains("d-none")) {
            closeNoteModal();
        }
    });

    if (editFromModalBtn) {
        editFromModalBtn.addEventListener("click", function () {
            if (!activeModalNoteId || !listBody) return;
            const row = listBody.querySelector(`tr[data-note-id="${activeModalNoteId}"]`);
            closeNoteModal();
            const updateTabRadio = document.getElementById("tab-4");
            if (updateTabRadio) updateTabRadio.checked = true;
            if (findQueryEl) findQueryEl.value = activeModalNoteId;
            loadNoteIntoUpdateForm(row);
        });
    }

    if (deleteFromModalBtn) {
        deleteFromModalBtn.addEventListener("click", function () {
            if (!activeModalNoteId) return;
            const idToDelete = activeModalNoteId;
            activeModalNoteId = "";
            closeNoteModal();
            deleteNoteById(idToDelete);
        });
    }

    function validateCreateNoteForm() {
        let isValid = true;

        const titleVal = titleEl ? titleEl.value.trim() : "";
        if (!titleVal) {
            isValid = setFieldError(titleEl, "Note title is required.") && isValid;
        } else if (titleVal.length < 3) {
            isValid = setFieldError(titleEl, "Enter at least 3 characters.") && isValid;
        } else {
            setFieldError(titleEl, "");
        }

        const detailsVal = detailsEl ? detailsEl.value.trim() : "";
        if (!detailsVal) {
            isValid = setFieldError(detailsEl, "Note details are required.") && isValid;
        } else if (detailsVal.length < 10) {
            isValid = setFieldError(detailsEl, "Enter at least 10 characters for the note details.") && isValid;
        } else {
            setFieldError(detailsEl, "");
        }

        return isValid;
    }

    [titleEl, reminderEl, detailsEl].forEach((el) => {
        if (!el) return;
        const evt = el.type === "date" ? "change" : "input";
        el.addEventListener(evt, () => setFieldError(el, ""));
    });

    if (createForm) {
        createForm.addEventListener("reset", function () {
            [titleEl, reminderEl, detailsEl].forEach((el) => setFieldError(el, ""));
        });

        createForm.addEventListener("submit", function (event) {
            event.preventDefault();
            if (!validateCreateNoteForm()) {
                const firstInvalid = createForm.querySelector(".is-invalid");
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            const title = titleEl.value.trim();
            const priority = priorityEl ? priorityEl.value : "normal";
            const reminder = reminderEl ? reminderEl.value : "";
            const details = detailsEl.value.trim();
            const checkedCat = createForm.querySelector('input[name="note_category"]:checked');
            const catKey = checkedCat ? checkedCat.value : "operations";
            const catLabel = CATEGORY_LABELS[catKey] || catKey;

            const existingCount = listBody ? listBody.querySelectorAll("tr[data-note-id]").length : 0;
            const noteId = "NOTE-" + (101 + existingCount);
            const createdDate = getTodayISO();

            if (listBody) {
                const row = document.createElement("tr");
                row.dataset.noteId = noteId;
                row.dataset.category = catKey;
                row.dataset.priority = priority;
                row.dataset.reminder = reminder;
                row.dataset.details = details;
                row.innerHTML = noteRowHTML({ noteId, title, catLabel, priority, reminder, createdDate });
                listBody.prepend(row);
            }

            updateNotesMetrics();
            syncNoteSuggestions();
            applyNotesFilters();
            createForm.reset();
            if (priorityEl) priorityEl.value = "normal";
        });
    }

    // Find Note handler (#panel-4)
    if (findForm) {
        findForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const q = findQueryEl ? findQueryEl.value.trim().toLowerCase() : "";
            if (!q) {
                setFieldError(findQueryEl, "Enter a note ID or title to search.");
                if (findQueryEl) findQueryEl.focus();
                return;
            }
            setFieldError(findQueryEl, "");

            const rows = listBody ? Array.from(listBody.querySelectorAll("tr[data-note-id]")) : [];
            const match = rows.find((r) => {
                const id = (r.dataset.noteId || "").toLowerCase();
                const text = (r.textContent || "").toLowerCase();
                return id === q || text.includes(q);
            });

            if (!match) {
                setFieldError(findQueryEl, "No matching note found.");
                return;
            }

            loadNoteIntoUpdateForm(match);
        });
    }

    // Update Note handler (#panel-4)
    [editTitleEl, editReminderEl, editDetailsEl].forEach((el) => {
        if (!el) return;
        const evt = el.type === "date" ? "change" : "input";
        el.addEventListener(evt, () => setFieldError(el, ""));
    });

    if (updateForm) {
        updateForm.addEventListener("reset", function () {
            [editTitleEl, editReminderEl, editDetailsEl].forEach((el) => setFieldError(el, ""));
        });

        updateForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const targetId = editIdEl ? editIdEl.value.trim() : "";
            if (!targetId) {
                setFieldError(findQueryEl, "Find and load a note first before updating.");
                return;
            }

            let isValid = true;
            const titleVal = editTitleEl ? editTitleEl.value.trim() : "";
            if (!titleVal || titleVal.length < 3) {
                isValid = setFieldError(editTitleEl, "Enter a valid note title (at least 3 characters).") && isValid;
            } else {
                setFieldError(editTitleEl, "");
            }

            const detailsVal = editDetailsEl ? editDetailsEl.value.trim() : "";
            if (!detailsVal || detailsVal.length < 10) {
                isValid = setFieldError(editDetailsEl, "Enter at least 10 characters for note details.") && isValid;
            } else {
                setFieldError(editDetailsEl, "");
            }

            if (!isValid) return;

            const row = listBody ? listBody.querySelector(`tr[data-note-id="${targetId}"]`) : null;
            if (!row) return;

            const cells = row.querySelectorAll("td");
            const createdDate = cells[5] ? cells[5].textContent.trim() : getTodayISO();
            const newPriority = editPriorityEl ? editPriorityEl.value : "normal";
            const newReminder = editReminderEl ? editReminderEl.value : "";
            const checkedCat = updateForm.querySelector('input[name="update_note_category"]:checked');
            const newCatKey = checkedCat ? checkedCat.value : "operations";
            const newCatLabel = CATEGORY_LABELS[newCatKey] || newCatKey;

            row.dataset.category = newCatKey;
            row.dataset.priority = newPriority;
            row.dataset.reminder = newReminder;
            row.dataset.details = detailsVal;
            row.innerHTML = noteRowHTML({
                noteId: targetId,
                title: titleVal,
                catLabel: newCatLabel,
                priority: newPriority,
                reminder: newReminder,
                createdDate
            });

            updateNotesMetrics();
            syncNoteSuggestions();
            applyNotesFilters();
        });
    }

    if (searchInput) searchInput.addEventListener("input", applyNotesFilters);
    if (categoryFilter) categoryFilter.addEventListener("change", applyNotesFilters);
    if (filterBtn) filterBtn.addEventListener("click", applyNotesFilters);

    updateNotesMetrics();
    syncNoteSuggestions();
    applyNotesFilters();
})();