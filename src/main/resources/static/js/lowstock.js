document.addEventListener("DOMContentLoaded", () => {

    const user = getStoredUser();

    if (!user) {
        window.location.href = "/login";
        return;
    }

    const listContainer =
        document.getElementById("lowStockList");


    loadLowStock();


    async function loadLowStock() {

        showLoading();


        try {

            const response =
                await fetch("/api/products/low-stock");


            const data =
                await response
                    .json()
                    .catch(() => []);


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load stock information."
                );
            }


            const products =
                Array.isArray(data)
                    ? data
                    : data.content || [];


            updateSummary(products);

            renderProducts(products);


        } catch (error) {

            console.error(
                "Low stock loading error:",
                error
            );


            /*
             * Fallback:
             * If a dedicated low-stock endpoint is not
             * available yet, retrieve all products and
             * calculate low-stock products locally.
             */
            await loadFromAllProducts(error);
        }
    }


    async function loadFromAllProducts(
        originalError
    ) {

        try {

            const response =
                await fetch("/api/products");


            const data =
                await response
                    .json()
                    .catch(() => []);


            if (!response.ok) {

                throw originalError;
            }


            const products =
                Array.isArray(data)
                    ? data
                    : data.content || [];


            const lowStockProducts =
                products.filter(product => {

                    const stock =
                        Number(
                            product.stockQuantity ??
                            product.stock ??
                            0
                        );


                    const reorderLevel =
                        Number(
                            product.reorderLevel ??
                            product.minimumStock ??
                            5
                        );


                    return (
                        stock <= reorderLevel
                    );
                });


            updateSummary(
                lowStockProducts
            );

            renderProducts(
                lowStockProducts
            );


        } catch (error) {

            console.error(
                "Fallback stock loading error:",
                error
            );


            showError(
                error.message ||
                "Unable to load stock information."
            );
        }
    }


    function updateSummary(products) {

        const lowStockCount =
            document.getElementById(
                "lowStockCount"
            );


        const outOfStockCount =
            document.getElementById(
                "outOfStockCount"
            );


        const outOfStock =
            products.filter(
                product =>
                    Number(
                        product.stockQuantity ??
                        product.stock ??
                        0
                    ) <= 0
            ).length;


        if (lowStockCount) {

            lowStockCount.textContent =
                formatNumber(
                    products.length
                );
        }


        if (outOfStockCount) {

            outOfStockCount.textContent =
                formatNumber(
                    outOfStock
                );
        }
    }


    function renderProducts(products) {

        if (!listContainer) {
            return;
        }


        if (
            !Array.isArray(products) ||
            products.length === 0
        ) {

            listContainer.innerHTML = `

                <div class="empty-state">

                    <div class="empty-state-icon">
                        ✓
                    </div>

                    <div class="empty-state-title">
                        No Low Stock Products
                    </div>

                    <p>
                        All products currently have sufficient stock.
                    </p>

                </div>

            `;

            return;
        }


        listContainer.innerHTML = `

            <div class="table-container">

                <table>

                    <thead>

                        <tr>

                            <th>
                                Product
                            </th>

                            <th>
                                Category
                            </th>

                            <th>
                                Current Stock
                            </th>

                            <th>
                                Reorder Level
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

                        ${products.map(
                            product =>
                                createProductRow(
                                    product
                                )
                        ).join("")}

                    </tbody>

                </table>

            </div>

        `;
    }


    function createProductRow(product) {

        const id =
            product.id;


        const name =
            product.name ||
            "Unnamed Product";


        const category =
            product.category ||
            "General";


        const stock =
            Number(
                product.stockQuantity ??
                product.stock ??
                0
            );


        const reorderLevel =
            Number(
                product.reorderLevel ??
                product.minimumStock ??
                5
            );


        const isOutOfStock =
            stock <= 0;


        const statusClass =
            isOutOfStock
                ? "badge-danger"
                : "badge-warning";


        const statusText =
            isOutOfStock
                ? "Out of Stock"
                : "Low Stock";


        return `

            <tr>

                <td>

                    <strong>
                        ${escapeHtml(name)}
                    </strong>

                </td>


                <td>
                    ${escapeHtml(category)}
                </td>


                <td>

                    <strong
                        class="${
                            isOutOfStock
                                ? "text-danger"
                                : "text-warning"
                        }"
                    >
                        ${stock}
                    </strong>

                </td>


                <td>
                    ${reorderLevel}
                </td>


                <td>

                    <span
                        class="badge ${statusClass}"
                    >
                        ${statusText}
                    </span>

                </td>


                <td>

                    <a
                        href="/edit-product?id=${encodeURIComponent(
                            id
                        )}"
                        class="btn btn-outline"
                        style="
                            min-height:34px;
                            padding:6px 11px;
                        "
                    >
                        Update Stock
                    </a>

                </td>

            </tr>

        `;
    }


    function showLoading() {

        if (!listContainer) {
            return;
        }


        listContainer.innerHTML = `

            <div class="loading">

                <div class="spinner"></div>

                Checking stock levels...

            </div>

        `;
    }


    function showError(message) {

        if (!listContainer) {
            return;
        }


        listContainer.innerHTML = `

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