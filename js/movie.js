const ssoTmdbReadApiKey = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNjg1NTBmYTRlODIzMWE1MWVlZGViNjYyNGRkNzFjNSIsInN1YiI6IjY1YWZjMjA2MTU4Yzg1MDBhYzFkMzdmYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.-zClmVb2mljRLrKfpdAGMHUNc53hcS2MWsSOUWaj26w'

window.onload = async () => {
    const id = location.search.split()[0]?.split('?')?.[1]
    console.log(id)
    if (id) {
        displayMovie(id)
    }

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


async function getMovie(id) {
    const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${ssoTmdbReadApiKey}`
        }
      };
      
    let responseDetail = await fetch(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, options).catch(err => console.error(err));
    if(!responseDetail){
        return
    }
    let detailData = await responseDetail.json();
    console.log(detailData);
    return detailData;
}

async function displayMovie(id){
    let movie = await getMovie(id);
    let movieContainer = document.createElement('div');
    let main = document.querySelector('main');
    movieContainer.innerHTML = `
    <div class="container">
        <div class="row">
            <div class="col-6">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            </div>
            <div class="txt">
                <h1>${movie.title}</h1>
                <p>${movie.overview}</p>
            </div>
        </div>
    </div>
    `;
    main.appendChild(movieContainer);
    displayReviewMovie(id)
}

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

async function getReviewMovie(id){
    const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNjg1NTBmYTRlODIzMWE1MWVlZGViNjYyNGRkNzFjNSIsInN1YiI6IjY1YWZjMjA2MTU4Yzg1MDBhYzFkMzdmYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.-zClmVb2mljRLrKfpdAGMHUNc53hcS2MWsSOUWaj26w'
        }
      };
      
    const reviewResults = await fetch(`https://api.themoviedb.org/3/movie/${id}/reviews?language=en-US&page=1`, options).catch(err => console.error(err));
    if(!reviewResults){
        return
    }
    const reviewData = await reviewResults.json();
    console.log(reviewData);
    return reviewData;
}

async function displayReviewMovie(id){
    let review = await getReviewMovie(id);
    if (review.results.length === 0 ){
        let reviewContainer = document.createElement('div');
        let main = document.querySelector('main');
        reviewContainer.innerHTML = `
        <div class="review">
            <h2>Reviews</h2>
            <p>No reviews available</p>
        </div>
        `;
        main.appendChild(reviewContainer);
    }
    review.results.forEach((element) => {
        console.log(element)
        let reviewContainer = document.createElement('div');
        let main = document.querySelector('main');
        let src = '';
        if (element.author_details.avatar_path != null){
            console.log('feur')
            src = `https://image.tmdb.org/t/p/w500${element.author_details.avatar_path}`
        }
        else{
            src = "img/defaultpfp.png"
        }
        reviewContainer.innerHTML = `
        <div class="review">
            <h2>Reviews</h2>
            <img src = ${src} alt="${element.author}">
            <h3>${element.author}</h3>
            <p>${element.content}</p>
        </div>
        `;
        main.appendChild(reviewContainer);
    });
}