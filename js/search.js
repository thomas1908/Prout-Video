const ssoTmdbReadApiKey = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNjg1NTBmYTRlODIzMWE1MWVlZGViNjYyNGRkNzFjNSIsInN1YiI6IjY1YWZjMjA2MTU4Yzg1MDBhYzFkMzdmYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.-zClmVb2mljRLrKfpdAGMHUNc53hcS2MWsSOUWaj26w'

window.onload = async () => {
    if (localStorage.length < 2 || localStorage.getItem('tmdbSessionId') == 'undefined') {
        hideloginbutton();
    }
    else{
        hidedecobutton();
    }
    if (!location.search.includes('request_token=')) {
        return
    }

    let token = location.search.split('request_token=')[1]?.split('&')?.[0]

    if(token) {
        getNewSession(token)
        .then(sessionData => {
            localStorage.setItem('tmdbSessionId', sessionData.session_id)
            localStorage.setItem('tmdbSessionToken', token)
            location.href = 'http://127.0.0.1:3000' //reload dans la barre de navigation
        })
        .catch(err => {
            console.error(err);
            location.href = 'http://127.0.0.1:3000'
        })
    }

   
}

// Cette fonction verifie qu'un token existe et redirige l'utilisateur vers le lien tmdb pour valider le token
async function redirectUserToSSO() {
    let tokenData = await getNewTMDBToken()
    if (!tokenData.success) {
        return alert('Une erreur est survenue et je ne peux pas vous identifier')
    }
    location.href = `https://www.themoviedb.org/authenticate/${tokenData.request_token}?redirect_to=http://127.0.0.1:3000`
}

// Cette fonction fait une requete a tmdb pour obtenir  un token vierge a faire valider par le user

async function getNewTMDBToken() {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${ssoTmdbReadApiKey}`
        }
    };

    let tokenRequest = await fetch('https://api.themoviedb.org/3/authentication/token/new', options).catch(err => console.error('error:' + err));
    if (!tokenRequest) {
        return
    }

    let tokenData = await tokenRequest.json()

   

    return tokenData;
}


async function getNewSession(token) {
    const options = {
        method: 'POST', 
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            Authorization: `Bearer ${ssoTmdbReadApiKey}`
        },
        body: JSON.stringify({request_token: token})
    };

    let sessionRequest = await fetch('https://api.themoviedb.org/3/authentication/session/new', options).catch(err => console.error('error:' + err));
    if (!sessionRequest) {
        return
    }

    let sessionData = await sessionRequest.json();
    console.log(sessionData);
    
    return sessionData;
}

function deletSession() {
    localStorage.removeItem('tmdbSessionId');
    localStorage.removeItem('tmdbSessionToken');
}


function hideloginbutton() {
    document.getElementById('buttonDelete').style.display = 'none';
    document.getElementById('redirectssobutton').style.display = 'block';

}
function hidedecobutton() {
    document.getElementById('buttonDelete').style.display = 'block';
    document.getElementById('redirectssobutton').style.display = 'none';
}


function buttonDelete() {
    let delSession = document.getElementById('buttonDelete');
    delSession.addEventListener('click', () => deletSession());
}
buttonDelete()

function buttonSignSession() {
    let redirButton = document.getElementById('redirectssobutton');
    redirButton.addEventListener('click', () => redirectUserToSSO());
}
buttonSignSession()

function deconnexionaffiche() {
    let deco = document.getElementById('buttonDelete');
    deco.addEventListener('click',()=> hideloginbutton());
}
deconnexionaffiche()

async function searchMovie(input, pageNumber) {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${ssoTmdbReadApiKey}`
        }
    };

    const searchResponse = await fetch(`https://api.themoviedb.org/3/search/movie?query=${input}&include_adult=false&language=en-US&page=${pageNumber}`, options).catch(err => console.error(err));
    if (!searchResponse) {
        return;
    }

    let searchResults = await searchResponse.json();

    return searchResults;
}

function getInput(){
    let searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', async () => {
        let input = searchInput.value;
        console.log(input)

        clearSearchResults();

        await displayMovie(input);
    });
}

function clearSearchResults() {
    let searchResults = document.querySelectorAll('div.searchMovieDiv');
    searchResults.forEach(result => {
        result.innerHTML = '';
    });
}

async function displayMovie(input) {
    let pageNumber = 1;
    let movieData = await searchMovie(input, pageNumber);
    let pageNumberSearch = movieData.total_pages;

    function appendMovies(results) {
        let main = document.querySelector('main');
        results.forEach(movie => {
            let movieId = movie.id;
            let movieDiv = document.createElement('div');
            movieDiv.className = 'searchMovieDiv';
            movieDiv.innerHTML = `
                <h2>${movie.title}</h2>
                <a href='http://127.0.0.1:3000/movie.html?${movieId}' target="_blank"><img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}"></a>
            `;
            main.appendChild(movieDiv);
        });
    }
    
    appendMovies(movieData.results);

    window.onscroll = async function () {
        let windowHeight = window.innerHeight;
        let scrollHeight = document.body.scrollHeight;
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (windowHeight + scrollTop >= scrollHeight) {
            console.log("Vous êtes arrivé en bas de la page !");
            pageNumber++;
            if (pageNumber > pageNumberSearch) {
                window.onscroll = null;
                return;
            }
            movieData = await searchMovie(input, pageNumber);
            appendMovies(movieData.results);
        }
    };
}

getInput();

async function getAccount(){
    let session_id = localStorage.getItem('tmdbSessionId');
    console.log(session_id)
    const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${ssoTmdbReadApiKey}`
        }
      };
      
    let accountResponse = await fetch(`https://api.themoviedb.org/3/account?session_id=${session_id}`, options).catch(err => console.error(err));
    if(!accountResponse){
        return
    }
    let accountData = await accountResponse.json();
    return accountData;
}

async function displayAccount(){
    let account = await getAccount();
    let avatar = document.getElementById('accountAvatar');
    avatar.src = `https://image.tmdb.org/t/p/w500${account.avatar.tmdb.avatar_path}" alt="${account.username}`;
}

displayAccount();