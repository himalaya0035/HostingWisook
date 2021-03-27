import {getJsonData} from '../getAndPostRequest.js';
import {
    createCollectionCard,
    editProfileModal,
    followersAndFollowingModal,
    hookCard,
    learnMoreModal,
    privacyModal
} from '../components.js'
import * as utility from '../utilities/utilities.js'

const rootElement = document.getElementById('rootElement');
const loader = document.getElementById('loader');


function constructProfilePageHeader(data) {  // datat here
    return (
        `
        <div class="header-container">
                <div class="header" id="user_banner_img" style="background: url(${data}); background-repeat: no-repeat; background-size: cover; background-position: center;">
                    <a href="/" style="font-weight:bold;text-decoration: none; color: white;font-size: 25px; letter-spacing: 2px;"><i
                    class="fa fa-arrow-left"></i> WISOOK</a>

                </div>
            <div class="headerOverlay"></div>
        </div>
        `
    )
}

export function renderconstructTopProfileBody(data, link_id) {
    return (
        `
        <div class="topProfileBody">
            <div class="image profileImage">
                <img src="${data.prof_img}" id=user_profile_img alt="user profile image"
                 class="rounded" />
                <div class="nameAndCredential">
                    <h3 id="user_full_name">${data.full_name}</h3>
                    <h6 id="user_credential">${data.credential}</h6>
                </div>
            </div>
            ${data.is_owner ? `<button class="editProfileBtn btn btn-secondary" data-toggle="modal"
             data-target="#modalLoginForm"><i class="fa fa-edit"></i> <span>Edit
                Profile</span></button>` : !data.is_following ? `<button class="editProfileBtn btn btn-primary identifyFollowBtns" id="${link_id}">Follow</button>` : `<button class="editProfileBtn btn btn-danger identifyFollowBtns" id="${link_id}">Unfollow</button>`}
           
        </div>
        <div class="followersAndFollowing">
            <a href="#" data-toggle="modal"
            data-target="#followersFollowing" class="mainPageFAnfFBtns"><span>${data.profile.follower_count}</span> Followers</a>
            <a href="#" data-toggle="modal"
            data-target="#followersFollowing" class="mainPageFAnfFBtns"><span>${data.profile.following_count}</span> Following</a>
        </div>
        `
    )
}

async function constructTopProfileBody(data, id) { // data here

    const link_id = parseInt(id)
    return renderconstructTopProfileBody(data, link_id)
}

async function constructHooksAndCollectionsTabbing(data) { // data here
    let userHookPosts = '';
    for (let i = 0; i < data.length; i++) {
        userHookPosts += hookCard(data[i]); // send individual data here ex (data[i])
    }

    const collection_data = await getJsonData(`/hooks/api/user/${window.location.pathname.split('/')[2]}/collections`)

    let userCollections = '';

    let len;
    if (collection_data.length <= 6) {
        len = collection_data.length;
    } else {
        len = 6;
    }

    for (let i = 0; i < len; i++) {
        userCollections += createCollectionCard(collection_data[i]);
    }
    return (
        `
        <div class="nav nav-tabs" id="nav-tab" role="tablist">
            <a class="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#nav-home"
                role="tab" aria-controls="nav-home" aria-selected="true">Hooks</a>
            <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#nav-profile"
                role="tab" aria-controls="nav-profile" aria-selected="false">Collections</a>
        </div>
        <div class="tab-content" id="nav-tabContent" style="padding-top: 15px;">
        <div class="tab-pane fade show active" id="nav-home" role="tabpanel"
            aria-labelledby="nav-home-tab">
            <div class="content">
                <div class="hooksContainer">
                    <div class="topHeader">
                        <h5 style="padding-bottom: 0px; letter-spacing: 1px; color:#f2f2f2">User's
                            Hooks
                            </h4>
                            <a href="#"
                                style="color: white; font-size: 16px; text-decoration: none;">View
                                All</a>
                    </div>
                    <div class="hookScroller disappearScrollbar">
                        ${userHookPosts}
                    </div>
                </div>
            </div>
        </div>
        <div class="tab-pane fade" id="nav-profile" role="tabpanel"
            aria-labelledby="nav-profile-tab"> 
               <div class="hooksContainer">
                <div class="topHeader">
                    <h5 style="padding-bottom: 0px; letter-spacing: 1px; color:#f2f2f2">User's
                        Collections
                    </h5>
                    <a href="collections.html"
                                style="color: white; font-size: 16px; text-decoration: none;">View
                                All</a>
                </div>
               
                    <div class="collectionsScroller disappearScrollbar">
                        <div class="collectionsContainer">
                            ${userCollections}
                        </div>
                    </div>
                
            </div>
            
            </div>
    </div>

        `
    )
}

async function constructProfilePage() {
    utility.enableLoader(rootElement, loader);
    const link_id = window.location.pathname.split('/')[2];
    const profile_data = await getJsonData(`/accounts/api/profile/${link_id}`);
    const topHeaderHtml = constructProfilePageHeader(profile_data.banner_img);
    const topProfileBodyHtml = await constructTopProfileBody(profile_data, link_id);
    const hook_and_collections_data = await getJsonData(`/hooks/api/user/${link_id}`);
    const hookAndCollectionTabbingHtml = await constructHooksAndCollectionsTabbing(hook_and_collections_data);
    const editProfileModalHtml = editProfileModal(profile_data);


    const userFollowersAndFollowingModal = followersAndFollowingModal();
    const learnMoreModalHtml = learnMoreModal()
    const privacyModalHtml = privacyModal();
    const assemblePage = `
    <div class="page-wrapper default-theme sidebar-bg bg1">
        <main class="page-content">
            <div id="overlay" class="overlay"></div>
            <div class="container-fluid" style="padding:0px;">
                <div class="pageWrapper" style="padding: 0px;">
                    ${topHeaderHtml}
                    <div class="profileBody">
                        ${topProfileBodyHtml}
                        ${hookAndCollectionTabbingHtml}
                    </div>

                </div>
                ${editProfileModalHtml}
                ${userFollowersAndFollowingModal}
                ${learnMoreModalHtml}
                ${privacyModalHtml}
        </main>
    </div>
    `
    rootElement.innerHTML = assemblePage;
    utility.disableLoader(rootElement, loader);
    utility.manageHooksClickEvents('bookmark', 'fa-bookmark', 'fa-bookmark-o');
    utility.manageHooksClickEvents('like', 'fa-heart', 'fa-heart-o');
    utility.handleProfileUpdate();
    utility.toggleFollowBtn();
    utility.addSlider('.hookScroller');
    utility.getFollowersAndFollowing();
    utility.addSlider('.collectionsScroller');
    utility.shareHookToVariousPlatforms();

}

constructProfilePage();