import requests
from tmdbv3api import TMDb, Movie, Collection, TV, Season
import json
import sqlite3
import os
from dotenv import load_dotenv
load_dotenv()

season = Season()
tmdb = TMDb()
tmdb.api_key = os.getenv('TMDB_API_KEY')
tv = TV()
Movies = Movie()
print(os.getenv('TMDB_API_KEY'))

class series:
    def discover(page):
        data = []
        for i in range(page+1, page+4):
            series_list = tv.popular(i)
            for series in series_list:
                dic = {
                    "id": series.id,
                    "name": series.name,
                    "overview": series.overview,
                    "poster" : ("https://image.tmdb.org/t/p/original" + series.poster_path) if series.poster_path else None,
                }
                # print(dic)
                data.append(dic)
        return data
    
    
    def details(id, user_id):
        series = tv.details(id)
        dic = {
            "id": series.id,
            "name": series.name,
            "overview": series.overview,
            "poster" : "https://image.tmdb.org/t/p/original" + series.poster_path,
            "genre" : series.genres,
            "homepage" : series.homepage,
            "release_date" : series.first_air_date,
            "status" : series.status,
            "backdrop" : ("https://image.tmdb.org/t/p/original" + series.backdrop_path) if series.backdrop_path else None,
            "cast" : series.credits.cast,
            "episodes" : series.number_of_episodes,
            "seasons" : series.seasons,
            'isinwatchlist': watchlist.isin(user_id, id, 1)
        }
        
        return dic
    
    def seasons(show_id, season_number):    
        seasons = season.details(show_id, season_number)
        epsiodes = []
        for i in seasons.episodes:
            print("overview",i.overview)
            dic = {
                "id": i.id,
                "name": i.name,
                "overview": i.overview,
                "season" : i.season_number,
                "episode" : i.episode_number,
                "air_date" : i.air_date,
                "img" : "https://image.tmdb.org/t/p/original" + i.still_path if i.still_path else None
            }
            epsiodes.append(dic)
        return epsiodes
class movies:
    def discover(page):
        data = []
        for i in range(page, page+3):
            # print(i)
            movie_list = Movies.popular(i)
            for movie in movie_list:
                dic = {
                    "id": movie.id,
                    "name": movie.title,
                    "overview": movie.overview,
                    "poster" : "https://image.tmdb.org/t/p/original" + movie.poster_path
                }
                # print(movie)
                data.append(dic)
        return data
    def details(id, user_id):
        movie = Movies.details(id)
        dic = {
            "id": movie.id,
            "name": movie.title,
            "overview": movie.overview,
            "poster" : "https://image.tmdb.org/t/p/original" + movie.poster_path,
            "genre" : movie.genres,
            "homepage" : movie.homepage,
            "imdb" : movie.imdb_id,
            "release_date" : movie.release_date,
            "status" : movie.status,
            "trailers" : movie.trailers,
            "backdrop" : ("https://image.tmdb.org/t/p/original" + movie.backdrop_path) if movie.backdrop_path else None,
            "collection_id" : movie.belongs_to_collection.id if movie.belongs_to_collection else None,
            "collection_name" : movie.belongs_to_collection.name if movie.belongs_to_collection else None,
            "cast" : movie.casts.cast,
        }
        for i in movie.casts.crew:
            if i['job'] == 'Director':
                dic['director'] = i['name']
            elif i['job'] == 'Producer':
                dic['producer'] = i['name']
        for i in movie.production_companies:
            dic['production_companies'] = i['id']
        dic['isinwatchlist'] = watchlist.isin(user_id, id, 0)
        return dic


class home:
    def get_home(user_id):
        discover = Movies.popular()
        discover_details = []
        i = 0
        for mov in discover:
            if i == 3:
                break
            mov_details = ({
                "id": mov.id,
                "name": mov.title,
                "overview": mov.overview,
                "backdrop" : "https://image.tmdb.org/t/p/original" + mov.backdrop_path
            })
            discover_details.append(mov_details)
            i += 1

        top_shows = []
        
        page_shows = tv.popular()
        for show in page_shows:
            dic = {
                "id": show.id,
                "name": show.name,
                "poster" : ("https://image.tmdb.org/t/p/original" + show.poster_path) if show.poster_path else None,
            }
            top_shows.append(dic)
        top_movies = []
        page_movies = Movies.popular()
        for movie in page_movies:
            dic = {
                "id": movie.id,
                "name": movie.title,
                "poster" : ("https://image.tmdb.org/t/p/original" + movie.poster_path) if movie.poster_path else None,
            }
            top_movies.append(dic)
        watchlist_instance = watchlist()  # Create an instance of watchlist
        getwatchlist = watchlist_instance.disp(user_id)
        user_watchlist = []
        for i in getwatchlist:
            if i[3] == 0:
                movie = Movies.details(i[2])
                dic = {
                    "id": movie.id,
                    "type": 0,
                    "name": movie.title,
                    "overview": movie.overview,
                    "poster" : "https://image.tmdb.org/t/p/original" + movie.poster_path
                }
                user_watchlist.append(dic)
            else:
                show = tv.details(i[2])
                dic = {
                    "id": show.id,
                    "type": 1,
                    "name": show.name,
                    "overview": show.overview,
                    "poster" : "https://image.tmdb.org/t/p/original" + show.poster_path
                }
                user_watchlist.append(dic)
        return user_watchlist,discover_details, top_shows, top_movies


class search:
    def search(query,full):
        data = []
        i = 0
        search = Movies.search(query)
        print(search[0])
        for movie in search:
            if full == 0 and i > 1:
                break
            print("full", full, 'i', i)
            dic = {
                'type': 0,
                "id": movie['id'],
                "name": movie['title'],
                "overview": movie['overview'],
                "poster" : ("https://image.tmdb.org/t/p/original" + movie['poster_path']) if movie['poster_path'] else None,
            }
            # print(dic)
            i += 1
            data.append(dic)
        i = 0
        search = tv.search(query)
        for show in search:
            if full == 0 and i > 1:
                    break
            dic = {
                'type': 1,
                "id": show['id'],
                "name": show['name'],
                "overview": show['overview'],
                "poster" : ("https://image.tmdb.org/t/p/original" + show['poster_path']) if show['poster_path'] else None,
            }
            i += 1
            data.append(dic)
        print(data)
        return data
    

class watchlist:
    print("watchlist")  
    print("fdsfjgsdfkg")
    def disp(self, user_id):
        
        db = sqlite3.connect('watch.db')
        cursor = db.cursor()
        get_watchlist = cursor.execute("SELECT * FROM watchlist WHERE user_id = ?", (user_id,)).fetchall()
        db.close()
        return get_watchlist

    def add(user_id, media_id, media_type):
        try:
            print("adding ", media_id)  
            db = sqlite3.connect('watch.db')
            cursor = db.cursor()
            add_watchlist = """INSERT INTO watchlist (user_id, media_id, type) VALUES (?, ?, ?)"""
            print(add_watchlist)
            cursor.execute(add_watchlist, (user_id, media_id, media_type))
            db.commit()
            db.close()
            print("added ", media_id , " successfully")
            return True
        except sqlite3.Error as e:
            print(e)
    
    def remove(user_id, media_id, type):
        try:
            print("removing ", media_id)
            db = sqlite3.connect('watch.db')
            cursor = db.cursor()
            remove_watchlist = """DELETE FROM watchlist WHERE user_id = ? AND media_id = ? AND type = ?"""
            print(remove_watchlist,(user_id, media_id, type))
            cursor.execute(remove_watchlist, (user_id, media_id, type))
            db.commit()
            db.close()
            print("removed ", media_id, " successfully")
            return True
        except:
            return False
        
    def isin(user_id, media_id, type):
        try:
            db = sqlite3.connect('watch.db')
            cursor = db.cursor()
            cursor.execute("SELECT * FROM watchlist WHERE user_id = ? AND media_id = ? AND type = ?", (user_id, media_id, type))
            if cursor.fetchone():
                return True
            return False
        except:
            return False
        
class arr:

    def __init__(self,warr):
        print("arr in init",warr)
        self.warr = warr
    sonarr_url = "http://192.168.0.103:8989"  # Sonarr server URL
    sonarr_api_key = "736dd7007df94766a4f506d9797fc41f"  # Replace with your Sonarr API key1
    radarr_url = "http://192.168.0.103:7878"  # Radarr server URL
    radarr_api_key = "174633fcbe284cbe9c7c06dbd170f1f6"  # Replace with your Radarr API key


    def get_root_folders(self):
        """Retrieve root folders from Radarr."""
        root_folder_url = f"{getattr(self, f'{self.warr}_url')}/api/v3/rootfolder"
        headers = {"X-Api-Key": getattr(self, f'{self.warr}_api_key')}

        response = requests.get(root_folder_url, headers=headers)
        response.raise_for_status()

        root_folders = response.json()
        for folder in root_folders:
            print(f"ID: {folder['id']}, Path: {folder['path']}")
        return root_folders

    def get_quality_profiles(self):
        """Retrieve quality profiles from Radarr."""
        quality_profile_url = f"{getattr(self, f'{self.warr}_url')}/api/v3/qualityprofile"
        headers = {"X-Api-Key": getattr(self, f'{self.warr}_api_key')}

        response = requests.get(quality_profile_url, headers=headers)
        response.raise_for_status()

        quality_profiles = response.json()
        for profile in quality_profiles:
            print(f"ID: {profile['id']}, Name: {profile['name']}")
        return quality_profiles
    
    def get_profiles(self):
        root_folders = self.get_root_folders()
        quality_profiles = self.get_quality_profiles()
        return root_folders, quality_profiles

    # Retrieve and print root folders and quality profiles

    def add(self, data, user_id):
        add_url = f"{getattr(self, f'{self.warr}_url')}/api/v3/movie"
        headers = {
            "X-Api-Key": getattr(self, f'{self.warr}_url'),
            "Content-Type": "application/json"
        }
        payload = {
            "tmdbId": int(data['tmdbId']),
            # "title" : data['title'],
            "qualityProfileId": data['qualityProfileId'],
            "rootFolderPath": data['rootFolderPath'],
            "monitored": True,
            "addOptions": {
                "searchForMovie": True
            }
        }

        response = requests.post(add_url, headers=headers, json=payload)
        # response.raise_for_status()
        print("raddarrr response")
        print(response)
        if response.status_code == 201:
            print("Movie added successfully.")
            return True
        else:
            print("Failed to add the movie:", response.json())
            return False

    def check_connection(self):
        """Check if the connection to the Radarr server is successful."""
        print("Checking connection to Radarr server...")
        print("aarrrrrrr", self.warr)
        test_url = f"{getattr(self, f'{self.warr}_url')}/api/v3/system/status"
        headers = {"X-Api-Key": getattr(self, f'{self.warr}_api_key')}

        try:
            response = requests.get(test_url, headers=headers)
            response.raise_for_status()
            print("Connection successful!")
            return {"status": True}
        except requests.exceptions.HTTPError as http_err:
            print(f"HTTP error occurred: {http_err}")
            print("error1")
            dic = {
                "status": False,
                "error": "HTTP error occurred",
                "message": http_err
            }
            return dic
        except requests.exceptions.RequestException as err:
            print(f"Error occurred: {err}")
            print("error2")
        return {"status": False}
    
    def isadded(self,data, user_id):
        get_url = f"{getattr(self, f'{self.warr}_url')}/api/v3/movie"
        headers = {
            "X-Api-Key": getattr(self, f'{self.warr}_api_key'),
            "Content-Type": "application/json"
        }

        response = requests.get(get_url, headers=headers)
        added_movies = []
        for i in response.json():
            added_movies.append(i['tmdbId'])
        print(added_movies)       

        if data['tmdbId'] in added_movies:
            print("Movie already added.") 
            return True
        else:
            if self.add(data, user_id):
                return True
            else:
                return False


watchlist_instance = watchlist()
