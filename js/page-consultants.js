(function () {
    const listBody = document.getElementById("consultantsListBody");
    const suggestionsList = document.getElementById("consultant-suggestions");

    const totalCountEl = document.getElementById("totalConsultantsCount");
    const activeCountEl = document.getElementById("activeConsultantsCount");
    const assignedCountEl = document.getElementById("assignedBookingsCount");

    const searchInput = document.getElementById("conSearchInput");
    const statusFilter = document.getElementById("conStatusFilter");
    const filterBtn = document.getElementById("conFilterBtn");

    const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB

    // Add Consultant form elements
    const addForm = document.getElementById("addConsultantForm");
    const photoEl = document.getElementById("conPhotoInput");
    const photoDropzone = document.getElementById("conPhotoDropzone");
    const photoLabel = document.getElementById("conPhotoLabel");
    const nameEl = document.getElementById("conFullName");
    const codeEl = document.getElementById("conCode");
    const roleEl = document.getElementById("conRole");
    const emailEl = document.getElementById("conEmail");
    const phoneEl = document.getElementById("conPhone");
    const cityEl = document.getElementById("conCity");
    const expEl = document.getElementById("conExperience");
    const joinDateEl = document.getElementById("conJoiningDate");
    const statusEl = document.getElementById("conStatus");
    const altPhoneEl = document.getElementById("conAltPhone");
    const bioEl = document.getElementById("conBio");
    const notesEl = document.getElementById("conNotes");

    // Find & Update Consultant form elements
    const findForm = document.getElementById("findConsultantForm");
    const findQueryEl = document.getElementById("findConsultantQuery");
    const updateForm = document.getElementById("updateConsultantForm");
    const editPhotoEl = document.getElementById("editConPhotoInput");
    const editPhotoDropzone = document.getElementById("editConPhotoDropzone");
    const editPhotoLabel = document.getElementById("editConPhotoLabel");
    const editNameEl = document.getElementById("editConName");
    const editCodeEl = document.getElementById("editConCode");
    const editRoleEl = document.getElementById("editConRole");
    const editEmailEl = document.getElementById("editConEmail");
    const editPhoneEl = document.getElementById("editConPhone");
    const editCityEl = document.getElementById("editConCity");
    const editExpEl = document.getElementById("editConExperience");
    const editJoinDateEl = document.getElementById("editConJoiningDate");
    const editStatusEl = document.getElementById("editConStatus");
    const editAltPhoneEl = document.getElementById("editConAltPhone");
    const editBioEl = document.getElementById("editConBio");
    const editNotesEl = document.getElementById("editConNotes");

    // Complete Profile Modal elements
    const profileModal = document.getElementById("consultantProfileModal");
    const closeProfileBtn = document.getElementById("closeProfileModalBtn");
    const cancelProfileBtn = document.getElementById("cancelProfileModalBtn");
    const editFromModalBtn = document.getElementById("editFromProfileModalBtn");
    const modalPhotoEl = document.getElementById("profileModalPhoto");
    const modalInitialsEl = document.getElementById("profileModalInitials");
    const modalCodeEl = document.getElementById("profileModalCode");
    const modalStatusEl = document.getElementById("profileModalStatus");
    const modalNameEl = document.getElementById("profileModalName");
    const modalRoleEl = document.getElementById("profileModalRole");
    const modalEmailEl = document.getElementById("profileModalEmail");
    const modalPhoneEl = document.getElementById("profileModalPhone");
    const modalCityEl = document.getElementById("profileModalCity");
    const modalAltPhoneEl = document.getElementById("profileModalAltPhone");
    const modalExpEl = document.getElementById("profileModalExperience");
    const modalJoinDateEl = document.getElementById("profileModalJoiningDate");
    const modalTripsEl = document.getElementById("profileModalTrips");
    const modalBioEl = document.getElementById("profileModalBio");
    const modalNotesEl = document.getElementById("profileModalNotes");

    let activeModalConsultantCode = "";

    const ROLE_LABELS = {
        trip_planner: "Senior Trip Planner",
        destination_specialist: "Destination Specialist",
        custom_architect: "Custom Itinerary Architect",
        coordinator: "On-Ground Coordinator"
    };

    function getTodayISO() {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, "0");
        const d = String(now.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }

    function getInitials(fullName) {
        const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
        if (!parts.length) return "CN";
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
        const val = (status || "").toLowerCase();
        if (val === "on_leave") {
            return '<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">On Leave</span>';
        }
        if (val === "inactive") {
            return '<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">Inactive</span>';
        }
        return '<span class="badge bg-success-subtle text-success border border-success-subtle">Active</span>';
    }

    function viewButtonHTML() {
        return '<button type="button" class="btn-brand-outline py-1 px-2 small js-view-consultant"><i class="bi bi-person-vcard me-1"></i> View</button>';
    }

    function validatePhoneValue(rawPhone, targetInput, required) {
        const trimmed = (rawPhone || "").trim();
        if (!trimmed) {
            if (!required) return setFieldError(targetInput, "");
            return setFieldError(targetInput, "Phone number is required.");
        }
        const compact = trimmed.replace(/[\s\-()]/g, "");
        if (!/^(?:\+?\d{1,3})?\d{10}$/.test(compact)) {
            return setFieldError(targetInput, "Enter a 10-digit number or country code + 10 digits (e.g., +91 9847011204).");
        }
        return setFieldError(targetInput, "");
    }

    function validatePhotoFile(fileInput, dropzoneEl) {
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            return setFieldError(fileInput, "", dropzoneEl);
        }
        const file = fileInput.files[0];
        if (!file.type || !file.type.startsWith("image/")) {
            return setFieldError(fileInput, `"${file.name}" must be an image file.`, dropzoneEl);
        }
        if (file.size > MAX_PHOTO_BYTES) {
            return setFieldError(fileInput, `"${file.name}" exceeds the 5 MB limit.`, dropzoneEl);
        }
        return setFieldError(fileInput, "", dropzoneEl);
    }

    function syncSuggestions() {
        if (!listBody || !suggestionsList) return;
        suggestionsList.innerHTML = "";
        const rows = Array.from(listBody.querySelectorAll("tr[data-consultant-code]"));
        rows.forEach((row) => {
            const code = row.dataset.consultantCode || "";
            const cells = row.querySelectorAll("td");
            const name = cells[1] ? cells[1].textContent.trim() : "";
            const email = row.dataset.email || "";
            const opt = document.createElement("option");
            opt.value = `${code} — ${name}${email ? ` (${email})` : ""}`;
            suggestionsList.appendChild(opt);
        });
    }

    function updateConsultantCounts() {
        if (!listBody) return;
        const rows = Array.from(listBody.querySelectorAll("tr[data-consultant-code]"));

        let total = rows.length;
        let active = 0;
        let assignedTrips = 0;

        rows.forEach((row) => {
            const st = (row.dataset.status || "").toLowerCase();
            if (st === "active") active += 1;
            assignedTrips += Number(row.dataset.trips) || 0;
        });

        if (totalCountEl) totalCountEl.textContent = total;
        if (activeCountEl) activeCountEl.textContent = active;
        if (assignedCountEl) assignedCountEl.textContent = assignedTrips;
    }

    function applyConsultantFilters() {
        if (!listBody) return;
        const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        const selectedStatus = statusFilter ? statusFilter.value.trim().toLowerCase() : "";

        const rows = Array.from(listBody.querySelectorAll("tr[data-consultant-code]"));
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

        let emptyRow = document.getElementById("conFilterEmptyRow");
        if (visibleCount === 0) {
            if (!emptyRow) {
                emptyRow = document.createElement("tr");
                emptyRow.id = "conFilterEmptyRow";
                emptyRow.innerHTML = `
          <td colspan="8" class="text-center py-4 text-muted">
            No matching consultants found. Adjust your search or status filter.
          </td>
        `;
                listBody.appendChild(emptyRow);
            }
            emptyRow.style.display = "";
        } else if (emptyRow) {
            emptyRow.style.display = "none";
        }
    }

    function loadConsultantIntoUpdateForm(row) {
        if (!row) return;
        const cells = row.querySelectorAll("td");
        if (editCodeEl) editCodeEl.value = row.dataset.consultantCode || "";
        if (editNameEl) editNameEl.value = cells[1] ? cells[1].textContent.trim() : "";
        if (editPhoneEl) editPhoneEl.value = cells[3] ? cells[3].textContent.trim() : "";
        if (editCityEl) editCityEl.value = cells[4] ? cells[4].textContent.trim() : "";
        if (editEmailEl) editEmailEl.value = row.dataset.email || "";
        if (editStatusEl) editStatusEl.value = row.dataset.status || "active";
        if (editExpEl) editExpEl.value = row.dataset.experience || "";
        if (editJoinDateEl) editJoinDateEl.value = row.dataset.joiningDate || "";
        if (editAltPhoneEl) editAltPhoneEl.value = row.dataset.altPhone || "";
        if (editBioEl) editBioEl.value = row.dataset.bio || "";
        if (editNotesEl) editNotesEl.value = row.dataset.notes || "";
        if (editPhotoLabel) {
            editPhotoLabel.textContent = row.dataset.photoName || "Update Portrait";
        }

        if (editRoleEl) {
            if (row.dataset.role) {
                editRoleEl.value = row.dataset.role;
            } else {
                const roleText = cells[2] ? cells[2].textContent.trim() : "";
                const foundEntry = Object.entries(ROLE_LABELS).find(([, label]) => label === roleText);
                if (foundEntry) editRoleEl.value = foundEntry[0];
            }
        }
    }

    function openConsultantProfileModal(row) {
        if (!profileModal || !row) return;
        const cells = row.querySelectorAll("td");
        const code = row.dataset.consultantCode || "";
        const name = cells[1] ? cells[1].textContent.trim() : "—";
        const role = cells[2] ? cells[2].textContent.trim() : "—";
        const phone = cells[3] ? cells[3].textContent.trim() : "—";
        const city = cells[4] ? cells[4].textContent.trim() : "—";
        const trips = row.dataset.trips || "0";
        const status = row.dataset.status || "active";
        const email = row.dataset.email || "—";
        const altPhone = row.dataset.altPhone || "Not provided";
        const exp = row.dataset.experience ? `${row.dataset.experience} Years` : "Not specified";
        const joiningDate = row.dataset.joiningDate || "Not specified";
        const bio = row.dataset.bio || "No short bio added yet.";
        const notes = row.dataset.notes || "No internal notes recorded.";
        const photoUrl = row.dataset.photoUrl || "";

        activeModalConsultantCode = code;

        if (modalPhotoEl && modalInitialsEl) {
            if (photoUrl) {
                modalPhotoEl.src = photoUrl;
                modalPhotoEl.classList.remove("d-none");
                modalInitialsEl.classList.add("d-none");
            } else {
                modalPhotoEl.src = "";
                modalPhotoEl.classList.add("d-none");
                modalInitialsEl.textContent = getInitials(name);
                modalInitialsEl.classList.remove("d-none");
            }
        }

        if (modalCodeEl) modalCodeEl.textContent = code;
        if (modalStatusEl) modalStatusEl.innerHTML = statusBadgeHTML(status);
        if (modalNameEl) modalNameEl.textContent = name;
        if (modalRoleEl) modalRoleEl.textContent = role;
        if (modalEmailEl) modalEmailEl.textContent = email;
        if (modalPhoneEl) modalPhoneEl.textContent = phone;
        if (modalCityEl) modalCityEl.textContent = city;
        if (modalAltPhoneEl) modalAltPhoneEl.textContent = altPhone;
        if (modalExpEl) modalExpEl.textContent = exp;
        if (modalJoinDateEl) modalJoinDateEl.textContent = joiningDate;
        if (modalTripsEl) modalTripsEl.textContent = `${trips} Assigned Trips`;
        if (modalBioEl) modalBioEl.textContent = bio;
        if (modalNotesEl) modalNotesEl.textContent = notes;

        profileModal.classList.remove("d-none");
    }

    function closeConsultantProfileModal() {
        if (!profileModal) return;
        profileModal.classList.add("d-none");
    }

    if (listBody) {
        listBody.addEventListener("click", function (event) {
            const viewBtn = event.target.closest(".js-view-consultant");
            if (!viewBtn) return;
            const row = viewBtn.closest("tr[data-consultant-code]");
            openConsultantProfileModal(row);
        });
    }

    if (closeProfileBtn) closeProfileBtn.addEventListener("click", closeConsultantProfileModal);
    if (cancelProfileBtn) cancelProfileBtn.addEventListener("click", closeConsultantProfileModal);
    if (profileModal) {
        profileModal.addEventListener("click", function (event) {
            if (event.target === profileModal) closeConsultantProfileModal();
        });
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && profileModal && !profileModal.classList.contains("d-none")) {
            closeConsultantProfileModal();
        }
    });

    if (editFromModalBtn) {
        editFromModalBtn.addEventListener("click", function () {
            if (!activeModalConsultantCode || !listBody) return;
            const row = listBody.querySelector(`tr[data-consultant-code="${activeModalConsultantCode}"]`);
            closeConsultantProfileModal();
            const updateTabRadio = document.getElementById("tab-4");
            if (updateTabRadio) updateTabRadio.checked = true;
            if (findQueryEl) findQueryEl.value = activeModalConsultantCode;
            loadConsultantIntoUpdateForm(row);
        });
    }

    function validateAddConsultantForm() {
        let isValid = true;
        const today = getTodayISO();

        isValid = validatePhotoFile(photoEl, photoDropzone) && isValid;

        const nameVal = nameEl ? nameEl.value.trim() : "";
        if (!nameVal) {
            isValid = setFieldError(nameEl, "Full name is required.") && isValid;
        } else if (nameVal.length < 2) {
            isValid = setFieldError(nameEl, "Enter at least 2 characters.") && isValid;
        } else {
            setFieldError(nameEl, "");
        }

        const codeVal = codeEl ? codeEl.value.trim().toUpperCase() : "";
        if (!codeVal) {
            isValid = setFieldError(codeEl, "Advisor code is required.") && isValid;
        } else if (!/^[A-Z0-9_-]{2,15}$/.test(codeVal)) {
            isValid = setFieldError(codeEl, "Use 2–15 uppercase letters, numbers, or hyphens (e.g., CON-01).") && isValid;
        } else {
            if (codeEl) codeEl.value = codeVal;
            setFieldError(codeEl, "");
        }

        const emailVal = emailEl ? emailEl.value.trim() : "";
        if (!emailVal) {
            isValid = setFieldError(emailEl, "Official email is required.") && isValid;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
            isValid = setFieldError(emailEl, "Enter a valid email address.") && isValid;
        } else {
            setFieldError(emailEl, "");
        }

        isValid = validatePhoneValue(phoneEl ? phoneEl.value : "", phoneEl, true) && isValid;

        const cityVal = cityEl ? cityEl.value.trim() : "";
        if (!cityVal) {
            isValid = setFieldError(cityEl, "Base city is required.") && isValid;
        } else if (cityVal.length < 2) {
            isValid = setFieldError(cityEl, "Enter a valid city name.") && isValid;
        } else {
            setFieldError(cityEl, "");
        }

        const expRaw = expEl ? expEl.value.trim() : "";
        if (expRaw !== "") {
            const expNum = Number(expRaw);
            if (!Number.isInteger(expNum) || expNum < 0 || expNum > 60) {
                isValid = setFieldError(expEl, "Enter a valid experience between 0 and 60 years.") && isValid;
            } else {
                setFieldError(expEl, "");
            }
        } else {
            setFieldError(expEl, "");
        }

        const joinVal = joinDateEl ? joinDateEl.value : "";
        if (joinVal && joinVal > today) {
            isValid = setFieldError(joinDateEl, "Joining date cannot be in the future.") && isValid;
        } else {
            setFieldError(joinDateEl, "");
        }

        isValid = validatePhoneValue(altPhoneEl ? altPhoneEl.value : "", altPhoneEl, false) && isValid;

        return isValid;
    }

    const addTrackedFields = [nameEl, codeEl, emailEl, phoneEl, cityEl, expEl, joinDateEl, altPhoneEl, bioEl, notesEl];
    addTrackedFields.forEach((el) => {
        if (!el) return;
        const evt = el.type === "date" ? "change" : "input";
        el.addEventListener(evt, () => setFieldError(el, ""));
    });

    if (photoEl) {
        photoEl.addEventListener("change", () => {
            setFieldError(photoEl, "", photoDropzone);
            if (photoLabel && photoEl.files && photoEl.files[0]) {
                photoLabel.textContent = photoEl.files[0].name;
            }
        });
    }

    if (addForm) {
        addForm.addEventListener("reset", function () {
            addTrackedFields.forEach((el) => setFieldError(el, ""));
            setFieldError(photoEl, "", photoDropzone);
            if (photoLabel) photoLabel.textContent = "Upload Portrait";
        });

        addForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!validateAddConsultantForm()) {
                const firstInvalid = addForm.querySelector(".is-invalid");
                if (firstInvalid) {
                    firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
                    if (typeof firstInvalid.focus === "function") firstInvalid.focus();
                }
                return;
            }

            const fullName = nameEl.value.trim();
            const code = codeEl.value.trim().toUpperCase();
            const roleKey = roleEl ? roleEl.value : "trip_planner";
            const roleLabel = ROLE_LABELS[roleKey] || roleKey;
            const email = emailEl.value.trim();
            const phone = phoneEl.value.trim();
            const city = cityEl.value.trim();
            const expVal = expEl ? expEl.value.trim() : "";
            const joinVal = joinDateEl ? joinDateEl.value : "";
            const status = statusEl ? statusEl.value : "active";
            const altPhoneVal = altPhoneEl ? altPhoneEl.value.trim() : "";
            const bioVal = bioEl ? bioEl.value.trim() : "";
            const notesVal = notesEl ? notesEl.value.trim() : "";
            const photoFile = photoEl && photoEl.files && photoEl.files[0] ? photoEl.files[0] : null;
            const photoNameVal = photoFile ? photoFile.name : "";
            const photoUrlVal = photoFile ? URL.createObjectURL(photoFile) : "";

            if (listBody) {
                const row = document.createElement("tr");
                row.dataset.consultantCode = code;
                row.dataset.status = status;
                row.dataset.trips = "0";
                row.dataset.email = email;
                row.dataset.role = roleKey;
                row.dataset.experience = expVal;
                row.dataset.joiningDate = joinVal;
                row.dataset.altPhone = altPhoneVal;
                row.dataset.bio = bioVal;
                row.dataset.notes = notesVal;
                row.dataset.photoName = photoNameVal;
                row.dataset.photoUrl = photoUrlVal;
                row.innerHTML = `
          <td class="fw-bold">${code}</td>
          <td class="fw-semibold">${fullName}</td>
          <td>${roleLabel}</td>
          <td>${phone}</td>
          <td>${city}</td>
          <td>0</td>
          <td>${statusBadgeHTML(status)}</td>
          <td class="text-end">${viewButtonHTML()}</td>
        `;
                listBody.prepend(row);
            }

            updateConsultantCounts();
            syncSuggestions();
            applyConsultantFilters();
            addForm.reset();
            if (statusEl) statusEl.value = "active";
        });
    }

    // Find Consultant handler (#panel-4)
    if (findForm) {
        findForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const q = findQueryEl ? findQueryEl.value.trim().toLowerCase() : "";
            if (!q) {
                setFieldError(findQueryEl, "Enter a consultant code, name, email, or phone number.");
                if (findQueryEl) findQueryEl.focus();
                return;
            }
            setFieldError(findQueryEl, "");

            const rows = listBody ? Array.from(listBody.querySelectorAll("tr[data-consultant-code]")) : [];
            const match = rows.find((r) => {
                const code = (r.dataset.consultantCode || "").toLowerCase();
                const email = (r.dataset.email || "").toLowerCase();
                const text = (r.textContent || "").toLowerCase();
                return code === q || email === q || text.includes(q);
            });

            if (!match) {
                setFieldError(findQueryEl, "No matching consultant found in the directory.");
                return;
            }

            loadConsultantIntoUpdateForm(match);
        });
    }

    // Update Consultant handler (#panel-4)
    const updateTrackedFields = [
        editNameEl,
        editEmailEl,
        editPhoneEl,
        editCityEl,
        editExpEl,
        editJoinDateEl,
        editAltPhoneEl,
        editBioEl,
        editNotesEl
    ];
    updateTrackedFields.forEach((el) => {
        if (!el) return;
        const evt = el.type === "date" ? "change" : "input";
        el.addEventListener(evt, () => setFieldError(el, ""));
    });

    if (editPhotoEl) {
        editPhotoEl.addEventListener("change", () => {
            setFieldError(editPhotoEl, "", editPhotoDropzone);
            if (editPhotoLabel && editPhotoEl.files && editPhotoEl.files[0]) {
                editPhotoLabel.textContent = editPhotoEl.files[0].name;
            }
        });
    }

    if (updateForm) {
        updateForm.addEventListener("reset", function () {
            updateTrackedFields.forEach((el) => setFieldError(el, ""));
            setFieldError(editPhotoEl, "", editPhotoDropzone);
            if (editPhotoLabel) editPhotoLabel.textContent = "Update Portrait";
        });

        updateForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const targetCode = editCodeEl ? editCodeEl.value.trim() : "";
            if (!targetCode) {
                setFieldError(findQueryEl, "Find and load a consultant first before updating.");
                return;
            }

            let isValid = true;
            const today = getTodayISO();

            isValid = validatePhotoFile(editPhotoEl, editPhotoDropzone) && isValid;

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

            isValid = validatePhoneValue(editPhoneEl ? editPhoneEl.value : "", editPhoneEl, true) && isValid;

            const cityVal = editCityEl ? editCityEl.value.trim() : "";
            if (!cityVal || cityVal.length < 2) {
                isValid = setFieldError(editCityEl, "Enter a valid base city.") && isValid;
            } else {
                setFieldError(editCityEl, "");
            }

            const expRaw = editExpEl ? editExpEl.value.trim() : "";
            if (expRaw !== "") {
                const expNum = Number(expRaw);
                if (!Number.isInteger(expNum) || expNum < 0 || expNum > 60) {
                    isValid = setFieldError(editExpEl, "Enter a valid experience between 0 and 60 years.") && isValid;
                } else {
                    setFieldError(editExpEl, "");
                }
            } else {
                setFieldError(editExpEl, "");
            }

            const joinVal = editJoinDateEl ? editJoinDateEl.value : "";
            if (joinVal && joinVal > today) {
                isValid = setFieldError(editJoinDateEl, "Joining date cannot be in the future.") && isValid;
            } else {
                setFieldError(editJoinDateEl, "");
            }

            isValid = validatePhoneValue(editAltPhoneEl ? editAltPhoneEl.value : "", editAltPhoneEl, false) && isValid;

            if (!isValid) return;

            const row = listBody ? listBody.querySelector(`tr[data-consultant-code="${targetCode}"]`) : null;
            if (!row) return;

            const newRoleKey = editRoleEl ? editRoleEl.value : "trip_planner";
            const newRoleLabel = ROLE_LABELS[newRoleKey] || newRoleKey;
            const newStatus = editStatusEl ? editStatusEl.value : "active";
            const tripsCount = row.dataset.trips || "0";
            const altPhoneVal = editAltPhoneEl ? editAltPhoneEl.value.trim() : "";
            const bioVal = editBioEl ? editBioEl.value.trim() : "";
            const notesVal = editNotesEl ? editNotesEl.value.trim() : "";
            const editedPhotoFile = editPhotoEl && editPhotoEl.files && editPhotoEl.files[0] ? editPhotoEl.files[0] : null;
            const newPhotoName = editedPhotoFile ? editedPhotoFile.name : row.dataset.photoName || "";
            const newPhotoUrl = editedPhotoFile ? URL.createObjectURL(editedPhotoFile) : row.dataset.photoUrl || "";

            row.dataset.status = newStatus;
            row.dataset.email = emailVal;
            row.dataset.role = newRoleKey;
            row.dataset.experience = expRaw;
            row.dataset.joiningDate = joinVal;
            row.dataset.altPhone = altPhoneVal;
            row.dataset.bio = bioVal;
            row.dataset.notes = notesVal;
            row.dataset.photoName = newPhotoName;
            row.dataset.photoUrl = newPhotoUrl;
            row.innerHTML = `
        <td class="fw-bold">${targetCode}</td>
        <td class="fw-semibold">${nameVal}</td>
        <td>${newRoleLabel}</td>
        <td>${editPhoneEl.value.trim()}</td>
        <td>${cityVal}</td>
        <td>${tripsCount}</td>
        <td>${statusBadgeHTML(newStatus)}</td>
        <td class="text-end">${viewButtonHTML()}</td>
      `;

            updateConsultantCounts();
            syncSuggestions();
            applyConsultantFilters();
        });
    }

    if (searchInput) searchInput.addEventListener("input", applyConsultantFilters);
    if (statusFilter) statusFilter.addEventListener("change", applyConsultantFilters);
    if (filterBtn) filterBtn.addEventListener("click", applyConsultantFilters);

    updateConsultantCounts();
    syncSuggestions();
    applyConsultantFilters();
})();