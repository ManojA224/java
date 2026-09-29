document.addEventListener("DOMContentLoaded", () => {

    const user = getStoredUser();

    if (!user) {
        window.location.href = "/login";
        return;
    }

    const productSelect =
        document.getElementById("productSelect");

    const quantityInput =
        document.getElementById("quantity");

    const addItemButton =
        document.getElementById("addItemButton");

    const billItems =
        document.getElementById("billItems");

    const billTotal =
        document.getElementById("billTotal");

    const billingForm =
        document.getElementById("billingForm");


    let products = [];

    let cart = [];


    loadProducts();


    if (addItemButton) {

        addItemButton.addEventListener(
            "click",
            addProductToBill
        );
    }


    if (billingForm) {

        billingForm.addEventListener(
            "submit",
            completeSale
        );
    }


    async function loadProducts() {

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


            populateProductSelect();


        } catch (error) {

            console.error(
                "Product loading error:",
                error
            );


            showMessage(
                error.message ||
                "Unable to load products.",
                "error"
            );
        }
    }


    function populateProductSelect() {

        if (!productSelect) {
            return;
        }


        productSelect.innerHTML = `
            <option value="">
                Select Product
            </option>
        `;


        products.forEach(product => {

            const stock =
                Number(
                    product.stockQuantity ??
                    product.stock ??
                    0
                );


            if (stock <= 0) {
                return;
            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                product.id;


            option.textContent =
                `${product.name} — ${formatCurrency(
                    product.price
                )} — ${stock} available`;


            productSelect.appendChild(
                option
            );
        });
    }


    function addProductToBill(event) {

        if (event) {
            event.preventDefault();
        }


        const productId =
            productSelect
                ? productSelect.value
                : "";


        const quantity =
            Number(
                quantityInput
                    ? quantityInput.value
                    : 0
            );


        if (!productId) {

            showMessage(
                "Please select a product.",
                "error"
            );

            return;
        }


        if (
            !Number.isInteger(quantity) ||
            quantity <= 0
        ) {

            showMessage(
                "Please enter a valid quantity.",
                "error"
            );

            return;
        }


        const product =
            products.find(
                item =>
                    Number(item.id) ===
                    Number(productId)
            );


        if (!product) {

            showMessage(
                "Selected product was not found.",
                "error"
            );

            return;
        }


        const stock =
            Number(
                product.stockQuantity ??
                product.stock ??
                0
            );


        const existingItem =
            cart.find(
                item =>
                    Number(item.productId) ===
                    Number(productId)
            );


        const existingQuantity =
            existingItem
                ? existingItem.quantity
                : 0;


        if (
            existingQuantity +
            quantity >
            stock
        ) {

            showMessage(
                `Only ${stock} units of ${product.name} are available.`,
                "error"
            );

            return;
        }


        if (existingItem) {

            existingItem.quantity +=
                quantity;

            existingItem.total =
                existingItem.quantity *
                existingItem.price;

        } else {

            cart.push({

                productId:
                    Number(product.id),

                productName:
                    product.name,

                quantity:
                    quantity,

                price:
                    Number(product.price || 0),

                total:
                    quantity *
                    Number(product.price || 0)
            });
        }


        renderCart();


        if (quantityInput) {

            quantityInput.value = 1;
        }


        if (productSelect) {

            productSelect.value = "";
        }


        clearMessage();
    }


    function renderCart() {

        if (!billItems) {
            return;
        }


        if (cart.length === 0) {

            billItems.innerHTML = `
                <tr>
                    <td
                        colspan="5"
                        style="
                            text-align:center;
                            padding:35px;
                            color:var(--text-muted);
                        "
                    >
                        No products added to this bill.
                    </td>
                </tr>
            `;


            updateTotal();

            return;
        }


        billItems.innerHTML =
            cart.map((item, index) => {

                return `
                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            <strong>
                                ${escapeHtml(
                                    item.productName
                                )}
                            </strong>
                        </td>

                        <td>

                            <div
                                style="
                                    display:flex;
                                    align-items:center;
                                    gap:6px;
                                "
                            >

                                <button
                                    type="button"
                                    class="btn btn-secondary"
                                    style="
                                        min-height:30px;
                                        padding:4px 9px;
                                    "
                                    onclick="
                                        changeQuantity(
                                            ${index},
                                            -1
                                        )
                                    "
                                >
                                    −
                                </button>

                                <strong>
                                    ${item.quantity}
                                </strong>

                                <button
                                    type="button"
                                    class="btn btn-secondary"
                                    style="
                                        min-height:30px;
                                        padding:4px 9px;
                                    "
                                    onclick="
                                        changeQuantity(
                                            ${index},
                                            1
                                        )
                                    "
                                >
                                    +
                                </button>

                            </div>

                        </td>

                        <td>
                            ${formatCurrency(
                                item.price
                            )}
                        </td>

                        <td>

                            <div
                                style="
                                    display:flex;
                                    justify-content:space-between;
                                    align-items:center;
                                    gap:10px;
                                "
                            >

                                <strong>
                                    ${formatCurrency(
                                        item.total
                                    )}
                                </strong>

                                <button
                                    type="button"
                                    class="btn btn-danger"
                                    style="
                                        min-height:30px;
                                        padding:4px 9px;
                                    "
                                    onclick="
                                        removeItem(
                                            ${index}
                                        )
                                    "
                                >
                                    ×
                                </button>

                            </div>

                        </td>

                    </tr>
                `;

            }).join("");


        updateTotal();
    }


    window.changeQuantity =
        function(index, change) {

            const item =
                cart[index];


            if (!item) {
                return;
            }


            const product =
                products.find(
                    product =>
                        Number(product.id) ===
                        Number(item.productId)
                );


            const stock =
                product
                    ? Number(
                        product.stockQuantity ??
                        product.stock ??
                        0
                    )
                    : 0;


            const newQuantity =
                item.quantity +
                change;


            if (newQuantity <= 0) {

                cart.splice(
                    index,
                    1
                );

                renderCart();

                return;
            }


            if (newQuantity > stock) {

                showMessage(
                    `Only ${stock} units are available.`,
                    "error"
                );

                return;
            }


            item.quantity =
                newQuantity;


            item.total =
                item.quantity *
                item.price;


            renderCart();
        };


    window.removeItem =
        function(index) {

            if (
                index < 0 ||
                index >= cart.length
            ) {
                return;
            }


            cart.splice(
                index,
                1
            );


            renderCart();
        };


    async function completeSale(event) {

        event.preventDefault();


        if (cart.length === 0) {

            showMessage(
                "Add at least one product before completing the bill.",
                "error"
            );

            return;
        }


        const total =
            cart.reduce(
                (
                    sum,
                    item
                ) =>
                    sum + item.total,
                0
            );


        const payload = {

            items:
                cart.map(item => ({
                    productId:
                        item.productId,

                    quantity:
                        item.quantity
                })),

            totalAmount:
                total
        };


        const submitButton =
            billingForm.querySelector(
                'button[type="submit"]'
            );


        if (submitButton) {

            submitButton.disabled = true;

            submitButton.textContent =
                "Processing...";
        }


        try {

            const response =
                await fetch(
                    "/api/sales",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                payload
                            )
                    }
                );


            const data =
                await response
                    .json()
                    .catch(() => ({}));


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to complete the sale."
                );
            }


            const saleId =
                data.id ||
                data.saleId;


            showMessage(
                "Bill created successfully.",
                "success"
            );


            cart = [];

            renderCart();


            setTimeout(() => {

                if (saleId) {

                    window.location.href =
                        `/bill?id=${encodeURIComponent(
                            saleId
                        )}`;

                } else {

                    window.location.href =
                        "/sales";
                }

            }, 600);


        } catch (error) {

            console.error(
                "Sale creation error:",
                error
            );


            showMessage(
                error.message ||
                "Unable to complete the sale.",
                "error"
            );


        } finally {

            if (submitButton) {

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Complete Sale";
            }
        }
    }


    function updateTotal() {

        const total =
            cart.reduce(
                (
                    sum,
                    item
                ) =>
                    sum + item.total,
                0
            );


        if (billTotal) {

            billTotal.textContent =
                formatCurrency(
                    total
                );
        }


        const subtotalElement =
            document.getElementById(
                "billSubtotal"
            );


        if (subtotalElement) {

            subtotalElement.textContent =
                formatCurrency(
                    total
                );
        }
    }


    function showMessage(
        message,
        type
    ) {

        const box =
            document.getElementById(
                "billingMessage"
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
    }


    function clearMessage() {

        const box =
            document.getElementById(
                "billingMessage"
            );


        if (!box) {
            return;
        }


        box.textContent = "";

        box.className =
            "hidden";
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


    renderCart();

});