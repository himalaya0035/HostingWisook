const pageWrapperTwo = document.getElementsByClassName('pageWrapper')[0];

const latestFeedContainer = document.getElementsByClassName('latestFeedContainer')[0];
const latestFeedPost = latestFeedContainer.getElementsByClassName('hookPost');
const imgHolder = latestFeedContainer.getElementsByClassName('hookImgHolder');
const img = latestFeedContainer.getElementsByTagName('img');
const stats = latestFeedContainer.getElementsByClassName('hookStats')
new ResizeObserver(() => {
    if (pageWrapperTwo.offsetWidth > 1243 && pageWrapperTwo.offsetWidth < 1523) {
        for (let i = 0; i < latestFeedPost.length; i++) {
            latestFeedPost[i].style.width = '355px';
            imgHolder[i].style.width = '355px';
            img[i].style.width = '355px';
            stats[i].style.width = '355px';
        }
    } else {
        for (let i = 0; i < latestFeedPost.length; i++) {
            latestFeedPost[i].removeAttribute('style')
            imgHolder[i].removeAttribute('style')
            img[i].removeAttribute('style')
            stats[i].removeAttribute('style')
        }
    }
}).observe(pageWrapperTwo);