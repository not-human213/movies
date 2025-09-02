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

// --- Toast (top-right) ---
function showToast(message, kind = 'info') {
    let tray = document.getElementById('toast-tray');
    if (!tray) {
        tray = document.createElement('div');
        tray.id = 'toast-tray';
        tray.style.position = 'fixed';
        tray.style.top = '16px';
        tray.style.right = '16px';
        tray.style.zIndex = '1100';
        tray.style.display = 'flex';
        tray.style.flexDirection = 'column';
        tray.style.gap = '8px';
        document.body.appendChild(tray);
    }
    const t = document.createElement('div');
    t.className = `toast-top toast-${kind}`;
    t.style.padding = '10px 12px';
    t.style.borderRadius = '10px';
    t.style.background = 'rgba(24,26,32,0.95)';
    t.style.color = '#e7ebf0';
    t.style.border = '1px solid rgba(255,255,255,0.1)';
    t.style.boxShadow = '0 4px 16px rgba(0,0,0,0.35)';
    t.textContent = message;
    tray.appendChild(t);
    setTimeout(() => {
        t.style.transition = 'opacity .25s ease';
        t.style.opacity = '0';
        setTimeout(() => t.remove(), 250);
    }, 1600);
}

// --- Card overlay actions ---
document.addEventListener('click', async (e) => {
    const addWatchBtn = e.target.closest('.btn-add-watchlist, .btn-remove-watchlist');
    if (addWatchBtn) {
        e.preventDefault();
        e.stopPropagation();
        const card = addWatchBtn.closest('.movie-card');
        const id = card?.getAttribute('data-id');
        const type = card?.getAttribute('data-type');
        if (!id || type === null) return;
        try {
            const isRemove = addWatchBtn.classList.contains('btn-remove-watchlist');
            const ok = await updateWatchlist(isRemove ? 'remove' : 'add', id, parseInt(type,10));
            if (ok) {
                const toast = document.createElement('div');
                toast.className = 'toast-inline';
                toast.style.position = 'absolute';
                toast.style.bottom = '10px';
                toast.style.left = '50%';
                toast.style.transform = 'translateX(-50%)';
                toast.textContent = isRemove ? 'Removed from Watchlist' : 'Added to Watchlist';
                card.appendChild(toast);
                setTimeout(() => toast.remove(), 1400);
                showToast(isRemove ? 'Removed from Watchlist' : 'Added to Watchlist', 'info');
                // If on index page and in watchlist section, remove card from DOM
                if (isRemove) {
                    addWatchBtn.classList.remove('btn-remove-watchlist');
                    addWatchBtn.classList.add('btn-add-watchlist');
                    addWatchBtn.setAttribute('title', 'Add to Watchlist');
                    // Remove from 'Your Watchlist' strip if present (regardless of where we clicked)
                    const strips = Array.from(document.querySelectorAll('.scroll-container'));
                    const wlStrip = strips.find(sc => {
                        let el = sc.previousElementSibling;
                        // Skip HR/tag wrappers until we find an H3
                        while (el && el.tagName !== 'H3') el = el.previousElementSibling;
                        return el && el.tagName === 'H3' && el.textContent.toLowerCase().includes('your watchlist');
                    });
                    if (wlStrip) {
                        const toRemoveCard = wlStrip.querySelector(`.movie-card[data-id="${id}"]`);
                        if (toRemoveCard) {
                            const si = toRemoveCard.closest('.scroll-item');
                            if (si) si.remove();
                        }
                    }
                    // Also remove the clicked card if it lives inside a watchlist strip
                    const parentScroll = card.closest('.scroll-container');
                    if (parentScroll) {
                        let el = parentScroll.previousElementSibling;
                        while (el && el.tagName !== 'H3') el = el.previousElementSibling;
                        if (el && el.textContent.toLowerCase().includes('your watchlist')) {
                            const scrollItem = card.closest('.scroll-item');
                            if (scrollItem) scrollItem.remove();
                        }
                    }
                } else {
                    addWatchBtn.classList.remove('btn-add-watchlist');
                    addWatchBtn.classList.add('btn-remove-watchlist');
                    addWatchBtn.setAttribute('title', 'Remove from Watchlist');
                    // If on index page and 'Your Watchlist' strip exists, append this card quickly if not already there
                    const strips = Array.from(document.querySelectorAll('.scroll-container'));
                    const watchlistStrip = strips.find(sc => {
                        let el = sc.previousElementSibling;
                        while (el && el.tagName !== 'H3') el = el.previousElementSibling;
                        return el && el.tagName === 'H3' && el.textContent.toLowerCase().includes('your watchlist');
                    });
                    if (watchlistStrip && watchlistStrip.previousElementSibling && watchlistStrip.previousElementSibling.previousElementSibling && watchlistStrip.previousElementSibling.previousElementSibling.textContent?.toLowerCase().includes('your watchlist')) {
                        const existing = watchlistStrip.querySelector(`.movie-card[data-id="${id}"]`);
                        if (!existing) {
                            const itemWrap = document.createElement('div');
                            itemWrap.className = 'scroll-item';
                            const link = card.closest('a');
                            const href = link ? link.getAttribute('href') : (parseInt(type,10)===1?`/shows?show_id=${id}`:`/movies?movie_id=${id}`);
                            itemWrap.innerHTML = `<a href="${href}" style="text-decoration: none; color: inherit;">${card.outerHTML}</a>`;
                            watchlistStrip.insertBefore(itemWrap, watchlistStrip.firstChild);
                        }
                    }
                }
            }
        } catch {}
        return;
    }

    const addArrBtn = e.target.closest('.btn-add-arr');
    if (addArrBtn) {
        e.preventDefault();
        e.stopPropagation();
        const card = addArrBtn.closest('.movie-card');
        const id = card?.getAttribute('data-id');
        const type = card?.getAttribute('data-type'); // 0 movie, 1 show
        if (!id || type === null) return;
        if (parseInt(type,10) === 1) {
            // Navigate to show details with flag to auto-open Sonarr modal
            window.location.href = `/shows?show_id=${id}&open_arr=1`;
        } else {
            window.location.href = `/movies?movie_id=${id}&open_arr=1`;
        }
        return;
    }
});

// Auto-open ARR modal on details pages when coming from overlay action
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('open_arr') === '1') {
        // If Radarr button exists, it's a movie details page; otherwise Sonarr for shows
        const radarrBtn = document.getElementById('radarr-btn');
        const sonarrBtn = document.getElementById('sonarr-btn');
        if (radarrBtn) {
            fetchProfilesAndFolders('movie');
        } else if (sonarrBtn) {
            fetchProfilesAndFolders('show');
        }
    }
    // Initialize overlay watchlist buttons to remove state if needed
    try {
        const cards = document.querySelectorAll('.movie-card[data-id][data-type]');
        if (cards.length) {
            fetch('/watchlist/data').then(r => r.ok ? r.json() : []).then(list => {
                if (!Array.isArray(list)) return;
                const set = new Set(list.map(x => `${x.type}:${x.id}`));
                cards.forEach(card => {
                    const id = card.getAttribute('data-id');
                    const type = card.getAttribute('data-type');
                    const key = `${parseInt(type,10)}:${id}`;
                    const btn = card.querySelector('.btn-overlay');
                    const wlBtn = card.querySelector('.btn-add-watchlist, .btn-remove-watchlist');
                    if (set.has(key) && wlBtn) {
                        wlBtn.classList.remove('btn-add-watchlist');
                        wlBtn.classList.add('btn-remove-watchlist');
                        wlBtn.setAttribute('title','Remove from Watchlist');
                    }
                });
            }).catch(()=>{});
        }
    } catch {}
});

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
            showToast(isActive ? 'Removed from Watchlist' : 'Added to Watchlist', 'info');
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
    const isMovie = type === 'movie';
    const arr = isMovie ? 'radarr' : 'sonarr';

    try {
    // pre-check configuration
        const cfgRes = await fetch(`/arr?action=configured&arr=${arr}`);
        if (!cfgRes.ok) {
            try { const err = await cfgRes.json(); showToast(err.error || `Configure ${arr} in Settings first.`, 'error'); } catch { showToast(`Configure ${arr} in Settings first.`, 'error'); }
            return;
        }
        openModal(type);
        // Show loading spinner in step 1 while fetching
        const qualityContainer = document.getElementById(isMovie ? 'qualityProfiles' : 'sonarrQualityProfiles');
        if (qualityContainer) {
            qualityContainer.innerHTML = '<div class="spinner-blob"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>';
        }
        const profilesResponse = await fetch(`/arr?action=get_profiles&arr=${arr}`);
        if (!profilesResponse.ok) throw new Error('Failed to fetch profiles');
        const [rootFolders, qualityProfiles] = await profilesResponse.json();

            if (qualityContainer) qualityContainer.innerHTML = '';
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
            msg.innerHTML = `<span class="toast-inline">${data.already_exists ? `${mediaType} already exists in ${arr}.` : `${mediaType} added to ${arr}!`}</span>`;
            btn.textContent = isMovie ? 'Remove from Radarr' : 'Remove from Sonarr';
            btn.setAttribute("data-added", "true");
            btn.classList.add('is-added');
            showToast(`${mediaType} ${data.already_exists ? 'already exists in' : 'added to'} ${arr}.`, 'info');
        } else {
            msg.innerHTML = `<span class="toast-inline">Failed to add ${mediaType} to ${arr}.</span>`;
            showToast(`Failed to add ${mediaType} to ${arr}.`, 'error');
        }
    } catch (error) {
        msg.innerHTML = `<span class="toast-inline">Error adding media to ${arr}.</span>`;
    showToast(`Error adding media to ${arr}.`, 'error');
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
            msg.innerHTML = '<span class="toast-inline">Removed from Radarr!</span>';
            btn.classList.remove('is-added');
            showToast('Removed from Radarr', 'info');
        } else {
            msg.innerHTML = '<span class="toast-inline">Failed to remove from Radarr.</span>';
            showToast('Failed to remove from Radarr', 'error');
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
            msg.innerHTML = '<span class="toast-inline">Removed from Sonarr!</span>';
            btn.classList.remove('is-added');
            showToast('Removed from Sonarr', 'info');
        } else {
            msg.innerHTML = '<span class="toast-inline">Failed to remove from Sonarr.</span>';
            showToast('Failed to remove from Sonarr', 'error');
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

