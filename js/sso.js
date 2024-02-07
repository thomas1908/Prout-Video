const ssoTmdbReadApiKey = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNjg1NTBmYTRlODIzMWE1MWVlZGViNjYyNGRkNzFjNSIsInN1YiI6IjY1YWZjMjA2MTU4Yzg1MDBhYzFkMzdmYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.-zClmVb2mljRLrKfpdAGMHUNc53hcS2MWsSOUWaj26w'

// verifie si un token est dans le lien d'accès, stocke le token et reload la page 
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
    delSession.addEventListener('click', () => {
        deletSession()
        hideloginbutton()
    });
}
buttonDelete()

function buttonSignSession() {
    let redirButton = document.getElementById('redirectssobutton');
    redirButton.addEventListener('click', () => redirectUserToSSO());
}
buttonSignSession()


async function getTrendMovie(page = 1){
    const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${ssoTmdbReadApiKey}`
            }
        };
        
    let responseMovie = await fetch(`https://api.themoviedb.org/3/trending/movie/day?language=en-US&page=${page}`, options).catch(err => console.error('error:' + err))
    if(!responseMovie){
            return
    }
    let movieData = await responseMovie.json();

    return movieData;   
}

async function displayTrendMovie(){
    let page = 1;
    let movieData = await getTrendMovie(page);
    console.log(movieData)
    let allPage = movieData.total_pages;
    const moviePoster = movieData.results.map(element => element.poster_path);
    const movieName = movieData.results.map(element => element.original_title);
    const movieDate = movieData.results.map(element => element.release_date);
    let compt = 0;
    moviePoster.forEach((element) => {
        let movieId = movieData.results[compt].id;
        let title = document.createTextNode(movieName[compt]);
        let date = document.createTextNode(movieDate[compt]);
        let lien = `http://127.0.0.1:3000/movie.html?${movieId}`;
        let main = document.querySelector('main');

        let img = document.createElement('img');
        
        let card = document.createElement('div');
        let ancre = document.createElement('a');
        let ancre2 = document.createElement('a');
        let cardContent = document.createElement('div');
        let cardTitle = document.createElement('p');
        let cardDate = document.createElement('p');


        cardDate.setAttribute('class','card__description');
        cardTitle.setAttribute('class','card__title');
        cardContent.setAttribute('class','card__content');
        ancre2.setAttribute('href', lien);
        ancre.setAttribute('href', lien);
        card.setAttribute('id','MovieTrend');
        card.setAttribute('class','card');
        img.setAttribute('id','PosterTrend');

        img.src = `https://image.tmdb.org/t/p/w500${element}`;

        ancre.appendChild(img);
        card.appendChild(ancre);
        cardTitle.appendChild(title);
        cardDate.appendChild(date);
        cardContent.appendChild(cardTitle);
        cardContent.appendChild(cardDate);
        ancre2.appendChild(cardContent);
        card.appendChild(ancre2);
        main.appendChild(card);
        compt ++;
    });

}

let currentPage = 1;

async function loadNextPage() {
    currentPage++;
    const movieData = await getTrendMovie(currentPage);
    if (movieData) {
        const moviePoster = movieData.results.map(element => element.poster_path);
        const movieName = movieData.results.map(element => element.original_title);
        const movieDate = movieData.results.map(element => element.release_date);
        let compt = 0;
        moviePoster.forEach((element) => {
            let movieId = movieData.results[compt].id;
            let title = document.createTextNode(movieName[compt]);
            let date = document.createTextNode(movieDate[compt]);
            let lien = `http://127.0.0.1:3000/movie.html?${movieId}`;
            let main = document.querySelector('main');

            let img = document.createElement('img');
            
            let card = document.createElement('div');
            let ancre = document.createElement('a');
            let ancre2 = document.createElement('a');
            let cardContent = document.createElement('div');
            let cardTitle = document.createElement('p');
            let cardDate = document.createElement('p');


            cardDate.setAttribute('class','card__description');
            cardTitle.setAttribute('class','card__title');
            cardContent.setAttribute('class','card__content');
            ancre2.setAttribute('href', lien);
            ancre.setAttribute('href', lien);
            card.setAttribute('id','MovieTrend');
            card.setAttribute('class','card');
            img.setAttribute('id','PosterTrend');

            img.src = `https://image.tmdb.org/t/p/w500${element}`;

            ancre.appendChild(img);
            card.appendChild(ancre);
            cardTitle.appendChild(title);
            cardDate.appendChild(date);
            cardContent.appendChild(cardTitle);
            cardContent.appendChild(cardDate);
            ancre2.appendChild(cardContent);
            card.appendChild(ancre2);
            main.appendChild(card);
            compt ++;
        });
    }
}

// Add a scroll event listener
window.addEventListener('scroll', function () {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        // User has reached the bottom of the page
        loadNextPage();
    }
});

// Initial load of the first page
displayTrendMovie();

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

displayAccount()