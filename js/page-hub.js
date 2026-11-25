(function () {
    const searchInput = document.getElementById("hubModuleSearch");
    const noMatchNotice = document.getElementById("hubNoMatchNotice");
    const cardItems = Array.from(document.querySelectorAll(".hub-card-item"));
    const rows = Array.from(document.querySelectorAll(".hub-section-row"));

    if (!searchInput || !cardItems.length) return;

    function filterHubModules() {
        const query = searchInput.value.trim().toLowerCase();
        let totalVisible = 0;

        cardItems.forEach((card) => {
            const titleText = (card.textContent || "").toLowerCase();
            const keywords = (card.dataset.keywords || "").toLowerCase();
            const isMatch = !query || titleText.includes(query) || keywords.includes(query);

            card.style.display = isMatch ? "" : "none";
            if (isMatch) totalVisible += 1;
        });

        rows.forEach((row) => {
            const rowCards = Array.from(row.querySelectorAll(".hub-card-item"));
            const anyVisible = rowCards.some((c) => c.style.display !== "none");
            row.style.display = anyVisible ? "" : "none";

            const divider = row.previousElementSibling;
            if (divider && divider.classList.contains("hub-section-group")) {
                divider.style.display = anyVisible ? "" : "none";
            }
        });

        if (noMatchNotice) {
            noMatchNotice.classList.toggle("d-none", totalVisible > 0);
        }
    }

    searchInput.addEventListener("input", filterHubModules);
})();