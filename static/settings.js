// Settings page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Change Password Form
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (newPassword !== confirmPassword) {
                alert('New passwords do not match!');
                return;
            }

            try {
                const response = await fetch('/settings/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        currentPassword,
                        newPassword
                    })
                });

                const data = await response.json();
                if (data.success) {
                    alert('Password updated successfully!');
                    changePasswordForm.reset();
                } else {
                    alert(data.message || 'Failed to update password');
                }
            } catch (error) {
                alert('Error updating password');
                console.error(error);
            }
        });
    }

    // Radarr Settings Form
    const radarrForm = document.getElementById('radarrForm');
    if (radarrForm) {
        radarrForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const url = document.getElementById('radarrUrl').value;
            const apiKey = document.getElementById('radarrApiKey').value;
            if (!url || !apiKey) { alert('Please provide URL and API key'); return; }

            try {
                const response = await fetch('/settings/radarr', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        url,
                        apiKey
                    })
                });

                const data = await response.json();
                if (data.success) {
                    alert('Radarr settings saved successfully!');
                } else {
                    alert(data.message || 'Failed to save Radarr settings');
                }
            } catch (error) {
                alert('Error saving Radarr settings');
                console.error(error);
            }
        });
    }

    // Sonarr Settings Form
    const sonarrForm = document.getElementById('sonarrForm');
    if (sonarrForm) {
        sonarrForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const url = document.getElementById('sonarrUrl').value;
            const apiKey = document.getElementById('sonarrApiKey').value;
            if (!url || !apiKey) { alert('Please provide URL and API key'); return; }

            try {
                const response = await fetch('/settings/sonarr', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        url,
                        apiKey
                    })
                });

                const data = await response.json();
                if (data.success) {
                    alert('Sonarr settings saved successfully!');
                } else {
                    alert(data.message || 'Failed to save Sonarr settings');
                }
            } catch (error) {
                alert('Error saving Sonarr settings');
                console.error(error);
            }
        });
    }
});

async function testConnection(service) {
    const url = document.getElementById(`${service}Url`).value;
    const apiKey = document.getElementById(`${service}ApiKey`).value;
    if (!url || !apiKey) { alert('Please provide URL and API key'); return; }

    try {
        const response = await fetch(`/settings/test-connection/${service}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url,
                apiKey
            })
        });

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        alert('Error testing connection');
        console.error(error);
    }
}

async function resetAccount() {
    if (!confirm('Are you sure you want to reset your account? This will clear all your settings and watchlist.')) {
        return;
    }

    try {
        const response = await fetch('/settings/reset-account', {
            method: 'POST'
        });

        const data = await response.json();
        if (data.success) {
            alert('Account reset successfully!');
            window.location.reload();
        } else {
            alert(data.message || 'Failed to reset account');
        }
    } catch (error) {
        alert('Error resetting account');
        console.error(error);
    }
}

async function deleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch('/settings/delete-account', {
            method: 'POST'
        });

        const data = await response.json();
        if (data.success) {
            alert('Account deleted successfully!');
            window.location.href = '/logout';
        } else {
            alert(data.message || 'Failed to delete account');
        }
    } catch (error) {
        alert('Error deleting account');
        console.error(error);
    }
}
