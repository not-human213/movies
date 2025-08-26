function scrollLeft() {
    const container = document.querySelector('.cast-list');
    container.scrollBy({ left: -150, behavior: 'smooth' });
    console.log("scrolling left");
}

function scrollRight() {
    const container = document.querySelector('.cast-list');
    container.scrollBy({ left: 150, behavior: 'smooth' });
    console.log("scrolling right");
}


function runSearch(event) {
    const query = document.querySelector('.searchbar').value;
    console.log(query);  // Ensure the function is being called

    // Check if Enter key was pressed and redirect if needed
    if (event.key === 'Enter') {
        window.location.href = `/search?query=${query}&full=1`;
        return;  // Stop further execution if redirected
    }

    // Proceed with AJAX search if query length > 2
    if (query.length > 2) {
        fetch(`/search?query=${query}&full=0`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(data);  // See the data returned from the search API

                const resultsContainer = document.getElementById('search-results');
                resultsContainer.innerHTML = '';  // Clear previous results
                resultsContainer.style.display = 'block';  // Show results container
                
                if (data && data.length > 0) {
                    data.forEach(item => {
                        const resultItem = document.createElement('div');
                        resultItem.classList.add('result-item');
                        resultItem.style.cursor = 'pointer';
                        resultItem.innerHTML = `<img src="${item.poster}"><p>${item.name}</p>`;
                        
                        resultItem.addEventListener('click', () => {
                            const url = item.type === 1 
                                ? `/shows?show_id=${item.id}` 
                                : `/movies?movie_id=${item.id}`;
                            window.location.href = url;
                        });

                        resultsContainer.appendChild(resultItem);
                    });
                } else {
                    resultsContainer.innerHTML = '<div class="no-results">No results found.</div>';
                }
            })
            .catch(error => {
                console.error('Error fetching search results:', error);
            });
    } else {
        document.getElementById('search-results').style.display = 'none';  // Hide results container
    }
}

// Attach event listener to the search bar for keyup events
document.querySelector('.searchbar').addEventListener('keyup', runSearch);


function watchlist() {
    const watchlistElement = document.querySelector('.scroll-container');
    
    fetch(`/watchlist?action=disp`, { method: 'GET' })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // Only parse as JSON if response is okay
        })
        .then data => {
            if (!data || data.length === 0) {
                console.log("watchlist is empty");
                watchlistElement.innerHTML = '<div class="no-results">Your watchlist is waiting! Add some movies or series to get started</div>';
            } else {
                console.log("Movies in watchlist:", data);
                // Use data to populate the watchlist
            }
        })
        .catch(error => console.error('Error fetching watchlist:', error));
}



function toggleWatchlist(media_id, media_type) {
    const button = document.getElementById("watchlistButton");
    const isActive = button.getAttribute("data-active") === "true";
    // Toggle the active state
    if (isActive) {
        button.setAttribute("data-active", "false");
        button.innerText = "Add to Watchlist";
        updateWatchlist("remove", media_id, media_type);
    } else {
        button.setAttribute("data-active", "true");
        button.innerText = "Remove from Watchlist";
        updateWatchlist("add" , media_id, media_type);
    }
}

function updateWatchlist(action, media_id, media_type) {
    fetch(`/watchlist?action=${action}`, { 
        method: 'POST',
        body: JSON.stringify({ media_id: media_id, media_type: media_type }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json())
      .then(data => console.log(data));
}


function todetails(event, id, type) {
    if (type == 1)
        window.location.href = `/shows?show_id=${id}`;
    else
        window.location.href = `/movies?movie_id=${id}`;
}




function searchtab(evt, source) {
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(source).style.display = "block";
    evt.currentTarget.className += " active";
  }

function toseasondetails(show_id, season_number)
{
    console.log(show_id);
    window.location.href = `/season?show_id=${show_id}&season_id=${season_number}`;
}


async function fetchProfilesAndFolders(type) {
    try {
        // Fetch quality profiles
        if (type == 'movie')
            profilesResponse = await fetch('/arr?action=get_profiles&arr=radarr');
        else
            profilesResponse = await fetch('/arr?action=get_profiles&arr=sonarr');
        
        if (!profilesResponse.ok) {
            const errorData = await profilesResponse.json();
            alert(errorData.error || "Failed to fetch profiles.");
            return;
        }

        

        const profiles = await profilesResponse.json();
        const rootFolders = profiles[0]; // Assuming this is correct
        const qualityProfiles = profiles[1]; // Assuming this is correct

        console.log("Root folders:", rootFolders);
        console.log("Quality profiles:", qualityProfiles);

        // Display modal
        const modal = document.getElementById("radarrModal");
        modal.style.display = "block";

        // Populate quality profiles
        const qualityProfilesContainer = document.getElementById("qualityProfiles");
        qualityProfilesContainer.innerHTML = ""; // Clear previous content
        qualityProfiles.forEach(profile => {
            const radio = `<label><input type="radio" name="qualityprofile" value="${profile.id}">${profile.name}</label><br>`;
            qualityProfilesContainer.innerHTML += radio;
        });

        // Add click event for "Next" button
        const nextBtn = document.getElementById("nextStep");
        nextBtn.addEventListener(
            'click',
            () => {

                if (!document.querySelector('input[name="qualityprofile"]:checked')) {
                    alert("Please select a quality profile.");
                                                                            
                }
                else{
                // Hide quality profile section
                qualityProfilesContainer.style.display = "none";
                // Populate root folder options
                const rootFoldersContainer = document.getElementById("rootFolderOptions");
                rootFolders.forEach(folder => {
                    const radio = `<label><input type="radio" name="rootfolders" value="${folder.path}">${folder.path}</label><br>`;
                    rootFoldersContainer.innerHTML += radio;
                });
                
                
                
                // Show root folder section
                nextBtn.style.display = "none";
                const rootFolder = document.getElementById("rootFolders");
                rootFolder.style.display = "block";
                rootFoldersContainer.style.display = "block";
            }
            },
            { once: true } // Ensure this listener runs only once
        );
        
    } catch (error) {
            console.error("Error fetching profiles and folders:", error);
            alert("An unexpected error occurred when fetching profiles.\nPlease try again later.");
        }
        try
        {
            const addBtn = document.getElementById("addMedia");
            addBtn.addEventListener(
                'click',
                () => {

                    selectedqualitypro = getSelectedValue("qualityprofile")
                    console.log(selectedqualitypro);
                    const tmdbId = addBtn.getAttribute("data-tmdb-id");
                    console.log("tmdbId:", tmdbId);
                    addToarr(tmdbId, type = addBtn.getAttribute("mtype"));
                }
            );
            
        }
        catch (error) {
            console.error("Error fetching profiles and folders:", error);
            alert("An unexpected error occurred when adding the movie.\nPlease try again later.");
}
}

function getSelectedValue(name) {
    const radios = document.getElementsByName(name);
    for (const radio of radios) {
        if (radio.checked) {
            return radio.value; // Return the selected value
        }
    }
    return null; // Return null if no option is selected
}


async function addToarr(tmdbId,type) {
    const qualityProfileId = document.querySelector('input[name="qualityprofile"]:checked').value;
    const rootFolderPath = document.querySelector('input[name="rootfolders"]:checked').value;
    const msg = document.getElementById("radarr-message");
    const btn = document.getElementById("radarr-btn");
    try {
        const response = await fetch('/arr?action=add&arr=radarr', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tmdbId: tmdbId,
                qualityProfileId: qualityProfileId,
                rootFolderPath: rootFolderPath,
                monitored: true,
                addOptions: { searchForMovie: true }
            })
        });
        const data = await response.json();
        if (data.success) {
            msg.style.color = "#0f0";
            msg.textContent = "Movie added to Radarr!";
            btn.textContent = "Remove from Radarr";
            btn.setAttribute("data-added", "true");
        } else if (data.already_exists) {
            msg.style.color = "#ff0";
            msg.textContent = "Movie already exists in Radarr.";
            btn.textContent = "Remove from Radarr";
            btn.setAttribute("data-added", "true");
        } else {
            msg.style.color = "#f00";
            msg.textContent = "Failed to add movie to Radarr.";
        }
        document.getElementById("radarrModal").style.display = "none";
    } catch (error) {
        msg.style.color = "#f00";
        msg.textContent = "Error adding movie to Radarr.";
        document.getElementById("radarrModal").style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", function() {
    checkRadarrStatus();
});

async function checkRadarrStatus() {
    const tmdbId = document.getElementById("radarr-btn").getAttribute("data-tmdb-id");
    const btn = document.getElementById("radarr-btn");
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
    } catch (e) {
        msg.textContent = "Could not check Radarr status.";
    }
}

async function handleRadarrClick() {
    const btn = document.getElementById("radarr-btn");
    const msg = document.getElementById("radarr-message");
    const tmdbId = btn.getAttribute("data-tmdb-id");
    const isAdded = btn.getAttribute("data-added") === "true";

    if (!isAdded) {
        fetchProfilesAndFolders('movie');
    } else {
        // Remove from Radarr
        const res = await fetch('/arr?action=remove&arr=radarr', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tmdbId: tmdbId })
        });
        const data = await res.json();
        if (data.success) {
            btn.textContent = "Add to Radarr";
            btn.setAttribute("data-added", "false");
            msg.style.color = "#0f0";
            msg.textContent = "Removed from Radarr!";
        } else {
            msg.style.color = "#f00";
            msg.textContent = "Failed to remove from Radarr.";
        }
    }
}

// --- Modal open/close and reset logic ---
function openRadarrModal() {
    resetRadarrModal();
    document.getElementById("radarrModal").style.display = "block";
}
function closeRadarrModal() {
    document.getElementById("radarrModal").style.display = "none";
    resetRadarrModal();
}
function resetRadarrModal() {
    // Reset steps
    document.getElementById('radarr-step-1').style.display = 'block';
    document.getElementById('radarr-step-2').style.display = 'none';
    // Clear radios
    document.getElementById("qualityProfiles").innerHTML = "";
    document.getElementById("rootFolderOptions").innerHTML = "";
}

// Close modal on cross or outside click
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("radarrModalClose").onclick = closeRadarrModal;
    window.onclick = function(event) {
        if (event.target == document.getElementById("radarrModal")) closeRadarrModal();
    };
    checkRadarrStatus();
});

// --- Modal step logic ---
async function fetchProfilesAndFolders(type) {
    openRadarrModal();
    let profilesResponse;
    if (type == 'movie')
        profilesResponse = await fetch('/arr?action=get_profiles&arr=radarr');
    else
        profilesResponse = await fetch('/arr?action=get_profiles&arr=sonarr');
    if (!profilesResponse.ok) {
        alert("Failed to fetch profiles.");
        closeRadarrModal();
        return;
    }
    const profiles = await profilesResponse.json();
    const rootFolders = profiles[0];
    const qualityProfiles = profiles[1];

    // Populate quality profiles
    const qualityProfilesContainer = document.getElementById("qualityProfiles");
    qualityProfiles.forEach(profile => {
        const radio = `<label><input type="radio" name="qualityprofile" value="${profile.id}">${profile.name}</label>`;
        qualityProfilesContainer.innerHTML += radio;
    });

    // Next button logic
    document.getElementById("nextStep").onclick = function() {
        if (!document.querySelector('input[name="qualityprofile"]:checked')) {
            alert("Please select a quality profile.");
            return;
        }
        document.getElementById('radarr-step-1').style.display = 'none';
        document.getElementById('radarr-step-2').style.display = 'block';
        // Populate root folders
        const rootFoldersContainer = document.getElementById("rootFolderOptions");
        rootFolders.forEach(folder => {
            const radio = `<label><input type="radio" name="rootfolders" value="${folder.path}">${folder.path}</label>`;
            rootFoldersContainer.innerHTML += radio;
        });
    };

    // Add movie button logic
    document.getElementById("addMedia").onclick = function() {
        if (!document.querySelector('input[name="rootfolders"]:checked')) {
            alert("Please select a root folder.");
            return;
        }
        const tmdbId = this.getAttribute("data-tmdb-id");
        addToarr(tmdbId, type);
    };
}

// --- Sonarr Modal open/close and reset logic ---
function openSonarrModal() {
    resetSonarrModal();
    document.getElementById("sonarrModal").style.display = "block";
}
function closeSonarrModal() {
    document.getElementById("sonarrModal").style.display = "none";
    resetSonarrModal();
}
function resetSonarrModal() {
    document.getElementById('sonarr-step-1').style.display = 'block';
    document.getElementById('sonarr-step-2').style.display = 'none';
    document.getElementById("sonarrQualityProfiles").innerHTML = "";
    document.getElementById("sonarrRootFolderOptions").innerHTML = "";
}

// Close modal on cross or outside click
document.addEventListener("DOMContentLoaded", function() {
    // Only run Sonarr logic if the button exists
    if (document.getElementById("sonarr-btn")) {
        checkSonarrStatus();

        // Modal close logic
        const closeBtn = document.getElementById("sonarrModalClose");
        if (closeBtn) closeBtn.onclick = closeSonarrModal;
        window.onclick = function(event) {
            if (event.target == document.getElementById("sonarrModal")) closeSonarrModal();
        };
    }
});

// --- Modal step logic ---
async function fetchSonarrProfilesAndFolders() {
    openSonarrModal();
    let profilesResponse = await fetch('/arr?action=get_profiles&arr=sonarr');
    if (!profilesResponse.ok) {
        alert("Failed to fetch profiles.");
        closeSonarrModal();
        return;
    }
    const profiles = await profilesResponse.json();
    const rootFolders = profiles[0];
    const qualityProfiles = profiles[1];

    // Populate quality profiles
    const qualityProfilesContainer = document.getElementById("sonarrQualityProfiles");
    qualityProfiles.forEach(profile => {
        const radio = `<label><input type="radio" name="sonarr_qualityprofile" value="${profile.id}">${profile.name}</label>`;
        qualityProfilesContainer.innerHTML += radio;
    });

    // Next button logic
    document.getElementById("sonarrNextStep").onclick = function() {
        if (!document.querySelector('input[name="sonarr_qualityprofile"]:checked')) {
            alert("Please select a quality profile.");
            return;
        }
        document.getElementById('sonarr-step-1').style.display = 'none';
        document.getElementById('sonarr-step-2').style.display = 'block';
        // Populate root folders
        const rootFoldersContainer = document.getElementById("sonarrRootFolderOptions");
        rootFolders.forEach(folder => {
            const radio = `<label><input type="radio" name="sonarr_rootfolders" value="${folder.path}">${folder.path}</label>`;
            rootFoldersContainer.innerHTML += radio;
        });
    };

    // Add show button logic
    document.getElementById("sonarrAddMedia").onclick = function() {
        if (!document.querySelector('input[name="sonarr_rootfolders"]:checked')) {
            alert("Please select a root folder.");
            return;
        }
        const tvdbId = this.getAttribute("data-tvdb-id");
        addToSonarr(tvdbId);
    };
}

// --- Add/Remove logic ---
async function addToSonarr(tvdbId) {
    const qualityProfileId = document.querySelector('input[name="sonarr_qualityprofile"]:checked').value;
    const rootFolderPath = document.querySelector('input[name="sonarr_rootfolders"]:checked').value;
    const msg = document.getElementById("sonarr-message");
    const btn = document.getElementById("sonarr-btn");
    try {
        const response = await fetch('/arr?action=add&arr=sonarr', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tvdbId: tvdbId,
                title: document.querySelector('h1').textContent,
                qualityProfileId: qualityProfileId,
                rootFolderPath: rootFolderPath,
                monitored: true,
                addOptions: { searchForMissingEpisodes: true }
            })
        });
        const data = await response.json();
        if (data.success) {
            msg.style.color = "#0f0";
            msg.textContent = "Show added to Sonarr!";
            btn.textContent = "Remove from Sonarr";
            btn.setAttribute("data-added", "true");
        } else if (data.already_exists) {
            msg.style.color = "#ff0";
            msg.textContent = "Show already exists in Sonarr.";
            btn.textContent = "Remove from Sonarr";
            btn.setAttribute("data-added", "true");
        } else {
            msg.style.color = "#f00";
            msg.textContent = "Failed to add show to Sonarr.";
        }
        closeSonarrModal();
    } catch (error) {
        msg.style.color = "#f00";
        msg.textContent = "Error adding show to Sonarr.";
        closeSonarrModal();
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
    } catch (e) {
        msg.textContent = "Could not check Sonarr status.";
    }
}

async function handleSonarrClick() {
    console.log("handleSonarrClick called");
    const btn = document.getElementById("sonarr-btn");
    const msg = document.getElementById("sonarr-message");
    const tvdbId = btn.getAttribute("data-tvdb-id");
    const isAdded = btn.getAttribute("data-added") === "true";

    if (!isAdded) {
        fetchSonarrProfilesAndFolders();
    } else {
        // Remove from Sonarr
        const res = await fetch('/arr?action=remove&arr=sonarr', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tvdbId: tvdbId })
        });
        const data = await res.json();
        if (data.success) {
            btn.textContent = "Add to Sonarr";
            btn.setAttribute("data-added", "false");
            msg.style.color = "#0f0";
            msg.textContent = "Removed from Sonarr!";
        } else {
            msg.style.color = "#f00";
            msg.textContent = "Failed to remove from Sonarr.";
        }
    }
}

// --- Radarr (Movies) ---
function openRadarrModal() {
    resetRadarrModal();
    document.getElementById("radarrModal").style.display = "block";
}
function closeRadarrModal() {
    document.getElementById("radarrModal").style.display = "none";
    resetRadarrModal();
}
function resetRadarrModal() {
    if (document.getElementById('radarr-step-1')) document.getElementById('radarr-step-1').style.display = 'block';
    if (document.getElementById('radarr-step-2')) document.getElementById('radarr-step-2').style.display = 'none';
    if (document.getElementById("qualityProfiles")) document.getElementById("qualityProfiles").innerHTML = "";
    if (document.getElementById("rootFolderOptions")) document.getElementById("rootFolderOptions").innerHTML = "";
}
async function fetchProfilesAndFolders(type) {
    openRadarrModal();
    let profilesResponse = await fetch('/arr?action=get_profiles&arr=radarr');
    if (!profilesResponse.ok) {
        alert("Failed to fetch profiles.");
        closeRadarrModal();
        return;
    }
    const profiles = await profilesResponse.json();
    const rootFolders = profiles[0];
    const qualityProfiles = profiles[1];

    // Populate quality profiles
    const qualityProfilesContainer = document.getElementById("qualityProfiles");
    qualityProfiles.forEach(profile => {
        const radio = `<label><input type="radio" name="qualityprofile" value="${profile.id}">${profile.name}</label>`;
        qualityProfilesContainer.innerHTML += radio;
    });

    // Next button logic
    document.getElementById("nextStep").onclick = function() {
        if (!document.querySelector('input[name="qualityprofile"]:checked')) {
            alert("Please select a quality profile.");
            return;
        }
        document.getElementById('radarr-step-1').style.display = 'none';
        document.getElementById('radarr-step-2').style.display = 'block';
        // Populate root folders
        const rootFoldersContainer = document.getElementById("rootFolderOptions");
        rootFolders.forEach(folder => {
            const radio = `<label><input type="radio" name="rootfolders" value="${folder.path}">${folder.path}</label>`;
            rootFoldersContainer.innerHTML += radio;
        });
    };

    // Add movie button logic
    document.getElementById("addMedia").onclick = function() {
        if (!document.querySelector('input[name="rootfolders"]:checked')) {
            alert("Please select a root folder.");
            return;
        }
        const tmdbId = this.getAttribute("data-tmdb-id");
        addToarr(tmdbId, type);
    };
}
async function addToarr(tmdbId, type) {
    const qualityProfileId = document.querySelector('input[name="qualityprofile"]:checked').value;
    const rootFolderPath = document.querySelector('input[name="rootfolders"]:checked').value;
    const msg = document.getElementById("radarr-message");
    const btn = document.getElementById("radarr-btn");
    try {
        const response = await fetch('/arr?action=add&arr=radarr', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tmdbId: tmdbId,
                qualityProfileId: qualityProfileId,
                rootFolderPath: rootFolderPath,
                monitored: true,
                addOptions: { searchForMovie: true }
            })
        });
        const data = await response.json();
        if (data.success) {
            msg.style.color = "#0f0";
            msg.textContent = "Movie added to Radarr!";
            btn.textContent = "Remove from Radarr";
            btn.setAttribute("data-added", "true");
        } else if (data.already_exists) {
            msg.style.color = "#ff0";
            msg.textContent = "Movie already exists in Radarr.";
            btn.textContent = "Remove from Radarr";
            btn.setAttribute("data-added", "true");
        } else {
            msg.style.color = "#f00";
            msg.textContent = "Failed to add movie to Radarr.";
        }
        document.getElementById("radarrModal").style.display = "none";
    } catch (error) {
        msg.style.color = "#f00";
        msg.textContent = "Error adding movie to Radarr.";
        document.getElementById("radarrModal").style.display = "none";
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
    } catch (e) {
        msg.textContent = "Could not check Radarr status.";
    }
}
async function handleRadarrClick() {
    const btn = document.getElementById("radarr-btn");
    const msg = document.getElementById("radarr-message");
    const tmdbId = btn.getAttribute("data-tmdb-id");
    const isAdded = btn.getAttribute("data-added") === "true";

    if (!isAdded) {
        fetchProfilesAndFolders('movie');
    } else {
        // Remove from Radarr
        const res = await fetch('/arr?action=remove&arr=radarr', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tmdbId: tmdbId })
        });
        const data = await res.json();
        if (data.success) {
            btn.textContent = "Add to Radarr";
            btn.setAttribute("data-added", "false");
            msg.style.color = "#0f0";
            msg.textContent = "Removed from Radarr!";
        } else {
            msg.style.color = "#f00";
            msg.textContent = "Failed to remove from Radarr.";
        }
    }
}

// --- Sonarr (Shows) ---
function openSonarrModal() {
    resetSonarrModal();
    document.getElementById("sonarrModal").style.display = "block";
}
function closeSonarrModal() {
    document.getElementById("sonarrModal").style.display = "none";
    resetSonarrModal();
}
function resetSonarrModal() {
    if (document.getElementById('sonarr-step-1')) document.getElementById('sonarr-step-1').style.display = 'block';
    if (document.getElementById('sonarr-step-2')) document.getElementById('sonarr-step-2').style.display = 'none';
    if (document.getElementById("sonarrQualityProfiles")) document.getElementById("sonarrQualityProfiles").innerHTML = "";
    if (document.getElementById("sonarrRootFolderOptions")) document.getElementById("sonarrRootFolderOptions").innerHTML = "";
}
async function fetchSonarrProfilesAndFolders() {
    openSonarrModal();
    let profilesResponse = await fetch('/arr?action=get_profiles&arr=sonarr');
    if (!profilesResponse.ok) {
        alert("Failed to fetch profiles.");
        closeSonarrModal();
        return;
    }
    const profiles = await profilesResponse.json();
    const rootFolders = profiles[0];
    const qualityProfiles = profiles[1];

    // Populate quality profiles
    const qualityProfilesContainer = document.getElementById("sonarrQualityProfiles");
    qualityProfiles.forEach(profile => {
        const radio = `<label><input type="radio" name="sonarr_qualityprofile" value="${profile.id}">${profile.name}</label>`;
        qualityProfilesContainer.innerHTML += radio;
    });

    // Next button logic
    document.getElementById("sonarrNextStep").onclick = function() {
        if (!document.querySelector('input[name="sonarr_qualityprofile"]:checked')) {
            alert("Please select a quality profile.");
            return;
        }
        document.getElementById('sonarr-step-1').style.display = 'none';
        document.getElementById('sonarr-step-2').style.display = 'block';
        // Populate root folders
        const rootFoldersContainer = document.getElementById("sonarrRootFolderOptions");
        rootFolders.forEach(folder => {
            const radio = `<label><input type="radio" name="sonarr_rootfolders" value="${folder.path}">${folder.path}</label>`;
            rootFoldersContainer.innerHTML += radio;
        });
    };

    // Add show button logic
    document.getElementById("sonarrAddMedia").onclick = function() {
        if (!document.querySelector('input[name="sonarr_rootfolders"]:checked')) {
            alert("Please select a root folder.");
            return;
        }
        const tvdbId = this.getAttribute("data-tvdb-id");
        addToSonarr(tvdbId);
    };
}
async function addToSonarr(tvdbId) {
    const qualityProfileId = document.querySelector('input[name="sonarr_qualityprofile"]:checked').value;
    const rootFolderPath = document.querySelector('input[name="sonarr_rootfolders"]:checked').value;
    const msg = document.getElementById("sonarr-message");
    const btn = document.getElementById("sonarr-btn");
    try {
        const response = await fetch('/arr?action=add&arr=sonarr', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tvdbId: tvdbId,
                title: document.querySelector('h1').textContent,
                qualityProfileId: qualityProfileId,
                rootFolderPath: rootFolderPath,
                monitored: true,
                addOptions: { searchForMissingEpisodes: true }
            })
        });
        const data = await response.json();
        if (data.success) {
            msg.style.color = "#0f0";
            msg.textContent = "Show added to Sonarr!";
            btn.textContent = "Remove from Sonarr";
            btn.setAttribute("data-added", "true");
        } else if (data.already_exists) {
            msg.style.color = "#ff0";
            msg.textContent = "Show already exists in Sonarr.";
            btn.textContent = "Remove from Sonarr";
            btn.setAttribute("data-added", "true");
        } else {
            msg.style.color = "#f00";
            msg.textContent = "Failed to add show to Sonarr.";
        }
        closeSonarrModal();
    } catch (error) {
        msg.style.color = "#f00";
        msg.textContent = "Error adding show to Sonarr.";
        closeSonarrModal();
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
    } catch (e) {
        msg.textContent = "Could not check Sonarr status.";
    }
}
async function handleSonarrClick() {
    console.log("handleSonarrClick called");
    const btn = document.getElementById("sonarr-btn");
    const msg = document.getElementById("sonarr-message");
    const tvdbId = btn.getAttribute("data-tvdb-id");
    const isAdded = btn.getAttribute("data-added") === "true";

    if (!isAdded) {
        fetchSonarrProfilesAndFolders();
    } else {
        // Remove from Sonarr
        const res = await fetch('/arr?action=remove&arr=sonarr', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tvdbId: tvdbId })
        });
        const data = await res.json();
        if (data.success) {
            btn.textContent = "Add to Sonarr";
            btn.setAttribute("data-added", "false");
            msg.style.color = "#0f0";
            msg.textContent = "Removed from Sonarr!";
        } else {
            msg.style.color = "#f00";
            msg.textContent = "Failed to remove from Sonarr.";
        }
    }
}

window.todetails = todetails;

