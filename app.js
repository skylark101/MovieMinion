

function clear() {
  document.getElementById('mname').innerHTML = "";
  document.getElementById('myear').innerHTML = "";
  document.getElementById('mimdb').innerHTML = "";
  document.getElementById('movie-poster').innerHTML = "";
  document.getElementById('downlink').innerHTML = "";
  document.getElementById("sub-link").innerHTML = "";

}
/*-----------APIs USED-------------*/


/*https://developers.themoviedb.org/*/
const api_key = "7aac52a729a8107a8c243de6e7943063";

/*https://www.omdbapi.com/*/
const api_key2 = "4a14d1f0";

/*https://yts.mx/api*/


/*opensubtitles-api*/
const sub_key = "W24rSqo88leLZlpua3NoWO3vIRjL753p";

//-----------------------FUNCTION TO GET MOVIE DETAILS-------------------------


var movieName = "";
var newName = "";
var year;
var imdbID;
function getMovieDetails(movie) {
  clear();

  movieName = movie.replaceAll(' ', '+');
  // console.log(movieName);
  var detURL = `https://www.omdbapi.com/?t=${movieName}&apikey=${api_key2}`;
  fetch(detURL)
    .then(response => response.json())
    .then(data => {

      document.getElementById('mname').innerHTML = data["Title"];
      document.getElementById('myear').innerHTML = data["Year"];
      document.getElementById('mimdb').innerHTML = data["imdbRating"];
      document.getElementById('movie-poster').setAttribute('src', data["Poster"]);
      imdbID = data["imdbID"];
      movieName = data["Title"] + '-' + data["Year"];
      var nwName = movieName.replaceAll('+', '-').replaceAll(': ', ' ').replaceAll(' :', ' ').replaceAll(':', ' ').replaceAll('!', ' ').replaceAll('?', ' ').replaceAll("'", '').replaceAll(".", '').replaceAll(',', ' ').replaceAll(' ', '-').replaceAll('---', '-').replaceAll('--', '-').replaceAll('----', '-');

      newName = nwName.trim();

      getLink(newName);
      getSubsId(imdbID.slice(2,imdbID.length));
    });




  document.getElementById('details').style.visibility = "visible";

}

// ---------------------MOVIE SEARCH WORKING-------------------------


document.getElementById('search-icon').addEventListener('click', () => {

  var mName = document.getElementById('movie-search').value;
  document.getElementById('refreshBtn').style.display = "none";

  // console.log(mName);
  getMovieDetails(mName);

})


// ---------------DRIVER FUNCTION FOR THE RANDOMIZER-------------------

function callRandom() {
  var genId = document.getElementById('genre').value;
  var genUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${api_key}&language=en-US&sort_by=popularity.desc&include_adult=false&vote_average.gte=5.0&with_genres=${genId}&include_video=false&page=1&with_watch_monetization_types=flatrate`;
  fetch(genUrl)
    .then(response => response.json())
    .then(dataGen => {
      var maxPages = 10 < dataGen["total_pages"] ? 10 : dataGen["total_pages"];
      randomizer(genId, maxPages);
    });

}




// --------------------------RANDOMIZER WORKING------------------------



function randomizer(genId, maxPages) {

  if (genId != "") {
    var randomPage = Math.floor((Math.random() * maxPages) + 1);
    var genUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${api_key}&page=${randomPage}&language=en-US&sort_by=popularity.desc&include_adult=false&vote_average.gte=5.0&with_genres=${genId}&include_video=false`;
    // console.log(genUrl);
    fetch(genUrl)
      .then(response => response.json())
      .then(dataGen => {

        var randomNum = Math.floor((Math.random() * dataGen["results"].length) + 1);
        var movName = dataGen["results"][randomNum]["title"];
        document.getElementById('refreshBtn').style.display = "block";
        getMovieDetails(movName);
      });
  }
}



// --------------------- THE TORRENT DOWNLOAD LINK --------------------

function getLink(nName) {


  /* ----------SCRAPING THE MOVIE ID FROM YTS.MX PAGE-----------------*/

  var xhr = new XMLHttpRequest();
  var URL = `https://yts.mx/movies/${nName}`;
  var url = URL.toLowerCase();
  // console.log(url);
  xhr.open("GET", url, true);
  xhr.responseType = "document";
  xhr.onload = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      var torrentID = xhr.responseXML.getElementById('movie-info').getAttribute("data-movie-id");
      // console.log(torrentID);


      /*--------------------GETTING THE TORRENT DOWNLOAD LINK FROM YTS.MX API------------*/
      var linkURL = `https://yts.mx/api/v2/movie_details.json?movie_id=${torrentID}`;

      fetch(linkURL)
        .then(response => response.json())
        .then(data => {

          var linkArray = data["data"]["movie"]["torrents"];
          for (var i = 0; i < linkArray.length; i++) {
            if (linkArray[i]["quality"] == "1080p") {
              document.getElementById('downlink').innerHTML = "Download here";
              document.getElementById('downlink').setAttribute("href", linkArray[i]["url"]);
              break;
            }
            else {
              document.getElementById('downlink').innerHTML = "N/A";
            }
          }

        });

    }
    else {
      console.log("error");
    }
  }
  xhr.send();
}

document.getElementById('movie-search').addEventListener('click', () => {
  document.getElementById('details').style.visibility = "hidden";
});






// -----------------------SUBTITLES SCRAPING---------------------------

function getSubsId(imdbID) {

  var url = `https://api.opensubtitles.com/api/v1/subtitles?imdb_id=${imdbID}`;
  const settings = {
    "async": true,
    "crossDomain": true,
    "url": url,
    "method": "GET",
    "headers": {
      "Content-Type": "application/json",
      "Api-Key": "W24rSqo88leLZlpua3NoWO3vIRjL753p"
    }
  };
  
  $.ajax(settings).done(function (response) {
    var file_id = response.data[0].attributes.files[0].file_id;
    downloadSub(file_id);
  });


}


async function downloadSub(file_id){
  const settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://api.opensubtitles.com/api/v1/download",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "Api-Key": "W24rSqo88leLZlpua3NoWO3vIRjL753p"
    },
    "processData": false,
    "data": `{\n  \"file_id\": ${file_id}\n}`
  };
  
  $.ajax(settings).done(function (response) {
    var sub_link = response["link"];
    setTimeout(function(){
      document.getElementById("sub-link").setAttribute('href',sub_link);
      document.getElementById("sub-link").innerHTML = "Download SRT";
    }, 2000);
  });
}
