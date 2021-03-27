import {constructSection, getJsonData, getJsonData2, postJsonData} from '../getAndPostRequest.js';
import {
    addHookModal,
    constructSidebar,
    contstructNavbar,
    hookCard2,
    hookDescription,
    learnMoreModal,
    loginAndSignupModal,
    privacyModal,
    singleComment,
    userCard
} from '../components.js'
import * as utility from '../utilities/utilities.js'

const hook_id = window.location.pathname.split('/')[2]

const rootElement = document.getElementById('rootElement');
const loader = document.getElementById('loader');

function refreshComments() {
    document.getElementsByClassName('fa-refresh')[0].onclick = async () => {
        document.getElementsByClassName('allComments')[0].innerHTML = await constructSection(`/hooks/api/${hook_id}/comments`, constructHookCommentBox);
    }
}

function postComment() {
    const addCommentButton = document.getElementById('addCommentButton');
    const addCommentInputBox = document.getElementById('addCommentInputBox');
    addCommentButton.onclick = async () => {

        const obj = {
            content: addCommentInputBox.value,
            hook: window.location.pathname.split('/')[2]
        }

        await postJsonData('/hooks/api/comments/create/', obj);
        document.getElementsByClassName('fa-refresh')[0].click();
        addCommentButton.disabled = true;
        addCommentInputBox.value = '';
    }

    addCommentButton.disabled = true;
    addCommentInputBox.oninput = () => {
        addCommentButton.disabled = addCommentInputBox.value.length <= 0;
    }
}

async function getAllCollections() {
    const collectionData = await getJsonData('/hooks/api/collections');
    let collectionList = ' <option selected disabled value="0">Add in Collection (Optional)</option>';
    for (let i = 0; i < collectionData.length; i++) {
        collectionList += `
            <option value="${collectionData[i].id}" id="${collectionData[i].id}">${collectionData[i].title}</option>
            `
    }
    return collectionList;
}


async function constructHookUserAndDesc(data, urlTwo) {
    let hookHtml = hookCard2(data);
    let userHtml = userCard(data.owner_data);
    let hookDescAndStatsHtml = hookDescription(data);
    let commentSectionData = await constructSection(urlTwo, constructHookCommentBox);
    let collectionList = await getAllCollections();
    return (
        `
        <div class="singleHookContainer">
            <div class="hookAndDesc">
                ${hookHtml}
                ${hookDescAndStatsHtml}
            </div>
            <div class="userAndComments">
                ${userHtml}
                  <select id="selectC" style="width:100%; padding:5px 10px; border-radius:10px; margin-top:10px;">
                    ${collectionList}
                </select>
                
                <div class="commentsSection" style="margin-top:10px; height: 282px">
                    <div class="commentStatsAndRefresh" style="padding: 10px; background: gray; color: white; padding-bottom: 0px; display: flex; justify-content: space-between; align-items: center;">
                        <h6>Comments</h6>
                        <i class="fa fa-refresh" title="refresh" style="margin-bottom: 8px;"></i>
                    </div>
                    <div class="allComments">
                        ${commentSectionData}
                    </div>
                    <div class="addComment">
                        <input type="text" id="addCommentInputBox" placeholder="Post A Comment" spellcheck="false">
                        <button class="btn btn-secondary btn-sm" id="addCommentButton">Post</button>
                    </div>
                </div>
            </div>
        </div>
        `
    )
}

function constructHookCommentBox(data) {
    let comments = '';
    for (let i = 0; i < data.length; i++) {
        comments += singleComment(data[i]);
    }
    return comments;
}

async function manage_add_to_my_pin() {
    document.getElementById('pinHook').onclick = (e) => {
        postJsonData(`/hooks/api/add-to-my-hooks/${hook_id}`).then(() => alert('Added to your hooks'))
    }
}

function onEnterSendComment(){
    const addCommentButton = document.getElementById('addCommentButton');
    const addCommentInputBox = document.getElementById('addCommentInputBox');
    addCommentInputBox.addEventListener('keypress', (e) => {
        if (e.key == 'Enter'){
            addCommentButton.click();
        }
    })
}


function sendCollectionToTheBackend() {
    const selectTag = document.getElementById('selectC');
    selectTag.onchange = async () => {
        if (selectTag.value != 0) {
            const obj = {
                collection_id: document.getElementById('selectC').value
            }
            const isPostRequestOk = await postJsonData(`/hooks/api/change-hook-collection/${hook_id}`, obj);
            if (isPostRequestOk) {
                alert('Hook Added to collection');
            } else {
                alert('Something went wrong , try again later');
            }
        }
    }
}


async function constructHookPage(urlOne, urlTwo) {


    utility.enableLoader(rootElement, loader);
    const hookAndUserHtml = await constructSection(urlOne, constructHookUserAndDesc, urlTwo);


    let res = await getJsonData2('/hooks/api/user-interests-and-is-authenticated');
    let isAuthenticated = false;
    if (res.status_code === 403) {
        console.log('unauthenticated')
    } else if (res.status_code === 200) {
        isAuthenticated = true;
        console.log('authenticated')
    }

    const sidebarHtml = await constructSidebar(res.data, isAuthenticated);


    const navbarHtml = contstructNavbar();
    const hookModal = await addHookModal();
    const signupAndSigninModalHtml = loginAndSignupModal();
    const learnMoreModalHtml = learnMoreModal()
    const privacyModalHtml = privacyModal();
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
                   ${hookAndUserHtml}
                </div>
                ${hookModal}
                ${signupAndSigninModalHtml}
                                    ${learnMoreModalHtml}
                    ${privacyModalHtml}
        </main>
    </div>
    `
    rootElement.innerHTML = assemblePage;

    onEnterSendComment();

    utility.disableLoader(rootElement, loader);
    utility.manageSidebarStateOnDifferentMediaDevices();
    utility.loadMainJsFile();
    utility.addNecessaryEventListeners();
    utility.manageOnClickIntrestBox();
    utility.manageHooksClickEvents('bookmark', 'fa-bookmark', 'fa-bookmark-o');
    utility.manageHooksClickEvents('like', 'fa-heart', 'fa-heart-o');
    utility.manageSearchResults();
    utility.manageAddHookModalPreveiw();
    refreshComments();
    setInterval(() => (document.getElementsByClassName('fa-refresh')[0].click()), 3000)
    postComment();
    manage_add_to_my_pin();
    utility.toggleFollowBtn();
    utility.shareHookToVariousPlatforms();

    sendCollectionToTheBackend();

    document.getElementById('deleteHook').onclick = async (e) => {
        const res = postJsonData(`/hooks/api/hook/${hook_id}`, {}, 'DELETE');
        if (res) window.location = '/'; else alert('Something went wrong try again later');
    }

    if (!isAuthenticated) {

        utility.loadLoginModalJs();
        utility.handle_login();
        utility.handle_register();
        utility.FBfun();
    }
}


constructHookPage(`/hooks/api/hook/${hook_id}`, `/hooks/api/${hook_id}/comments`)
    .then(() => console.log("promise resolved"))
