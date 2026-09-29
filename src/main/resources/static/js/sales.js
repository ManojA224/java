document.addEventListener("DOMContentLoaded", () => {

    const user = getStoredUser();

    if (!user) {
        window.location.href = "/login";
        return;
    }

    const salesList =
        document.getElementById("salesList");

    const filterForm =
        document.getElementById("salesFilterForm");

    const startDate =
        document.getElementById("startDate");

    const endDate =
        document.getElementById("endDate");


    let sales = [];


    loadSales();


    if (filterForm) {

        filterForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                loadSales();
            }
        );
    }


    async function loadSales() {

        showLoading();


        try {

            let url = "/api/sales";

            const params =
                new URLSearchParams();


            if (
                startDate &&
                startDate.value
            ) {

                params.append(
                    "startDate",
                    startDate.value
                );
            }


            if (
                endDate &&
                endDate.value
            ) {

                params.append(
                    "endDate",
                    endDate.value
                );
            }


            if (params.toString()) {

                url +=
                    "?" +
                    params.toString();
            }


            const response =
                await fetch(url);


            const data =
                await response
                    .json()
                    .catch(() => []);


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load sales."
                );
            }


            sales =
                Array.isArray(data)
                    ? data
                    : data.content || [];


            updateSummary();

            renderSales();


        } catch (error) {

            console.error(
                "Sales loading error:",
                error
            );


            showError(
                error.message ||
                "Unable to load sales."
            );
        }
    }


    function updateSummary() {

        const countElement =
            document.getElementById(
                "salesCount"
            );


        const revenueElement =
            document.getElementById(
                "salesRevenue"
            );


        const totalRevenue =
            sales.reduce(
                (sum, sale) =>
                    sum +
                    Number(
                        sale.totalAmount ??
                        sale.total ??
                        0
                    ),
                0
            );


        if (countElement) {

            countElement.textContent =
                formatNumber(
                    sales.length
                );
        }


        if (revenueElement) {

            revenueElement.textContent =
                formatCurrency(
                    totalRevenue
                );
        }
    }


    function renderSales() {

        if (!salesList) {
            return;
        }


        if (
            !Array.isArray(sales) ||
            sales.length === 0
        ) {

            salesList.innerHTML = `
                <div class="empty-state">

                    <div class="empty-state-icon">
                        🧾
                    </div>

                    <div class="empty-state-title">
                        No sales found
                    </div>

                    <p>
                        Completed transactions will appear here.
                    </p>

                </div>
            `;

            return;
        }


        salesList.innerHTML = `

            <div class="table-container">

                <table>

                    <thead>

                        <tr>

                            <th>
                                Bill No.
                            </th>

                            <th>
                                Date
                            </th>

                            <th>
                                Items
                            </th>

                            <th>
                                Amount
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Action
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        ${sales.map(
                            sale => {

                                const id =
                                    sale.id ||
                                    sale.saleId;


                                const billNumber =
                                    sale.billNumber ||
                                    `#${id || "-"}`;


                                const date =
                                    sale.saleDate ||
                                    sale.createdAt;


                                const items =
                                    sale.items ||
                                    sale.saleItems ||
                                    [];


                                const itemCount =
                                    Array.isArray(items)
                                        ? items.reduce(
                                            (
                                                total,
                                                item
                                            ) =>
                                                total +
                                                Number(
                                                    item.quantity ||
                                                    0
                                                ),
                                            0
                                        )
                                        : (
                                            sale.itemCount ||
                                            0
                                        );


                                const amount =
                                    sale.totalAmount ??
                                    sale.total ??
                                    0;


                                return `

                                    <tr>

                                        <td>

                                            <strong>
                                                ${escapeHtml(
                                                    billNumber
                                                )}
                                            </strong>

                                        </td>


                                        <td>
                                            ${formatDateTime(
                                                date
                                            )}
                                        </td>


                                        <td>
                                            ${formatNumber(
                                                itemCount
                                            )}
                                        </td>


                                        <td>

                                            <strong>
                                                ${formatCurrency(
                                                    amount
                                                )}
                                            </strong>

                                        </td>


                                        <td>

                                            <span
                                                class="badge badge-success"
                                            >
                                                Completed
                                            </span>

                                        </td>


                                        <td>

                                            <a
                                                href="/bill?id=${encodeURIComponent(
                                                    id
                                                )}"
                                                class="btn btn-outline"
                                                style="
                                                    min-height:34px;
                                                    padding:6px 11px;
                                                "
                                            >
                                                View Bill
                                            </a>

                                        </td>

                                    </tr>

                                `;
                            }
                        ).join("")}

                    </tbody>

                </table>

            </div>

        `;
    }


    function clearFilter() {

        if (startDate) {
            startDate.value = "";
        }


        if (endDate) {
            endDate.value = "";
        }


        loadSales();
    }


    window.clearFilter =
        clearFilter;


    function showLoading() {

        if (!salesList) {
            return;
        }


        salesList.innerHTML = `

            <div class="loading">

                <div class="spinner"></div>

                Loading sales...

            </div>

        `;
    }


    function showError(message) {

        if (!salesList) {
            return;
        }


        salesList.innerHTML = `

            <div class="alert alert-danger">

                ${escapeHtml(message)}

            </div>

        `;
    }


    function getStoredUser() {

        const stored =
            sessionStorage.getItem(
                "shopliteUser"
            );


        if (!stored) {
            return null;
        }


        try {

            return JSON.parse(
                stored
            );

        } catch {

            return {
                username: stored
            };
        }
    }


    function formatNumber(value) {

        return new Intl.NumberFormat(
            "en-IN"
        ).format(
            Number(value || 0)
        );
    }


    function formatCurrency(value) {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2
            }
        ).format(
            Number(value || 0)
        );
    }


    function formatDateTime(value) {

        if (!value) {
            return "—";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "—";
        }


        return date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }


    function escapeHtml(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }


        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }

});