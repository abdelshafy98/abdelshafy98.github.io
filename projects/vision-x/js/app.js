// Select all sections that should be observed
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".nav-section");
const navMenuIcon = document.getElementById("nav-menu-icon");

document.getElementById("copywrite-year").innerText = new Date().getFullYear();

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelector(".nav-bar").classList.remove("open-menu");
  });
});

// Scroll listener
window.addEventListener("scroll", () => {
  let currentSectionId = null;
  const scrollPos = window.scrollY;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 150;
    const sectionHeight = section.offsetHeight;

    if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
      currentSectionId = section.getAttribute("id");
    }
  });

  if (currentSectionId) {
    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSectionId}`) {
        link.classList.add("active");
      }
    });
  }
});

navMenuIcon.addEventListener("click", () => {
  document.querySelector(".nav-bar").classList.toggle("open-menu");
});
