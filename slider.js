document.addEventListener("DOMContentLoaded", () => {
  const formSection = document.querySelector(".review-form-section");
  const sliderSection = document.querySelector(".testimonial-slider");
  const form = document.getElementById("review-form");

  const leaveReviewBtn = document.getElementById("leave-review-btn");
  const backBtn = document.getElementById("back-btn");

  const container = document.getElementById("testimonial-container");
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");
  const dotsContainer = document.getElementById("progress-dots");

  let testimonials = [
    {
      text: "This platform transformed my business results. Highly recommend it!",
      rating: 5,
      name: "Sarah Johnson"
    },
    {
      text: "Excellent support team and beautiful designs. Five stars from me.",
      rating: 5,
      name: "Michael Liu"
    },
    {
      text: "Smooth user experience and very intuitive features.",
      rating: 4,
      name: "Aisha Khan"
    }
  ];

  let currentIndex = 0;
  let autoSlideInterval;
  let startX = null;

  // STAR RATING LOGIC
  const starSelector = document.getElementById("star-selector");
  const starsError = document.getElementById("stars-error");
  let selectedRating = 0;

  for (let i = 1; i <= 5; i++) {
    const star = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    star.setAttribute("viewBox", "0 0 24 24");
    star.setAttribute("data-value", i);
    star.innerHTML = `<path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.782 1.4 8.173L12 18.896l-7.334 3.854 1.4-8.173L.132 9.21l8.2-1.192z"/>`;

    star.addEventListener("mouseover", () => highlightStars(i));
    star.addEventListener("mouseout", resetHighlight);
    star.addEventListener("click", () => selectRating(i));

    starSelector.appendChild(star);
  }

  function highlightStars(rating) {
    const stars = starSelector.querySelectorAll("svg");
    stars.forEach((star, index) => {
      star.classList.toggle("hovered", index < rating);
    });
  }

  function resetHighlight() {
    const stars = starSelector.querySelectorAll("svg");
    stars.forEach(star => {
      star.classList.remove("hovered");
    });
  }

  function selectRating(rating) {
    selectedRating = rating;
    const stars = starSelector.querySelectorAll("svg");
    stars.forEach((star, index) => {
      star.classList.toggle("active", index < rating);
      star.classList.remove("hovered");
    });
    if (starsError) starsError.textContent = "";
  }

  // expose for form use
  window.getSelectedRating = () => selectedRating;

  function createStars(count) {
    const starIcon = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 17.27L18.18 21 16.54 13.97 
        22 9.24l-7.19-.61L12 2 9.19 8.63 
        2 9.24l5.46 4.73L5.82 21z"/>
      </svg>`;
    return starIcon.repeat(count);
  }

  function sanitizeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function createTestimonialElement(data) {
    const safeText = sanitizeHTML(data.text);
    const safeName = sanitizeHTML(data.name);
    const safeRating = Number.isInteger(data.rating) ? data.rating : 0;

    const testimonial = document.createElement("div");
    testimonial.className = "testimonial";

    testimonial.innerHTML = `
      <p class="review-text">"${safeText}"</p>
      <div class="rating">${createStars(safeRating)}</div>
      <span class="customer-name">- ${safeName}</span>
    `;

    return testimonial;
  }

  function renderTestimonials() {
    container.innerHTML = "";
    testimonials.forEach(item => {
      const el = createTestimonialElement(item);
      container.appendChild(el);
    });

    renderDots();
    updateSlider();
  }

  function renderDots() {
    dotsContainer.innerHTML = "";
    testimonials.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Testimonial ${i + 1}`);
      dot.addEventListener("click", () => {
        stopAutoSlide();
        currentIndex = i;
        updateSlider();
        startAutoSlide();
      });
      dotsContainer.appendChild(dot);
    });
  }

  function updateSlider() {
    const translateX = -currentIndex * 100;
    container.style.transform = `translateX(${translateX}%)`;

    const dots = dotsContainer.querySelectorAll("button");
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === currentIndex);
    });
  }

  function nextTestimonial() {
    currentIndex = (currentIndex + 1) % testimonials.length;
    updateSlider();
  }

  function prevTestimonial() {
    currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
    updateSlider();
  }

  function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
      nextTestimonial();
    }, 5000);
  }

  function stopAutoSlide() {
    clearInterval(autoSlideInterval);
  }

  prevBtn.addEventListener("click", () => {
    stopAutoSlide();
    prevTestimonial();
    startAutoSlide();
  });

  nextBtn.addEventListener("click", () => {
    stopAutoSlide();
    nextTestimonial();
    startAutoSlide();
  });

  container.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  container.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const endX = e.changedTouches[0].clientX;
    const diff = endX - startX;

    if (Math.abs(diff) > 50) {
      stopAutoSlide();
      if (diff > 0) {
        prevTestimonial();
      } else {
        nextTestimonial();
      }
      startAutoSlide();
    }
    startX = null;
  });

  function showSlider() {
    sliderSection.classList.add("active");
    formSection.classList.remove("active");
  }

  function showForm() {
    sliderSection.classList.remove("active");
    formSection.classList.add("active");
  }

  if (leaveReviewBtn) {
    leaveReviewBtn.addEventListener("click", () => {
      stopAutoSlide();
      showForm();
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      startAutoSlide();
      showSlider();
    });
  }

  // ✅ SUBMIT FORM
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("name");
    const commentInput = document.getElementById("comment");

    const customerName = nameInput.value.trim();
    const reviewText = commentInput.value.trim();
    const rating = window.getSelectedRating?.() || 0;

    if (!customerName || !reviewText || rating === 0) {
      alert("Please fill out all fields and select a rating.");
      return;
    }

    testimonials.push({
      text: reviewText,
      rating: rating,
      name: customerName
    });

    form.reset();
    selectedRating = 0;
    highlightStars(0);

    showSlider();
    renderTestimonials();
    startAutoSlide();
  });

  // INIT
  showSlider();
  renderTestimonials();
  startAutoSlide();
});
