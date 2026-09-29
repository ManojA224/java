document.addEventListener("DOMContentLoaded", () => {

    const user = getStoredUser();

    if (!user) {
        window.location.href = "/login";
        return;
    }

    loadDashboard();


    async function loadDashboard() {

        try {

            const response = await fetch("/api/sales/dashboard");

            const data =
                await response.json()
                    .catch(() => ({}));


            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to load dashboard."
                );
            }


            updateDashboard(data);

        } catch (error) {

            console.error(
                "Dashboard loading error:",
                error
            );

            /*
             * If the dashboard API is not available yet,
             * keep the page usable instead of breaking it.
             */
            updateDashboard({
                totalProducts: 0,
                lowStockProducts: 0,
                totalSales: 0,
                totalRevenue: 0
            });
        }
    }


    function updateDashboard(data) {

        setText(
            "totalProducts",
            formatNumber(
                data.totalProducts ??
                data.productCount ??
                0
            )
        );


        setText(
            "lowStockProducts",
            formatNumber(
                data.lowStockProducts ??
                data.lowStockCount ??
                0
            )
        );


        setText(
            "totalSales",
            formatNumber(
                data.totalSales ??
                data.salesCount ??
                0
            )
        );


        setText(
            "totalRevenue",
            formatCurrency(
                data.totalRevenue ??
                data.revenue ??
                0
            )
        );


        updateRecentSales(
            data.recentSales ||
            data.sales ||
            []
        );


        updateLowStock(
            data.lowStock ||
            data.lowStockProductsList ||
            []
        );
    }


    function updateRecentSales(sales) {

        const container =
            document.getElementById(
                "recentSales"
            );


        if (!container) {
            return;
        }


        if (!Array.isArray(sales) ||
            sales.length === 0) {

            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        🧾
                    </div>

                    <div class="empty-state-title">
                        No recent sales
                    </div>

                    <p>
                        Completed bills will appear here.
                    </p>
                </div>
            `;

            return;
        }


        container.innerHTML = sales
            .slice(0, 5)
            .map((sale) => {

                const billNumber =
                    sale.billNumber ||
                    `#${sale.id || "-"}`;

                const amount =
                    sale.totalAmount ??
                    sale.total ??
                    0;

                const date =
                    sale.saleDate ||
                    sale.createdAt;


                return `
                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            align-items:center;
                            gap:15px;
                            padding:13px 0;
                            border-bottom:1px solid var(--border);
                        "
                    >

                        <div>

                            <strong>
                                ${escapeHtml(
                                    billNumber
                                )}
                            </strong>

                            <div
                                class="text-muted"
                                style="font-size:12px;"
                            >
                                ${formatDateTime(date)}
                            </div>

                        </div>

                        <strong>
                            ${formatCurrency(amount)}
                        </strong>

                    </div>
                `;

            })
            .join("");
    }


    function updateLowStock(products) {

        const container =
            document.getElementById(
                "lowStockProductsList"
            );


        if (!container) {
            return;
        }


        if (!Array.isArray(products) ||
            products.length === 0) {

            container.innerHTML = `
                <div class="empty-state">

                    <div class="empty-state-icon">
                        ✓
                    </div>

                    <div class="empty-state-title">
                        Stock levels are healthy
                    </div>

                    <p>
                        No products currently require attention.
                    </p>

                </div>
            `;

            return;
        }


        container.innerHTML = products
            .slice(0, 5)
            .map((product) => {

                const stock =
                    Number(
                        product.stockQuantity ??
                        product.stock ??
                        0
                    );

                const reorderLevel =
                    Number(
                        product.reorderLevel ??
                        0
                    );


                return `
                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            align-items:center;
                            gap:15px;
                            padding:13px 0;
                            border-bottom:1px solid var(--border);
                        "
                    >

                        <div>

                            <strong>
                                ${escapeHtml(
                                    product.name ||
                                    "Product"
                                )}
                            </strong>

                            <div
                                class="text-muted"
                                style="font-size:12px;"
                            >
                                Reorder level:
                                ${reorderLevel}
                            </div>

                        </div>

                        <span class="badge ${
                            stock === 0
                                ? "badge-danger"
                                : "badge-warning"
                        }">
                            ${stock} left
                        </span>

                    </div>
                `;

            })
            .join("");
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

            return JSON.parse(stored);

        } catch {

            return {
                username: stored
            };
        }
    }


    function setText(
        elementId,
        value
    ) {

        const element =
            document.getElementById(
                elementId
            );


        if (element) {
            element.textContent = value;
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