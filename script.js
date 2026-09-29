// -----------------------------
// ELEMENTS
// -----------------------------

const addButton = document.querySelector("#addButton");

const modal = document.querySelector("#internshipModal");

const closeButton = document.querySelector("#closeButton");

const cancelButton = document.querySelector("#cancelButton");

const internshipForm =
    document.querySelector("#internshipForm");

const tableBody =
    document.querySelector("#applicationTable");

const searchInput =
    document.querySelector("#searchInput");

const statusFilter =
    document.querySelector("#statusFilter");

const sortSelect =
    document.querySelector("#sortSelect");

const emptyState =
    document.querySelector("#emptyState");

const modalTitle =
    document.querySelector("#modalTitle");


// -----------------------------
// DATA
// -----------------------------

let internships =
    JSON.parse(
        localStorage.getItem("internships")
    ) || [];

let editingIndex = null;


// -----------------------------
// SAVE DATA
// -----------------------------

function saveInternships() {

    localStorage.setItem(
        "internships",
        JSON.stringify(internships)
    );

}


// -----------------------------
// DISPLAY APPLICATIONS
// -----------------------------

function displayInternships() {

    const searchTerm =
        searchInput.value.toLowerCase();

    const selectedStatus =
        statusFilter.value;

    const sortValue =
        sortSelect.value;


    let filteredInternships =
        internships.map(function (internship, index) {

            return {
                ...internship,
                originalIndex: index
            };

        });


    // SEARCH

    filteredInternships =
        filteredInternships.filter(function (internship) {

            const company =
                internship.company.toLowerCase();

            const position =
                internship.position.toLowerCase();

            const location =
                (internship.location || "")
                    .toLowerCase();

            const matchesSearch =
                company.includes(searchTerm) ||
                position.includes(searchTerm) ||
                location.includes(searchTerm);

            const matchesStatus =
                selectedStatus === "All" ||
                internship.status === selectedStatus;

            return matchesSearch && matchesStatus;

        });


    // SORT

    filteredInternships.sort(function (a, b) {

        if (sortValue === "newest") {

            return new Date(b.dateApplied) -
                   new Date(a.dateApplied);

        }

        if (sortValue === "oldest") {

            return new Date(a.dateApplied) -
                   new Date(b.dateApplied);

        }

        if (sortValue === "company") {

            return a.company.localeCompare(b.company);

        }

    });


    tableBody.innerHTML = "";


    // EMPTY STATE

    if (filteredInternships.length === 0) {

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";

    }


    // CREATE ROWS

    filteredInternships.forEach(function (internship) {

        const newRow =
            document.createElement("tr");

        const daysOld =
            getDaysSince(internship.dateApplied);

        const location =
            internship.location || "—";


        let jobLinkHTML = "";

        if (internship.jobLink) {

            jobLinkHTML = `
                <a
                    href="${internship.jobLink}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="action-button job-link"
                >
                    Job
                </a>
            `;

        }


        newRow.innerHTML = `

            <td>
                <div class="company-name">
                    ${escapeHTML(internship.company)}
                </div>
            </td>

            <td>
                <div class="position-name">
                    ${escapeHTML(internship.position)}
                </div>
            </td>

            <td class="location-text">
                ${escapeHTML(location)}
            </td>

            <td>
                <span
                    class="status ${internship.status.toLowerCase()}"
                >
                    ${escapeHTML(internship.status)}
                </span>
            </td>

            <td class="date-text">
                ${formatDate(internship.dateApplied)}
            </td>

            <td class="age-text">
                ${daysOld}d
            </td>

            <td>

                <div class="actions">

                    ${jobLinkHTML}

                    <button
                        class="action-button"
                        onclick="editInternship(
                            ${internship.originalIndex}
                        )"
                    >
                        Edit
                    </button>

                    <button
                        class="action-button delete-button"
                        onclick="deleteInternship(
                            ${internship.originalIndex}
                        )"
                    >
                        Delete
                    </button>

                </div>

            </td>

        `;


        tableBody.appendChild(newRow);

    });


    updateStats();

}


// -----------------------------
// ADD APPLICATION
// -----------------------------

function openAddModal() {

    editingIndex = null;

    internshipForm.reset();

    modalTitle.textContent =
        "Add Internship";

    document.querySelector("#dateApplied").value =
        getToday();

    modal.style.display = "flex";

}


// -----------------------------
// EDIT APPLICATION
// -----------------------------

function editInternship(index) {

    const internship =
        internships[index];


    document.querySelector("#company").value =
        internship.company;

    document.querySelector("#position").value =
        internship.position;

    document.querySelector("#location").value =
        internship.location || "";

    document.querySelector("#status").value =
        internship.status;

    document.querySelector("#dateApplied").value =
        internship.dateApplied;

    document.querySelector("#deadline").value =
        internship.deadline || "";

    document.querySelector("#jobLink").value =
        internship.jobLink || "";

    document.querySelector("#notes").value =
        internship.notes || "";


    editingIndex = index;

    modalTitle.textContent =
        "Edit Internship";

    modal.style.display = "flex";

}


// -----------------------------
// DELETE APPLICATION
// -----------------------------

function deleteInternship(index) {

    const internship =
        internships[index];

    const confirmed =
        confirm(
            `Delete your ${internship.company} application?`
        );


    if (!confirmed) {
        return;
    }


    internships.splice(index, 1);

    saveInternships();

    displayInternships();

}


// -----------------------------
// CLOSE MODAL
// -----------------------------

function closeModal() {

    modal.style.display = "none";

    internshipForm.reset();

    editingIndex = null;

}


// -----------------------------
// FORM SUBMISSION
// -----------------------------

internshipForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const internship = {

            company:
                document.querySelector("#company")
                    .value.trim(),

            position:
                document.querySelector("#position")
                    .value.trim(),

            location:
                document.querySelector("#location")
                    .value.trim(),

            status:
                document.querySelector("#status")
                    .value,

            dateApplied:
                document.querySelector("#dateApplied")
                    .value,

            deadline:
                document.querySelector("#deadline")
                    .value,

            jobLink:
                document.querySelector("#jobLink")
                    .value.trim(),

            notes:
                document.querySelector("#notes")
                    .value.trim()

        };


        if (editingIndex === null) {

            internships.push(internship);

        } else {

            internships[editingIndex] =
                internship;

        }


        saveInternships();

        closeModal();

        displayInternships();

    }
);


// -----------------------------
// STATS
// -----------------------------

function updateStats() {

    const total =
        internships.length;


    const interviews =
        internships.filter(function (internship) {

            return internship.status === "Interview";

        }).length;


    const offers =
        internships.filter(function (internship) {

            return internship.status === "Offer";

        }).length;


    const applied =
        internships.filter(function (internship) {

            return internship.status === "Applied";

        }).length;


    const responses =
        interviews + offers;


    const responseRate =
        total === 0
            ? 0
            : Math.round(
                (responses / total) * 100
            );


    document.querySelector(
        "#applicationCount"
    ).textContent = total;


    document.querySelector(
        "#interviewCount"
    ).textContent = interviews;


    document.querySelector(
        "#offerCount"
    ).textContent = offers;


    document.querySelector(
        "#responseRate"
    ).textContent =
        `${responseRate}%`;


    document.querySelector(
        "#appliedPipeline"
    ).textContent = applied;


    document.querySelector(
        "#interviewPipeline"
    ).textContent = interviews;


    document.querySelector(
        "#offerPipeline"
    ).textContent = offers;

}


// -----------------------------
// HELPER FUNCTIONS
// -----------------------------

function getToday() {

    const today =
        new Date();

    return today
        .toISOString()
        .split("T")[0];

}


function getDaysSince(date) {

    if (!date) {
        return 0;
    }

    const appliedDate =
        new Date(date + "T00:00:00");

    const today =
        new Date();

    const difference =
        today - appliedDate;

    return Math.max(
        0,
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        )
    );

}


function formatDate(date) {

    if (!date) {
        return "—";
    }

    const parsedDate =
        new Date(date + "T00:00:00");


    return parsedDate.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

}


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value || "";

    return div.innerHTML;

}


// -----------------------------
// EVENT LISTENERS
// -----------------------------

addButton.addEventListener(
    "click",
    openAddModal
);


cancelButton.addEventListener(
    "click",
    closeModal
);


closeButton.addEventListener(
    "click",
    closeModal
);


modal.addEventListener(
    "click",
    function (event) {

        if (event.target === modal) {

            closeModal();

        }

    }
);


searchInput.addEventListener(
    "input",
    displayInternships
);


statusFilter.addEventListener(
    "change",
    displayInternships
);


sortSelect.addEventListener(
    "change",
    displayInternships
);


document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeModal();

        }

    }
);


// -----------------------------
// INITIAL LOAD
// -----------------------------

displayInternships();