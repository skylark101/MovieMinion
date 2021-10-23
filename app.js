

function clear(){
  document.getElementById('mname').innerHTML = "";
  document.getElementById('myear').innerHTML = "";
  document.getElementById('mimdb').innerHTML = "";
  document.getElementById('movie-poster').innerHTML = "";
  document.getElementById('downlink').innerHTML = "";
}
/*-----------APIs USED-------------*/


/*https://developers.themoviedb.org/*/
const api_key = "7aac52a729a8107a8c243de6e7943063";

/*https://www.omdbapi.com/*/
const api_key2 = "4a14d1f0";

/*https://yts.mx/api*/


//-----------------------FUNCTION TO GET MOVIE DETAILS-------------------------


var movieName = "";
var newName = "";
var year;
var imdbID;
function getMovieDetails(movie){
  clear();

  movieName = movie.replaceAll(' ','+');
  var detURL = `https://www.omdbapi.com/?t=${movieName}&apikey=${api_key2}`;
  fetch(detURL)
  .then(response => response.json())
  .then(data=>{

    document.getElementById('mname').innerHTML = data["Title"];
    document.getElementById('myear').innerHTML = data["Year"];
    document.getElementById('mimdb').innerHTML = data["imdbRating"];
    document.getElementById('movie-poster').setAttribute('src',data["Poster"]);

    movieName = data["Title"]+ '-' + data["Year"];
    var nwName = movieName.replaceAll('+','-').replaceAll(': ',' ').replaceAll(' :',' ').replaceAll(':',' ').replaceAll('!',' ').replaceAll('?',' ').replaceAll("'",'').replaceAll(',',' ').replaceAll(' ','-');
    newName = nwName.trim();
    console.log(newName);
    getLink(newName);
  });
 


   
    document.getElementById('details').style.visibility = "visible";
 
}

// ---------------------MOVIE SEARCH WORKING-------------------------


document.getElementById('search-icon').addEventListener('click',()=>{

  var mName = document.getElementById('movie-search').value;
  document.getElementById('refreshBtn').style.display="none";

  getMovieDetails(mName);
  
})




// --------------------------RANDOMIZER WORKING------------------------



document.getElementById('btn-search').addEventListener('click',randomizer);

function randomizer(){

  var genId = document.getElementById('genre').value;
  if (genId != ""){
    var genUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${api_key}&language=en-US&sort_by=popularity.desc&include_adult=false&with_genres=${genId}&include_video=false&page=1&with_watch_monetization_types=flatrate`;
    fetch(genUrl)
  .then(response => response.json())
  .then(dataGen=>{

    var randomNum = Math.floor((Math.random() * dataGen["results"].length) + 1);
    var movName = dataGen["results"][randomNum]["title"];
    document.getElementById('refreshBtn').style.display="block";
    getMovieDetails(movName);
  });
  }
}



// --------------------- THE TORRENT DOWNLOAD LINK --------------------

function getLink(newName){

  
  /* ----------SCRAPING THE MOVIE ID FROM YTS.MX PAGE-----------------*/

  var xhr = new XMLHttpRequest();
  var URL = `https://yts.mx/movies/${newName}`;
  var url = URL.toLowerCase();
  console.log(url);
  xhr.open("GET",url,true);
  xhr.responseType = "document";
  xhr.onload = function(){
    if(xhr.readyState == 4 && xhr.status == 200){
      var torrentID = xhr.responseXML.getElementById('movie-info').getAttribute("data-movie-id");
      console.log(torrentID);


      /*--------------------GETTING THE TORRENT DOWNLOAD LINK FROM YTS.MX API------------*/
      var linkURL =  `https://yts.mx/api/v2/movie_details.json?movie_id=${torrentID}`;
     
      fetch(linkURL)
  .then(response => response.json())
  .then(data=>{

    var linkArray = data["data"]["movie"]["torrents"];
    for(var i = 0; i<linkArray.length;i++){
      if(linkArray[i]["quality"] == "720p"){
        document.getElementById('downlink').innerHTML = "Download here";
        document.getElementById('downlink').setAttribute("href",linkArray[i]["url"]);

      }
      else{
        document.getElementById('downlink').innerHTML = "N/A";
    }
    
  });
    }
  };
  xhr.onerror = function(){
    console.log(xhr.status,xhr.statusText);
  }
  xhr.send();
}

 
