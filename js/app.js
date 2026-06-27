const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");

document.getElementById("cy").innerText = `${new Date().getFullYear()}`;

hamburger.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.toggle("open");
  hamburger.classList.toggle("open", isOpen);
  hamburger.setAttribute("aria-expanded", isOpen);
  document.body.style.overflow = isOpen ? "hidden" : "";
});

document.querySelectorAll(".menu-link").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", false);
    document.body.style.overflow = "";
  });
});

// -- EmailJS Contact Form --
const EMAILJS_SERVICE_ID = "service_nlx9pu1";
const EMAILJS_TEMPLATE_ID = "template_c9u804c";
const EMAILJS_PUBLIC_KEY = "nn4JQBSjDAZk7TM9M";

function handleSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const btn = form.querySelector(".btn-submit");

  // Disable button & show loading state
  btn.disabled = true;
  btn.textContent = "Sending…";

  const templateParams = {
    from_name: form.querySelector("#name").value.trim(),
    from_email: form.querySelector("#email").value.trim(),
    message: form.querySelector("#message").value.trim(),
  };

  emailjs
    .send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY,
    )
    .then(() => {
      // Success
      btn.textContent = "Message sent ✓";
      btn.style.background = "#059669";
      form.reset();

      setTimeout(() => {
        btn.textContent = "Send Message";
        btn.style.background = "";
        btn.disabled = false;
      }, 4000);
    })
    .catch((error) => {
      // Failure
      console.error("EmailJS error:", error);
      btn.textContent = "Failed — try again";
      btn.style.background = "#dc2626";
      btn.disabled = false;

      setTimeout(() => {
        btn.textContent = "Send Message";
        btn.style.background = "";
      }, 4000);
    });
}
