// Wait for the HTML document to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize AOS library
  AOS.init({
    duration: 1000,
    once: true,
  });

  // --- GLOBAL VARIABLE ---
  let allMovies = [];

  // Function to fetch movies from the JSON file
  async function fetchMovies() {
    try {
      const response = await fetch("./data/movies.json");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch movies:", error);
      return [];
    }
  }

  // Function to create a movie card HTML element
  function createMovieCard(movie) {
    return `
        <div class="movie-card" data-aos="fade-up" onclick="goToMovieDetails(${movie.id})">
            <img src="${movie.poster}" alt="${movie.title}">
            <div class="rating">
                <i class="fas fa-star"></i> ${movie.rating}
            </div>
            <!-- NEW: Add to List Button -->
            <button class="add-to-list-btn" onclick="event.stopPropagation(); toggleMyList(${movie.id})">
                <i class="far fa-heart"></i>
            </button>
            <h3>${movie.title}</h3>
        </div>
    `;
  }
  // Function to display movies in a specific container
  function displayMovies(movies, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = ""; // Clear existing content

    if (movies.length === 0) {
      container.innerHTML =
        '<p class="no-results-message">No movies found.</p>';
      return;
    }

    movies.forEach((movie) => {
      container.innerHTML += createMovieCard(movie);
    });

    // --- THE FIX IS HERE ---
    // After the movies are added to the DOM, update the heart icons
    updateListButtons();
  }

  // --- UPDATED: SEARCH FUNCTION WITH SMOOTH SCROLL ---
  function handleSearch(searchTerm) {
    const searchResultsSection = document.getElementById(
      "search-results-section"
    );
    const trendingSection = document.getElementById("trending");
    const newReleasesSection = document.getElementById("new-releases");

    if (searchTerm.trim() === "") {
      // If search is empty, show original sections and hide search results
      searchResultsSection.style.display = "none";
      trendingSection.style.display = "block";
      newReleasesSection.style.display = "block";
      return;
    }

    // Filter movies based on search term
    const filteredMovies = allMovies.filter((movie) =>
      movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Show search results section and hide others
    searchResultsSection.style.display = "block";
    trendingSection.style.display = "none";
    newReleasesSection.style.display = "none";

    // Display the filtered movies
    displayMovies(filteredMovies, "search-results-container");

    // --- NEW: SMOOTH SCROLL TO RESULTS ---
    searchResultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // --- UPDATED: INITIALIZE PAGE FUNCTION ---
  async function initializePage() {
    allMovies = await fetchMovies(); // Store movies in the global variable

    if (allMovies.length > 0) {
      // Display default movies
      displayMovies(allMovies.slice(0, 3), "trending-movies-container");
      displayMovies(allMovies.slice(3, 6), "new-movies-container");
      updateHeroSection(allMovies[0]);
    }

    // --- NEW: HIDE LOADING SPINNER AND SHOW CONTENT ---
    const loadingOverlay = document.getElementById("loading-overlay");
    const mainContent = document.querySelector("main");

    loadingOverlay.style.opacity = "0";
    setTimeout(() => {
      loadingOverlay.style.display = "none";
      document.getElementById("main-home").style.opacity = "1";
    }, 500); // Wait for the fade-out transition

    // Add event listener to the search bar
    const searchInput = document.querySelector(".search-bar input");
    searchInput.addEventListener("input", (e) => {
      handleSearch(e.target.value);
    });
  }

  // Function to update the hero section
  function updateHeroSection(movie) {
    const heroSection = document.querySelector(".hero");
    if (heroSection) {
      heroSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('${movie.backdrop}')`;
      document.querySelector(".hero-content h1").textContent = movie.title;
      document.querySelector(".hero-content p").textContent = movie.description;
    }
  }

  // Function to navigate to movie details
  window.goToMovieDetails = (movieId) => {
    window.location.href = `movie-details.html?id=${movieId}`;
  };

  // Run the initialization
  initializePage();
});

// --- MY LIST FUNCTIONS ---

// Function to get the current list from localStorage
function getMyList() {
  const list = localStorage.getItem("myMovieList");
  return list ? JSON.parse(list) : [];
}

// Function to save the list to localStorage
function saveMyList(list) {
  localStorage.setItem("myMovieList", JSON.stringify(list));
}

// Function to add or remove a movie from the list
function toggleMyList(movieId) {
  let myList = getMyList();
  const index = myList.indexOf(movieId);

  if (index > -1) {
    // Movie is in the list, so remove it
    myList.splice(index, 1);
    console.log(`Movie ${movieId} removed from list.`);
  } else {
    // Movie is not in the list, so add it
    myList.push(movieId);
    console.log(`Movie ${movieId} added to list.`);
  }

  saveMyList(myList);
  updateListButtons(); // Update the heart icons on the page
}

// Function to update the heart icons (filled or empty) on the current page
function updateListButtons() {
  const myList = getMyList();
  const buttons = document.querySelectorAll(".add-to-list-btn i");

  buttons.forEach((button) => {
    const movieId = parseInt(
      button.closest(".add-to-list-btn").getAttribute("onclick").match(/\d+/)[0]
    );
    if (myList.includes(movieId)) {
      button.classList.remove("far");
      button.classList.add("fas"); // Filled heart
      button.parentElement.classList.add("in-list");
    } else {
      button.classList.remove("fas");
      button.classList.add("far"); // Empty heart
      button.parentElement.classList.remove("in-list");
    }
  });
}

