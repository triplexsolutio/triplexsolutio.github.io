// app-home.js – lógica para la página link-in-bio

// ====== ELEMENTOS ======
const themeToggleBtn = document.getElementById("themeToggle");
const rootHtml = document.documentElement;
const mobileMenu = document.getElementById("mobileMenu");
const menuToggleBtn = document.getElementById("menuToggle");
const mobileMenuCloseBtn = document.getElementById("mobileMenuClose");
const yearSpan = document.getElementById("year");
const newsletterModal = document.getElementById("newsletterModal");
const newsletterModalClose = document.getElementById("newsletterModalClose");
const newsletterBarForm = document.getElementById("newsletterBarForm");
const newsletterModalForm = document.getElementById("newsletterModalForm");
const headerSearchBtn = document.getElementById("headerSearchBtn");
const goSearchBtn = document.getElementById("goSearchBtn");
const coffeeBtn = document.getElementById("coffeeBtn");

// ====== INIT ======

document.addEventListener("DOMContentLoaded", () => {
  // Año footer
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Tema guardado (reutilizamos mismo storage que el buscador)
  const savedTheme = localStorage.getItem("ts-theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    rootHtml.setAttribute("data-theme", savedTheme);
  }
  updateThemeToggleIcon();

  // Mostrar modal newsletter solo la primera vez (por navegador)
  const hasSeenNewsletter = localStorage.getItem("ts-newsletter-modal-seen");
  if (!hasSeenNewsletter) {
    setTimeout(() => {
      openNewsletterModal();
    }, 1800);
  }

  // Eventos para links de redes en footer (GA)
  const footerSocialLinks = document.querySelectorAll(".footer-social__link");
  footerSocialLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const network = link.dataset.social || "unknown";
      if (window.gtag) {
        gtag("event", "click_social_footer", {
          network,
          location: "home_link_in_bio",
          link_url: link.href,
        });
      }
    });
  });
});

// ====== TEMA LIGHT/DARK ======

function updateThemeToggleIcon() {
  if (!themeToggleBtn) return;
  const isDark = rootHtml.getAttribute("data-theme") === "dark";
  themeToggleBtn.innerHTML = isDark
    ? '<i class="fa-solid fa-moon"></i>'
    : '<i class="fa-solid fa-sun"></i>';
}

themeToggleBtn?.addEventListener("click", () => {
  const current = rootHtml.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  rootHtml.setAttribute("data-theme", next);
  localStorage.setItem("ts-theme", next);
  updateThemeToggleIcon();
});

// ====== MENÚ MÓVIL ======

function openMobileMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.add("open");
  if (window.gtag) {
    gtag("event", "open_mobile_menu_home", {});
  }
}

function closeMobileMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.remove("open");
  if (window.gtag) {
    gtag("event", "close_mobile_menu_home", {});
  }
}

menuToggleBtn?.addEventListener("click", () => {
  if (!mobileMenu) return;
  if (mobileMenu.classList.contains("open")) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
});

mobileMenuCloseBtn?.addEventListener("click", closeMobileMenu);

mobileMenu?.addEventListener("click", (e) => {
  if (e.target.classList.contains("mobile-menu-backdrop")) {
    closeMobileMenu();
  }
});

document.querySelectorAll("[data-menu-link]").forEach((link) => {
  link.addEventListener("click", () => {
    closeMobileMenu();
  });
});

// ESC para cerrar menú y modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (mobileMenu?.classList.contains("open")) {
      closeMobileMenu();
    }
    if (newsletterModal && !newsletterModal.classList.contains("hidden")) {
      closeNewsletterModal();
    }
  }
});

// ====== ACCORDIONS ======
document.querySelectorAll("[data-accordion-toggle]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const acc = btn.closest(".accordion");
    if (!acc) return;
    const isOpen = acc.classList.contains("open");
    acc.classList.toggle("open", !isOpen);

    if (window.gtag) {
      gtag("event", "accordion_toggle_home", {
        title: btn.textContent.trim(),
        open: !isOpen,
      });
    }
  });
});

// ====== NEWSLETTER MODAL ======

function openNewsletterModal() {
  if (!newsletterModal) return;
  newsletterModal.classList.remove("hidden");
}

function closeNewsletterModal() {
  if (!newsletterModal) return;
  newsletterModal.classList.add("hidden");
  localStorage.setItem("ts-newsletter-modal-seen", "1");
}

newsletterModalClose?.addEventListener("click", closeNewsletterModal);

newsletterModal?.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-backdrop")) {
    closeNewsletterModal();
  }
});

// ====== NEWSLETTER FORMS (solo GA + feedback, sin backend real) ======

function handleNewsletterSubmit(formId) {
  const form =
    formId === "bar" ? newsletterBarForm : newsletterModalForm;
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.querySelector("input[type='email']");
    const emailValue = input?.value.trim() || "";

    if (!emailValue) {
      alert("Añade un email válido :)");
      return;
    }

    // Aquí es donde luego conectarás Beehiiv, MailerLite, etc.
    if (window.gtag) {
      gtag("event", "newsletter_submit", {
        origin: formId === "bar" ? "bar" : "modal",
        email_length: emailValue.length,
      });
    }

    input.value = "";
    if (formId === "modal") {
      closeNewsletterModal();
    }
    alert("¡Gracias! En breve tendrás noticias anime por email :)");
  });
}

handleNewsletterSubmit("bar");
handleNewsletterSubmit("modal");

// ====== BOTONES ESPECÍFICOS (GA) ======

headerSearchBtn?.addEventListener("click", () => {
  if (window.gtag) {
    gtag("event", "go_to_search_from_header", {});
  }
});

goSearchBtn?.addEventListener("click", () => {
  if (window.gtag) {
    gtag("event", "go_to_search_from_home_card", {});
  }
});

coffeeBtn?.addEventListener("click", () => {
  if (window.gtag) {
    gtag("event", "click_support_coffee", {});
  }
});
