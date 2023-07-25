import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js';

import { getDatabase, ref, onValue, update, push } from 'https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js';

const dbURL = import.meta.env.VITE_DB_URL;
const projectId = import.meta.env.VITE_PROJECT_ID;

const firebaseConfig = {
  databaseURL: dbURL,
  projectId: projectId,
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);
const wishesInDB = ref(db, 'wishes');

const wishesForm = document.getElementById('form-message');
wishesForm.addEventListener('submit', sendWishesToDB);

const textareaEl = document.getElementById('message-textarea');
const nameInputEl = document.getElementById('name-input');
const listEl = document.getElementById('messages-list');

function sendWishesToDB(event) {
  event.preventDefault();

  const wishesData = {
    name: nameInputEl.value,
    wishes: textareaEl.value,
    countLikes: 0,
    isLiked: false,
  };

  push(wishesInDB, wishesData);
  wishesForm.reset();
}

function getDataFromDB() {
  onValue(wishesInDB, snapshot);
}

function snapshot(snapshot) {
  const messageExists = snapshot.exists() && snapshot.hasChildren();

  if (messageExists) {
    listEl.innerHTML = '';
    const wishesObj = Object.entries(snapshot.val()).reverse();
    const wishes = renderList(wishesObj);
    listEl.append(...wishes);
  } else {
    listEl.innerHTML = '';
    const h4 = document.createElement('h4');
    h4.setAttribute('class', 'no-messages');
    h4.textContent = 'No wishes yet';
    listEl.append(h4);
  }
}

function renderList(wishesArr){
  return wishesArr.map((wish) => {
    const h3Name = document.createElement('h3');
    const p1 = document.createElement('p');
    p1.setAttribute('class', 'message-text');

    const div1 = document.createElement('div');
    div1.setAttribute('class', 'message-section');

    const div2 = document.createElement('div');
    div2.setAttribute('class', 'like-section');

    const i = document.createElement('i');
    const targetObj = ref(db, `wishes/${wish[0]}`);
    
    if (wish[1].isLiked) {
      i.setAttribute('class', 'fa-solid fa-heart red');
    }else{
      i.setAttribute('class', 'fa-solid fa-heart');
    }

    i.setAttribute('data-id', wish[0]);
    i.addEventListener('click', () => {
      updateDataInDB(wish[1].countLikes, targetObj, wish[1].isLiked);
    });

    const span = document.createElement('span');
    span.setAttribute('class', 'like-count');
    span.textContent = wish[1].countLikes;

    const li = document.createElement('li');

    h3Name.textContent = `From ${wish[1].name}`;
    p1.textContent = wish[1].wishes;

    div1.append(h3Name, p1);
    div2.append(i, span);
    li.append(div1, div2);

    return li;
  });
}

function updateDataInDB(prevCountLikes, target, prevIsLiked){
  const likes = prevIsLiked ? prevCountLikes - 1 : prevCountLikes + 1;

  update(target, {
    countLikes: likes,
    isLiked: !prevIsLiked,
  })
}

getDataFromDB();
