import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import {
    getDatabase,
    ref,
    set,
    push,
    onValue,
    update,
    remove,
} from 'https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js'
const firebaseConfig = {
    apiKey: "AIzaSyABIViWmQ0rUQ33zQNwYATD_XTgL1s9rcc",
    authDomain: "website-firebase-680cd.firebaseapp.com",
    projectId: "website-firebase-680cd",
    storageBucket: "website-firebase-680cd.appspot.com",
    messagingSenderId: "881351921814",
    appId: "1:881351921814:web:3679c08c0d623145e7f2b7",
    measurementId: "G-CHY738C4E7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase(app)
// console.log("db", db);

const registerBtn = document.getElementById('register_btn')
const loginBtn = document.getElementById('login_btn')
const form1 = document.getElementById('form1')
const form2 = document.getElementById('form2')
const loginHeading = document.getElementById('loginBtn')
const registerHeading = document.getElementById('registerBtn')
const logoutBtn = document.getElementById('logout')
const logoutAppBtn = document.getElementById('logoutApp')
const contentContainer = document.getElementById('content_container')
const submitTodo = document.getElementById('submit_todo')
const list_container = document.getElementById('list_container')
const loader = document.getElementById('loader')


registerHeading.addEventListener('click', registerForm)
loginHeading.addEventListener('click', loginForm)
logoutBtn.addEventListener('click', logout)
logoutAppBtn.addEventListener('click' ,logout)
function registerForm() {
    form1.style.display = "block"
    form2.style.display = "none"
}

function loginForm() {
    form2.style.display = "block"
    form1.style.display = "none"
}


registerBtn.addEventListener('click', () => {
    const userName = document.getElementById('userName').value
    console.log(userName);
    const registerEmail = document.getElementById('registerEmail')
    const registerPassword = document.getElementById('registerPassword')
    console.log(registerEmail.value, registerPassword.value);
    createUserWithEmailAndPassword(auth, registerEmail.value, registerPassword.value)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            const obj = {
                userName,
                email: registerEmail
            }
            const userRef = ref(db, `users/${user.uid}`)
            console.log('userRef--->', obj)
            set(userRef, obj)
            console.log("User-->", user);
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log("error-->", errorMessage);
            console.log("errorcode-->", errorCode);
            alert(errorMessage)

            // ..
        });
})


loginBtn.addEventListener('click', () => {
    const loginEmail = document.getElementById('login_email')
    const loginPassword = document.getElementById('login_password')
    console.log(loginEmail.value, loginPassword.value);

    signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;

            console.log("user", user);
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log("error", error);
        });

})


onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        contentContainer.style.display = 'block'
        form1.style.display = 'none'
        form2.style.display = 'none'
        loader.style.display = 'none'
        getTodos()
        // ...
    } else {
        contentContainer.style.display = 'none'
        // form2.style.display = 'block'
        loader.style.display = 'none'
        // User is signed out
        // ...
    }
});


submitTodo.addEventListener('click', addTodo)
function addTodo() {
    const todo = document.getElementById('todo_input').value
    if (!todo) return alert('Please add some todo')
    const todoListRef = ref(db, `todos/${auth.currentUser.uid}`)
    console.log("todoListRef", todoListRef);
    const newTodoRef = push(todoListRef)
    console.log("todoListRef", todoListRef)
    console.log("newTodoRef",);
    // const database = firebase.database().ref('todos')
    // const key = database.push().key;
    const obj = {
        todo,
        status: 'pending'
    }
    // database.child(key).set()
    // console.log(todo);
    set(newTodoRef, obj)
    document.getElementById('todo_input').value = ''
}


function getTodos() {
    const todoListRef = ref(db, `todos/${auth.currentUser.uid}`)
    onValue(todoListRef, snapshot => {
        const isDataExist = snapshot.exists()
        console.log("isDataExist", isDataExist);
        if (isDataExist) {
            list_container.innerHTML = null
            snapshot.forEach(childSnapshot => {
                // console.log("snapshot" ,childSnapshot);
                const childKey = childSnapshot.key
                const childData = childSnapshot.val()
                // console.log('childKey=>', childKey)
                // console.log('childData=>', childData)
                const listItem = `
                <li style="display: flex;
                justify-content: space-between;
                align-items: center;" id = ${childKey}>${childData.todo}
                <div> 
                <span style="cursor: pointer;"><i class="fa-regular fa-circle-check"></i></span></span>&nbsp&nbsp&nbsp;
                <span style="cursor: pointer;" id =${childKey + '-edit'}><i class="fa-solid fa-pen-to-square"></i></span>&nbsp&nbsp&nbsp; 
                <span style="cursor: pointer;" id =${childKey + '-del'}><i class="fa-solid fa-trash"></i></span>&nbsp&nbsp&nbsp;
                </div>
                </li> <hr>`
                list_container.innerHTML += listItem
                // console.log("listItem" ,listItem);
                setTimeout(() => {
                    const editbtn = document.getElementById(childKey + '-edit')
                    // console.log("editbtn->", editbtn);
                    editbtn.addEventListener('click', editFunc)
                    const deleteBtn = document.getElementById(childKey + '-del')
                    // console.log(childKey + '-del');
                    deleteBtn.addEventListener('click', deleteFunc)
                }, 2300)
            })
        }
    })
}

function deleteFunc() {
    const elementId = this.id.slice(0, this.id.length - 4)
    console.log(this.id.slice(0, this.id.length - 4))
    const todoRef = ref(db, `todos/${auth.currentUser.uid}/${elementId}`)
    remove(todoRef)
}


function editFunc() {
    const editInput = this.parentNode.parentNode.firstChild.nodeValue
    console.log(editInput);
    const elementId = this.id.slice(0, this.id.length - 5)
    // console.log(elementId);
    let newTodo = prompt('Edit your todo', this.parentNode.parentNode.firstChild.nodeValue)
    const editTodo = {
        todo: newTodo,
        status: 'pending'
    }
    const todoRef = ref(db, `todos/${auth.currentUser.uid}/${elementId}`)
    console.log(todoRef);
    set(todoRef, editTodo)
    // console.log(editTodo);
    this.parentNode.parentNode.firstChild.nodeValue = newTodo



    // console.log(this.parentNode.parentNode.parentNode.firstElementChild.innerText);


    // console.log("todoRef", todoRef);
    // console.log("newTodo", newTodo);

}







function logout() {
    signOut(auth)
        .then(() => {
            // Sign-out successful.
        })
        .catch(error => {
            // An error happened.
        })
}


