import {getJsonData} from "/static/js/api handling/getAndPostRequest.js";

export async function constructSidebar(data, isAuthenticated) {
    const profileData = constrcutSidebarProfileSection(data, isAuthenticated);
    const sidebarFooterOptions = getSidebarOptions(isAuthenticated);
    const intrestSection = await constructSidebarIntrestSection(data.interests, isAuthenticated);
    return (
        `
        <nav id="sidebar" class="sidebar-wrapper">
        <div class="sidebar-content" style="background-color:rgb(0, 0, 0);  color:white;">
            <!-- sidebar-brand  -->
            <div class="sidebar-item sidebar-brand">
                <a href="/"
                    style="color: white; letter-spacing: 3px; font-size: 23px; display: flex; align-items: flex-end;"><img
                        src="/static/img/dry-cleaning-with-mineral-spirits.svg" alt="" width="35"
                        style="margin-right: 10px;"> Wisook</a>
            </div>
            <!-- sidebar-header  -->
            <div class="sidebar-item sidebar-header d-flex flex-nowrap">
                ${profileData}
            </div>

            <div class=" sidebar-item sidebar-menu">
                <ul>
                    <li class="header-menu">
                        <span>General</span>
                    </li>
                    <li class="sidebar-dropdown">
                        <a href="/">
                            <i class="fa fa-home"></i>
                            <span class="menu-text">Home</span>
                        </a>
                    </li>
                    <li class="sidebar-dropdown">
                        <a href=${isAuthenticated ? '/bookmarks' : '#'} class=${isAuthenticated ? '' : 'signIn'}>
                            <i class="fa fa-bookmark"></i>
                            <span class="menu-text">Bookmarks</span>
                        </a>
                    </li>
                    <li class="sidebar-dropdown">
                        <a href="${isAuthenticated ? '/collections' : '#'}" class=${isAuthenticated ? '' : 'signIn'}>
                            <i class="fa fa-plus"></i>
                            <span class="menu-text">Create Collection</span>
                        </a>
                    </li>
                    <li class="header-menu">
                        <span>${isAuthenticated ? 'Your Interests' : 'Explore Intrests'}</span>
                    </li>
                    ${intrestSection}
                    <a href="/interests" class="viewAllIntrests">View All</a>
                </ul>
            </div>
            <!-- sidebar-menu  -->
        </div>
        <!-- sidebar-footer  -->
        <div class="sidebar-footer" style="background-color: black; ">
            <div class="dropdown" title="Notifications">
                <a href="/notifications"  aria-haspopup="true" aria-expanded="false">
                    <i class="fa fa-bell"></i>
                    <span class="badge-sonar"></span>
                </a>
            </div>
            ${sidebarFooterOptions}
            <div class="pinned-footer">
                <a href="#">
                    <i class="fas fa-ellipsis-h"></i>
                </a>
            </div>
        </div>
    </nav>
        `
    )
}


function constrcutSidebarProfileSection(data, isAuthenticated) {

    return (
        `
        <div class="user-pic">
                    <a href="${isAuthenticated ? `profile/${data.id}` : `#`}"><img class="img-responsive img-rounded" src="${!isAuthenticated ? "/media/defaults/default_profile_image.jpeg" : data.prof_img}"
                        style="width: 58px; height: 58px; object-position: top;" alt="User picture"></a>
        </div>
        <div class="user-info">
            <a href="${isAuthenticated ? `/profile/${data.id}` : `#`}"><span class="user-name">
                <strong>${isAuthenticated ? data.full_name : "Guest User"}</strong>
            </span></a>
            <span class="user-role" style="color:gray; font-size:12px; font-weight:bold; letter-spacing:1px;">${isAuthenticated ? data.credential : "Welcome"}</span>
            <span class="user-status">
                <i class="fa fa-circle"></i>
                <span>Online</span>
            </span>
        </div>
        `
    )

}

// todo
async function constructSidebarIntrestSection(interests, isAuthenticated) { // data here

    let intrestList = ''

    if (!isAuthenticated) {

        const res = await getJsonData('/hooks/api/top-interests');

        for (let i = 0; i < res.length; i++) {
            intrestList += constructIntrestBox(res[i]); // fdata here
        }

        return (
            `
            <div class="sidebarIntrestsBox">
                ${intrestList}
            </div>
            `
        )

    } else {
        for (let i = 0; i < interests.length; i++) {
            intrestList += constructIntrestBox(interests[i]); // fdata here
        }
        return (
            `
        <div class="sidebarIntrestsBox">
            ${intrestList}
        </div>
        `
        )
    }
}

function getSidebarOptions(isAuthenticated) {
    if (isAuthenticated)
        return (
            `
        <div class="dropdown" title="explore settings">
            <a href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <i class="fa fa-cog"></i>

            </a>
              <div class="dropdown-menu" aria-labelledby="dropdownMenuMessage">
                <a class="dropdown-item" href="/accounts/reset_password"><i class="fa fa-key" style="font-size:12px; font-weight:bold;" ></i> Change Password</a>
                <a class="dropdown-item" href="#" data-toggle="modal" data-target="#privacyModal"><i class="fa fa-lock"></i> Privacy Notice</a>
                <a class="dropdown-item" href="#" data-toggle="modal" data-target="#learnMoreModal"><i class="fa fa-question"></i> Learn More</a>
            </div>
         </div>
    
     <div title="Log out" >
        <a href="/accounts/logout">
            <i class="fa fa-power-off"></i>
        </a>
        
    </div>
        `
        )
    else
        return (
            `
       
             <div class="signUp" data-toggle="modal" title="Sign Up">
                <a href="#" >
                    <i class="fa fa-user"></i>
                </a>
                
            </div>
            <div class="signIn" data-toggle="modal" title="Sign In">
            <a href="#" >
                <i class="fa fa-sign-in"></i>
            </a>
            
        </div>
        `
        )
}

// sidebar components ends


export function hookCard(data) {  //data here
    return (
        `
         <div class="hookPost">
            <div class="hookImgHolder">
                <a href="/hook/${data.id}"><img alt="" src="${data.image}"
                    draggable="false"></a>
                <h5 class="hookTitle">${data.title}</h5>
                <a href="/hook/${data.id}"><i class="fa fa-expand openHook"></i></a>
                <div class="hookOverlay"></div>
            </div>
            <div class="hookStats">
                <div id="${data.id}" class="statSection like" title="Like hook">
                    <i id="${data.id}" class='${data.is_liked ? 'fa fa-heart' : 'fa fa-heart-o'}'></i>
                </div>
                <div id="${data.id}" class="statSection bookmark" title="Bookmark Hook">
                    <i id="${data.id}" class='${data.is_bookmarked ? "fa fa-bookmark" : "fa fa-bookmark-o"}'></i>
                </div>
                <div class="statSection share" data-toggle="modal" data-target="#shareModal" title="Share Hook">
                    <i class="fa fa-share-alt"></i>
                </div>
                <div class="statSection redirect" title="Visit Url">
                   <a href="${data.url}" target="_blank"><i class="fa fa-external-link"></i></a>
                </div>
            </div>
         </div>
         `
    )
}

export function constructIntrestBox(data) { // data here
    return (
        `
        <div class="intrestBox" style="background-image:url('${data ? data.image : 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxleHBsb3JlLWZlZWR8Nnx8fGVufDB8fHw%3D&auto=format&fit=crop&w=500&q=60'}')">
            <h1 style="text-align:center; margin-left:5px; margin-right:5px;  white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;">${data.name}</h1>
            <div class="colorOverlay"></div>
        </div>
        `
    )
}

export function userCard(data) {
    return (
        `
        <div class="card p-3">
            <div class="d-flex align-items-center">
                <div class="image"> <img
                        src="${data.prof_img}"
                        class="rounded" alt="user profile image"> </div>
                <div class="ml-3 w-100">
                    <h5 class="mb-0 mt-0">${data.full_name}</h5> <span>${data.credential}</span>
                    <div
                        class="p-2 mt-2 bg-primary d-flex justify-content-between rounded text-white stats">
                        <div class="d-flex flex-column"> <span class="articles">Hooks</span>
                            <span class="number1">${data.num_of_hooks}</span> </div>
                        <div class="d-flex flex-column"> <span
                                class="followers">Followers</span> <span
                                class="number2">${data.num_of_followers}</span> </div>
                        <div class="d-flex flex-column"> <span
                                class="followers">Following</span> <span
                                class="number2">${data.num_of_following}</span> </div>
                    </div>
                    <div class="button mt-2 d-flex flex-row align-items-center"> <button
                            class="btn btn-sm btn-outline-primary w-100" onclick='window.location = "/profile/${data.id}"'>View</button> 
                            ${data.is_following ? `<button id=${data.id} class="btn btn-sm btn-danger identifyFollowBtns w-100 ml-2">Unfollow</button>` : `<button id=${data.id} class="btn btn-sm btn-primary identifyFollowBtns w-100 ml-2">Follow</button>`}
                             </div>
                </div>
            </div>
        </div>
        `
    )
}

export function contstructNavbar() {
    return (
        `
        <nav class="navbar"
        style="margin: 0px;  overflow-y: hidden; flex-wrap: nowrap; justify-content: flex-start; background-color: rgb(0, 0, 0); position:sticky; top: 0px; border-bottom: 1px solid #454545; border-left: 1px solid #454545; height: 56px;">
        <img src="/static/img/toggle.svg" id="toggle-sidebar" class="toggleSidebarBtn" alt="toggle Sidebar"
            title="Toggle Sidebar">
        <div class="searchBar">
            <button>
                <select class="searchCategory">
                    <option value="Hooks">Hooks</option>
                    <option value="Users">Users</option>
                    <option value="Intrests">Intrests</option>
                </select>
            </button>
            <input type="text" class="searchInput" spellcheck="false" placeholder="Search Hooks ...">
            <i class="fa fa-search searchIcon"></i>
        </div>
        <button type="button" style="margin-right: 15px" id="addHook" class="btn btn-outline " data-toggle="modal"
            data-target="#exampleModalCenter" title="Post a hook"><i class="fa fa-plus"></i> Hook
            It</button>
             <button type="button" id="learnMore"  class="btn btn-info " data-toggle="modal"
            data-target="#learnMoreModal" style="color:white;" title="Post a hook"> Promote your Website
            </button>
        <div class="mobileNavbar">
            <div class="sidebar-item sidebar-brand">
                <a href="#"
                    style="color: white; text-decoration: none; letter-spacing: 3px; font-size: 23px; font-weight: bold; display: flex; align-items: flex-end;"><img
                        src="/static/img/dry-cleaning-with-mineral-spirits.svg" alt="" width="35"
                        style="margin-right: 10px;"> WISOOK</a>
            </div>
            <div class="mobileNavbarOption">
                <i class="fa fa-search searchIconMobile"></i>
                <div class="mobileSidebarToggler" id="toggle-sidebar2">
                    <img src="/static/img/professor.jpg" alt="" width="35" height="35" class="mobileProfileImage">
                    <div class="mobileSidebarTogglerBar">
                        <i class="fa fa-bars"></i>
                    </div>
                </div>
            </div>
        </div>
    </nav>
    <div class="searchSection">
        <div class="searchBar2">
            <button>
                <select class="searchCategory">
                    <option value="Hooks">Hooks</option>
                    <option value="Users">Users</option>
                    <option value="Intrests">Intrests</option>
                </select>
            </button>
            <input type="text" class="searchInput" spellcheck="false" placeholder="Search Hooks...">
            <i class="fa fa-arrow-left searchIcon2"></i>
        </div>
        <div class="searchResults" id="style-1">
        </div>
        <div id="loader2" style="position:absolute; top:50%; left: 50%; transform: translate(-50%,-50%);">
        <img src="/static/img/loader.gif" alt="" width="150">
    </div>
    </div>
        `
    )
}


export async function addHookModal() {

    const interestList = await getAllInterests();

    return (
        `
        <div class="modal fade" id="exampleModalCenter" tabindex="-1" role="dialog"
        aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content" style=" border: none;  box-shadow: 0px 0px 5px #000 ;">
                <div class="modal-body" style="padding:0px;height: auto;">
                    <div class="previewHook"
                        style="background: #696660; padding: 40px;   display: flex; justify-content: center; align-items: center;">
                        <div class="hookPost" style="margin:0px; box-shadow: 0px 5px 10px #000; position:relative;">
                            <div class="hookImgHolder">
                                <img alt="" src="/static/img/deafaultPicture.jpg" id="previewHookImg" draggable="false">
                                <h5 class="hookTitle" id="previewHookTitle">Preview Hook Title ...</h5>
                                <i class="fa fa-expand openHook"></i>
                                <div class="hookOverlay"></div>
                            </div>
                            <div class="hookStats">
                                <div class="statSection like" style="pointer-events: none;"
                                    title="Like hook">
                                    <i class="fa fa-heart-o"></i>
                                </div>
                                <div class="statSection bookmark" style="pointer-events: none;"
                                    title="Bookmark Hook">
                                    <i class="fa fa-bookmark-o"></i>
                                </div>
                                <div class="statSection share" style="pointer-events: none;"
                                    title="Share Hook">
                                    <i class="fa fa-share-alt"></i>
                                </div>
                                <div class="statSection redirect" style="pointer-events: none;"
                                    title="Visit Url">
                                    <i class="fa fa-external-link"></i>
                                </div>
                            </div>
                            <div id="loader3" style="z-index:50; position:absolute;  justify-content:center; align-items:center; top:0; left:0; width:100%; height:100%; background:#f2f2f2;">
                                <img src="/static/img/loader3.gif" alt="" width="150">
                            </div>
                        </div>
                        
                        <p
                            style="position: absolute; font-weight: bold; top: 5px; color: #f2f2f2; left: 12px; font-size: 18px; letter-spacing: 2px;">
                            Preview</p>
                        <a class="close" href="#" id="close-hook-create" style="position: absolute; right: 12px; top:5px; color: #f2f2f2;"
                            data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </a>
                        
                    </div>
                    <div class="addHookUrl" style="height: auto;  padding: 10px;">
                    <p id="message" style="color:red; margin-bottom:0px;"></p>
                        <p style="margin: 0px; font-weight: bold;">Paste A URL <i class="fa fa-link"></i> :
                        </p>
                       
                        <input type="text" id="addHookUrl" spellcheck="false"
                            style="color:grey; width: 100%; font-weight: bold; box-shadow: 0px 0px 3px #000; border: none; padding: 5px 12px; margin-bottom: 10px; margin-top: 10px; border-radius: 5px;"
                            placeholder="Url here..">
                            <select class="form-select" id="selectI" style="max-width:500px; padding:5px 10px; width:100%; margin-bottom:10px;" aria-label="Default select example">
                                ${interestList}
                            </select>
                        <button type="button" id="addHookBtnFinal" class="btn btn-dark"
                            style="float: right; margin-bottom: 10px;">Hook It</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
        `
    )
}

export function managePagination(prev_url, next_url, totalCount) {

    const curr_search_param = window.location.search;
    const curr_page_num = parseInt(curr_search_param.split('=')[1]);
    let previous_page_url;
    if (prev_url === null) previous_page_url = '#';
    else {
        previous_page_url = `?page=${curr_page_num - 1}`;
    }
    let noOfPages;
    let paginationsList = ` <a href="${previous_page_url}">
                            <li>
                                <</li> </a> 
                                <a class="${curr_page_num === 1 || isNaN(curr_page_num) ? "is-active" : ''}" href="${curr_page_num === 1 || isNaN(curr_page_num) ? '#' : '?page=1'}">
                                <li>1</li>
                                </a>`
    if (totalCount % 12 == 0) {
        noOfPages = totalCount / 12;
    } else {
        noOfPages = (totalCount / 12) + 1
    }
    noOfPages = parseInt(noOfPages)
    for (let i = 0; i < noOfPages - 1; i++) {
        let page_num;
        let next_page_url;
        let curr_page_number;

        page_num = i + 2;
        if (isNaN(curr_page_num)) curr_page_number = 1; else curr_page_number = curr_page_num;

        if (next_url !== null) next_page_url = `?page=${curr_page_number + 1}`; else next_page_url = '#';
        paginationsList += `
        <a class="${curr_page_number === i + 2 ? 'is-active' : ''}" href="${next_page_url}">
        <li>${i + 2}</li>
    </a>
        `
    }

    let next_page_url;
    if (next_url === null) next_page_url = '#';
    else {
        // next_page_url = `?page=${curr_page_num === null ? 2 : curr_page_num + 1}`
        if (isNaN(curr_page_num)) {
            next_page_url = `?page=2`
        } else {
            next_page_url = `?page=${curr_page_num + 1}`
        }
    }
    paginationsList += ` <a href="${next_page_url}">
    <li>></li>
</a>`

    return (
        `
                    <div class="pagination p1">
                    <ul>
                       ${paginationsList}
                    </ul>
                    </div>
                `
    )
}

export function editProfileModal(data) {
    return (
        `
        <div class="modal fade" id="modalLoginForm"  tabindex="-1" role="dialog" aria-labelledby="myModalLabel"
        aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered"  role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title w-100 font-weight-bold">Edit Profile</h4>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body mx-3">
                    <form accept-charset="UTF-8" action="#" method="POST" target="_blank" id="update_profile_form">
                        <div class="form-group">
                            <label for="exampleInputName">Full Name</label>
                            <input type="text" name="full_name" class="form-control input_change_field" id="exampleInputName"
                                placeholder="Enter your name and surname" required="required" value="${data.full_name}">
                        </div>
                        <div class="form-group">
                            <label for="exampleInputEmail1" required="required">Credential</label>
                            <input type="text" name="credential" class="form-control input_change_field" id="exampleInputEmail1"
                                aria-describedby="emailHelp" placeholder="Enter Credential (Ex - Teacher)" value="${data.credential}">
                        </div>
                        <hr>
                        <div class="form-group mt-3">
                            <label class="mr-2">Update your Profile Image:</label>
                            <br>
                            <input type="file" class="input_change_field" name="prof_img">
                        </div>
                        <hr>
                        <hr>
                        <div class="form-group mt-3">
                            <label class="mr-2">Update your Cover Image:</label>
                            <br>
                            <input type="file" class="input_change_field" name="banner_img">
                        </div>
                        <hr>
                        <button type="submit" class="btn btn-secondary btn-sm" id="update_profile_btn">Update</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
        `
    )
}

export function followersAndFollowingModal() {
    return (
        `
        <div class="modal fade" id="followersFollowing" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"
        aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h6 class="modal-title w-100 font-weight-bold">User Followers And Following</h6>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body" style="overflow-y:auto; height: 500px; padding: 0px;">
                    <div class="nav nav-tabs"  id="nav-tab" role="tablist">
                        <a class="nav-item nav-link active" style="padding:0px;" id="nav-following-tab" data-toggle="tab" href="#nav-following" role="tab" aria-controls="nav-home" aria-selected="true"><span class="fAndFBtn" style="display:block; padding:8px 16px;" id="following">Following</span></a>
                        <a class="nav-item nav-link " id="nav-followers-tab" style="padding:0px;" data-toggle="tab" href="#nav-followers" role="tab" aria-controls="nav-profile" aria-selected="false"><span class="fAndFBtn" style="display:block; padding:8px 16px;" id="followers">Followers</span></a>
                      </div>
                    <div class="tab-content" id="nav-tabContentTwo">
                        <div class="tab-pane fade show fAndFpane active" id="nav-following" style="position:relative; height:460px;"  role="tabpanel" aria-labelledby="nav-following-tab">
                            <div class="loader5" id="loader-following" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);">
                                <img src="/static/img/loader4.gif" alt="Spinning Loader">
                            </div>
                        </div>
                        <div class="tab-pane fade fAndFpane" id="nav-followers"   style="position:relative; height:460px;" role="tabpanel" aria-labelledby="nav-followers-tab">
                            <div class="loader5" id="loader-followers" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);">
                                <img src="/static/img/loader4.gif" alt="Spinning Loader">
                            </div>
                        </div>
                </div>
            </div>
        </div>
    </div>
        `
    )
}

export function fillSingleNotificationElement(data) { // also data here
    console.log(data.obj_id)
    switch (data.type) {
        case 'like' :
            return (
                `
          <a href="/hook/${data.obj_id}" class="notification-list notification-list--unread">
          <div class="notification-list_content">
            <div class="notification-list_img">
              <i class="fa fa-heart fa-2x text-danger"></i>
            </div>
            <div class="notification-list_detail">
              <p><b>Hurray!</b> Your hook got new likes</p>
  
              <p class="text-muted"><small>${data.created_on}</small></p>
            </div>
          </div>
          <div class="notification-list_feature-img">
            <img src="${data.image}" alt="Feature image">
          </div>
        </a>
          `
            )
        case 'comment' :
            return (
                `
          <a href="/hook/${data.obj_id}" class="notification-list notification-list--unread">
          <div class="notification-list_content">
            <div class="notification-list_img">
              <i class="fa fa-comment fa-2x text-primary"></i>
            </div>
            <div class="notification-list_detail">
              <p><b>Hurray!</b> Your hook started a coversation !</p>
  
              <p class="text-muted"><small>${data.created_on} </small></p>
            </div>
          </div>
          <div class="notification-list_feature-img">
            <img src="${data.image}" alt="Feature image">
          </div>
        </a>
          `
            )
        case 'follower' :
            return (
                `
          <a href="/profile/${data.obj_id}" class="notification-list notification-list--unread">
          <div class="notification-list_content">
            <div class="notification-list_img">
              <img src="/media/${data.image}" alt="">
            </div>
            <div class="notification-list_detail">
              <p><b>${data.name} </b> is now following you</p>
              <p class="text-muted"><small>${data.created_on} </small></p>
            </div>
          </div>
        </a>
          `
            )
    }
}

export function loginAndSignupModal() {
    return (
        `
          <div class="modal fade login" id="loginModal">
          <div class="modal-dialog modal-dialog-centered login animated">
              <div class="modal-content">
                  <div class="modal-header">
                      <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                      <h4 class="modal-title">Login with</h4>
                  </div>
                  <div class="modal-body">
                      <div class="box">
                          <div class="content">
                          
                          <div style="display: flex;align-items: center; justify-content: space-between">
                          <a class="google-btn" style="display: block" href="/accounts/oauth/google">
                              <div class="google-icon-wrapper">
                                <img class="google-icon" src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"/>
                              </div>
                              <p class="btn-text"><b>Sign in with google</b></p>
                            </a>
                            
                            <fb:login-button
                                scope="public_profile,email"
                                onlogin="checkLoginState();">
                            </fb:login-button>
                          </div>
                              <div class="division">
                                  <div class="line l"></div>
                                  <span>or</span>
                                  <div class="line r"></div>
                              </div>
                              <div class="error"></div>
                              <div class="form loginBox">
                                  <form accept-charset="UTF-8" id="login-form">
                                      <input id="email" class="form-control" type="text" placeholder="Email"
                                          name="email">
                                      <input id="password" class="form-control" type="password" placeholder="Password"
                                          name="password">
                                      <input class="btn btn-default btn-login" type="submit" value="Login">
                                  </form>
                              </div>
                          </div>
                      </div>
                      <div class="box">
                          <div class="content registerBox" style="display:none;">
                              <div class="form">
                                  <form  data-remote="true" 
                                      accept-charset="UTF-8" id="register-form">
                                      <input class="form-control" type="text" placeholder="Full Name" name="full_name">
                                      <input id="email" class="form-control" type="text" placeholder="Email"
                                          name="email">
                                      <input id="password" class="form-control" type="password" placeholder="Password"
                                          name="password">
                                      <input id="password_confirmation" class="form-control" type="password"
                                          placeholder="Repeat Password" name="password_confirmation">
                                      <input class="btn btn-default btn-register" type="submit" value="Create account"
                                          name="commit">
                                  </form>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div class="modal-footer">
                      <div class="forgot login-footer">
                        <span>
                              <a href="/accounts/reset_password/" id="">Forgot Password ?</a>
                              </span>
                              <br>
                          <span>Looking to
                              <a href="#!" id="showRegisterForm">create an account</a>
                              ?</span>
                      </div>
                      <div class="forgot register-footer" style="display:none">
                          <span>Already have an account?</span>
                          <a href="#!" id="showLoginForm">Login</a>
                      </div>
                  </div>
              </div>
          </div>
      </div>
          `
    )
}

export function singleComment(data) {
    return (
        `
        <div class="singleComment" style="display: flex; align-items: flex-start;">
            <img src="${data.owner_data.prof_img}" style="width: 25px; height: 25px; object-position: top; border-radius: 50%; margin-right: 8px; object-fit:cover;" alt="" class="commenterImg">
            <div class="nameAndComment">
                 <h6 style="font-size: 13px; margin-bottom: 0px;">${data.owner_data.full_name}</h6>
                <p style="font-size: 14px; font-weight: 600; color: rgb(116, 114, 114);">${data.content}</p>
            </div>
        </div>
        `
    )
}

export function hookDescription({num_of_likes, number_of_views, description}) {
    return (
        `
        <div class="descAndStats" >
            <div class="hookStats2">
                <div class="totalLikes"><i class="fa fa-heart"></i> ${num_of_likes} Likes</div>
                <div class="totalViews"><i class="fa fa-eye"></i> ${number_of_views} Views</div>
                <div class="popularityScore"><i class="fa fa-bullseye"></i> ${Math.ceil((num_of_likes / number_of_views) * 100)}% Score</div>
            </div>
            <div class="descHook">
                <p>${description}</p>
            </div>
        </div>
        `
    )
}


export function hookCard2(data) {  //data here
    return (
        `
         <div class="hookPost">
            <div class="hookImgHolder">
                <a href="#"><img alt="" src="${data.image}"
                    draggable="false"></a>
                <h5 class="hookTitle">${data.title}</h5>
                <a href="#">${data.owner_data.is_owner ? `<i class="fa fa-trash openHook" style="font-size:20px;" title="Delete Hook" id="deleteHook"></i>` : `<i class="fa fa-paperclip openHook" style="font-size:20px;" title="Add to My Hooks" id="pinHook"></i>`} </a>
                <div class="hookOverlay"></div>
            </div>
            <div class="hookStats">
                <div id="${data.id}" class="statSection like" title="Like hook">
                    <i id="${data.id}" class='${data.is_liked ? 'fa fa-heart' : 'fa fa-heart-o'}'></i>
                </div>
                <div id="${data.id}" class="statSection bookmark" title="Bookmark Hook">
                    <i id="${data.id}" class='${data.is_bookmarked ? "fa fa-bookmark" : "fa fa-bookmark-o"}'></i>
                </div>
                <div class="statSection share" data-toggle="modal" data-target="#shareModal" title="Share Hook">
                    <i class="fa fa-share-alt"></i>
                </div>
                <div class="statSection redirect" title="Visit Url">
                   <a href="${data.url}" target="_blank"><i class="fa fa-external-link"></i></a>
                </div>
            </div>
         </div>
         `
    )
}

export function createCollectionCard(data) {
    let x = data.num_of_hooks;
    if (x < 4) {
        return (
            `
            <a class="card1" href="/collection/${data.id}/hooks">
                <div class="collection">
                <img src="${data.images[0] ? data.images[0] : `https://th.bing.com/th/id/OIP.ZMIkHl9meMnoVEQSbBgTBgHaEK?w=271&h=180&c=7&o=5&pid=1.7`}" alt="collection hooks image">
                </div>
        
                <div class="collectionOverlay"></div>
                <h4 class="collectionName" > ${data.title} </h4>
            </a> 
            `
        )
    } else {
        return (
            `
            <a href="/collection/${data.id}/hooks" class="card1">
            <div class="cl p">
              <div class="collection">
                <img src="${data.images[0]}" alt="collection hooks image">
              </div>
            </div>
      
            <div class="cl q">
              <div class="collection">
                <img src="${data.images[1]}" alt="collection hooks image">
              </div>
      
            </div>
      
            <div class="cl r">
              <div class="collection">
                <img src="${data.images[2]}" alt="collection hooks image">
              </div>
            </div>
      
            <div class="cl s">
              <div class="collection">
                <img src="${data.images[3]}" alt="collection hooks image">
              </div>
            </div>
      
            <div class="collectionOverlay"></div>
      
            <h4 class="collectionName" > ${data.title} </h4>
        </a>
            `
        )
    }
}

export function createCollectionModal() {
    return (
        `
<div class="modal fade" id="createCollectionModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"
aria-hidden="true">
<div class="modal-dialog modal-dialog-centered" role="document">
<div class="modal-content">
<div class="modal-header">
<h4 class="modal-title w-100 font-weight-bold">Create Collection</h4>
<button type="button" class="close" data-dismiss="modal" aria-label="Close">
<span aria-hidden="true">&times;</span>
</button>
</div>
<div class="modal-body ">
<form accept-charset="UTF-8">
<div class="form-group">
<label for="exampleInputName">Collection Name</label>
<input type="text" name="collectionName" class="form-control" id="collectionNameInput"
placeholder="Name Your Collection" required="required">
</div>

<button type="submit" id="createCollectionBtn" class="btn btn-success btn-sm">Create</button>
</form>
</div>
</div>
</div>
</div>
`
    )
}

export function learnMoreModal(){
    return (
        `
        <div class="modal fade" id="learnMoreModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
        aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">What does Wisook do?</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
            <p><h6>Wisook is a social media platform that enables you to delve deeper into new topics and explore interests with greater comprehension. Rather than being merely a source for breaking news, Wisook is aimed at taking its users deeper into the things that interest and matter to them, helping them learn more about their favorite topics and discover new and interesting things.</h6></p>
    
            <p><h6>The platform learns what you love browsing and searching for across the web, to show you even more of what you are interested in.</h6></p>
    
            <p> <h6> So entrepreneurs and small business owners can use this site either as a research tool to learn more about their industry and passions, as a networking tool to connect with partners and customers who share their interests or as another way of sharing their content with a specific target audience. From articles and images to videos and music, you can save anything from anywhere on Wisook. As long as it’s on the internet, you can add your favorite things to Wisook.</h6></p>
            </div>
    
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" data-dismiss="modal">Ok, Got it</button>
              
            </div>
            
          </div>
        </div>
      </div>

        `
    )
}

export function privacyModal() {
    return (
        `
        <div class="modal fade" id="privacyModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
        aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">Privacy Notice</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
            <p><h6>This website does not share personal information with third-parties nor does store information is collected about your visit for use other than to analyze content performance through the use of cookies, which you can turn off at anytime by modifying your Internet browser’s settings. The owner is not responsible for the republishing of the content found on this platform on other Web sites or media without permission.
            <br><br>
            Comments Policy
           <br><br>
           The owner of this platform reserves the right to edit or delete any comments submitted to this platform without notice due to;
            <br>
           1. Comments deemed to be spam or questionable spam
            <br>
           2. Comments including profanity
           <br>
           3. Comments containing language or concepts that could be deemed offensive
           <br>
           4. Comments that attack a person individually
           <br><br>
           This privacy policy statements is made on [march 24, 2021] and may have a change on the futures with or without notice. You should read this privacy policy on this page on the futures when updated</h6></p>
            </div>
    
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" data-dismiss="modal">Ok, Got it</button>
              
            </div>
            
          </div>
        </div>
      </div>

        `
    )
}

async function getAllInterests(){
    let data = await getJsonData('/hooks/api/all-interests');
    let interestsOptionList = ' <option value="0" selected disabled>Choose Interest (Optional)</option>';
    for (let i=0;i<data.length;i++){
        interestsOptionList +=    `
            <option value="${data[i].name}">${data[i].name}</option>
            `
    }
    return interestsOptionList;
}