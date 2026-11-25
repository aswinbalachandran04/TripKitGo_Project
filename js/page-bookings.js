(function () {
  const standardForm = document.getElementById("createBookingForm");
  const customForm = document.getElementById("customBookingForm");
  const overviewBody = document.getElementById("bookingOverviewBody");
  const summaryList = document.getElementById("bookingSummaryList");

  const confirmedEl = document.getElementById("confirmedTripsCount");
  const pendingEl = document.getElementById("pendingApprovalCount");
  const totalEl = document.getElementById("totalBookingsCount");
  const travelersEl = document.getElementById("totalTravelersCount");

  // Inline success message elements inside Panel 3 & Panel 4
  const stdSuccessBox = document.getElementById("standardBookingSuccess");
  const stdSuccessTitle = document.getElementById("standardSuccessTitle");
  const stdSuccessText = document.getElementById("standardSuccessText");
  const closeStdSuccessBtn = document.getElementById("closeStandardSuccessBtn");

  const cstSuccessBox = document.getElementById("customBookingSuccess");
  const cstSuccessTitle = document.getElementById("customSuccessTitle");
  const cstSuccessText = document.getElementById("customSuccessText");
  const closeCstSuccessBtn = document.getElementById("closeCustomSuccessBtn");

  // Edit modal elements
  const editModal = document.getElementById("editBookingModal");
  const closeEditBtn = document.getElementById("closeEditBookingBtn");
  const cancelEditBtn = document.getElementById("cancelEditBookingBtn");
  const editForm = document.getElementById("editBookingForm");
  const editCodeBadge = document.getElementById("editBookingCodeBadge");
  const editIdEl = document.getElementById("editBookingId");
  const editNameEl = document.getElementById("editBookingName");
  const editEmailEl = document.getElementById("editBookingEmail");
  const editPhoneEl = document.getElementById("editBookingPhone");
  const editPackageEl = document.getElementById("editBookingPackage");
  const editStartEl = document.getElementById("editBookingStart");
  const editEndEl = document.getElementById("editBookingEnd");
  const editAdultsEl = document.getElementById("editBookingAdults");
  const editChildrenEl = document.getElementById("editBookingChildren");
  const editConsultantEl = document.getElementById("editBookingConsultant");
  const editStatusEl = document.getElementById("editBookingStatus");
  const editRemarksEl = document.getElementById("editBookingRemarks");

  let bookingCounter = 1045;

  function hideSuccessBox(box) {
    if (!box) return;
    box.classList.add("d-none");
    box.classList.remove("d-flex");
  }

  function showBookingSuccess(data, kindLabel) {
    const isCustom = kindLabel === "Customized Booking";
    const box = isCustom ? cstSuccessBox : stdSuccessBox;
    const titleEl = isCustom ? cstSuccessTitle : stdSuccessTitle;
    const textEl = isCustom ? cstSuccessText : stdSuccessText;

    if (!box || !titleEl || !textEl) return;

    titleEl.textContent = `${kindLabel} Created — ${data.bookingId} (${data.status})`;
    textEl.textContent = `${data.name} • ${data.packageName} (${data.startDate} → ${data.endDate}, ${formatGuestsText(data.adults, data.children)}) has been added to your bookings.`;

    box.classList.remove("d-none");
    box.classList.add("d-flex");
    box.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (closeStdSuccessBtn) {
    closeStdSuccessBtn.addEventListener("click", () => hideSuccessBox(stdSuccessBox));
  }
  if (closeCstSuccessBtn) {
    closeCstSuccessBtn.addEventListener("click", () => hideSuccessBox(cstSuccessBox));
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

  function statusBadgeHTML(status) {
    if (status === "Confirmed") {
      return '<span class="badge bg-success-subtle text-success border border-success-subtle">Confirmed</span>';
    }
    if (status === "Pending") {
      return '<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">Pending</span>';
    }
    return '<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">On Hold</span>';
  }

  function formatGuestsText(adults, children) {
    const a = Number(adults) || 0;
    const c = Number(children) || 0;
    if (c > 0) {
      return `${a} ${a === 1 ? "Adult" : "Adults"}, ${c} ${c === 1 ? "Child" : "Children"}`;
    }
    return `${a} ${a === 1 ? "Adult" : "Adults"}`;
  }

  function updateOverviewMetrics() {
    if (!overviewBody) return;
    const rows = Array.from(overviewBody.querySelectorAll("tr[data-booking-id]"));

    let confirmed = 0;
    let pending = 0;
    let totalGuests = 0;

    rows.forEach((row) => {
      const st = row.dataset.status;
      if (st === "Confirmed") confirmed += 1;
      if (st === "Pending") pending += 1;
      totalGuests += Number(row.dataset.guests) || 0;
    });

    if (confirmedEl) confirmedEl.textContent = String(confirmed);
    if (pendingEl) pendingEl.textContent = String(pending);
    if (totalEl) totalEl.textContent = String(rows.length);
    if (travelersEl) travelersEl.textContent = String(totalGuests);
  }

  function buildOverviewRowHTML(data) {
    return `
      <td class="fw-bold">${data.bookingId}</td>
      <td>
        <div class="fw-semibold">${data.name}</div>
        <div class="small text-muted">${data.email}</div>
      </td>
      <td>${data.packageName}</td>
      <td>${data.startDate} &rarr; ${data.endDate}</td>
      <td>${formatGuestsText(data.adults, data.children)}</td>
      <td>${data.consultant}</td>
      <td>${statusBadgeHTML(data.status)}</td>
      <td class="text-end">
        <div class="d-inline-flex gap-1">
          <button type="button" class="btn-brand-outline py-1 px-2 small js-edit-booking" title="Edit booking">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button type="button" class="btn-brand-outline py-1 px-2 small text-danger border-danger-subtle js-delete-booking" title="Delete booking">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
      </td>
    `;
  }

  function buildSummaryCardInnerHTML(data) {
    const remarksLine = data.remarks
      ? `<div class="small text-muted mt-2 pt-2 border-top w-100">${data.remarks}</div>`
      : "";
    return `
      <div class="metric-glass-card flex-column align-items-start h-100">
        <div class="d-flex justify-content-between align-items-center w-100 mb-2">
          <span class="fw-bold small" style="color: var(--teal-primary);">${data.bookingId}</span>
          ${statusBadgeHTML(data.status)}
        </div>
        <h6 class="fw-bold mb-1" style="color: var(--navy-primary);">${data.name}</h6>
        <div class="small fw-semibold mb-2">${data.packageName}</div>
        <div class="small mb-1"><i class="bi bi-calendar3 me-1"></i> ${data.startDate} &rarr; ${data.endDate}</div>
        <div class="small mb-1"><i class="bi bi-people me-1"></i> ${formatGuestsText(data.adults, data.children)}</div>
        <div class="small mb-1"><i class="bi bi-telephone me-1"></i> ${data.phone}</div>
        <div class="small text-muted"><i class="bi bi-person-badge me-1"></i> ${data.consultant}</div>
        ${remarksLine}
        <div class="d-flex justify-content-end gap-2 pt-3 mt-auto border-top w-100">
          <button type="button" class="btn-brand-outline py-1 px-2 small js-edit-booking">
            <i class="bi bi-pencil-square me-1"></i> Edit
          </button>
          <button type="button" class="btn-brand-outline py-1 px-2 small text-danger border-danger-subtle js-delete-booking">
            <i class="bi bi-trash3 me-1"></i> Delete
          </button>
        </div>
      </div>
    `;
  }

  function addBookingToDOM(data) {
    if (overviewBody) {
      const tr = document.createElement("tr");
      tr.dataset.bookingId = data.bookingId;
      tr.dataset.guests = String(data.totalGuests);
      tr.dataset.status = data.status;
      tr.dataset.name = data.name;
      tr.dataset.email = data.email;
      tr.dataset.phone = data.phone;
      tr.dataset.package = data.packageName;
      tr.dataset.start = data.startDate;
      tr.dataset.end = data.endDate;
      tr.dataset.adults = String(data.adults);
      tr.dataset.children = String(data.children);
      tr.dataset.consultant = data.consultant;
      tr.dataset.remarks = data.remarks;
      tr.innerHTML = buildOverviewRowHTML(data);
      overviewBody.prepend(tr);
    }

    if (summaryList) {
      const col = document.createElement("div");
      col.className = "col-12 col-md-6";
      col.dataset.bookingId = data.bookingId;
      col.innerHTML = buildSummaryCardInnerHTML(data);
      summaryList.prepend(col);
    }

    updateOverviewMetrics();
  }

  function deleteBookingById(bookingId) {
    if (!bookingId) return;
    if (overviewBody) {
      const row = overviewBody.querySelector(`tr[data-booking-id="${bookingId}"]`);
      if (row) row.remove();
    }
    if (summaryList) {
      const cardCol = summaryList.querySelector(`[data-booking-id="${bookingId}"]`);
      if (cardCol) cardCol.remove();
    }
    updateOverviewMetrics();
  }

  function openEditBookingModal(bookingId) {
    if (!editModal || !overviewBody || !bookingId) return;
    const row = overviewBody.querySelector(`tr[data-booking-id="${bookingId}"]`);
    if (!row) return;

    if (editIdEl) editIdEl.value = bookingId;
    if (editCodeBadge) editCodeBadge.textContent = `(${bookingId})`;
    if (editNameEl) editNameEl.value = row.dataset.name || "";
    if (editEmailEl) editEmailEl.value = row.dataset.email || "";
    if (editPhoneEl) editPhoneEl.value = row.dataset.phone || "";
    if (editPackageEl) editPackageEl.value = row.dataset.package || "";
    if (editStartEl) editStartEl.value = row.dataset.start || "";
    if (editEndEl) editEndEl.value = row.dataset.end || "";
    if (editAdultsEl) editAdultsEl.value = row.dataset.adults || "1";
    if (editChildrenEl) editChildrenEl.value = row.dataset.children || "0";
    if (editConsultantEl) editConsultantEl.value = row.dataset.consultant || "";
    if (editStatusEl) editStatusEl.value = row.dataset.status || "Confirmed";
    if (editRemarksEl) editRemarksEl.value = row.dataset.remarks || "";

    [
      editNameEl,
      editEmailEl,
      editPhoneEl,
      editPackageEl,
      editStartEl,
      editEndEl,
      editAdultsEl,
      editChildrenEl,
      editConsultantEl
    ].forEach((el) => setFieldError(el, ""));

    editModal.classList.remove("d-none");
  }

  function closeEditBookingModal() {
    if (!editModal) return;
    editModal.classList.add("d-none");
  }

  function handleBookingActionClick(event) {
    const target = event.target;
    const editBtn = target.closest(".js-edit-booking");
    const deleteBtn = target.closest(".js-delete-booking");
    const owner = (editBtn || deleteBtn)?.closest("[data-booking-id]");
    if (!owner) return;

    const bookingId = owner.dataset.bookingId;
    if (editBtn) {
      openEditBookingModal(bookingId);
    } else if (deleteBtn) {
      deleteBookingById(bookingId);
    }
  }

  if (overviewBody) overviewBody.addEventListener("click", handleBookingActionClick);
  if (summaryList) summaryList.addEventListener("click", handleBookingActionClick);

  if (closeEditBtn) closeEditBtn.addEventListener("click", closeEditBookingModal);
  if (cancelEditBtn) cancelEditBtn.addEventListener("click", closeEditBookingModal);
  if (editModal) {
    editModal.addEventListener("click", (event) => {
      if (event.target === editModal) closeEditBookingModal();
    });
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && editModal && !editModal.classList.contains("d-none")) {
      closeEditBookingModal();
    }
  });

  if (editForm) {
    [
      editNameEl,
      editEmailEl,
      editPhoneEl,
      editPackageEl,
      editStartEl,
      editEndEl,
      editAdultsEl,
      editChildrenEl,
      editConsultantEl
    ].forEach((el) => {
      if (!el) return;
      const evt = el.type === "date" ? "change" : "input";
      el.addEventListener(evt, () => setFieldError(el, ""));
    });

    editForm.addEventListener("submit", function (event) {
      event.preventDefault();
      let isValid = true;

      const nameVal = editNameEl ? editNameEl.value.trim() : "";
      if (!nameVal || nameVal.length < 2) {
        isValid = setFieldError(editNameEl, "Enter primary traveler name (at least 2 characters).") && isValid;
      } else {
        setFieldError(editNameEl, "");
      }

      const emailVal = editEmailEl ? editEmailEl.value.trim() : "";
      if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        isValid = setFieldError(editEmailEl, "Enter a valid email address.") && isValid;
      } else {
        setFieldError(editEmailEl, "");
      }

      const phoneVal = editPhoneEl ? editPhoneEl.value.trim() : "";
      const phoneDigits = phoneVal.replace(/[\s\-()]/g, "");
      if (!phoneVal || !/^(?:\+?\d{1,3})?\d{10}$/.test(phoneDigits)) {
        isValid = setFieldError(editPhoneEl, "Enter a 10-digit number or country code + 10 digits.") && isValid;
      } else {
        setFieldError(editPhoneEl, "");
      }

      const pkgVal = editPackageEl ? editPackageEl.value.trim() : "";
      if (!pkgVal) {
        isValid = setFieldError(editPackageEl, "Package or route is required.") && isValid;
      } else {
        setFieldError(editPackageEl, "");
      }

      const startVal = editStartEl ? editStartEl.value : "";
      const endVal = editEndEl ? editEndEl.value : "";
      if (!startVal) {
        isValid = setFieldError(editStartEl, "Departure date is required.") && isValid;
      } else {
        setFieldError(editStartEl, "");
      }

      if (!endVal) {
        isValid = setFieldError(editEndEl, "Return date is required.") && isValid;
      } else if (startVal && endVal < startVal) {
        isValid = setFieldError(editEndEl, "Return date must be on or after departure date.") && isValid;
      } else {
        setFieldError(editEndEl, "");
      }

      const adultsNum = Number(editAdultsEl ? editAdultsEl.value.trim() : "");
      if (!Number.isInteger(adultsNum) || adultsNum < 1) {
        isValid = setFieldError(editAdultsEl, "At least 1 adult is required.") && isValid;
      } else {
        setFieldError(editAdultsEl, "");
      }

      const childrenRaw = editChildrenEl ? editChildrenEl.value.trim() : "";
      const childrenNum = childrenRaw === "" ? 0 : Number(childrenRaw);
      if (!Number.isInteger(childrenNum) || childrenNum < 0) {
        isValid = setFieldError(editChildrenEl, "Children count must be 0 or higher.") && isValid;
      } else {
        setFieldError(editChildrenEl, "");
      }

      const consultantVal = editConsultantEl ? editConsultantEl.value.trim() : "";
      if (!consultantVal) {
        isValid = setFieldError(editConsultantEl, "Assigned consultant is required.") && isValid;
      } else {
        setFieldError(editConsultantEl, "");
      }

      if (!isValid) return;

      const bookingId = editIdEl ? editIdEl.value : "";
      const statusVal = editStatusEl ? editStatusEl.value : "Confirmed";
      const remarksVal = editRemarksEl ? editRemarksEl.value.trim() : "";
      const updatedData = {
        bookingId,
        name: nameVal,
        email: emailVal,
        phone: phoneVal,
        packageName: pkgVal,
        startDate: startVal,
        endDate: endVal,
        adults: adultsNum,
        children: childrenNum,
        totalGuests: adultsNum + childrenNum,
        consultant: consultantVal,
        status: statusVal,
        remarks: remarksVal
      };

      if (overviewBody) {
        const row = overviewBody.querySelector(`tr[data-booking-id="${bookingId}"]`);
        if (row) {
          row.dataset.guests = String(updatedData.totalGuests);
          row.dataset.status = updatedData.status;
          row.dataset.name = updatedData.name;
          row.dataset.email = updatedData.email;
          row.dataset.phone = updatedData.phone;
          row.dataset.package = updatedData.packageName;
          row.dataset.start = updatedData.startDate;
          row.dataset.end = updatedData.endDate;
          row.dataset.adults = String(updatedData.adults);
          row.dataset.children = String(updatedData.children);
          row.dataset.consultant = updatedData.consultant;
          row.dataset.remarks = updatedData.remarks;
          row.innerHTML = buildOverviewRowHTML(updatedData);
        }
      }

      if (summaryList) {
        const col = summaryList.querySelector(`[data-booking-id="${bookingId}"]`);
        if (col) {
          col.innerHTML = buildSummaryCardInnerHTML(updatedData);
        }
      }

      updateOverviewMetrics();
      closeEditBookingModal();
    });
  }

  // Standard New Booking Form
  if (standardForm) {
    const stdName = document.getElementById("primaryTravelerName");
    const stdEmail = document.getElementById("travelerEmail");
    const stdPhone = document.getElementById("travelerPhone");
    const stdPkg = document.getElementById("publishedPackage");
    const stdStart = document.getElementById("departureDate");
    const stdEnd = document.getElementById("returnDate");
    const stdAdults = document.getElementById("adultsCount");
    const stdChildren = document.getElementById("childrenCount");
    const stdConsultant = document.getElementById("assignedConsultant");
    const stdStatus = document.getElementById("bookingStatus");
    const stdRemarks = document.getElementById("bookingRemarks");

    const stdFields = [stdName, stdEmail, stdPhone, stdPkg, stdStart, stdEnd, stdAdults, stdChildren, stdConsultant];
    stdFields.forEach((el) => {
      if (!el) return;
      const evt = el.tagName === "SELECT" || el.type === "date" ? "change" : "input";
      el.addEventListener(evt, () => setFieldError(el, ""));
    });

    standardForm.addEventListener("reset", () => stdFields.forEach((el) => setFieldError(el, "")));

    standardForm.addEventListener("submit", function (event) {
      event.preventDefault();
      let isValid = true;

      const nameVal = stdName ? stdName.value.trim() : "";
      if (!nameVal || nameVal.length < 2) {
        isValid = setFieldError(stdName, "Primary traveler name is required.") && isValid;
      } else {
        setFieldError(stdName, "");
      }

      const emailVal = stdEmail ? stdEmail.value.trim() : "";
      if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        isValid = setFieldError(stdEmail, "Enter a valid email address.") && isValid;
      } else {
        setFieldError(stdEmail, "");
      }

      const phoneVal = stdPhone ? stdPhone.value.trim() : "";
      const phoneDigits = phoneVal.replace(/[\s\-()]/g, "");
      if (!phoneVal || !/^(?:\+?\d{1,3})?\d{10}$/.test(phoneDigits)) {
        isValid = setFieldError(stdPhone, "Enter a 10-digit number or country code + 10 digits.") && isValid;
      } else {
        setFieldError(stdPhone, "");
      }

      const pkgVal = stdPkg ? stdPkg.value : "";
      if (!pkgVal) {
        isValid = setFieldError(stdPkg, "Select a tour package.") && isValid;
      } else {
        setFieldError(stdPkg, "");
      }

      const startVal = stdStart ? stdStart.value : "";
      const endVal = stdEnd ? stdEnd.value : "";
      if (!startVal) {
        isValid = setFieldError(stdStart, "Departure date is required.") && isValid;
      } else {
        setFieldError(stdStart, "");
      }

      if (!endVal) {
        isValid = setFieldError(stdEnd, "Return date is required.") && isValid;
      } else if (startVal && endVal < startVal) {
        isValid = setFieldError(stdEnd, "Return date must be on or after departure date.") && isValid;
      } else {
        setFieldError(stdEnd, "");
      }

      const adultsNum = Number(stdAdults ? stdAdults.value.trim() : "");
      if (!Number.isInteger(adultsNum) || adultsNum < 1) {
        isValid = setFieldError(stdAdults, "Enter at least 1 adult.") && isValid;
      } else {
        setFieldError(stdAdults, "");
      }

      const childrenRaw = stdChildren ? stdChildren.value.trim() : "";
      const childrenNum = childrenRaw === "" ? 0 : Number(childrenRaw);
      if (!Number.isInteger(childrenNum) || childrenNum < 0) {
        isValid = setFieldError(stdChildren, "Children count must be 0 or higher.") && isValid;
      } else {
        setFieldError(stdChildren, "");
      }

      const consultantVal = stdConsultant ? stdConsultant.value : "Unassigned";

      if (!isValid) {
        const firstInvalid = standardForm.querySelector(".is-invalid");
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
          firstInvalid.focus();
        }
        return;
      }

      const bookingId = "BK-" + bookingCounter++;
      const createdData = {
        bookingId,
        name: nameVal,
        email: emailVal,
        phone: phoneVal,
        packageName: pkgVal,
        startDate: startVal,
        endDate: endVal,
        adults: adultsNum,
        children: childrenNum,
        totalGuests: adultsNum + childrenNum,
        consultant: consultantVal || "Unassigned",
        status: stdStatus ? stdStatus.value : "Confirmed",
        remarks: stdRemarks ? stdRemarks.value.trim() : ""
      };

      addBookingToDOM(createdData);
      showBookingSuccess(createdData, "Standard Booking");
      standardForm.reset();
    });
  }

  // Customized New Booking Form (Distinct Fields)
  if (customForm) {
    const cstName = document.getElementById("customTravelerName");
    const cstEmail = document.getElementById("customTravelerEmail");
    const cstPhone = document.getElementById("customTravelerPhone");
    const cstDest = document.getElementById("customDestinations");
    const cstStart = document.getElementById("customDepartureDate");
    const cstEnd = document.getElementById("customReturnDate");
    const cstAdults = document.getElementById("customAdultsCount");
    const cstChildren = document.getElementById("customChildrenCount");
    const cstStayTier = document.getElementById("customStayTier");
    const cstTransport = document.getElementById("customTransportMode");
    const cstConsultant = document.getElementById("customConsultant");
    const cstStatus = document.getElementById("customBookingStatus");
    const cstNotes = document.getElementById("customItineraryNotes");

    const cstFields = [
      cstName,
      cstEmail,
      cstPhone,
      cstDest,
      cstStart,
      cstEnd,
      cstAdults,
      cstChildren,
      cstNotes
    ];
    cstFields.forEach((el) => {
      if (!el) return;
      const evt = el.type === "date" ? "change" : "input";
      el.addEventListener(evt, () => setFieldError(el, ""));
    });

    customForm.addEventListener("reset", () => cstFields.forEach((el) => setFieldError(el, "")));

    customForm.addEventListener("submit", function (event) {
      event.preventDefault();
      let isValid = true;

      const nameVal = cstName ? cstName.value.trim() : "";
      if (!nameVal || nameVal.length < 2) {
        isValid = setFieldError(cstName, "Primary traveler name is required.") && isValid;
      } else {
        setFieldError(cstName, "");
      }

      const emailVal = cstEmail ? cstEmail.value.trim() : "";
      if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        isValid = setFieldError(cstEmail, "Enter a valid email address.") && isValid;
      } else {
        setFieldError(cstEmail, "");
      }

      const phoneVal = cstPhone ? cstPhone.value.trim() : "";
      const phoneDigits = phoneVal.replace(/[\s\-()]/g, "");
      if (!phoneVal || !/^(?:\+?\d{1,3})?\d{10}$/.test(phoneDigits)) {
        isValid = setFieldError(cstPhone, "Enter a 10-digit number or country code + 10 digits.") && isValid;
      } else {
        setFieldError(cstPhone, "");
      }

      const destVal = cstDest ? cstDest.value.trim() : "";
      if (!destVal || destVal.length < 3) {
        isValid = setFieldError(cstDest, "Enter preferred custom route or destinations.") && isValid;
      } else {
        setFieldError(cstDest, "");
      }

      const startVal = cstStart ? cstStart.value : "";
      const endVal = cstEnd ? cstEnd.value : "";
      if (!startVal) {
        isValid = setFieldError(cstStart, "Departure date is required.") && isValid;
      } else {
        setFieldError(cstStart, "");
      }

      if (!endVal) {
        isValid = setFieldError(cstEnd, "Return date is required.") && isValid;
      } else if (startVal && endVal < startVal) {
        isValid = setFieldError(cstEnd, "Return date must be on or after departure date.") && isValid;
      } else {
        setFieldError(cstEnd, "");
      }

      const adultsNum = Number(cstAdults ? cstAdults.value.trim() : "");
      if (!Number.isInteger(adultsNum) || adultsNum < 1) {
        isValid = setFieldError(cstAdults, "Enter at least 1 adult.") && isValid;
      } else {
        setFieldError(cstAdults, "");
      }

      const childrenRaw = cstChildren ? cstChildren.value.trim() : "";
      const childrenNum = childrenRaw === "" ? 0 : Number(childrenRaw);
      if (!Number.isInteger(childrenNum) || childrenNum < 0) {
        isValid = setFieldError(cstChildren, "Children count must be 0 or higher.") && isValid;
      } else {
        setFieldError(cstChildren, "");
      }

      if (!isValid) {
        const firstInvalid = customForm.querySelector(".is-invalid");
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
          firstInvalid.focus();
        }
        return;
      }

      const stayTier = cstStayTier ? cstStayTier.value : "Boutique & Heritage";
      const transport = cstTransport ? cstTransport.value : "Private SUV";
      const notesVal = cstNotes ? cstNotes.value.trim() : "";
      const prefSummary = `Stay: ${stayTier} • Transport: ${transport}`;
      const combinedRemarks = notesVal ? `${prefSummary} — ${notesVal}` : prefSummary;

      const bookingId = "BK-" + bookingCounter++;
      const createdData = {
        bookingId,
        name: nameVal,
        email: emailVal,
        phone: phoneVal,
        packageName: `Custom: ${destVal}`,
        startDate: startVal,
        endDate: endVal,
        adults: adultsNum,
        children: childrenNum,
        totalGuests: adultsNum + childrenNum,
        consultant: cstConsultant ? cstConsultant.value : "",
        status: cstStatus ? cstStatus.value : "",
        remarks: combinedRemarks
      };

      addBookingToDOM(createdData);
      showBookingSuccess(createdData, "Customized Booking");
      customForm.reset();
    });
  }

  updateOverviewMetrics();
})();