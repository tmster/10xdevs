function handleSubmit(event: SubmitEvent) {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);

  fetch("/api/auth/login", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          const errorElement = document.querySelector("#error");
          if (errorElement) {
            errorElement.textContent = data.error || "Login failed";
          }
        });
      }
      window.location.href = "/";
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
