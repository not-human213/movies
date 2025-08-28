// --- Navigation ---
function todetails(event, id, type) {
    event.preventDefault();
    if (type == 1) {
        window.location.href = `/shows?show_id=${id}`;
    } else {
        window.location.href = `/movies?movie_id=${id}`;
    }
}

function toseasondetails(show_id, season_number) {
    window.location.href = `/season?show_id=${show_id}&season_id=${season_number}`;
}

// --- UI Elements ---
function scrollLeft() {
    const container = document.querySelector('.cast-list');
    if (container) container.scrollBy({ left: -150, behavior: 'smooth' });
}

function scrollRight() {
    const container = document.querySelector('.cast-list');
    if (container) container.scrollBy({ left: 150, behavior: 'smooth' });
}

// --- Search ---
function runSearch(event) {
    const query = document.querySelector('.searchbar').value;
    if (event.key === 'Enter') {
        window.location.href = `/search?query=${query}&full=1`;
        return;
    }

    const resultsContainer = document.getElementById('search-results');
    if (query.length > 2) {
        fetch(`/search?query=${query}&full=0`)
            .then(response => response.json())
            .then(data => {
                resultsContainer.innerHTML = '';
                resultsContainer.style.display = 'block';
                if (data && data.length > 0) {
                    data.forEach(item => {
                        const resultItem = document.createElement('div');
                        resultItem.classList.add('result-item');
                        resultItem.style.cursor = 'pointer';
                        resultItem.innerHTML = `<img src="${item.poster}"><p>${item.name}</p>`;
                        resultItem.addEventListener('click', () => {
                            const url = item.type === 1 ? `/shows?show_id=${item.id}` : `/movies?movie_id=${item.id}`;
                            window.location.href = url;
                        });
                        resultsContainer.appendChild(resultItem);
                    });
                } else {
                    resultsContainer.innerHTML = '<div class="no-results">No results found.</div>';
                }
            })
            .catch(error => console.error('Error fetching search results:', error));
    } else {
        if (resultsContainer) resultsContainer.style.display = 'none';
    }
}

function searchtab(evt, source) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(source).style.display = "block";
    evt.currentTarget.className += " active";
}

// --- Watchlist ---
function toggleWatchlist(media_id, media_type) {
    const button = document.getElementById("watchlistButton");
    const isActive = button.getAttribute("data-active") === "true";
    const action = isActive ? "remove" : "add";

    updateWatchlist(action, media_id, media_type).then(success => {
        if (success) {
            button.setAttribute("data-active", String(!isActive));
            button.innerText = isActive ? "Add to Watchlist" : "Remove from Watchlist";
        }
    });
}

async function updateWatchlist(action, media_id, media_type) {
    try {
        const response = await fetch(`/watchlist?action=${action}`, {
            method: 'POST',
            body: JSON.stringify({ media_id: media_id, media_type: media_type }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            console.log(`Watchlist updated: ${action}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error updating watchlist:', error);
        return false;
    }
}

// --- *arr Modal Logic (Shared) ---
function openModal(type) {
    const modalId = type === 'movie' ? 'radarrModal' : 'sonarrModal';
    resetModal(type);
    document.getElementById(modalId).style.display = "block";
}

function closeModal(type) {
    const modalId = type === 'movie' ? 'radarrModal' : 'sonarrModal';
    document.getElementById(modalId).style.display = "none";
    resetModal(type);
}

function resetModal(type) {
    const isMovie = type === 'movie';
    const step1 = document.getElementById(isMovie ? 'radarr-step-1' : 'sonarr-step-1');
    const step2 = document.getElementById(isMovie ? 'radarr-step-2' : 'sonarr-step-2');
    if (step1) step1.style.display = 'block';
    if (step2) step2.style.display = 'none';

    const qualityProfiles = document.getElementById(isMovie ? 'qualityProfiles' : 'sonarrQualityProfiles');
    const rootFolders = document.getElementById(isMovie ? 'rootFolderOptions' : 'sonarrRootFolderOptions');
    if (qualityProfiles) qualityProfiles.innerHTML = "";
    if (rootFolders) rootFolders.innerHTML = "";
}

async function fetchProfilesAndFolders(type) {
    openModal(type);
    const isMovie = type === 'movie';
    const arr = isMovie ? 'radarr' : 'sonarr';

    try {
        const profilesResponse = await fetch(`/arr?action=get_profiles&arr=${arr}`);
        if (!profilesResponse.ok) throw new Error('Failed to fetch profiles');
        const [rootFolders, qualityProfiles] = await profilesResponse.json();

        const qualityContainer = document.getElementById(isMovie ? 'qualityProfiles' : 'sonarrQualityProfiles');
        qualityProfiles.forEach(profile => {
            const radioName = isMovie ? 'qualityprofile' : 'sonarr_qualityprofile';
            qualityContainer.innerHTML += `<label><input type="radio" name="${radioName}" value="${profile.id}">${profile.name}</label><br>`;
        });

        document.getElementById(isMovie ? 'nextStep' : 'sonarrNextStep').onclick = () => {
            const radioName = isMovie ? 'qualityprofile' : 'sonarr_qualityprofile';
            if (!document.querySelector(`input[name="${radioName}"]:checked`)) {
                alert("Please select a quality profile.");
                return;
            }
            document.getElementById(isMovie ? 'radarr-step-1' : 'sonarr-step-1').style.display = 'none';
            document.getElementById(isMovie ? 'radarr-step-2' : 'sonarr-step-2').style.display = 'block';

            const rootFolderContainer = document.getElementById(isMovie ? 'rootFolderOptions' : 'sonarrRootFolderOptions');
            rootFolderContainer.innerHTML = "";
            rootFolders.forEach(folder => {
                const radioName = isMovie ? 'rootfolders' : 'sonarr_rootfolders';
                rootFolderContainer.innerHTML += `<label><input type="radio" name="${radioName}" value="${folder.path}">${folder.path}</label><br>`;
            });
        };

        document.getElementById(isMovie ? 'addMedia' : 'sonarrAddMedia').onclick = () => {
            const radioName = isMovie ? 'rootfolders' : 'sonarr_rootfolders';
            if (!document.querySelector(`input[name="${radioName}"]:checked`)) {
                alert("Please select a root folder.");
                return;
            }
            if (isMovie) {
                addToarr(document.getElementById('addMedia').getAttribute("data-tmdb-id"), null);
            } else {
                addToarr(null, document.getElementById('sonarrAddMedia').getAttribute("data-tvdb-id"));
            }
        };
    } catch (error) {
        alert(`Error fetching profiles from ${arr}.`);
        closeModal(type);
    }
}

async function addToarr(tmdbId, tvdbId) {
    const isMovie = !!tmdbId;
    const type = isMovie ? 'movie' : 'show';
    const arr = isMovie ? 'radarr' : 'sonarr';
    const msg = document.getElementById(isMovie ? 'radarr-message' : 'sonarr-message');
    const btn = document.getElementById(isMovie ? 'radarr-btn' : 'sonarr-btn');
    const qualityProfileName = isMovie ? 'qualityprofile' : 'sonarr_qualityprofile';
    const rootFolderName = isMovie ? 'rootfolders' : 'sonarr_rootfolders';

    const qualityProfileId = document.querySelector(`input[name="${qualityProfileName}"]:checked`).value;
    const rootFolderPath = document.querySelector(`input[name="${rootFolderName}"]:checked`).value;

    let payload = { qualityProfileId, rootFolderPath, monitored: true };
    if (isMovie) {
        payload.tmdbId = tmdbId;
        payload.addOptions = { searchForMovie: true };
    } else {
        payload.tvdbId = tvdbId;
        payload.tmdbId = document.getElementById('sonarrAddMedia').getAttribute("data-tmdb-id"); // Add this line
        payload.title = document.querySelector('h1').textContent;
        payload.addOptions = { searchForMissingEpisodes: true };
    }

    try {
        const response = await fetch(`/arr?action=add&arr=${arr}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        const mediaType = isMovie ? 'Movie' : 'Show';
        if (data.success || data.already_exists) {
            msg.textContent = data.already_exists ? `${mediaType} already exists in ${arr}.` : `${mediaType} added to ${arr}!`;
            btn.textContent = `Remove from ${arr}`;
            btn.setAttribute("data-added", "true");
        } else {
            msg.textContent = `Failed to add ${mediaType} to ${arr}.`;
        }
    } catch (error) {
        msg.textContent = `Error adding media to ${arr}.`;
    } finally {
        closeModal(type);
    }
}

// --- Radarr (Movies) ---
async function handleRadarrClick() {
    const btn = document.getElementById("radarr-btn");
    const isAdded = btn.getAttribute("data-added") === "true";
    if (!isAdded) {
        fetchProfilesAndFolders('movie');
    } else {
        const tmdbId = btn.getAttribute("data-tmdb-id");
        const res = await fetch('/arr?action=remove&arr=radarr', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tmdbId: tmdbId })
        });
        const data = await res.json();
        const msg = document.getElementById("radarr-message");
        if (data.success) {
            btn.textContent = "Add to Radarr";
            btn.setAttribute("data-added", "false");
            msg.textContent = "Removed from Radarr!";
        } else {
            msg.textContent = "Failed to remove from Radarr.";
        }
    }
}

async function checkRadarrStatus() {
    const btn = document.getElementById("radarr-btn");
    if (!btn) return;
    const tmdbId = btn.getAttribute("data-tmdb-id");
    const msg = document.getElementById("radarr-message");
    try {
        const res = await fetch(`/arr?action=checkmovie&arr=radarr&tmdbid=${tmdbId}`);
        const data = await res.json();
        if (data.exists) {
            btn.textContent = "Remove from Radarr";
            btn.setAttribute("data-added", "true");
            msg.textContent = "Already in Radarr.";
        } else {
            btn.textContent = "Add to Radarr";
            btn.setAttribute("data-added", "false");
            msg.textContent = "";
        }
    } catch (e) { /* Fail silently */ }
}

// --- Sonarr (Shows) ---
async function handleSonarrClick() {
    const btn = document.getElementById("sonarr-btn");
    const isAdded = btn.getAttribute("data-added") === "true";
    if (!isAdded) {
        fetchProfilesAndFolders('show');
    } else {
        const tvdbId = btn.getAttribute("data-tvdb-id");
        const res = await fetch('/arr?action=remove&arr=sonarr', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tvdbId: tvdbId })
        });
        const data = await res.json();
        const msg = document.getElementById("sonarr-message");
        if (data.success) {
            btn.textContent = "Add to Sonarr";
            btn.setAttribute("data-added", "false");
            msg.textContent = "Removed from Sonarr!";
        } else {
            msg.textContent = "Failed to remove from Sonarr.";
        }
    }
}

async function checkSonarrStatus() {
    const btn = document.getElementById("sonarr-btn");
    if (!btn) return;
    const tvdbId = btn.getAttribute("data-tvdb-id");
    const msg = document.getElementById("sonarr-message");
    try {
        const res = await fetch(`/arr?action=checkshow&arr=sonarr&tvdbid=${tvdbId}`);
        const data = await res.json();
        if (data.exists) {
            btn.textContent = "Remove from Sonarr";
            btn.setAttribute("data-added", "true");
            msg.textContent = "Already in Sonarr.";
        } else {
            btn.textContent = "Add to Sonarr";
            btn.setAttribute("data-added", "false");
            msg.textContent = "";
        }
    } catch (e) { /* Fail silently */ }
}

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", function() {
    const searchBar = document.querySelector('.searchbar');
    if (searchBar) searchBar.addEventListener('keyup', runSearch);

    if (document.getElementById("radarr-btn")) {
        checkRadarrStatus();
        document.getElementById("radarrModalClose").onclick = () => closeModal('movie');
    }

    if (document.getElementById("sonarr-btn")) {
        checkSonarrStatus();
        document.getElementById("sonarrModalClose").onclick = () => closeModal('show');
    }

    window.onclick = function(event) {
        if (event.target == document.getElementById("radarrModal")) closeModal('movie');
        if (event.target == document.getElementById("sonarrModal")) closeModal('show');
    };
});

