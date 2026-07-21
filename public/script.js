// =========================
// Current Date
// =========================

const date = new Date();

document.getElementById("date").innerHTML =
date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
});

// =========================
// Local Storage
// =========================

let recentSearches =
JSON.parse(localStorage.getItem("recentSearches")) || [];

let favorites =
JSON.parse(localStorage.getItem("favorites")) || [];

let currentWord = "";

// =========================
// Recent Searches
// =========================

function updateRecentSearches(){

    const recentList =
    document.getElementById("recentSearches");

    recentList.innerHTML = "";

    recentSearches.forEach(function(word){

        recentList.innerHTML +=
        `<li>${word}</li>`;

    });

}

// =========================
// Favorites
// =========================

function updateFavorites(){

    const favoriteList =
    document.getElementById("favoriteList");

    favoriteList.innerHTML = "";

    favorites.forEach(function(word,index){

        favoriteList.innerHTML +=

        `
        <li>

            ⭐ ${word}

            <button
            onclick="removeFavorite(${index})">

            ❌

            </button>

        </li>
        `;

    });

}

function removeFavorite(index){

    favorites.splice(index,1);

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );

    updateFavorites();

}

updateRecentSearches();
updateFavorites();

// =========================
// Load Total Words
// =========================

async function loadWordCount(){

    try{

        const response =
        await fetch("/words");

        const words =
        await response.json();

        document.getElementById("count").innerHTML =
        words.length;

    }

    catch(error){

        console.log(error);

    }

}

loadWordCount();

// =========================
// Search Word
// =========================

document
.getElementById("searchBtn")
.addEventListener("click",async function(){

    const word =
    document
    .getElementById("word")
    .value
    .trim()
    .toLowerCase();

    if(word=="")
    {
        alert("Enter a word.");
        return;
    }

    try{

        const response =
        await fetch(
        `/search/${word}`
        );

        const displayWord =
        document.getElementById("displayWord");

        const displayMeaning =
        document.getElementById("displayMeaning");

        if(response.ok)
        {

            const data =
            await response.json();

            currentWord =
            data.word;

            displayWord.innerHTML =
            data.word;

            displayMeaning.innerHTML =
            data.meaning;

            if(!recentSearches.includes(data.word))
            {

                recentSearches.unshift(data.word);

            }

            if(recentSearches.length>5)
            {

                recentSearches.pop();

            }

            localStorage.setItem(

                "recentSearches",

                JSON.stringify(recentSearches)

            );

            updateRecentSearches();

        }

        else
        {

            currentWord="";

            displayWord.innerHTML =
            "Word Not Found";

            displayMeaning.innerHTML =
            "Meaning not available.";

        }

    }

    catch(error){

        alert("Server not running.");

    }

});

// =========================
// Search Suggestions
// =========================

const searchInput = document.getElementById("word");
const suggestions = document.getElementById("suggestions");

searchInput.addEventListener("input", async function () {

    const prefix = this.value.trim().toLowerCase();

    if (prefix === "") {

        suggestions.style.display = "none";
        suggestions.innerHTML = "";

        return;

    }

    try {

        const response = await fetch(
            `/suggest/${prefix}`
        );

        const words = await response.json();

        suggestions.innerHTML = "";

        if (words.length === 0) {

            suggestions.style.display = "none";
            return;

        }

        suggestions.style.display = "block";

        words.forEach(item => {

            const div = document.createElement("div");

            div.textContent = item.word;

            div.onclick = () => {

                searchInput.value = item.word;

                suggestions.style.display = "none";

                document.getElementById("searchBtn").click();

            };

            suggestions.appendChild(div);

        });

    }

    catch (error) {

        console.log(error);

    }

});

// Hide suggestions when clicking outside

document.addEventListener("click", function (e) {

    if (!document.querySelector(".search-box").contains(e.target)) {

        suggestions.style.display = "none";

    }

});

// =========================
// Add Word
// =========================

document
.getElementById("addBtn")
.addEventListener("click",async function(){

    const word =
    document
    .getElementById("newWord")
    .value
    .trim()
    .toLowerCase();

    const meaning =
    document
    .getElementById("newMeaning")
    .value
    .trim();

    if(word=="" || meaning=="")
    {

        alert("Fill all fields.");

        return;

    }

    try{

        const response =
        await fetch(
        "/add",
        {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                word,

                meaning

            })

        });

        const result =
        await response.json();

        alert(result.message);

        document.getElementById("newWord").value="";
        document.getElementById("newMeaning").value="";

        loadWordCount();

    }

    catch(error){

        alert("Unable to connect to server.");

    }

});

// ==========================
// Import Words
// ==========================

const importBtn = document.getElementById("importBtn");
const fileInput = document.getElementById("fileInput");

importBtn.addEventListener("click", async () => {

    if (fileInput.files.length === 0) {
        alert("Please select a words.txt file.");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {

        const response = await fetch("/import", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        alert(result.message);

        fileInput.value = "";

        // Update word count if your project has this function
        if (typeof loadWordCount === "function") {
            loadWordCount();
        }

    } catch (error) {

        console.error(error);
        alert("Import failed.");

    }

});

// =========================
// Update Word
// =========================

document.getElementById("updateBtn").addEventListener("click", async function () {

    const word = document.getElementById("updateWord").value.trim().toLowerCase();
    const meaning = document.getElementById("updateMeaning").value.trim();

    if (word === "" || meaning === "") {
        alert("Fill all fields.");
        return;
    }

    try {

        const response = await fetch("/update", {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                word,
                meaning
            })

        });

        const result = await response.json();

        alert(result.message);

        document.getElementById("updateWord").value = "";
        document.getElementById("updateMeaning").value = "";

    }

    catch (error) {

        alert("Unable to connect to server.");

    }

});

// =========================
// Delete Word
// =========================

document
.getElementById("deleteBtn")
.addEventListener("click", async function(){

    const word =
    document
    .getElementById("deleteWord")
    .value
    .trim()
    .toLowerCase();

    if(word==""){

        alert("Enter a word.");

        return;

    }

    const confirmDelete =
    confirm(`Delete "${word}" ?`);

    if(!confirmDelete){

        return;

    }

    try{

        const response =
        await fetch(
        `/delete/${word}`,
        {
            method:"DELETE"
        });

        const result =
        await response.json();

        alert(result.message);

        document.getElementById("deleteWord").value="";

        loadWordCount();

    }

    catch(error){

        alert("Unable to connect to server.");

    }

});

// =========================
// Favorites
// =========================

document
.getElementById("favoriteBtn")
.addEventListener("click",function(){

    if(currentWord=="")
    {

        alert("Search a word first.");

        return;

    }

    if(!favorites.includes(currentWord))
    {

        favorites.push(currentWord);

        localStorage.setItem(

            "favorites",

            JSON.stringify(favorites)

        );

        updateFavorites();

        alert("Added to Favorites.");

    }

    else
    {

        alert("Already Added.");

    }

});

// =========================
// Dark Mode
// =========================

const themeBtn =
document.getElementById("themeBtn");

if(localStorage.getItem("theme")=="dark")
{

    document.body.classList.add("dark");

    themeBtn.innerHTML="☀️ Light Mode";

}

themeBtn.addEventListener("click",function(){

    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark"))
    {

        localStorage.setItem(
            "theme",
            "dark"
        );

        themeBtn.innerHTML="☀️ Light Mode";

    }

    else
    {

        localStorage.setItem(
            "theme",
            "light"
        );

        themeBtn.innerHTML="🌙 Dark Mode";

    }

});