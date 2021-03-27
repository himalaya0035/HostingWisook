import {constructSection, getJsonData2} from '../getAndPostRequest.js';
import {
    addHookModal,
    constructSidebar,
    contstructNavbar,
    hookCard,
    learnMoreModal,
    loginAndSignupModal,
    managePagination,
    privacyModal,
    userCard
} from '../components.js'
import * as utility from '../utilities/utilities.js'

const rootElement = document.getElementById('rootElement');
const loader = document.getElementById('loader');


function constructTrendingThisWeek(data) { //data here
    let trendingHooksList = '';
    for (let i = 0; i < data.length; i++) {
        trendingHooksList += hookCard(data[i]);
    }
    return (
        `
        <div class="hooksContainer">
            <h4 style="padding-bottom: 5px; letter-spacing: 1px; color:#f2f2f2">Trending This week</h4>
            <div class="hookScroller disappearScrollbar">
                ${trendingHooksList}
            </div>
        </div>
        `
    )
}

function constructTopUsers(data) { // data here
    let topUsersList = '';
    for (let i = 0; i < data.length; i++) {
        topUsersList += userCard(data[i]);
    }
    return (
        `
        <div class="usersToFollow" style="margin-bottom: 15px;">
            <h4 style="padding-bottom: 5px; letter-spacing: 1px; color:#f2f2f2">Top Users</h4>
            <div class="usersScroller disappearScrollbar" style="padding-bottom: 15px">
                <div class="usersContainer">
                    ${topUsersList}
                </div>
            </div>
        </div>
        `
    )
}

let prev_url
let next_url
let bookmark_count

function constructLatestFeed(data) { //data here
    bookmark_count = data.count;
    next_url = data.next;
    prev_url = data.previous;
    console.log({
        bookmark_count,
        next_url,
        prev_url
    })

    let latestFeedHooks = '';
    for (let i = 0; i < data.results.length; i++) {
        latestFeedHooks += hookCard(data.results[i]);
    }
    return (
        `
        <div class="latestPosts">
            <h4 style="padding-bottom: 5px; letter-spacing: 1px; color:#f2f2f2">Latest Feed</h4>
            <div class="latestFeedContainer">
                ${latestFeedHooks}
            </div>
        </div>
        `
    )
}


async function constructHomepage(urlOne, UrlTwo, urlThree) {
    utility.enableLoader(rootElement, loader);
    const trendingHooksHtml = constructSection(urlOne, constructTrendingThisWeek);
    const topUsersHtml = constructSection(UrlTwo, constructTopUsers);
    let pagination;

    let latestFeedHTML = ''
    let res = await getJsonData2('/hooks/api/user-interests-and-is-authenticated');
    let isAuthenticated = false;
    if (res.status_code === 200) {
        isAuthenticated = true;
        latestFeedHTML = await constructSection(urlThree, constructLatestFeed);
        pagination = managePagination(prev_url, next_url, bookmark_count);
    }


    const sidebarHtml = constructSidebar(res.data, isAuthenticated);
    const navbarHtml = contstructNavbar();
    const hookModal = await addHookModal();
    const signupAndSigninModalHtml = loginAndSignupModal();

    const learnMoreModalHtml = learnMoreModal()
    const privacyModalHtml = privacyModal();

    let assemblePage = '';

    await Promise.all([trendingHooksHtml, topUsersHtml, sidebarHtml]).then(values => {
        assemblePage = `
        <div class="page-wrapper default-theme sidebar-bg bg1">
        ${values[2]}
            <main class="page-content">
                <div id="overlay" class="overlay"></div>
                <div class="container-fluid" style="padding:0px;">
                    ${navbarHtml}
                    <div id="addHookMobile" data-toggle="modal" data-target="#exampleModalCenter">
                        <i class="fa fa-plus" style="font-size:20px; color: white;"></i>
                    </div>
                    <div class="pageWrapper" style="padding-bottom: 0px;">
                        ${values[0]}
                        ${values[1]}
                        ${latestFeedHTML}
                        ${isAuthenticated ? pagination : ''}
                    </div>
                    ${hookModal}
                    ${learnMoreModalHtml}
                    ${privacyModalHtml}
                    ${signupAndSigninModalHtml}
            </main>
        </div>
        `
    })
    rootElement.innerHTML = assemblePage;
    utility.disableLoader(rootElement, loader)
    utility.manageSidebarStateOnDifferentMediaDevices();
    utility.loadMainJsFile();
    utility.addSlider('.hookScroller');
    utility.addSlider('.usersScroller');


    utility.addNecessaryEventListeners();

    utility.manageOnClickIntrestBox();
    utility.manageHooksClickEvents('bookmark', 'fa-bookmark', 'fa-bookmark-o');
    utility.manageHooksClickEvents('like', 'fa-heart', 'fa-heart-o');

    utility.manageSearchResults();
    utility.manageAddHookModalPreveiw();

    utility.toggleFollowBtn();
    utility.shareHookToVariousPlatforms();

    if (!isAuthenticated) {

        utility.loadLoginModalJs();
        utility.handle_login();
        utility.handle_register();
        utility.FBfun();
    } else {
        utility.loadLatestFeedJs();
    }
}
let def_url3 = '/hooks/api/feed'
let page_num;
const curr_search_param = window.location.search;
const curr_page_num = parseInt(curr_search_param.split('=')[1]);

if (!isNaN(curr_page_num)) {
    def_url3 = `/hooks/api/feed?page=${curr_page_num}`
}

constructHomepage('/hooks/api/weekly-picks', '/accounts/api/top-users', def_url3)
    .then(() => console.log("prmoise resolved"))

// .catch((err) => console.log(err.message));
