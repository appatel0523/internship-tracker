// ======================================================
// INTERNTRACK V3
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

let internships = [];
let editingIndex = null;

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

async function deleteInternship(index) {
    const item = internships[index];
    if (!item || busy || !currentUser) return;
    try {
        const migration = JSON.parse(localStorage.getItem(MIGRATION_KEY) || "null");
        if (migration?.userId === currentUser.id && !migration.complete) {
            showNotice("Finish importing before deleting applications. Press Refresh to retry the import safely.");
            return;
        }
    } catch {
        showNotice("Could not check the import checkpoint. Restore browser storage access before deleting.");
        return;
    }
    if (!confirm(`Delete your ${item.company} application?`)) return;
    const userId = currentUser.id;
    const version = sessionVersion;
    setBusy(true, "Deleting application…");
    try {
        const { data, error } = await db.from("applications").delete().eq("id", item.id).eq("user_id", userId).select("id");
        if (error) throw error;
        if (!data.length) throw new Error("This application could not be deleted. Refresh and try again.");
        if (version !== sessionVersion) return;
        internships = internships.filter(row => row.id !== item.id);
        renderAll();
        showToast("Application deleted");
    } catch (error) { if (version === sessionVersion) showNotice(error.message); }
    finally { if (version === sessionVersion) setBusy(false); }
}


// ======================================================
// FORM SUBMISSION
// ======================================================

internshipForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();
        if (busy || !currentUser) return;


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


        const existing = editingIndex === null ? null : internships[editingIndex];
        const userId = currentUser.id;
        const version = sessionVersion;
        setBusy(true, "Saving application…");
        try {
            const row = toDatabase(internship, userId);
            const request = existing
                ? db.from("applications").update(row).eq("id", existing.id).eq("user_id", userId)
                : db.from("applications").insert(row);
            const { data, error } = await request.select().single();
            if (error) throw error;
            if (version !== sessionVersion) return;
            const saved = fromDatabase(data);
            if (existing) internships = internships.map(item => item.id === existing.id ? saved : item);
            else internships.push(saved);
            closeModal(internshipModal);
            editingIndex = null;
            renderAll();
            showToast(existing ? "Application updated" : "Application added");
        } catch (error) { if (version === sessionVersion) showNotice("Save failed. Your form is still here. " + error.message); }
        finally { if (version === sessionVersion) setBusy(false); }

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

        if (event.key === "Escape" && !busy) {

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
            class="status ${escapeHTML(safeStatus.toLowerCase())}"
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


    return div.innerHTML.replace(/"/g, "&quot;").replace(/'/g, "&#39;");

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
// Supabase JS v2: only the public browser key belongs in this file.
const PROJECT_URL = "https://yyvjihkkivtmlayxygaa.supabase.co";
const PUBLISHABLE_KEY = "sb_publishable_8S6GjlXcxRem0Ic1VOikKA_vZf8iDKa";
const $ = selector => document.querySelector(selector);
const db = window.supabase?.createClient(PROJECT_URL, PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});
let currentUser = null;
let sessionVersion = 0;
let busy = false;
let authMode = "login";
let authPending = false;
let sessionKnown = false;

function toDatabase(item, userId) {
    const n = normalizeInternship(item);
    return {
        user_id: userId, company: n.company, position: n.position,
        location: n.location, status: n.status, date_applied: n.dateApplied || null,
        deadline: n.deadline || null, follow_up_date: n.followUpDate || null,
        salary: n.salary, recruiter: n.contact, job_link: n.jobLink, notes: n.notes
    };
}
function fromDatabase(row) {
    return { ...normalizeInternship({ ...row, dateApplied: row.date_applied,
        followUpDate: row.follow_up_date, contact: row.recruiter, jobLink: row.job_link }), id: row.id };
}
function showNotice(message = "") {
    $("#cloudNotice").textContent = message;
    $("#cloudNotice").hidden = !message;
}
function setBusy(value, message = "Loading your applications…") {
    busy = value;
    $("#loadingText").textContent = message;
    $("#loadingScreen").hidden = !value;
    $("#appShell").inert = value;
    internshipModal.inert = value;
    detailsModal.inert = value;
}
function setAuthMode(mode) {
    authMode = mode;
    $("#authSubmit").textContent = mode === "login" ? "Log in" : "Create account";
    $("#authPassword").autocomplete = mode === "login" ? "current-password" : "new-password";
    $("#authPassword").minLength = mode === "login" ? 1 : 8;
    $("#passwordHint").hidden = mode === "login";
    for (const [id, active] of [["#loginTab", mode === "login"], ["#signupTab", mode === "signup"]]) {
        $(id).classList.toggle("active", active);
        $(id).setAttribute("aria-pressed", String(active));
    }
    $("#authMessage").textContent = "";
}
$("#loginTab").onclick = () => setAuthMode("login");
$("#signupTab").onclick = () => setAuthMode("signup");
$("#authForm").addEventListener("submit", async event => {
    event.preventDefault();
    if (authPending || !db) return;
    authPending = true;
    $("#authSubmit").disabled = true;
    $("#loginTab").disabled = $("#signupTab").disabled = true;
    $("#authMessage").textContent = "Connecting…";
    try {
        const credentials = { email: $("#authEmail").value.trim(), password: $("#authPassword").value };
        // Keep the GitHub Pages repository path; no server-only callback route.
        const redirect = new URL("./", window.location.href).href;
        const { data, error } = authMode === "signup"
            ? await db.auth.signUp({ ...credentials, options: { emailRedirectTo: redirect } })
            : await db.auth.signInWithPassword(credentials);
        if (error) throw error;
        $("#authPassword").value = "";
        $("#authMessage").textContent = data.session ? "Signed in." : "Check your email for a confirmation link, then log in here.";
    } catch (error) { $("#authMessage").textContent = error.message; }
    finally {
        authPending = false;
        $("#authSubmit").disabled = false;
        $("#loginTab").disabled = $("#signupTab").disabled = false;
    }
});

// A durable journal is bound to the first importing account. The original key is
// never modified or removed. Completed IDs act as tombstones after cloud deletes.
const MIGRATION_KEY = "interntrack-v3-migration";
async function stableImportId(userId, item, index) {
    const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(
        JSON.stringify(["interntrack-v3", userId, index, normalizeInternship(item)])));
    const hex = Array.from(new Uint8Array(bytes)).map(b => b.toString(16).padStart(2,"0")).join("");
    // 52-bit negative integers are exact in JavaScript and fit Postgres bigint.
    // Negative IDs keep imported rows separate from the positive identity sequence.
    return -(parseInt(hex.slice(0, 13), 16) + 1);
}
async function migrateLocal(userId, version) {
    if (!localStorage.getItem("internships")) return;
    const run = async () => {
        if (version !== sessionVersion) return;
        const raw = localStorage.getItem("internships");
        if (!raw) return;
        let journal = JSON.parse(localStorage.getItem(MIGRATION_KEY) || "null");
        if (journal && journal.userId !== userId) {
            return "Browser data belongs to a different importing account and has not been copied into this account.";
        }
        if (journal?.complete) return;
        if (!journal) {
            const items = JSON.parse(raw);
            if (!Array.isArray(items)) throw new Error("The old browser data is not a valid application list.");
            if (!items.length) return;
            if (items.some(item => !item || typeof item !== "object" || Array.isArray(item) ||
                Object.values(item).some(value => value != null && typeof value === "object") || !item.company || !item.position)) {
                throw new Error("Some old applications are invalid. The original data has been kept unchanged.");
            }
            const rows = await Promise.all(items.map(async (item, index) => ({
                ...toDatabase(item, userId), id: await stableImportId(userId, item, index)
            })));
            journal = { userId, rows, complete: false };
            // Must succeed BEFORE uploading. Storage failures cannot silently lose the checkpoint.
            localStorage.setItem(MIGRATION_KEY, JSON.stringify(journal));
        }
        // Repair the failed UUID checkpoint without touching the original local data.
        // PostgreSQL rejected that entire batch before inserting any rows.
        if (journal.rows.some(row => typeof row.id === "string" && row.id.includes("-"))) {
            journal.rows = await Promise.all(journal.rows.map(async (row, index) => ({
                ...row, id: await stableImportId(userId, fromDatabase(row), index)
            })));
            localStorage.setItem(MIGRATION_KEY, JSON.stringify(journal));
        }
        if (new Set(journal.rows.map(row => row.id)).size !== journal.rows.length) {
            throw new Error("Import IDs conflict. Your local data has been retained.");
        }
        if (version !== sessionVersion) return;
        // A single atomic batch plus stable primary keys makes interrupted retries idempotent.
        // DO NOTHING on conflicts preserves any already edited cloud records.
        const { error } = await db.from("applications").upsert(journal.rows, { onConflict: "id", ignoreDuplicates: true });
        if (error) throw error;
        if (version !== sessionVersion) return;
        journal.complete = true;
        localStorage.setItem(MIGRATION_KEY, JSON.stringify(journal));
        return "Your browser applications have been imported. The original local backup has been retained.";
    };
    // Serialize imports across tabs on supported browsers; stable IDs also guard retries.
    if (!navigator.locks) throw new Error("Safe import requires a browser with Web Locks support. Your local data is unchanged.");
    return navigator.locks.request("interntrack-v3-import", run);
}
async function fetchApplications(userId) {
    const rows = [];
    for (let start = 0; ; start += 500) {
        const { data, error } = await db.from("applications").select("*").eq("user_id", userId).order("id").range(start, start + 499);
        if (error) throw error;
        rows.push(...data);
        if (data.length < 500) break;
    }
    return rows.map(fromDatabase);
}
async function refreshCloud() {
    if (!currentUser || busy || internshipModal.classList.contains("open")) return;
    const version = sessionVersion;
    const userId = currentUser.id;
    setBusy(true);
    showNotice();
    let migrationMessage = "";
    try {
        try { migrationMessage = await migrateLocal(userId, version) || ""; }
        catch (error) { migrationMessage = "Import not completed; local data is safe. Press Refresh to retry. " + error.message; }
        if (version !== sessionVersion) return;
        const rows = await fetchApplications(userId);
        if (version !== sessionVersion) return;
        closeModal(detailsModal);
        internships = rows;
        renderAll();
        showNotice(migrationMessage);
    } catch (error) {
        if (version === sessionVersion) showNotice([migrationMessage, "Could not load cloud applications. Press Refresh to retry. " + error.message].filter(Boolean).join(" "));
    } finally { if (version === sessionVersion) setBusy(false); }
}
async function applySession(session) {
    const user = session?.user || null;
    if (sessionKnown && currentUser?.id === user?.id) return;
    sessionKnown = true;
    sessionVersion++;
    currentUser = user;
    internships = [];
    editingIndex = null;
    internshipForm.reset();
    searchInput.value = "";
    statusFilter.value = "All";
    closeModal(internshipModal);
    closeModal(detailsModal);
    renderAll();
    showNotice();
    setBusy(false);
    $("#authScreen").hidden = !!user;
    $("#appShell").hidden = !user;
    $("#signedInEmail").textContent = user?.email || "";
    if (user) await refreshCloud();
}
$("#refreshButton").onclick = refreshCloud;
$("#logoutButton").onclick = async () => {
    if (!db || busy) return;
    setBusy(true, "Signing out…");
    try {
        const { error } = await db.auth.signOut({ scope: "local" });
        if (error) throw error;
        await applySession(null);
        $("#authMessage").textContent = "You have been signed out.";
    } catch (error) { showNotice("Could not sign out. " + error.message); }
    finally { setBusy(false); }
};
window.addEventListener("focus", () => { if (currentUser && !busy) refreshCloud(); });
window.addEventListener("online", refreshCloud);
if (!db) {
    setBusy(false);
    $("#authScreen").hidden = false;
    $("#authSubmit").disabled = true;
    $("#authMessage").textContent = "Could not load the sign-in service. Check your connection and reload this page.";
} else {
    // Do not await other Supabase calls inside its synchronous auth callback.
    db.auth.onAuthStateChange((_event, session) => { setTimeout(() => applySession(session), 0); });
    db.auth.getSession().then(({ data, error }) => {
        if (error) throw error;
        if (!sessionKnown) return applySession(data.session);
    }).catch(error => {
        if (!sessionKnown) {
            applySession(null);
            $("#authMessage").textContent = "Could not restore your session. " + error.message;
        }
    });
}
