document.addEventListener("DOMContentLoaded", () => {
  AOS.init({ duration: 1000, once: true });

  // --- REUSED FUNCTIONS from main.js ---
  function getMyList() {
    const list = localStorage.getItem("myMovieList");
    return list ? JSON.parse(list) : [];
  }

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

  function createMovieCard(movie) {
    return `
            <div class="movie-card" data-aos="fade-up" onclick="goToMovieDetails(${movie.id})">
                <img src="${movie.poster}" alt="${movie.title}">
                <div class="rating"><i class="fas fa-star"></i> ${movie.rating}</div>
                <button class="add-to-list-btn" onclick="event.stopPropagation(); toggleMyList(${movie.id})">
                    <i class="far fa-heart"></i>
                </button>
                <h3>${movie.title}</h3>
            </div>
        `;
  }

  function displayMovies(movies, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    if (movies.length === 0) {
      container.innerHTML =
        '<p class="no-results-message">Your list is empty. Add some movies from the home page!</p>';
      return;
    }
    movies.forEach((movie) => {
      container.innerHTML += createMovieCard(movie);
    });
    updateListButtons();
  }

  function toggleMyList(movieId) {
    let myList = getMyList();
    const index = myList.indexOf(movieId);
    if (index > -1) {
      myList.splice(index, 1);
    } else {
      myList.push(movieId);
    }
    saveMyList(myList);
    updateListButtons();
    // If the list is now empty, re-render the page to show the empty message
    if (myList.length === 0) {
      displayMovies([], "my-list-container");
    }
  }

  function saveMyList(list) {
    localStorage.setItem("myMovieList", JSON.stringify(list));
  }

  function updateListButtons() {
    const myList = getMyList();
    const buttons = document.querySelectorAll(".add-to-list-btn i");
    buttons.forEach((button) => {
      const movieId = parseInt(
        button
          .closest(".add-to-list-btn")
          .getAttribute("onclick")
          .match(/\d+/)[0]
      );
      if (myList.includes(movieId)) {
        button.classList.remove("far");
        button.classList.add("fas");
        button.parentElement.classList.add("in-list");
      } else {
        button.classList.remove("fas");
        button.classList.add("far");
        button.parentElement.classList.remove("in-list");
      }
    });
  }

  window.goToMovieDetails = (movieId) => {
    window.location.href = `movie-details.html?id=${movieId}`;
  };

  // --- SPECIFIC LOGIC FOR THIS PAGE ---
  async function initializeMyListPage() {
    const myListIds = getMyList();

    if (myListIds.length === 0) {
      displayMovies([], "my-list-container");
      return;
    }

    const allMovies = await fetchMovies();
    const myMovies = allMovies.filter((movie) => myListIds.includes(movie.id));

    displayMovies(myMovies, "my-list-container");
  }

  initializeMyListPage();
});
