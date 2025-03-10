import tvdb_v4_official
import random

# tvdb = tvdb_v4_official.TVDB("




class series:
    def discover(page):
        data = []
        series_list = tvdb.get_all_series(page)
        for series in series_list:
            dic = {
                "id": series.get("id"),
                "name": series.get("name"),
                "overview": series.get("overview"),
                "year": series.get("year")
            }
            if series["image"] is not None:
                dic["image"] = "https://artworks.thetvdb.com" + series.get("image")
            else:
                dic["image"] = "unavailable"

            data.append(dic)
        return data


    def get_details(id):
        info = tvdb.get_series_extended(id)
        if info is None:
                return {"error": "Failed to retrieve series information"}
        data = {
            "id" : id,
            "name" : info.get("name"),
            "year" : info.get("year"),
            "image" : info.get("image"),
            "trailers" : info.get("trailers"),
            "genres" : info.get("genres"),
            "cast" : info.get("characters"),
            "seasons": info.get("seasons"),
            "content_rating": info.get("contentRatings")
        }

        try:
            data["overview"] =  info.get("lists")[0]["overview"]
        except:
            data["overview"] = ""
        for art in info.get("artworks"):
            print(art)
            if art["type"] == 15 and art["width"] == 1920 and art["height"] == 1080:
                
                data["bg"] = art["image"]
                break

        return data
    
    def epinfo(season):
            info = tvdb.get_series_episodes(121361)
            data = []
            for ep in info["episodes"]:
                dic = {}
                if ep["seasonNumber"] == season:
                    dic = {
                        "id" : ep["name"],
                        "aired" : ep["aired"],
                        "overview" : ep["overview"],
                        "image" : ep["image"]
                    }
                    data.append(dic)



class movies:
      def discover(page):
        data = []
        movie = tvdb.get_all_movies(1)
        for mov in movie:
            dic = {
                "id": mov.get("id"),
                "name": mov.get("name"),
                "year": mov.get("year")
            }
            if mov["image"] is not None:
                dic["image"] = "https://artworks.thetvdb.com" +  mov.get("image")
            else:
                dic["image"] = "unavailable"

            data.append(dic)
        return data

      def get_details(id):
        details = tvdb.get_movie_extended(id)
        data = {
            "id" : id,
            "name" : details["name"],
            "year" : details["year"],
            "image" : details["image"],
            "trailers" : details["trailers"],
            "genres" : details["genres"],
            "cast" : details["characters"],
        }

        try:
            data["overview"] =  details["lists"][0]["overview"]
        except:
            data["overview"] = ""
        for art in details["artworks"]:
            if art["type"] == 15 and art["width"] == 1920 and art["height"] == 1080:
                
                data["bg"] = art["image"]
                break

        return data

class home:
    def get_home():
        page = random.randint(1, 10)
        start = random.randint(1, 30)
        discover = tvdb.get_all_movies(page)[start: start + 3]
        discover_details = []
        for mov in discover:
            details = tvdb.get_movie_extended(mov["id"])
            mov_details = ({
                "id": mov["id"],
                "name": mov["name"],
            })
            try:
                if details["lists"][0]["overview"] != "None":
                    mov_details["overview"] = details["lists"][0]["overview"]
                else:
                    mov_details["overview"] = ""
            except:
                mov_details["overview"] = ""
            for art in details["artworks"]:
                if art["type"] == 15 and art["width"] == 1920 and art["height"] == 1080:
                    mov_details["bg"] = art["image"]
                    break
            discover_details.append(mov_details)
        # print(discover_details)

        top_shows = []
        for i in range(0,1):
            page_shows = tvdb.get_all_series(i)
            for show in page_shows:
                if show['image'] is None:
                    continue
                if show['image'] is not None:
                    show['image'] =  "https://artworks.thetvdb.com" + show['image']
                else:
                    show['image'] = ""
                top_shows.append(show)

        top_shows = sorted(top_shows, key=lambda x: x['score'], reverse=True)
        top_movies = []
        for i in range(0,1):
            page_movies = tvdb.get_all_movies(i)
            for movie in page_movies:
                if movie['image'] is not None:
                    movie['image'] =  "https://artworks.thetvdb.com" + movie['image']
                else:
                    movie['image'] = ""
                top_movies.append(movie)
        top_movies = sorted(top_movies, key=lambda x: x['score'], reverse=True)
        return discover_details, top_shows, top_movies

            
home.get_home()