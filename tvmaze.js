"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodesList = $("#episodesList");

// add global constants here for urls
const SHOWS_API_URL = "http://api.tvmaze.com/search/shows";
const BROKEN_IMG_URL = "https://tinyurl.com/tv-missing";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(searchTerm) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const showsAPIResponse = await axios.get(SHOWS_API_URL, {
    params: { q: searchTerm },
  });

  console.log(showsAPIResponse.data);

  const shows = showsAPIResponse.data.map((show) => {
    return {
      id: show.show.id,
      name: show.show.name,
      summary: show.show.summary,
      image: show.show.image?.medium || BROKEN_IMG_URL,
    };
  });

  return shows;

  //  [
  //   // {
  //   //   id: 1767,
  //   //   name: "The Bletchley Circle",
  //   //   summary:
  //   //     `<p><b>The Bletchley Circle</b> follows the journey of four ordinary
  //   //        women with extraordinary skills that helped to end World War II.</p>
  //   //      <p>Set in 1952, Susan, Millie, Lucy and Jean have returned to their
  //   //        normal lives, modestly setting aside the part they played in
  //   //        producing crucial intelligence, which helped the Allies to victory
  //   //        and shortened the war. When Susan discovers a hidden code behind an
  //   //        unsolved murder she is met by skepticism from the police. She
  //   //        quickly realises she can only begin to crack the murders and bring
  //   //        the culprit to justice with her former friends.</p>`,
  //   //   image:
  //   //       "http://static.tvmaze.com/uploads/images/medium_portrait/147/369403.jpg"
  //   // }
  // ]
}

/** Given list of shows, create markup for each and append to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let { id, name, summary, image } of shows) {
    const $show = $(
      `<div data-show-id="${id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${image}
              alt=https://tinyurl.com/tv-missing
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${name}</h5>
             <div><small>${summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `
    );

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  let episodes = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);

  return episodes.data;
}

/** Given a list (array) of episodes, create markup for each and append to DOM (episodes area)
 * clears episode area first
 */

function populateEpisodes(episodes) {
  $episodesList.empty();
  $episodesArea.css("display", "");

  for (let episode of episodes) {
    const $episode = `<li>${episode.name} (Season ${episode.season}, Number ${episode.number})</li>`;
    $episodesList.append($episode);
  }
}

/** Handle episode search on specified show: get episodes from API and display.
 *
 */

async function searchForEpisodesAndDisplay(evt) {
  console.log("episode button works!");
  const showID = $(evt.target).closest(".Show").data("show-id");
  const episodes = await getEpisodesOfShow(showID);
  populateEpisodes(episodes);
}

/** handles click on episode buttons */

$showsList.on("click", "button", searchForEpisodesAndDisplay);
