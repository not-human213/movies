# WatchWise
#### Video Demo: <URL HERE>

## Introduction
WatchWise is a personalized movie and TV show management system that makes it easier for users to discover, organize, and track their entertainment journey. The motivation behind WatchWise was to ease the management of your self-hosted media server and to provide users with a structured way of curating their watchlists without having to manually keep track of titles across multiple platforms.  

The project is designed as a full-stack application, where the backend handles fetching and storing movie data while the frontend allows for an intuitive, user-friendly experience. WatchWise integrates external APIs for movie metadata, utilizes a database for persistence, and provides features such as adding to watchlists, searching, and managing favorites.

This README describes the goals of the project, its key features, file structure, design choices, and potential improvements.

---

## Features
- **Search Movies and Shows:** Users can search titles using an integrated movie API.
- **Add to Watchlist:** Titles can be stored in a personalized watchlist for easy tracking.
- **Organize Favorites:** Users can mark certain shows or movies as favorites.
- **Database Integration:** Persistent storage ensures data is not lost between sessions.
- **Simple and Clean UI:** Designed for usability and minimal friction.

---

## Project Structure
The project is organized into several files and directories, each serving a distinct purpose:

1. **`app.py` (Backend Application)**  
   - This is the heart of the backend, built with Flask.  
   - It defines the API endpoints that handle user requests such as searching for a movie, adding it to the watchlist, retrieving the user’s watchlist, and marking favorites.  
   - It connects with the database and communicates with external APIs to fetch movie data (title, poster, description, release year, etc.).

2. **`watchlist.db` (Database)**  
   - SQLite database that stores user watchlist entries.  
   - Contains tables such as `watchlist` and possibly `favorites`, ensuring persistence of data even after the application restarts.  
   - Fields include movie ID, title, year, poster URL, and user-specific metadata.

3. **`templates/` (Frontend Pages)**  
   - Contains the HTML files used to render pages such as the home page, search results, and the watchlist view.  
   - Uses Jinja2 templating to dynamically display data fetched from the backend.  

4. **`static/` (CSS and JavaScript)**  
   - Stores styling and client-side scripts.  
   - Ensures that the UI is responsive and visually appealing.  

5. **`requirements.txt`**  
   - Lists all Python dependencies required to run the project (Flask, requests, SQLite libraries, etc.).  
   - Ensures reproducibility of the environment.  

6. **`README.md` (This File)**  
   - Documents the project, explaining its purpose, structure, and design decisions.  

---

## Design Decisions
During development, several key decisions had to be made:

1. **Framework Choice (Flask over Django):**  
   Flask was chosen for its simplicity and flexibility. Since this project focuses on core functionality rather than heavy configuration, Flask provided a lightweight yet powerful solution.

2. **Database (SQLite):**  
   SQLite was selected because it is easy to set up, lightweight, and sufficient for this project’s scope. For larger-scale deployments, PostgreSQL or MySQL could be integrated.

3. **API Integration (Movie API):**  
   Instead of manually creating a movie database, WatchWise integrates with external APIs to fetch accurate and up-to-date movie information. This ensures scalability and real-world usability.

4. **Frontend (HTML + Jinja Templates):**  
   While modern frameworks like React could have been used, Jinja templating with Flask allowed for faster development and seamless integration with backend data. For future scalability, a React or Next.js frontend could be introduced.

---

## Challenges and Solutions
1. **Data Persistence:**  
   One challenge was ensuring that the user’s watchlist is preserved across sessions. This was solved by designing a proper database schema in SQLite and linking it with backend routes.

2. **Handling Duplicate Entries:**  
   Initially, users could add the same movie multiple times to their watchlist. This was addressed by enforcing unique constraints in the database and validating requests before insertion.

3. **API Rate Limits:**  
   Since external movie APIs often have rate limits, the application had to implement caching mechanisms to minimize unnecessary API calls. This reduced latency and prevented exceeding rate limits.

---

## Future Improvements
- **User Authentication:** Add login functionality so that multiple users can manage their personalized watchlists.  
- **Recommendations System:** Use machine learning models or collaborative filtering to recommend titles based on user preferences.  
- **Advanced Filtering:** Allow users to filter watchlists by genre, release year, or IMDb rating.  
- **Mobile App Integration:** Extend functionality to mobile apps for on-the-go access.  
- **Cloud Deployment:** Deploy on platforms like Heroku, AWS, or DigitalOcean for accessibility anywhere.  

---

## Conclusion
WatchWise is more than just a simple watchlist manager; it is a step towards creating a smarter and more organized way to enjoy entertainment. By integrating real-world APIs, providing a structured database-backed system, and building a user-friendly interface, the project demonstrates the application of software engineering principles to solve an everyday problem.  

This project reflects thoughtful design, attention to detail, and scalability in mind. The journey involved making important trade-offs (simplicity vs. scalability, speed vs. features) while always keeping the end user in focus.  

---

## How to Run
1. Clone the repository.  
2. Install dependencies using:  
   ```bash
   pip install -r requirements.txt
3. Get a TMDB API Key
    - Go to The Movie Database (TMDB)
    - Sign up / log in
    - Navigate to Settings → API → Request an API Key
    - Copy your API key

4. Create a .env File
   In the project root, create a file named .env and add:
     ```bash
     TMDB_API_KEY=your_api_key_here
5. Run the Application
     ```bash
     flask run
