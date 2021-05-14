var interval
var dataJSON = []

document.addEventListener('DOMContentLoaded', () =>
{
    switchPage('home')
    //Grabs the 5 necessary JSON objects for Trending Movies and On-Air TV
    const routes = ['/movies', '/tv']
    var requests = new Array(routes.length)
    
    for (let i=0; i<routes.length; i++)
    {
        requests[i] = new XMLHttpRequest()
        requests[i].open('GET', routes[i], true)
        requests[i].send()
        requests[i].onreadystatechange = function()
        {
            if (this.readyState == 4 && this.status == 200)
            {
                dataJSON[i] = (JSON.parse(requests[i].responseText))
                if (dataJSON.length == 2)
                {
                    if (dataJSON[0] && dataJSON[1])
                    {
                        updateStats()
                        interval = setInterval(updateStats, 5000)
                    }
                }
            }
        }
    }
})

//Switch tab item colors and display corresponding elements
function switchPage(destination)
{
    if (destination == 'home')
    {
        document.getElementById("homeBtn").disabled = true;
        document.getElementById("searchBtn").disabled = false;
        document.getElementById('hUnderline').style.opacity = 1;
        document.getElementById('sUnderline').style.opacity = 0;
        document.getElementById('MovieContainer').style.display = 'block';
        document.getElementById('TVContainer').style.display = 'block';  
        document.getElementById('Search').style.display = 'none';
        document.getElementById('Results').style.display = 'none';
    }
    else
    {
        document.getElementById("homeBtn").disabled =false;
        document.getElementById("searchBtn").disabled = true;
        document.getElementById('hUnderline').style.opacity = 0;
        document.getElementById('sUnderline').style.opacity = 1;
        document.getElementById('MovieContainer').style.display = 'none';
        document.getElementById('TVContainer').style.display = 'none';
        document.getElementById('Search').style.display = 'block'; 
        document.getElementById('Results').style.display = 'block';
    }
}

var index = 0
function updateStats()
{
    const elemType = ['Movie', 'TV']
    
    for (i=0; i<elemType.length; i++)
    {
        if (index==5){index=0}
        document.getElementById(elemType[i]+'Pic').src = dataJSON[i][index]['poster'];
        document.getElementById(elemType[i]+'Title').innerHTML = dataJSON[i][index]['name'] + ' (' + dataJSON[i][index]['date'].split('-', 1) + ')';

        var fadeIns = document.getElementsByClassName('fadeDiv');
        for (e of fadeIns)
        {
            e.animate([{opacity: 0},
                        {opacity: 1}],
                        {duration: 1000,
                        iterations: 1});
        }
        index++;
    }
}

function search()
{
    let query = document.getElementById("Query").value
    let category = document.getElementById("Category").value
    if (query == null || category == null || query.trim() == "" || category == "")
    {
        alert("Please enter valid values.")
    }
    else
    {
        var searchData = 
        {
            "category" : category,
            "query" : query
        }

        request = new XMLHttpRequest
        request.open('GET', '/search/'+JSON.stringify(searchData), true)
        request.send()
        request.onreadystatechange = function()
        {
            if (this.readyState==4 && this.status == 200)
            {
                showResults(JSON.parse(request.responseText))
            }
        }
    }
}

function showResults(results)
{
    //Clear last search if there is one
    if (document.getElementById('resultCont')!= null)
    {
        document.getElementById('resultCont').remove();
    }

    var resultContainer = document.createElement('DIV');
    resultContainer.id = "resultCont";
    document.getElementById('Results').appendChild(resultContainer);

    //TODO MAKE IT SAY NO RESULTS IF NO RESULTS
    var resultHeader = document.createElement('H3');
    resultHeader.style.fontWeight = 300;
    resultHeader.style.fontSize = '14px';
    resultHeader.style.marginTop = '3%';
    resultHeader.style.fontFamily = 'Raleway, sans-serif';
    resultHeader.style.color = 'white';

    // Notify of no results of of results found!
    if (results.length == 0)
    {
        resultHeader.innerHTML  = 'No results found.';
        resultHeader.style.textAlign = 'center';
    }
    else 
    {
        resultHeader.innerHTML = 'Showing results...'
        resultHeader.style.textAlign = 'left';
    }

    resultContainer.appendChild(resultHeader);

    // Main loop for creating new div elements
    for (r of results)
    {
        // CREATE DIV to hold result
        var mediaDiv = document.createElement('DIV')
        mediaDiv.className = 'result'
        mediaDiv.style.display = 'grid';
        mediaDiv.style.gridColumnGap = '3%';
        mediaDiv.style.gridTemplateColumns = 'min-content';
        mediaDiv.style.fontFamily = 'Raleway, sans-serif';
        mediaDiv.style.marginBottom = "2%";

        // CREATE POSTER and APPEND
        var mediaPoster = document.createElement('DIV');
        var picInPost = document.createElement('IMG');
        picInPost.src = r['poster'];
        picInPost.style.margin = '5%';
        mediaPoster.appendChild(picInPost);
        mediaPoster.style.gridColumn = 1;
        mediaPoster.style.gridRow = '1 / span 4';
        mediaPoster.style.borderLeft = '8px solid firebrick';
        mediaDiv.append(mediaPoster);

        // CREATE TITLE and APPEND
        var mediaTitle = document.createElement('DIV');
        mediaTitle.innerHTML = r['title'];
        mediaTitle.style.color = 'white';
        mediaTitle.style.marginTop = '4%';
        mediaTitle.style.width = '100%';
        mediaTitle.style.gridColumn = '2 / span 4';
        mediaTitle.style.gridRow = 1;
        mediaTitle.style.fontSize = '20px';
        mediaTitle.style.fontWeight = 600;
        mediaDiv.append(mediaTitle)

        // CREATE INFO and APPEND
        var mediaInfo = document.createElement('DIV');
        var date = (r['date'] != null) ? r['date'].split('-', 1) : 'N/A';
        var yearAndGenres = date + ' | ' + r['genres'];
        mediaInfo.innerHTML = '<br>';
        mediaInfo.innerHTML += yearAndGenres;
        // Capture and operate on rating
        var rating = document.createElement('DIV');
        rating.innerHTML += '<span style="color:firebrick;"> &#9733 ' + ((r['vote_average']/10.0)*5).toFixed(2) + '/5&ensp; </span>';
        rating.innerHTML += '<span style="color:white;">' + (r['vote_count'] + ' votes') + ' </span>';
        rating.innerHTML += '<br><br>';
        rating.innerHTML += (r['overview'] != null) ? r['overview'].replace('\n', "") : 'N/A';
        rating.innerHTML += '<br><br>';
        mediaInfo.append(rating);
        // Capture and operator on vote counts
        mediaInfo.style.color = 'lightgray';
        mediaInfo.style.gridColumn = '2 / span 4';
        mediaInfo.style.gridRow = 2;
        mediaInfo.style.fontWeight= 300;
        mediaInfo.style.fontSize = '13px';
        mediaInfo.style.marginTop = '3px';
        mediaDiv.append(mediaInfo);

        // CREAT SHOWMORE BUTTON and APPEND
        var showMoreBtn = document.createElement('BUTTON');
        showMoreBtn.innerHTML = 'Show more';
        showMoreBtn.style.color = 'white';
        showMoreBtn.style.width = '90px';
        showMoreBtn.style.height = '30px';
        showMoreBtn.style.marginTop = '3px';
        showMoreBtn.style.fontFamily = 'Raleway, sans-serif';
        showMoreBtn.style.border = 'none';
        showMoreBtn.style.borderRadius = '5px';
        showMoreBtn.style.backgroundColor = 'firebrick';
        showMoreBtn.style.gridColumn = 2;
        showMoreBtn.style.gridRow = 3;
        showMoreBtn.name = r['id'] + '-' + r['category'];
        showMoreBtn.addEventListener("mouseenter", function() {this.style.backgroundColor="lightgray"});
        showMoreBtn.addEventListener("mouseleave", function() {this.style.backgroundColor="firebrick"});
        showMoreBtn.addEventListener("click", function() {showMore(this.name)});
        mediaDiv.append(showMoreBtn);

        var resContainer = document.getElementById('resultCont');
        resContainer.appendChild(mediaDiv);
        resContainer.style.gridColumn = 5;
        resContainer.style.gridRow = 4;
    }
}

function clearRes()
{
    var myForm = document.getElementsByTagName('Form');
    myForm[0].reset();
    document.getElementById('Category').selectedIndex = 0;
    document.getElementById('resultCont').remove();
}

//This function calls our back end to send us more info about the selected media
function showMore(media)
{
    var info = media.split('-');
    let searchData = 
    {
        "category" : info[1],
        "id" : info[0]
    }

    let request = new XMLHttpRequest
    request.open('GET', '/showMore/'+JSON.stringify(searchData), true)
    request.send()
    request.onreadystatechange = function()
    {
        if (this.readyState==4 && this.status == 200)
        {
            displayPopup(JSON.parse(request.responseText))
        }
    }
}

// Display the actual popup for the movie with all the details
function displayPopup(mediaData)
{
    let baseURL = 'https://www.themoviedb.org/';

    document.getElementById('Modal').style.display = 'block';
    document.getElementById('sourcePoster').src = mediaData['backdrop'];
    document.getElementById('infoBtn').href = baseURL + mediaData['category'] + '/' + mediaData['id'];
    document.getElementById('infoBtn').style.fontFamily = 'Raleway, sans-serif';
    document.getElementById('movieTitle').innerHTML = mediaData['title'];
    document.getElementById('movieTitle').style.fontFamily = 'Raleway, sans-serif';
    let currDate = (mediaData['date'] != null) ? mediaData['date'].split('-', 1) : 'N/A';
    document.getElementById('yearAndGenres').innerHTML = currDate + ' | ' + mediaData['genres'];
    document.getElementById('yearAndGenres').style.fontFamily = 'Raleway, sans-serif';
    document.getElementById('yearAndGenres').style.fontWeight = 500;
    document.getElementById('ratingAndVotes').innerHTML = '<span style="color:firebrick;"> &#9733 ' + ((mediaData['vote_average']/10.0)*5).toFixed(2) + '/5&ensp; </span>';
    document.getElementById('ratingAndVotes').innerHTML += (mediaData['vote_count'] + ' votes') + '<br><br>';
    document.getElementById('ratingAndVotes').style.fontFamily = 'Raleway, sans-serif';
    document.getElementById('ratingAndVotes').style.fontSize = "12px";
    document.getElementById('overview').innerHTML = mediaData['overview'];
    document.getElementById('overview').style.fontFamily = 'Raleway, sans-serif';
    document.getElementById('overview').style.fontWeight = 500;
    document.getElementById('languages').innerHTML = 'Spoken languages: ' + mediaData['lang'];
    document.getElementById('languages').style.fontFamily = 'Raleway, sans-serif';
    document.getElementById('close').addEventListener("click", closeModal);

    const modalCard = document.getElementById("ModalCard");
    // Form and display grid of cast members
    var castHeadline = document.createElement('H3');
    castHeadline.style.fontFamily = 'Raleway, sans-serif';
    castHeadline.id = 'castHL';
    castHeadline.style.marginLeft = '5%';
    castHeadline.style.marginTop = '6%';
    castHeadline.style.marginBottom = '2%';
    castHeadline.innerHTML = 'Cast';
    modalCard.appendChild(castHeadline);

    // Display Cast in Grid
    var castGrid = document.createElement("DIV");
    castGrid.id = 'CastGrid';
    modalCard.appendChild(castGrid);
    const cast = mediaData['cast'];
    var row = 1;
    var col = 0;

    for (person of cast)
    {
        row = (col/4 != 0 ? 1+col/4 : row)
        col = (col%4 != 0 ? col+1 : 1);
        
        //Create the elements 
        var p = document.createElement('DIV');
        p.className = 'member';
        var pHeadShot = document.createElement('IMG');
        var pName = document.createElement('DIV');
        var pAS = document.createElement('DIV');
        var pCharacter = document.createElement('DIV');

        //Fill the elements with their content
        pHeadShot.src = person['headshot'];
        console.log(person['headshot']);
        pName.style.marginTop = '1%';
        pName.innerHTML = '<span style="font-weight: 700;">' + person['name'] + '</span>';
        pAS.innerHTML = 'AS';
        pCharacter.innerHTML = '<span style="font-weight: 300;">' + person['role'] + '</span>';
        //Add the elements to their parents
        p.appendChild(pHeadShot);
        p.appendChild(pName);
        p.appendChild(pAS);					
        p.appendChild(pCharacter);
        castGrid.appendChild(p);

        p.style.gridColumn = col;
        p.style.gridRow = row;
    }

    // Create and append 'Reviews' headline
    var revHeadline = document.createElement('H3');
    revHeadline.id = 'revHL';
    revHeadline.innerHTML = 'Reviews';
    revHeadline.style.marginLeft = '5%';
    revHeadline.style.marginTop = '6%';
    revHeadline.style.marginBottom = '2%';
    modalCard.appendChild(revHeadline);

    // Form and display reviews
    var revDiv = document.createElement('DIV');
    revDiv.style.width = '90%';
    revDiv.style.paddingBottom = '2%';
    revDiv.style.fontFamily = 'Raleway, sans-serif';
    revDiv.style.fontSize = "13px";
    revDiv.style.marginLeft = '5%';
    revDiv.id = 'Reviews';
    modalCard.appendChild(revDiv);
    var reviews = mediaData['reviews'];
    
    for (rev of reviews)
    {
        var currRev = document.createElement('DIV');
        var nameAndDate = document.createElement('DIV');
        nameAndDate.style.fontSize = '13';
        pCharacter.style.fontWeight = 100;
        nameAndDate.innerHTML = '<span style="font-weight: 700; font-size: 14px;">' + rev['username'] + '</span>';
        var date = rev['date'];
        if (date != 'N/A')
        {
            var noTime = date.split('T',1);
            var splitDate = noTime[0].split('-', 3);
            var dateStr = '';
            dateStr += ' on ' + splitDate[1] + '/' + splitDate[2] + '/' + splitDate[0] + '<br><br>';
        }
        nameAndDate.innerHTML += dateStr;
        currRev.appendChild(nameAndDate);

        if (rev['rating'] != 0)
        {
            var rating = document.createElement('DIV');
            rating.innerHTML = '&#9733 ' + rev['rating']/10.0*5 + '/5';
            rating.style.color = 'firebrick';
            currRev.appendChild(rating);
        }

        var content = document.createElement('DIV');
        content.id = 'ModalReviews';
        var hrLine = document.createElement('DIV');
        hrLine.style.height = '2px';
        hrLine.style.width = '80%';
        hrLine.style.backgroundColor = 'gray';
        hrLine.style.opacity = .3;
        hrLine.style.marginTop = '2%';
        hrLine.style.marginLeft = '10%';
        hrLine.style.marginBottom = '3%';
        
        content.innerHTML = rev['content'];
        currRev.appendChild(content);
        currRev.appendChild(hrLine);
        revDiv.appendChild(currRev);
    }
}

// Clear the info in the current modal and hide it
function closeModal()
{
    document.getElementById('Modal').style.display = 'none';
    document.getElementById('sourcePoster').src = "";
    document.getElementById('movieTitle').innerHTML = "";
    document.getElementById('yearAndGenres').innerHTML = "";
    document.getElementById('ratingAndVotes').innerHTML = "";
    document.getElementById('overview').innerHTML = "";
    document.getElementById('languages').innerHTML = "";
    document.getElementById('castHL').remove();
    document.getElementById('revHL').remove();
    document.getElementById('CastGrid').remove();
    document.getElementById('Reviews').remove();
}