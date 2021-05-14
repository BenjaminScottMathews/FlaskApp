from flask import Flask, request, json
import os
import requests
import json

app = Flask(__name__)
app.config['DEBUG']

genres = {}

@app.route('/')
def index():
    print("Handling request to home page.")  
    return (app.send_static_file('index.html'))

@app.route('/<topic>')
def getTrending(topic):
    baseURL = 'https://api.themoviedb.org/3/'
    apiKey = '?api_key=ead4095417bb16d1d6607abf17bbebcf'

    if (request.method == 'GET'):
        # TRENDING MOVIES
        if (topic == "movies"):
            url = (baseURL + 'trending/movie/week' + apiKey)
            titleKey = 'original_title'
            dateKey = 'release_date'
        # TV ON AIR
        else:
            url = (baseURL + 'tv/airing_today' + apiKey)
            titleKey = 'name'
            dateKey = 'first_air_date'

        response = requests.get(url)
        dataJSON = response.json()
        data = []
        for m in dataJSON['results']:
            if (len(data) == 5): break
            media = {}
            media ['name'] = m[titleKey]
            media ['poster'] = ('https://www.themoviedb.org/t/p/w780' + m['backdrop_path']) if (m.get('backdrop_path')) else "./static/media/movie-placeholder.jpg"
            media ['date'] = m[dateKey]
            data.append(media)
        return (json.dumps(data))

@app.route('/search/<category>')
def getSearch(category):
    # Variables for URL Construction
    baseURL = 'https://api.themoviedb.org/3/'
    apiKey = '?api_key=ead4095417bb16d1d6607abf17bbebcf'
    language = '&language=en-US'
    page = '&page=1'
    adult = '&include_adult=false'

    if (request.method == 'GET'):
        searchData = json.loads(category)
        query = searchData['query'].replace(" ", '%20')
        if (searchData["category"] == "Movies"):
           url = (baseURL + 'search/movie' + apiKey + '&query=' + query + language + page + adult)
        elif (searchData["category"] == "TV Shows"):
           url = (baseURL + 'search/tv' + apiKey + language + page + '&query=' + query + adult)
        else:
           url = (baseURL + 'search/multi' + apiKey + language + '&query=' + query + page + adult)
        response = requests.get(url)
        dataJSON = response.json()
        return processResults(dataJSON, searchData["category"])  
    return ()

# Function to process and store movie JSON we received
def processResults(media, category):
    data = []
    for m in media['results']:
        # If we have 10 results, we're finished with this query
        if (len(data) == 10): break
        if (category == "Movies and TV Shows"):
            currCat = m['media_type']
        else:
            currCat = 'tv' if (category == "TV Shows") else 'movie'
        # Create JSON object only including our desired attributes
        media = {}
        media ['id'] = m['id'] if (m.get('id')) else 'N/A'
        if currCat == "tv":
            media ['title'] = m['name'] if (m.get('name')) else 'N/A'
        elif currCat == "movie":
            media ['title'] = m['original_title'] if (m.get('original_title')) else 'N/A'
        media ['overview'] = m['overview'] if (m.get('overview')) else 'N/A'
        media ['poster'] = ('https://www.themoviedb.org/t/p/w185' + m['poster_path']) if (m.get('poster_path')) else './static/media/portraitDefault.png'
        if currCat == "tv":
            media ['date'] = m['first_air_date'] if (m.get('first_air_date')) else None
        elif currCat == "movie":
            media ['date'] = m['release_date'] if (m.get('release_date')) else None
        media ['vote_average'] = m['vote_average'] if (m.get('vote_average')) else 0
        media ['vote_count'] = m['vote_count'] if (m.get('vote_count')) else 0

        genreString = defGenres(m['genre_ids'] if m.get('genre_ids') else None) 
        media ['genres'] = genreString
        media ['category'] = currCat
        data.append(media)

    return (json.dumps(data))

# Retrieve genres from TMBD and manipulate the genre IDs to produce a string
def defGenres(genreIDs):
    global genres 
    baseURL = 'https://api.themoviedb.org/3/'
    apiKey = '?api_key=ead4095417bb16d1d6607abf17bbebcf'

     # If the genres haven't been fetched yet, fetch them!
    if not bool(genres):
        genreURL = baseURL + 'genre/movie/list' + apiKey + '&language=en-US'
        genreResponse = requests.get(genreURL)
        genreJSON = genreResponse.json()
        for i in genreJSON['genres']:
            genres[i['id']] = i['name']

        genreURL = baseURL + 'genre/tv/list' + apiKey + '&language=en-US'
        genreResponse = requests.get(genreURL)
        genreJSON = genreResponse.json()
        for i in genreJSON['genres']:
            genres[i['id']] = i['name']

    if (genreIDs == None): return 'N/A'

    realGenres = []
    for id in genreIDs:
        if (genres.get(id) != None):
            realGenres.append(genres.get(id))
    
    genreString = ""
    for i in range (len(realGenres)):
        genreString += realGenres[i]
        if (i<len(realGenres)-1):
            genreString += ", "

    return genreString

@app.route('/showMore/<media>')
def showMore (media):
    info = json.loads(media)
    baseURL = 'https://api.themoviedb.org/3/'
    apiKey = '?api_key=ead4095417bb16d1d6607abf17bbebcf'
    language = '&language=en-US'

    if (info['category'] == 'movie'):
        url = baseURL + 'movie/' + info['id'] + apiKey + language
        url2 = baseURL + 'movie/' + info['id'] + '/credits' + apiKey + language
        url3 = baseURL + 'movie/' + info['id'] + '/reviews' + apiKey + language
    if (info['category'] == 'tv'):
        url = baseURL + 'tv/' + info['id'] + apiKey + language
        url2 = baseURL + 'tv/' + info['id'] + '/credits' + apiKey + language
        url3 = baseURL + 'tv/' + info['id'] + '/reviews' + apiKey + language
    response = requests.get(url)
    dataJSON = response.json()
    response = requests.get(url2)
    castJSON = response.json()
    response = requests.get(url3)
    reviewJSON = response.json()

    data = {}
    if info['category'] == "tv":
        data ['title'] = dataJSON['name'] if (dataJSON.get('name')) else 'N/A'
        data ['date'] = dataJSON['first_air_date'] if (dataJSON.get('first_air_date')) else None
        data ['runtime'] = dataJSON['episode_run_time'] if (dataJSON.get('episode_run_time')) else 'N/A'
        data ['seasons'] = dataJSON['number_of_seasons'] if (dataJSON.get('number_of_seasons')) else 'N/A'
    else:
        data ['title'] = dataJSON['original_title'] if (dataJSON.get('original_title')) else 'N/A'
        data ['date'] = dataJSON['release_date'] if (dataJSON.get('release_date')) else None
        data ['runtime'] = dataJSON['runtime'] if (dataJSON.get('runtime')) else 'N/A'
    data['id'] = info['id']
    data['category'] = info['category']
    data ['overview'] = dataJSON['overview'] if (dataJSON.get('overview')) else 'N/A'
    data ['poster'] = ('https://www.themoviedb.org/t/p/w185' + dataJSON['poster_path']) if (dataJSON.get('poster_path')) else './static/media/movie-placeholder.jpg'
    data ['vote_average'] = dataJSON['vote_average'] if (dataJSON.get('vote_average')) else 0
    data ['vote_count'] = dataJSON['vote_count'] if (dataJSON.get('vote_count')) else 0
    genreNames = []
    genreString = ""
    for gen in dataJSON['genres']:
        genreNames.append(gen['name'])
        genreString = ', '.join(genreNames) if len(genreNames)!= 0 else 'N/A'
    data ['genres'] = genreString if (len(genreString)!=0) else 'N/A'
    langs = []
    langStr = ''
    for lang in dataJSON['spoken_languages']:
        langs.append(lang['english_name'])
        langStr = ', '.join(langs) if (len(langs) != 0) else 'N/A'
    data['lang'] = langStr if (len(langStr)!=0) else 'N/A'
    data['backdrop'] = 'https://www.themoviedb.org/t/p/w780' + dataJSON['backdrop_path'] if (dataJSON.get('backdrop_path')) else "./static/media/movie-placeholder.jpg"

    # GET CAST INFO
    data['cast'] = processCast(castJSON)

    # GET REVIEW INFO
    data['reviews'] = processReviews(reviewJSON)

    return (json.dumps(data))

def processCast(castJSON):
    cast = []
    for c in castJSON['cast']:
        if (len(cast) == 8): break
        actor = {}
        actor['name'] = c['name'] if (c.get('name')) else 'N/A'
        actor['headshot'] = ('https://www.themoviedb.org/t/p/w185' + c['profile_path']) if (c.get('profile_path')) else './static/media/person-placeholder.png'
        actor['role'] = c['character'] if (c.get('character')) else 'N/A'
        cast.append(actor)
    return (cast)

def processReviews(reviewsJSON):
    reviews = []
    for r in reviewsJSON['results']:
        if (len(reviews) == 5): break
        review = {}
        authorDetails = r['author_details']
        review['username'] = authorDetails['username'] if (authorDetails.get('username')) else 'N/A'
        review['rating'] =  authorDetails['rating'] if (authorDetails.get('rating')) else 0
        review['content'] = r['content'] if (r.get('content')) else 'N/A'
        review['date'] = r['created_at'] if (r.get('created_at')) else 'N/A'
        reviews.append(review)
    return reviews if (len(reviews) != 0) else 'No Reviews Found'


