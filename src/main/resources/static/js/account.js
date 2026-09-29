document.addEventListener("DOMContentLoaded", () => {

    const user = getStoredUser();

    if (!user) {
        window.location.href = "/login";
        return;
    }

    const accountForm =
        document.getElementById("accountForm");

    const logoutButton =
        document.getElementById("logoutButton");


    loadAccount();


    if (accountForm) {

        accountForm.addEventListener(
            "submit",
            updateAccount
        );
    }


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logout
        );
    }


    async function loadAccount() {

        try {

            const username =
                user.username ||
                user.userName;


            if (!username) {
                populateFromSession();
                return;
            }


            const response =
                await fetch(
                    `/api/auth/account?username=${encodeURIComponent(
                        username
                    )}`
                );


            const data =
                await response
                    .json()
                    .catch(() => ({}));


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load account information."
                );
            }


            populateAccount(data);


        } catch (error) {

            console.error(
                "Account loading error:",
                error
            );


            /*
             * Keep the page usable even if the account
             * endpoint is not available yet.
             */
            populateFromSession();
        }
    }


    function populateFromSession() {

        populateAccount(user);
    }


    function populateAccount(data) {

        const username =
            data.username ||
            data.userName ||
            user.username ||
            "";


        const email =
            data.email ||
            user.email ||
            "";


        const firstName =
            data.firstName ||
            user.firstName ||
            "";


        const lastName =
            data.lastName ||
            user.lastName ||
            "";


        setValue(
            "username",
            username
        );


        setValue(
            "email",
            email
        );


        setValue(
            "firstName",
            firstName
        );


        setValue(
            "lastName",
            lastName
        );


        setText(
            "profileUsername",
            username
                ? `@${username}`
                : "@user"
        );


        const fullName =
            `${firstName} ${lastName}`
                .trim();


        setText(
            "profileName",
            fullName ||
            username ||
            "User"
        );


        const initial =
            (
                firstName ||
                username ||
                "U"
            )
                .charAt(0)
                .toUpperCase();


        setText(
            "profileInitial",
            initial
        );
    }


    async function updateAccount(event) {

        event.preventDefault();


        const firstName =
            getValue("firstName")
                .trim();


        const lastName =
            getValue("lastName")
                .trim();


        const username =
            getValue("username")
                .trim();


        if (!username) {

            showMessage(
                "Username is required.",
                "error"
            );

            return;
        }


        const button =
            document.getElementById(
                "saveAccountButton"
            );


        if (button) {

            button.disabled = true;

            button.textContent =
                "Saving...";
        }


        try {

            const response =
                await fetch(
                    "/api/auth/account",
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                username,
                                firstName,
                                lastName
                            })
                    }
                );


            const data =
                await response
                    .json()
                    .catch(() => ({}));


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to update account."
                );
            }


            /*
             * Update the locally stored user data
             * so the UI remains consistent.
             */
            const updatedUser = {
                ...user,
                ...data,
                username:
                    data.username ||
                    username,
                firstName,
                lastName
            };


            sessionStorage.setItem(
                "shopliteUser",
                JSON.stringify(
                    updatedUser
                )
            );


            populateAccount(
                updatedUser
            );


            showMessage(
                "Account updated successfully.",
                "success"
            );


        } catch (error) {

            console.error(
                "Account update error:",
                error
            );


            showMessage(
                error.message ||
                "Unable to update account.",
                "error"
            );


        } finally {

            if (button) {

                button.disabled = false;

                button.textContent =
                    "Save Changes";
            }
        }
    }


    async function logout() {

        const confirmed =
            window.confirm(
                "Are you sure you want to logout?"
            );


        if (!confirmed) {
            return;
        }


        try {

            /*
             * Notify Spring Security if the logout
             * endpoint is configured.
             */
            await fetch(
                "/logout",
                {
                    method: "POST"
                }
            );

        } catch (error) {

            console.warn(
                "Server logout request failed:",
                error
            );
        }


        sessionStorage.removeItem(
            "shopliteUser"
        );


        localStorage.removeItem(
            "shopliteUser"
        );


        window.location.href =
            "/login";
    }


    function showMessage(
        message,
        type
    ) {

        const box =
            document.getElementById(
                "accountMessage"
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

        }, 3500);
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


    function setValue(
        elementId,
        value
    ) {

        const element =
            document.getElementById(
                elementId
            );


        if (element) {

            element.value =
                value || "";
        }
    }


    function getValue(
        elementId
    ) {

        const element =
            document.getElementById(
                elementId
            );


        return element
            ? element.value
            : "";
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

            element.textContent =
                value || "";
        }
    }

});