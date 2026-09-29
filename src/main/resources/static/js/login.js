document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        return;
    }

    const messageBox =
        document.getElementById("loginMessage");

    const loginButton =
        document.getElementById("loginButton");


    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const username =
            document.getElementById("username")
                .value
                .trim();

        const password =
            document.getElementById("password")
                .value;


        clearMessage();


        if (!username || !password) {

            showMessage(
                "Please enter your username and password.",
                "error"
            );

            return;
        }


        loginButton.disabled = true;

        loginButton.textContent = "Signing in...";


        try {

            const response = await fetch(
                "/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        username,
                        password
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
                    "Invalid username or password."
                );
            }


            /*
             * Store only the information required
             * by the frontend session.
             */
            sessionStorage.setItem(
                "shopliteUser",
                JSON.stringify(data)
            );


            showMessage(
                "Login successful. Redirecting...",
                "success"
            );


            setTimeout(() => {

                window.location.href =
                    "/dashboard";

            }, 500);


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            showMessage(
                error.message ||
                "Unable to sign in. Please try again.",
                "error"
            );


        } finally {

            loginButton.disabled = false;

            loginButton.textContent =
                "Sign In";
        }

    });


    function showMessage(message, type) {

        if (!messageBox) {
            return;
        }


        messageBox.textContent =
            message;

        messageBox.className =
            "alert";


        if (type === "success") {

            messageBox.classList.add(
                "alert-success"
            );

        } else {

            messageBox.classList.add(
                "alert-danger"
            );
        }


        messageBox.classList.remove(
            "hidden"
        );
    }


    function clearMessage() {

        if (!messageBox) {
            return;
        }


        messageBox.textContent = "";

        messageBox.className =
            "hidden";
    }

});