var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function(choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }

  // To Unregister the service worker after clicking on Add (+) icon
  if('serviceWorker' in navigator){
    navigator.serviceWorker.getRegistrations()
        .then((registrations)=>{
          for(let idx = 0; idx < registrations.length; idx++){
            registrations[idx].unregister();
          }
        })
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

// Currently not in use allows to save assets on demand
function onSaveButtonClicked(){
  console.log('clicked');
  caches.open('user-requested').then((cache)=>{
    cache.add('https://httpbin.org/get');
    cache.add('src/images/sf-boat.jpg');
  })
}

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url('+ data.image +')';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = "white";
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  // var cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save'
  // cardSaveButton.addEventListener('click', onSaveButtonClicked);
  // cardSupportingText.appendChild(cardSaveButton)
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function clearCards(){
  while (sharedMomentsArea.hasChildNodes()){
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function updateUI(data){
  clearCards();
  for(var i = 0; i < data.length; i++){
    createCard(data[i]);
  }
}

var networkDataReceived = false;
var url = 'https://photogram-c5234.firebaseio.com/posts.json';
// You cant send the post request when you are offline but if you mock the response in body then you can do that
// fetch(url,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": 'application/json',
//         'Accept': 'application/json'
//       },
//       body: JSON.stringify({ message: 'Some message' })
//     })
fetch(url)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    console.log('From web', data);
    networkDataReceived = true;
    var dataArray = [];
    for(var key  in data){
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  });

if("indexedDB" in window){
  console.log('================ Supported IndexDB ==================');
  readAllData(OBJECT_STORE_NAME).then((data)=>{
    console.log('================ Received Indexed DB DATA ==================');
    if(!networkDataReceived){
      console.log('From cache', data);
      updateUI(data);
    }
  });
}
