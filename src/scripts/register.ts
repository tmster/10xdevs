function handleSubmit(event: SubmitEvent) {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) {
    const errorElement = document.querySelector("#error");
    if (errorElement) {
      errorElement.textContent = "Passwords do not match";
    }
    return;
  }

  if (password.length < 6) {
    const errorElement = document.querySelector("#error");
    if (errorElement) {
      errorElement.textContent = "Password must be at least 6 characters long";
    }
    return;
  }

  fetch("/api/auth/register", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          const errorElement = document.querySelector("#error");
          if (errorElement) {
            errorElement.textContent = data.error || "Registration failed";
          }
        });
      }
      window.location.href = "/login";
    })
    .catch(() => {
      const errorElement = document.querySelector("#error");
      if (errorElement) {
        errorElement.textContent = "An unexpected error occurred";
      }
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  form?.addEventListener("submit", handleSubmit);
});
