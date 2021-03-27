import {constructSection, getJsonData2} from '../getAndPostRequest.js';
import {
    addHookModal,
    constructSidebar,
    contstructNavbar,
    hookCard,
    learnMoreModal, loginAndSignupModal,
    managePagination,
    privacyModal
} from '../components.js'
import * as utility from '../utilities/utilities.js'

const rootElement = document.getElementById('rootElement');
const loader = document.getElementById('loader');

let bookmark_count;
let next_url;
let prev_url;
const interest_name = window.location.pathname.split('/')[2];



function constructInterestHooksList(data) { // data here
    bookmark_count = data.count;
    next_url = data.next;
    prev_url = data.previous;
    let bookmarksList = '';
    for (let i = 0; i < data.results.length; i++) {
        bookmarksList += hookCard(data.results[i]);
    }
    return (
        `
        <div class="latestPosts">
            <h4 style="padding-bottom: 5px; letter-spacing: 1px; color:#f2f2f2">Latest in ${interest_name.replace('%20', ' ')}</h4>
            <div class="latestFeedContainer">
                ${bookmarksList}
            </div>
        </div>
        `
    )
}


async function constructInterestHookPage() {
    utility.enableLoader(rootElement, loader);

    let res = await getJsonData2('/hooks/api/user-interests-and-is-authenticated');
    let isAuthenticated = false;
    if (res.status_code === 200)
        isAuthenticated = true;


    const sidebarHtml = await constructSidebar(res.data, isAuthenticated);

    const bookmarksListHtml = await constructSection(`/hooks/api/interest/${interest_name}`, constructInterestHooksList);
    const navbarHtml = contstructNavbar();
    const pagination = managePagination(prev_url, next_url, bookmark_count);
    const hookModal = await addHookModal();
    const learnMoreModalHtml = learnMoreModal()
    const privacyModalHtml = privacyModal();

        const signupAndSigninModalHtml = loginAndSignupModal();


    const assemblePage = `
    <div class="page-wrapper default-theme sidebar-bg bg1">
        ${sidebarHtml}
        <main class="page-content">
            <div id="overlay" class="overlay"></div>
            <div class="container-fluid" style="padding:0px;">
                ${navbarHtml}
                <div id="addHookMobile" data-toggle="modal" data-target="#exampleModalCenter">
                    <i class="fa fa-plus" style="font-size:20px; color: white;"></i>
                </div>
                <div class="pageWrapper" style="padding-bottom: 0px;">
                    ${bookmarksListHtml}
                    ${pagination}
                </div>
                ${hookModal}
                ${signupAndSigninModalHtml}
                ${learnMoreModalHtml}
                ${privacyModalHtml}
        </main>
    </div>
    `
    rootElement.innerHTML = assemblePage;
    utility.disableLoader(rootElement, loader);

    utility.manageSidebarStateOnDifferentMediaDevices();
    utility.loadMainJsFile();
    utility.addNecessaryEventListeners();
    utility.loadLatestFeedJs();
    utility.manageHooksClickEvents('bookmark', 'fa-bookmark', 'fa-bookmark-o');
    utility.manageHooksClickEvents('like', 'fa-heart', 'fa-heart-o');
    utility.loadLatestFeedJs();
    utility.manageOnClickIntrestBox();
    utility.shareHookToVariousPlatforms();
    if (!isAuthenticated) {
        utility.loadLoginModalJs();
        utility.handle_login();
        utility.handle_register();
        utility.FBfun();
    }
}

constructInterestHookPage().then(r => r);