
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
        .then(data => {
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


function todetails(event, id,type)
{
    console.log(id);
    console.log(type);
    
    if (type == 1)
    {
        window.location.href = `/shows?show_id=${id}`;
    }
    else
    {
        window.location.href = `/movies?movie_id=${id}`;
    }
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
    console.log("tmdvId:", tmdbId);
    try {
        if(type = 'movie')
        {
            const response = await fetch('/arr?action=add&arr=radarr', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    tmdbId: tmdbId,
                    qualityProfileId: qualityProfileId,
                    rootFolderPath: rootFolderPath,
                    monitored: true,
                    addOptions: { searchForMovie: true }
                })
            });
        }
        else
        {
            const response = await fetch('/sonarr?action=add&arr=sonarr', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    tmdbId: tmdbId,
                    qualityProfileId: qualityProfileId,
                    rootFolderPath: rootFolderPath,
                    monitored: true,
                    addOptions: { searchForMovie: true }
                })
            });
        }
        console.log("Response:", response);
        if (response.ok) {
            alert("Movie added successfully!");
            const modal = document.getElementById("radarrModal");
            modal.style.display = "none";
        } else {
            const errorData = await response.json();
            alert("Error adding movie: response not ok " + JSON.stringify(errorData));
            const modal = document.getElementById("radarrModal");
            modal.style.display = "none";
        }
    } catch (error) {
        console.error("Error adding movie:", error);
        const modal = document.getElementById("radarrModal");
        modal.style.display = "none";
    }
}

