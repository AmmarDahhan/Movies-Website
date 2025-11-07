document.addEventListener("DOMContentLoaded", () => {
  // Function to get movie ID from the URL
  function getMovieIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  // Function to fetch all movies
  async function fetchMovies() {
    try {
      const response = await fetch("./data/movies.json");
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch movies:", error);
      return [];
    }
  }

  // Main function to run everything
  async function initializeDetailsPage() {
    const mainElement = document.getElementById("movie-details-main");
    const loadingSpinner = document.getElementById("loading-spinner-details");
    const contentContainer = document.getElementById(
      "details-content-container"
    );

    // --- THE FIX IS HERE ---
    // Make the main element visible IMMEDIATELY so we can see the spinner
    // mainElement.style.opacity = "1";

    const movieId = getMovieIdFromUrl();

    if (!movieId) {
      loadingSpinner.innerHTML =
        '<p class="container">Error: Movie ID not found.</p>';
      return;
    }

    const allMovies = await fetchMovies();
    const movie = allMovies.find((m) => m.id == movieId);

    if (movie) {
      // 1. Set the background image
      mainElement.style.backgroundImage = `url('${movie.backdrop}')`;

      // 2. Create the HTML for the movie details
      const detailsHTML = `
                <div class="container details-container">
                    <div class="details-poster">
                        <img src="${movie.poster}" alt="${movie.title}">
                    </div>
                    <div class="details-info">
                        <h1>${movie.title}</h1>
                        <div class="meta">
                            <span><i class="fas fa-star"></i> ${
                              movie.rating
                            }</span>
                            <span>${movie.year}</span>
                        </div>
                        <ul class="genre-list">
                            ${movie.genre.map((g) => `<li>${g}</li>`).join("")}
                        </ul>
                        <p>${movie.description}</p>
                        <div class="details-actions">
                            <button class="btn-play"><i class="fas fa-play"></i> Play</button>
                            <button class="btn-info"><i class="fas fa-plus"></i> My List</button>
                        </div>
                    </div>
                </div>
            `;

      // 3. Add the HTML to the content container
      contentContainer.innerHTML = detailsHTML;

      // 4. Hide the spinner and show the content
      loadingSpinner.style.display = "none";
      contentContainer.style.display = "block";
    } else {
      // If movie is not found
      loadingSpinner.innerHTML = '<p class="container">Movie not found.</p>';
    }
  }

  // Run the initialization
  initializeDetailsPage();
});
