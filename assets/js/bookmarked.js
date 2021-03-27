const hooksPost = document.getElementsByClassName('hookPost');
const noBookmarkMessage = document.getElementById('noBookmarkMessage');
console.log(noBookmarkMessage)
if (hooksPost.length === 0) {
    noBookmarkMessage.style.display = 'block';
}