// ======================================================
// INTERNTRACK V2
// Internship Application Dashboard
// ======================================================


// ======================================================
// ELEMENTS
// ======================================================

const internshipModal =
    document.querySelector("#internshipModal");

const detailsModal =
    document.querySelector("#detailsModal");

const internshipForm =
    document.querySelector("#internshipForm");

const closeButton =
    document.querySelector("#closeButton");

const cancelButton =
    document.querySelector("#cancelButton");

const detailsCloseButton =
    document.querySelector("#detailsCloseButton");

const modalTitle =
    document.querySelector("#modalTitle");

const tableBody =
    document.querySelector("#applicationTable");

const emptyState =
    document.querySelector("#emptyState");

const searchInput =
    document.querySelector("#searchInput");

const statusFilter =
    document.querySelector("#statusFilter");

const sortSelect =
    document.querySelector("#sortSelect");

const resultsText =
    document.querySelector("#resultsText");

const toast =
    document.querySelector("#toast");

const navItems =
    document.querySelectorAll(".nav-item");

const views =
    document.querySelectorAll(".view");

const addButtons =
    document.querySelectorAll(".add-application-button");


// ======================================================
// DATA
// ======================================================

// Same localStorage key as your original version.
// This means your old applications should still load.

let internships = [];

try {

    const savedInternships =
        JSON.parse(
            localStorage.getItem("internships")
        );

    if (Array.isArray(savedInternships)) {
        internships = savedInternships;
    }

} catch (error) {

    console.error(
        "Could not load internship data:",
        error
    );

    internships = [];

}


let editingIndex = null;


// ======================================================
// DATA HELPERS
// ======================================================

function saveInternships() {

    localStorage.setItem(
        "internships",
        JSON.stringify(internships)
    );

}


function normalizeInternship(internship) {

    return {

        company:
            internship.company || "",

        position:
            internship.position || "",

        location:
            internship.location || "",

        status:
            internship.status || "Applied",

        dateApplied:
            internship.dateApplied || "",

        deadline:
            internship.deadline || "",

        followUpDate:
            internship.followUpDate || "",

        salary:
            internship.salary || "",

        contact:
            internship.contact || "",

        jobLink:
            internship.jobLink || "",

        notes:
            internship.notes || ""

    };

}


// Make old saved applications compatible
// with the new fields.

internships =
    internships.map(normalizeInternship);

saveInternships();


// ======================================================
// NAVIGATION
// ======================================================

function switchView(viewName) {

    views.forEach(function (view) {

        view.classList.remove("active-view");

    });


    navItems.forEach(function (item) {

        item.classList.remove("active");

    });


    const targetView =
        document.querySelector(
            `#${viewName}View`
        );

    if (targetView) {

        targetView.classList.add(
            "active-view"
        );

    }


    const targetNav =
        document.querySelector(
            `.nav-item[data-view="${viewName}"]`
        );

    if (targetNav) {

        targetNav.classList.add(
            "active"
        );

    }


    renderAll();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


navItems.forEach(function (item) {

    item.addEventListener(
        "click",
        function () {

            switchView(
                item.dataset.view
            );

        }
    );

});


document
    .querySelectorAll("[data-go-to]")
    .forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                switchView(
                    button.dataset.goTo
                );

            }
        );

    });


// ======================================================
// ADD APPLICATION
// ======================================================

function openAddModal() {

    editingIndex = null;

    internshipForm.reset();

    modalTitle.textContent =
        "Add Application";

    document.querySelector(
        "#status"
    ).value = "Applied";

    document.querySelector(
        "#dateApplied"
    ).value = getToday();

    openModal(internshipModal);

}


addButtons.forEach(function (button) {

    button.addEventListener(
        "click",
        openAddModal
    );

});


// ======================================================
// EDIT APPLICATION
// ======================================================

function editInternship(index) {

    const internship =
        internships[index];

    if (!internship) {
        return;
    }


    editingIndex = index;


    document.querySelector("#company").value =
        internship.company;

    document.querySelector("#position").value =
        internship.position;

    document.querySelector("#location").value =
        internship.location;

    document.querySelector("#status").value =
        internship.status;

    document.querySelector("#dateApplied").value =
        internship.dateApplied;

    document.querySelector("#deadline").value =
        internship.deadline;

    document.querySelector("#followUpDate").value =
        internship.followUpDate;

    document.querySelector("#salary").value =
        internship.salary;

    document.querySelector("#contact").value =
        internship.contact;

    document.querySelector("#jobLink").value =
        internship.jobLink;

    document.querySelector("#notes").value =
        internship.notes;


    modalTitle.textContent =
        "Edit Application";

    openModal(internshipModal);

}


// ======================================================
// DELETE APPLICATION
// ======================================================

function deleteInternship(index) {

    const internship =
        internships[index];

    if (!internship) {
        return;
    }


    const confirmed =
        confirm(
            `Delete your ${internship.company} application?`
        );


    if (!confirmed) {
        return;
    }


    internships.splice(
        index,
        1
    );


    saveInternships();

    renderAll();

    showToast(
        "Application deleted"
    );

}


// ======================================================
// FORM SUBMISSION
// ======================================================

internshipForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const company =
            document
                .querySelector("#company")
                .value
                .trim();

        const position =
            document
                .querySelector("#position")
                .value
                .trim();


        if (!company || !position) {

            showToast(
                "Company and position are required"
            );

            return;

        }


        const internship = {

            company: company,

            position: position,

            location:
                document
                    .querySelector("#location")
                    .value
                    .trim(),

            status:
                document
                    .querySelector("#status")
                    .value,

            dateApplied:
                document
                    .querySelector("#dateApplied")
                    .value,

            deadline:
                document
                    .querySelector("#deadline")
                    .value,

            followUpDate:
                document
                    .querySelector("#followUpDate")
                    .value,

            salary:
                document
                    .querySelector("#salary")
                    .value
                    .trim(),

            contact:
                document
                    .querySelector("#contact")
                    .value
                    .trim(),

            jobLink:
                document
                    .querySelector("#jobLink")
                    .value
                    .trim(),

            notes:
                document
                    .querySelector("#notes")
                    .value
                    .trim()

        };


        if (editingIndex === null) {

            internships.push(
                internship
            );

            showToast(
                "Application added"
            );

        } else {

            internships[editingIndex] =
                internship;

            showToast(
                "Application updated"
            );

        }


        saveInternships();

        closeModal(internshipModal);

        editingIndex = null;

        renderAll();

    }
);


// ======================================================
// APPLICATION TABLE
// ======================================================

function renderApplications() {

    if (!tableBody) {
        return;
    }


    const searchTerm =
        searchInput.value
            .trim()
            .toLowerCase();

    const selectedStatus =
        statusFilter.value;

    const sortValue =
        sortSelect.value;


    let filtered =
        internships.map(
            function (internship, index) {

                return {
                    ...internship,
                    originalIndex: index
                };

            }
        );


    // SEARCH

    filtered =
        filtered.filter(
            function (internship) {

                const searchableText =
                    [
                        internship.company,
                        internship.position,
                        internship.location,
                        internship.contact
                    ]
                    .join(" ")
                    .toLowerCase();


                const matchesSearch =
                    searchableText.includes(
                        searchTerm
                    );


                const matchesStatus =
                    selectedStatus === "All" ||
                    internship.status ===
                        selectedStatus;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    // SORT

    filtered.sort(
        function (a, b) {

            if (sortValue === "newest") {

                return (
                    getDateValue(
                        b.dateApplied
                    ) -
                    getDateValue(
                        a.dateApplied
                    )
                );

            }


            if (sortValue === "oldest") {

                return (
                    getDateValue(
                        a.dateApplied
                    ) -
                    getDateValue(
                        b.dateApplied
                    )
                );

            }


            if (sortValue === "companyAZ") {

                return a.company.localeCompare(
                    b.company
                );

            }


            if (sortValue === "companyZA") {

                return b.company.localeCompare(
                    a.company
                );

            }


            return 0;

        }
    );


    tableBody.innerHTML = "";


    resultsText.textContent =
        `${filtered.length} ${
            filtered.length === 1
                ? "application"
                : "applications"
        }`;


    if (filtered.length === 0) {

        emptyState.style.display =
            "block";

        return;

    }


    emptyState.style.display =
        "none";


    filtered.forEach(
        function (internship) {

            const row =
                document.createElement(
                    "tr"
                );


            const followUp =
                internship.followUpDate
                    ? formatDate(
                        internship.followUpDate
                    )
                    : "—";


            row.innerHTML = `

                <td>
                    <div class="company-name">
                        ${escapeHTML(
                            internship.company
                        )}
                    </div>
                </td>

                <td>
                    <div class="position-name">
                        ${escapeHTML(
                            internship.position
                        )}
                    </div>
                </td>

                <td class="location-text">
                    ${
                        internship.location
                            ? escapeHTML(
                                internship.location
                            )
                            : "—"
                    }
                </td>

                <td>
                    ${statusBadge(
                        internship.status
                    )}
                </td>

                <td class="date-text">
                    ${formatDate(
                        internship.dateApplied
                    )}
                </td>

                <td class="date-text">
                    ${followUp}
                </td>

                <td>

                    <div class="actions">

                        <button
                            class="action-button view-button"
                            onclick="viewInternship(
                                ${internship.originalIndex}
                            )"
                        >
                            View
                        </button>

                        <button
                            class="action-button"
                            onclick="editInternship(
                                ${internship.originalIndex}
                            )"
                        >
                            Edit
                        </button>

                        ${
                            internship.jobLink
                                ? `
                                <a
                                    class="action-button job-link"
                                    href="${safeURL(
                                        internship.jobLink
                                    )}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Job
                                </a>
                                `
                                : ""
                        }

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


            tableBody.appendChild(
                row
            );

        }
    );

}


// ======================================================
// DETAILS VIEW
// ======================================================

function viewInternship(index) {

    const internship =
        internships[index];

    if (!internship) {
        return;
    }


    document.querySelector(
        "#detailsTitle"
    ).textContent =
        internship.company;


    const detailsBody =
        document.querySelector(
            "#detailsBody"
        );


    detailsBody.innerHTML = `

        <div class="details-hero">

            <h3>
                ${escapeHTML(
                    internship.position
                )}
            </h3>

            <p>
                ${
                    internship.location
                        ? escapeHTML(
                            internship.location
                        )
                        : "Location not provided"
                }
            </p>

        </div>


        <div class="details-grid">

            ${detailBox(
                "Status",
                internship.status
            )}

            ${detailBox(
                "Date Applied",
                formatDate(
                    internship.dateApplied
                )
            )}

            ${detailBox(
                "Deadline",
                formatDate(
                    internship.deadline
                )
            )}

            ${detailBox(
                "Follow Up",
                formatDate(
                    internship.followUpDate
                )
            )}

            ${detailBox(
                "Salary / Pay",
                internship.salary || "—"
            )}

            ${detailBox(
                "Recruiter / Contact",
                internship.contact || "—"
            )}

        </div>


        <div class="details-section">

            <h4>Notes</h4>

            <p>
                ${
                    internship.notes
                        ? escapeHTML(
                            internship.notes
                        )
                        : "No notes added."
                }
            </p>

        </div>


        ${
            internship.jobLink
                ? `
                <a
                    class="details-link"
                    href="${safeURL(
                        internship.jobLink
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Open job posting ↗
                </a>
                `
                : ""
        }

    `;


    openModal(detailsModal);

}


function detailBox(label, value) {

    return `

        <div class="detail-box">

            <span>
                ${escapeHTML(label)}
            </span>

            <strong>
                ${escapeHTML(
                    value || "—"
                )}
            </strong>

        </div>

    `;

}


// ======================================================
// DASHBOARD STATS
// ======================================================

function updateStats() {

    const total =
        internships.length;

    const interviews =
        countStatus("Interview");

    const offers =
        countStatus("Offer");

    const applied =
        countStatus("Applied");

    const wishlist =
        countStatus("Wishlist");


    const responses =
        interviews + offers;


    const responseRate =
        percentage(
            responses,
            total
        );


    setText(
        "#applicationCount",
        total
    );

    setText(
        "#interviewCount",
        interviews
    );

    setText(
        "#offerCount",
        offers
    );

    setText(
        "#responseRate",
        `${responseRate}%`
    );


    setText(
        "#wishlistPipeline",
        wishlist
    );

    setText(
        "#appliedPipeline",
        applied
    );

    setText(
        "#interviewPipeline",
        interviews
    );

    setText(
        "#offerPipeline",
        offers
    );

}


// ======================================================
// RECENT APPLICATIONS
// ======================================================

function renderRecentApplications() {

    const container =
        document.querySelector(
            "#recentApplications"
        );


    const recent =
        internships
            .map(
                function (internship, index) {

                    return {
                        ...internship,
                        originalIndex: index
                    };

                }
            )
            .sort(
                function (a, b) {

                    return (
                        getDateValue(
                            b.dateApplied
                        ) -
                        getDateValue(
                            a.dateApplied
                        )
                    );

                }
            )
            .slice(0, 5);


    if (recent.length === 0) {

        container.innerHTML = `

            <div class="mini-empty">
                No applications yet.
                Add your first opportunity to get started.
            </div>

        `;

        return;

    }


    container.innerHTML = `

        <div class="recent-list">

            ${recent.map(
                function (internship) {

                    return `

                        <div class="recent-item">

                            <div class="recent-company">
                                ${escapeHTML(
                                    internship.company
                                )}
                            </div>

                            <div class="recent-role">
                                ${escapeHTML(
                                    internship.position
                                )}
                            </div>

                            <div>
                                ${statusBadge(
                                    internship.status
                                )}
                            </div>

                            <div class="recent-date">
                                ${formatDate(
                                    internship.dateApplied
                                )}
                            </div>

                        </div>

                    `;

                }
            ).join("")}

        </div>

    `;

}


// ======================================================
// NEEDS ATTENTION
// ======================================================

function renderAttention() {

    const container =
        document.querySelector(
            "#attentionList"
        );


    let attentionItems = [];


    internships.forEach(
        function (internship) {

            if (internship.followUpDate) {

                attentionItems.push({

                    company:
                        internship.company,

                    label:
                        "Follow up",

                    date:
                        internship.followUpDate

                });

            }


            if (internship.deadline) {

                attentionItems.push({

                    company:
                        internship.company,

                    label:
                        "Deadline",

                    date:
                        internship.deadline

                });

            }

        }
    );


    attentionItems.sort(
        function (a, b) {

            return (
                getDateValue(a.date) -
                getDateValue(b.date)
            );

        }
    );


    const todayValue =
        getDateValue(
            getToday()
        );


    attentionItems =
        attentionItems
            .filter(
                function (item) {

                    return (
                        getDateValue(
                            item.date
                        ) >=
                        todayValue
                    );

                }
            )
            .slice(0, 4);


    if (attentionItems.length === 0) {

        container.innerHTML = `

            <div class="mini-empty">
                Nothing urgent right now.
            </div>

        `;

        return;

    }


    container.innerHTML =
        attentionItems.map(
            function (item) {

                return `

                    <div class="attention-item">

                        <div>

                            <strong>
                                ${escapeHTML(
                                    item.company
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    item.label
                                )}
                            </span>

                        </div>

                        <span class="attention-date">
                            ${formatDate(
                                item.date
                            )}
                        </span>

                    </div>

                `;

            }
        ).join("");

}


// ======================================================
// INTERVIEWS
// ======================================================

function renderInterviews() {

    const container =
        document.querySelector(
            "#interviewCards"
        );


    const interviews =
        internships
            .map(
                function (internship, index) {

                    return {
                        ...internship,
                        originalIndex: index
                    };

                }
            )
            .filter(
                function (internship) {

                    return (
                        internship.status ===
                        "Interview"
                    );

                }
            );


    renderOpportunityCards(
        container,
        interviews,
        "No interviews yet",
        "Applications marked Interview will appear here."
    );

}


// ======================================================
// OFFERS
// ======================================================

function renderOffers() {

    const container =
        document.querySelector(
            "#offerCards"
        );


    const offers =
        internships
            .map(
                function (internship, index) {

                    return {
                        ...internship,
                        originalIndex: index
                    };

                }
            )
            .filter(
                function (internship) {

                    return (
                        internship.status ===
                        "Offer"
                    );

                }
            );


    renderOpportunityCards(
        container,
        offers,
        "No offers yet",
        "Keep applying. Offers marked in your tracker will appear here."
    );

}


// ======================================================
// OPPORTUNITY CARDS
// ======================================================

function renderOpportunityCards(
    container,
    applications,
    emptyTitle,
    emptyText
) {

    if (applications.length === 0) {

        container.innerHTML = `

            <div class="full-empty">

                <h3>
                    ${escapeHTML(
                        emptyTitle
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        emptyText
                    )}
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        applications.map(
            function (internship) {

                return `

                    <article class="opportunity-card">

                        <div class="opportunity-card-top">

                            <div>

                                <h3>
                                    ${escapeHTML(
                                        internship.company
                                    )}
                                </h3>

                                <p class="role">
                                    ${escapeHTML(
                                        internship.position
                                    )}
                                </p>

                            </div>

                            ${statusBadge(
                                internship.status
                            )}

                        </div>


                        <div class="card-info">

                            <div class="card-info-row">

                                <span>Location</span>

                                <strong>
                                    ${
                                        internship.location
                                            ? escapeHTML(
                                                internship.location
                                            )
                                            : "—"
                                    }
                                </strong>

                            </div>


                            <div class="card-info-row">

                                <span>Follow Up</span>

                                <strong>
                                    ${formatDate(
                                        internship.followUpDate
                                    )}
                                </strong>

                            </div>


                            <div class="card-info-row">

                                <span>Salary</span>

                                <strong>
                                    ${
                                        internship.salary
                                            ? escapeHTML(
                                                internship.salary
                                            )
                                            : "—"
                                    }
                                </strong>

                            </div>

                        </div>


                        ${
                            internship.notes
                                ? `
                                <p class="card-notes">
                                    ${escapeHTML(
                                        truncateText(
                                            internship.notes,
                                            120
                                        )
                                    )}
                                </p>
                                `
                                : ""
                        }


                        <button
                            class="secondary-button"
                            onclick="viewInternship(
                                ${internship.originalIndex}
                            )"
                        >
                            View Details
                        </button>

                    </article>

                `;

            }
        ).join("");

}


// ======================================================
// ANALYTICS
// ======================================================

function renderAnalytics() {

    const total =
        internships.length;

    const interviews =
        countStatus("Interview");

    const offers =
        countStatus("Offer");

    const rejected =
        countStatus("Rejected");


    setText(
        "#analyticsTotal",
        total
    );

    setText(
        "#analyticsInterviewRate",
        `${percentage(
            interviews,
            total
        )}%`
    );

    setText(
        "#analyticsOfferRate",
        `${percentage(
            offers,
            total
        )}%`
    );

    setText(
        "#analyticsRejectionRate",
        `${percentage(
            rejected,
            total
        )}%`
    );


    renderStatusBreakdown();

    renderSearchSummary();

}


// ======================================================
// STATUS BREAKDOWN
// ======================================================

function renderStatusBreakdown() {

    const container =
        document.querySelector(
            "#statusBreakdown"
        );


    const statuses = [
        "Wishlist",
        "Applied",
        "Assessment",
        "Interview",
        "Offer",
        "Rejected",
        "Withdrawn"
    ];


    if (internships.length === 0) {

        container.innerHTML = `

            <div class="mini-empty">
                Add applications to see analytics.
            </div>

        `;

        return;

    }


    container.innerHTML =
        statuses.map(
            function (status) {

                const count =
                    countStatus(status);

                const percent =
                    percentage(
                        count,
                        internships.length
                    );


                return `

                    <div class="breakdown-row">

                        <div class="breakdown-top">

                            <span>
                                ${escapeHTML(
                                    status
                                )}
                            </span>

                            <span>
                                ${count} · ${percent}%
                            </span>

                        </div>


                        <div class="breakdown-track">

                            <div
                                class="breakdown-fill"
                                style="width: ${percent}%"
                            ></div>

                        </div>

                    </div>

                `;

            }
        ).join("");

}


// ======================================================
// SEARCH SUMMARY
// ======================================================

function renderSearchSummary() {

    const container =
        document.querySelector(
            "#searchSummary"
        );


    const active =
        internships.filter(
            function (internship) {

                return ![
                    "Rejected",
                    "Withdrawn"
                ].includes(
                    internship.status
                );

            }
        ).length;


    const companies =
        new Set(
            internships
                .map(
                    function (internship) {

                        return internship.company
                            .trim()
                            .toLowerCase();

                    }
                )
                .filter(Boolean)
        ).size;


    const newest =
        internships
            .filter(
                function (internship) {

                    return internship.dateApplied;

                }
            )
            .sort(
                function (a, b) {

                    return (
                        getDateValue(
                            b.dateApplied
                        ) -
                        getDateValue(
                            a.dateApplied
                        )
                    );

                }
            )[0];


    container.innerHTML = `

        <div class="summary-row">

            <span>Active Opportunities</span>

            <strong>
                ${active}
            </strong>

        </div>


        <div class="summary-row">

            <span>Companies Tracked</span>

            <strong>
                ${companies}
            </strong>

        </div>


        <div class="summary-row">

            <span>Interviews</span>

            <strong>
                ${countStatus(
                    "Interview"
                )}
            </strong>

        </div>


        <div class="summary-row">

            <span>Offers</span>

            <strong>
                ${countStatus(
                    "Offer"
                )}
            </strong>

        </div>


        <div class="summary-row">

            <span>Latest Application</span>

            <strong>
                ${
                    newest
                        ? escapeHTML(
                            newest.company
                        )
                        : "—"
                }
            </strong>

        </div>

    `;

}


// ======================================================
// FILTER EVENTS
// ======================================================

searchInput.addEventListener(
    "input",
    renderApplications
);


statusFilter.addEventListener(
    "change",
    renderApplications
);


sortSelect.addEventListener(
    "change",
    renderApplications
);


// ======================================================
// MODALS
// ======================================================

function openModal(modal) {

    modal.classList.add("open");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";

}


function closeModal(modal) {

    modal.classList.remove("open");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";

}


closeButton.addEventListener(
    "click",
    function () {

        closeModal(
            internshipModal
        );

    }
);


cancelButton.addEventListener(
    "click",
    function () {

        closeModal(
            internshipModal
        );

    }
);


detailsCloseButton.addEventListener(
    "click",
    function () {

        closeModal(
            detailsModal
        );

    }
);


internshipModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            internshipModal
        ) {

            closeModal(
                internshipModal
            );

        }

    }
);


detailsModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            detailsModal
        ) {

            closeModal(
                detailsModal
            );

        }

    }
);


document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeModal(
                internshipModal
            );

            closeModal(
                detailsModal
            );

        }

    }
);


// ======================================================
// TOAST
// ======================================================

let toastTimeout;


function showToast(message) {

    clearTimeout(
        toastTimeout
    );


    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );


    toastTimeout =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            2200
        );

}


// ======================================================
// GENERAL HELPERS
// ======================================================

function countStatus(status) {

    return internships.filter(
        function (internship) {

            return (
                internship.status ===
                status
            );

        }
    ).length;

}


function percentage(value, total) {

    if (total === 0) {
        return 0;
    }


    return Math.round(
        (value / total) * 100
    );

}


function getToday() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


function getDateValue(date) {

    if (!date) {
        return 0;
    }


    const parsed =
        new Date(
            `${date}T00:00:00`
        );


    const value =
        parsed.getTime();


    return Number.isNaN(value)
        ? 0
        : value;

}


function formatDate(date) {

    if (!date) {
        return "—";
    }


    const parsed =
        new Date(
            `${date}T00:00:00`
        );


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return "—";

    }


    return parsed.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

}


function statusBadge(status) {

    const safeStatus =
        status || "Applied";


    return `

        <span
            class="status ${safeStatus.toLowerCase()}"
        >
            ${escapeHTML(
                safeStatus
            )}
        </span>

    `;

}


function setText(selector, value) {

    const element =
        document.querySelector(
            selector
        );


    if (element) {

        element.textContent =
            value;

    }

}


function truncateText(text, maxLength) {

    if (!text) {
        return "";
    }


    if (
        text.length <= maxLength
    ) {

        return text;

    }


    return (
        text.slice(
            0,
            maxLength
        ) + "..."
    );

}


function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value || "";


    return div.innerHTML;

}


function safeURL(value) {

    if (!value) {
        return "#";
    }


    try {

        const url =
            new URL(value);


        if (
            url.protocol === "http:" ||
            url.protocol === "https:"
        ) {

            return escapeHTML(
                url.href
            );

        }

    } catch (error) {

        return "#";

    }


    return "#";

}


// ======================================================
// RENDER EVERYTHING
// ======================================================

function renderAll() {

    updateStats();

    renderApplications();

    renderRecentApplications();

    renderAttention();

    renderInterviews();

    renderOffers();

    renderAnalytics();

}


// ======================================================
// INITIAL LOAD
// ======================================================

renderAll();