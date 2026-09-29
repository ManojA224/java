document.addEventListener("DOMContentLoaded", () => {

    const user = getStoredUser();

    if (!user) {
        window.location.href = "/login";
        return;
    }

    const productList =
        document.getElementById("productList");

    const searchInput =
        document.getElementById("searchInput");

    const categoryFilter =
        document.getElementById("categoryFilter");


    let products = [];


    loadProducts();


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyFilters
        );
    }


    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            applyFilters
        );
    }


    async function loadProducts() {

        showLoading();


        try {

            const response =
                await fetch("/api/products");


            const data =
                await response
                    .json()
                    .catch(() => []);


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load products."
                );
            }


            products =
                Array.isArray(data)
                    ? data
                    : data.content || [];


            populateCategories();

            renderProducts(products);


        } catch (error) {

            console.error(
                "Product loading error:",
                error
            );


            showError(
                error.message ||
                "Unable to load products."
            );
        }
    }


    function applyFilters() {

        const search =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        const category =
            categoryFilter
                ? categoryFilter.value
                : "";


        const filtered =
            products.filter(product => {

                const name =
                    String(
                        product.name || ""
                    ).toLowerCase();


                const productCategory =
                    String(
                        product.category || ""
                    );


                const matchesSearch =
                    !search ||
                    name.includes(search);


                const matchesCategory =
                    !category ||
                    productCategory === category;


                return (
                    matchesSearch &&
                    matchesCategory
                );
            });


        renderProducts(filtered);
    }


    function populateCategories() {

        if (!categoryFilter) {
            return;
        }


        const categories =
            [
                ...new Set(
                    products
                        .map(
                            product =>
                                product.category
                        )
                        .filter(Boolean)
                )
            ]
            .sort();


        categoryFilter.innerHTML = `
            <option value="">
                All Categories
            </option>
        `;


        categories.forEach(category => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category;

            option.textContent =
                category;


            categoryFilter.appendChild(
                option
            );
        });
    }


    function renderProducts(items) {

        if (!productList) {
            return;
        }


        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {

            productList.innerHTML = `
                <div class="empty-state">

                    <div class="empty-state-icon">
                        □
                    </div>

                    <div class="empty-state-title">
                        No products found
                    </div>

                    <p>
                        Try changing your search or category filter.
                    </p>

                </div>
            `;

            return;
        }


        productList.innerHTML =
            items.map(product => {

                const id =
                    product.id;


                const name =
                    product.name ||
                    "Unnamed Product";


                const category =
                    product.category ||
                    "General";


                const price =
                    Number(
                        product.price || 0
                    );


                const stock =
                    Number(
                        product.stockQuantity ??
                        product.stock ??
                        0
                    );


                const image =
                    product.imageUrl ||
                    "/images/default-product.jpg";


                const stockClass =
                    stock === 0
                        ? "badge-danger"
                        : stock <= 5
                            ? "badge-warning"
                            : "badge-success";


                const stockText =
                    stock === 0
                        ? "Out of stock"
                        : `${stock} in stock`;


                return `
                    <article class="product-card">

                        <img
                            class="product-image"
                            src="${escapeHtml(image)}"
                            alt="${escapeHtml(name)}"
                            onerror="
                                this.src='/images/default-product.jpg'
                            "
                        >

                        <div class="product-card-body">

                            <div class="product-name">
                                ${escapeHtml(name)}
                            </div>

                            <div class="product-category">
                                ${escapeHtml(category)}
                            </div>

                            <div class="product-price">
                                ${formatCurrency(price)}
                            </div>

                            <div
                                class="product-stock"
                                style="margin-top:8px;"
                            >

                                <span
                                    class="badge ${stockClass}"
                                >
                                    ${stockText}
                                </span>

                            </div>

                            <div class="product-actions">

                                <a
                                    href="/edit-product?id=${encodeURIComponent(id)}"
                                    class="btn btn-outline"
                                    style="flex:1;"
                                >
                                    Edit
                                </a>

                                <button
                                    type="button"
                                    class="btn btn-danger"
                                    style="flex:1;"
                                    onclick="
                                        deleteProduct(${Number(id)})
                                    "
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    </article>
                `;

            }).join("");
    }


    window.deleteProduct =
        async function(productId) {

            if (!productId) {
                return;
            }


            const confirmed =
                window.confirm(
                    "Are you sure you want to delete this product?"
                );


            if (!confirmed) {
                return;
            }


            try {

                const response =
                    await fetch(
                        `/api/products/${encodeURIComponent(
                            productId
                        )}`,
                        {
                            method: "DELETE"
                        }
                    );


                const data =
                    await response
                        .json()
                        .catch(() => ({}));


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to delete product."
                    );
                }


                products =
                    products.filter(
                        product =>
                            Number(product.id) !==
                            Number(productId)
                    );


                populateCategories();

                applyFilters();


                showMessage(
                    "Product deleted successfully.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Delete product error:",
                    error
                );


                showMessage(
                    error.message ||
                    "Unable to delete product.",
                    "error"
                );
            }
        };


    function showLoading() {

        if (!productList) {
            return;
        }


        productList.innerHTML = `
            <div class="loading">

                <div class="spinner"></div>

                Loading products...

            </div>
        `;
    }


    function showError(message) {

        if (!productList) {
            return;
        }


        productList.innerHTML = `
            <div class="alert alert-danger">
                ${escapeHtml(message)}
            </div>
        `;
    }


    function showMessage(
        message,
        type
    ) {

        const box =
            document.getElementById(
                "productsMessage"
            );


        if (!box) {
            return;
        }


        box.textContent =
            message;

        box.className =
            "alert";


        box.classList.add(
            type === "success"
                ? "alert-success"
                : "alert-danger"
        );


        box.classList.remove(
            "hidden"
        );


        setTimeout(() => {

            box.classList.add(
                "hidden"
            );

        }, 3000);
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
