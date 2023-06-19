const movieSearchBox = document.getElementById("search-box");
const searchButton = document.getElementById("search-button");
const searchList = document.getElementById("search-list");
const resultGrid = document.getElementById("result-grid");

searchButton.addEventListener("click", findMovies);

async function findMovies() {
  let searchTerm = movieSearchBox.value.trim();
  if (searchTerm.length > 0) {
    resultGrid.innerHTML = "";

    searchList.innerHTML = "Loading...";

    const URL = `https://omdbapi.com/?s=${searchTerm}&page=1&apikey=c19d571d`;
    try {
      const res = await fetch(URL);
      const data = await res.json();

      if (data.Response === "True") {
        let movies = data.Search;
        movies.sort((a, b) => a.Year.localeCompare(b.Year));
        displayMovieList(movies);
      } else {
        searchList.innerHTML = "No results found";
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      searchList.innerHTML = "An error occurred";
    }
  } else {
    searchList.classList.add("hide-search-list");
  }
}

function displayMovieList(movies) {
  searchList.innerHTML = "";
  const searchResultsText = document.createElement("div");
  searchResultsText.classList.add("search-results-text");
  searchResultsText.textContent = "Search Results:";
  searchList.appendChild(searchResultsText);
  for (let idx = 0; idx < movies.length; idx++) {
    let movieListItem = document.createElement("div");
    movieListItem.dataset.id = movies[idx].imdbID;
    movieListItem.classList.add("search-list-item");
    if (movies[idx].Poster !== "N/A") {
      moviePoster = movies[idx].Poster;
    } else {
      moviePoster = "image_not_found.png";
    }

    movieListItem.innerHTML = `
      <div class="search-item-thumbnail">
        <img src="${moviePoster}" alt="Movie Poster">
      </div>
      <div class="search-item-info">
        <h3>${movies[idx].Title}</h3>
        <p>${movies[idx].Year}</p>
        <button class="view-details-button">View Details..</button>
      </div>
    `;
    searchList.appendChild(movieListItem);
  }
  loadMovieDetails();
}

async function loadMovieDetails() {
  const searchListMovies = searchList.querySelectorAll(".search-list-item");
  searchListMovies.forEach((movie) => {
    const viewDetailsButton = movie.querySelector(".view-details-button");
    viewDetailsButton.addEventListener("click", async (event) => {
      event.stopPropagation();
      searchList.classList.add("hide-search-list");
      movieSearchBox.value = "";

      const imdbID = movie.dataset.id;
      const URL = `https://www.omdbapi.com/?i=${imdbID}&apikey=fc1fef96`;

      try {
        const res = await fetch(URL);
        const movieDetails = await res.json();
        displayMovieDetails(movieDetails);
        searchList.innerHTML = "";
      } catch (error) {
        console.error("Error fetching movie details:", error);
        resultGrid.innerHTML = ` An error occurred`;
      }
    });
  });
}

async function displayMovieDetails(details) {
  resultGrid.innerHTML = `
    <div class="movie-poster">
        <img src="${
          details.Poster !== "N/A" ? details.Poster : "image_not_found.png"
        }" alt="Movie Poster">
    </div>
    <div class="movie-info">
        <h3 class="movie-title">${details.Title}</h3>
        <ul class="movie-misc-info">
            <li class="year">Year: ${details.Year}</li>
            <li class="rated">Ratings: ${details.Rated}</li>
            <li class="released">Released: ${details.Released}</li>
        </ul>
        <p class="genre"><b>Genre:</b> ${details.Genre}</p>
        <p class="writer"><b>Writer:</b> ${details.Writer}</p>
        <p class="actors"><b>Actors:</b> ${details.Actors}</p>
        <p class="plot"><b>Plot:</b> ${details.Plot}</p>
        <p class="language"><b>Language:</b> ${details.Language}</p>
        <p class="awards"><b><i class="fas fa-award"></i></b> ${
          details.Awards
        }</p>
        <div class="trailer">
          <h4>Trailer</h4>
          <div id="trailer-player"></div>
        </div>
    </div>
    `;
  const trailerVideoId = await getTrailerVideoId(details.Title);

  if (trailerVideoId) {
    const player = new YT.Player("trailer-player", {
      height: "315",
      width: "560",
      videoId: trailerVideoId,
    });
  }
}

async function getTrailerVideoId(movieTitle) {
  const apiKey = "AIzaSyCde5W9REXwWO8z-d2Xgddm77m-XD7o528";
  const searchQuery = `${movieTitle} official trailer`;

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
    searchQuery
  )}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.items && data.items.length > 0) {
      return data.items[0].id.videoId;
    } else {
      console.log("No trailer found for the movie");
      return null;
    }
  } catch (error) {
    console.error("Error fetching trailer:", error);
    return null;
  }
}
