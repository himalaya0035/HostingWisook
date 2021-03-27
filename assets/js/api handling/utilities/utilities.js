import {constructSection, getCookie, postJsonData} from '../getAndPostRequest.js';

const SCRAPER_HOST = 'http://127.0.0.1:8080/'

export function loadMainJsFile() {
    jQuery(function ($) {
        toggleSidebarByOverlay();
        if (
            !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
            )
        ) {
            $('.sidebar-content').mCustomScrollbar({
                axis: 'y',
                autoHideScrollbar: true,
                scrollInertia: 300,
            });
            $('.sidebar-content').addClass('desktop');
        }
    });

    function toggleSidebarByOverlay() {
        document.getElementById('overlay').onclick = () => {
            document.getElementsByClassName('page-wrapper')[0].classList.toggle('toggled')
        }
    }
}

export function enableLoader(containerElement, loaderGif) {
    containerElement.style.visibility = 0;
    containerElement.style.opacity = 0;
    loaderGif.style.display = 'block';
    loaderGif.style.visibility = 1;
    loaderGif.style.opacity = 1;
}

export function disableLoader(containerElement, loaderGif) {
    containerElement.style.visibility = 1;
    containerElement.style.opacity = 1;
    loaderGif.style.display = 'none';
    loaderGif.style.visibility = 0;
    loaderGif.style.opacity = 0;
}


export function addSlider(element) {
    const slider = document.querySelector(element);
    let isDown = false;
    let startX;
    let scrollLeft;
    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    })
    slider.addEventListener('mouseleave', () => {
        isDown = false;
    })
    slider.addEventListener('mouseup', () => {
        isDown = false;
    })
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return
        e.preventDefault();
        let x = e.pageX - slider.offsetLeft;
        let walk = (x - startX) * 1.5;
        slider.scrollLeft = scrollLeft - walk;
    })

}

function manageToggleSidebar() { // helper function
    const pageWrapper = document.getElementsByClassName('page-wrapper')[0];
    if (window.innerWidth > 925) {
        pageWrapper.classList.add('toggled')
    } else {
        pageWrapper.classList.remove('toggled')
    }

}

export function manageSidebarStateOnDifferentMediaDevices() {
    window.addEventListener('resize', manageToggleSidebar);
    manageToggleSidebar();
}

export function addNecessaryEventListeners() {
    let toggleSidebarBtn = document.getElementById('toggle-sidebar');
    let toggleSidebarBtn2 = document.getElementById('toggle-sidebar2');
    let searchSection = document.getElementsByClassName('searchSection')[0];
    let searchInput = document.getElementsByClassName('searchInput')[0];
    const pageWrapper = document.getElementsByClassName('page-wrapper')[0];
    toggleSidebarBtn.onclick = () => {
        pageWrapper.classList.toggle('toggled');
        if (toggleSidebarBtn.src.indexOf('/static/img/toggle.svg') > -1) {
            toggleSidebarBtn.src = '/static/img/toggle (1).svg';
        } else {
            toggleSidebarBtn.src = '/static/img/toggle.svg'
        }
    }
    toggleSidebarBtn2.onclick = () => {
        pageWrapper.classList.toggle('toggled');
    }

    document.getElementsByClassName('searchIconMobile')[0].onclick = () => {
        searchSection.style.display = 'block';
    }
    document.getElementsByClassName('searchIcon2')[0].onclick = () => {
        searchSection.style.display = 'none';
    }
    searchInput.oninput = () => {
        if (searchInput.value.length > 0) {
            searchSection.style.display = 'block';
        } else {
            searchSection.style.display = 'none';
        }
    }

}

export function loadLatestFeedJs() {
    const pageWrapperTwo = document.getElementsByClassName('pageWrapper')[0];
    const latestFeedContainer = document.getElementsByClassName('latestFeedContainer')[0];
    const latestFeedPost = latestFeedContainer.getElementsByClassName('hookPost');
    const imgHolder = latestFeedContainer.getElementsByClassName('hookImgHolder');
    const img = latestFeedContainer.getElementsByTagName('img');
    const stats = latestFeedContainer.getElementsByClassName('hookStats')
    new ResizeObserver(() => {
        if (pageWrapperTwo.offsetWidth > 1257 && pageWrapperTwo.offsetWidth < 1550) {
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
}

export function manageOnClickIntrestBox() {
    const intrestBox = document.getElementsByClassName('intrestBox');
    for (let i = 0; i < intrestBox.length; i++) {
        intrestBox[i].onclick = (e) => {
            window.location = `/interest/${e.target.parentElement.innerText}/hooks`
        }
    }
}

export function manageHooksClickEvents(classOfElement, toggleClass, existingClass) {
    let bookmarkBtns = document.getElementsByClassName(classOfElement);
    for (let i = 0; i < bookmarkBtns.length; i++) {
        bookmarkBtns[i].onclick = async (e) => {

            let action = toggleClass.includes('heart') ? 'heart' : 'bookmark'

            let clikcedBtn = e.target;


            if (clikcedBtn.classList.contains('fa')) {
                clikcedBtn.classList.toggle(toggleClass);
                clikcedBtn.classList.toggle(existingClass)
            } else {
                let faElement = clikcedBtn.getElementsByTagName('i')[0];
                faElement.classList.toggle(toggleClass);
                faElement.classList.toggle(existingClass)
            }
            const isPostRequestOk = await postJsonData(`/hooks/api/${e.target.id}/${action}-action`);

            if (!isPostRequestOk) alert("Something went wrong. Couldn't like this Hook")

        }
    }
}

// test code after this comment 

let arrayForResults = [];
var count = 0;

function filterData(data, searchText) {
    if (data) {
        arrayForResults = data;
        count = 1;
    }
    let key;
    let matches = arrayForResults.filter(arrElement => {
        const regex = new RegExp(`^${searchText}`, 'gi');
        if (arrElement.full_name === undefined) {
            if (arrElement.title === undefined) {
                console.log('interest')
                key = 'name'
                return arrElement.name.match(regex)
            } else {
                console.log('hook')
                key = 'title'
                return arrElement.title.match(regex)
            }
        } else {
            console.log('user')
            key = 'full_name'
            return arrElement.full_name.match(regex)
        }

    })
    outputHtml(matches, searchText, count, key)
}

// todo
function outputHtml(matches, searchText, count, key) {
    // console.log(matches)
    var searchResults = document.getElementsByClassName('searchResults')[0];

    let html = matches.map(match => `<a href="${match.imgUrl}" class="searchResult">
   ${match[key]}
</a>`
    ).join('');
    if (matches.length === 0 && count === 1) {
        searchResults.innerHTML = `<p style="display:flex; justify-content:center; margin-top:40px; color:#808080; text-align:center;">No search Result Found <br> with keyword "${searchText}"</p>`
    } else {
        searchResults.innerHTML = html;
    }
}

function enableSearchLoader(loader) {
    loader.style.display = 'block';
    loader.style.visibility = 1;
    loader.style.opacity = 1;
}

function enableHookLoader(loader) {
    loader.style.display = 'flex';
    loader.style.visibility = 1;
    loader.style.opacity = 1;
}

function disableSearchLoader(loader) {
    loader.style.display = 'none';
    loader.style.visibility = 0;
    loader.style.opacity = 0;
}

export function manageSearchResults() {
    var searchBox = document.getElementsByClassName('searchInput');
    let searchCategories = document.getElementsByClassName('searchCategory');
    var searchResults = document.getElementsByClassName('searchResults')[0];
    var loader2 = document.getElementById('loader2');
    var searchIcon = document.getElementsByClassName('searchIcon')[0];
    let url = `http://localhost/hooks/api/all-hooks?search=`;
    searchIcon.onclick = () => {
        if (searchIcon.classList.contains('fa-close'))
            searchBox[0].value = '';
        searchResults.style.display = 'none';
        searchIcon.classList.remove('fa-close');
    }


    for (let i = 0; i < searchCategories.length; i++) {
        searchCategories[i].addEventListener('change', () => {
            let searchBar = searchCategories[i].closest('.searchBar') || searchCategories[i].closest('.searchBar2');
            let selectedInput = searchBar.getElementsByClassName('searchInput')[0];


            switch (searchCategories[i].value) {
                case 'Hooks':
                    selectedInput.placeholder = 'Search Hooks ...'
                    url = `/hooks/api/all-hooks?search=`;
                    break;
                case 'Users':
                    selectedInput.placeholder = 'Search Users ...'
                    url = `/accounts/api/all-users?search=`;
                    break;
                case 'Intrests':
                    selectedInput.placeholder = 'Search Intrests ...'
                    url = `/hooks/api/all-interests?search=`;
                    break;
            }
        })
    }


    for (let i = 0; i < searchBox.length; i++) {
        searchBox[i].addEventListener('input', async (e) => {
            let inputSearchBox = e.target;
            if (inputSearchBox.value.length > 0) {
                searchResults.style.display = 'block';
                searchIcon.classList.add('fa-close');
                if (inputSearchBox.value.length == 1) {
                    arrayForResults = [];
                    count = 0;
                    enableSearchLoader(loader2)

                    let aisehi = await constructSection(`${url}${inputSearchBox.value}`, filterData, inputSearchBox.value);
                    disableSearchLoader(loader2)
                } else {
                    filterData(undefined, inputSearchBox.value)
                }
            } else {
                searchResults.style.display = 'none';
                disableSearchLoader(loader2);
                searchIcon.classList.remove('fa-close');
                searchResults.innerHTML = '';
            }
        })

    }
}

export function disableBtn(ele) {
    ele.disabled = true;
    ele.style.background = '#cccccc';
    ele.style.color = '#666666';
}

export function enableBtn(ele) {
    ele.disabled = false;
    ele.style.background = '#673AB7';
    ele.style.color = 'white';
}

export function displayErrorMsg(msg) {
    document.getElementById('message').innerText = msg;
}

export function removeErrorMsg() {
    document.getElementById('message').innerText = '';
}

let sendData;

export function manageAddHookModalPreveiw() {
    const addHookInputBox = document.getElementById('addHookUrl');
    const addHookBtn = document.getElementById('addHookBtnFinal')
    console.log(sendData)

    addHookBtn.onclick = async () => {
        const obj = {
            description: sendData.description,
            image: sendData.image,
            name: sendData.site_name,
            title: sendData.title,
            url: addHookInputBox.value,
        }
        if (document.getElementById('selectI').value != 0) {
            obj['related_interest'] = document.getElementById('selectI').value;
        }
        // console.log(obj)
        await postJsonData('/hooks/api/create', obj)
        document.getElementById('close-hook-create').click();
        alert('Hook Added');
    }


    const loader = document.getElementById('loader3')
    disableBtn(addHookBtn)
    addHookInputBox.addEventListener('input', async () => {

        enableHookLoader(loader)
        try {
            removeErrorMsg();
            await constructSection( `/scrape?url=${addHookInputBox.value}`, showPreviewHook)
            enableBtn(addHookBtn)
        } catch {
            displayErrorMsg('Invalid Url')
            disableBtn(addHookBtn)
        }
        disableSearchLoader(loader)
        if (addHookInputBox.value.length == 0) {
            disableBtn(addHookBtn)
        }
    })
}

function showPreviewHook(data) {
    sendData = data;
    const previewHookTitle = document.getElementById('previewHookTitle');
    const previewHookImg = document.getElementById('previewHookImg');
    previewHookTitle.innerText = data.title;
    previewHookImg.src = data.image;
}


export function loadLoginModalJs() {
    const signUpBtn = document.getElementsByClassName('signUp')[0];
    const signInBtn = document.getElementsByClassName('signIn');
    const showLoginform = document.getElementById('showLoginForm');
    const showRegisterform = document.getElementById('showRegisterForm');
    for (let i = 0; i < signInBtn.length; i++) signInBtn[i].onclick = () => openLoginModal();
    signUpBtn.onclick = () => openRegisterModal();
    showLoginform.onclick = () => showLoginForm();
    showRegisterform.onclick = () => showRegisterForm();
}

function showRegisterForm() {
    $('.loginBox').fadeOut('fast', function () {
        $('.registerBox').fadeIn('fast');
        $('.login-footer').fadeOut('fast', function () {
            $('.register-footer').fadeIn('fast');
        });
        $('.modal-title').html('Register with');
    });
    $('.error').removeClass('alert alert-danger').html('');

}

function showLoginForm() {
    $('#loginModal .registerBox').fadeOut('fast', function () {
        $('.loginBox').fadeIn('fast');
        $('.register-footer').fadeOut('fast', function () {
            $('.login-footer').fadeIn('fast');
        });

        $('.modal-title').html('Login with');
    });
    $('.error').removeClass('alert alert-danger').html('');
}

function openLoginModal() {
    showLoginForm();
    console.log('working ++')
    setTimeout(function () {
        $('#loginModal').modal('show');
    }, 230);

}

function openRegisterModal() {
    showRegisterForm();
    setTimeout(function () {
        $('#loginModal').modal('show');
    }, 230);

}

function loginAjax() {
    shakeModal();
}

function shakeModal() {
    $('#loginModal .modal-dialog').addClass('shake');
    $('.error').addClass('alert alert-danger').html("Invalid email/password combination");
    $('input[type="password"]').val('');
    setTimeout(function () {
        $('#loginModal .modal-dialog').removeClass('shake');
    }, 1000);
}

export function changeInterestState() {
    const intrestStateBtn = document.getElementsByClassName('changeIntrestState');
    for (let i = 0; i < intrestStateBtn.length; i++) {
        intrestStateBtn[i].onclick = (e) => {
            console.log('sjsjsj')
        }
    }
}

export function toggleFollowBtn() {
    const followBtns = document.getElementsByClassName('identifyFollowBtns');
    for (let i = 0; i < followBtns.length; i++) {
        followBtns[i].onclick = async (e) => {

            let action = followBtns[i].classList.contains('btn-primary') ? 'follow' : 'unfollow'

            const obj = {
                action,
                user_id: e.target.id
            }

            followBtns[i].disabled = true;
            const isPostRequestOk = await postJsonData('/accounts/api/follow_unfollow_action', obj);
            if (isPostRequestOk) {
                if (followBtns[i].classList.contains('btn-primary')) {
                    followBtns[i].classList.toggle('btn-primary');
                    followBtns[i].classList.toggle('btn-danger');
                    followBtns[i].innerText = 'Unfollow';
                } else {
                    followBtns[i].classList.toggle('btn-primary');
                    followBtns[i].classList.toggle('btn-danger');
                    followBtns[i].innerText = 'Follow';
                }
            } else {
                alert('Something went wrong, please try again later');
            }
            followBtns[i].disabled = false;
        }
    }
}


export function handleProfileUpdate() {
    const elements = document.getElementsByClassName('input_change_field');
    const frm_data = new FormData();
    for (let i = 0; i < elements.length; i++) {
        elements[i].onchange = (e) => {
            const ele = e.target;
            if (ele.type === 'file') frm_data.append(ele.name, ele.files[0])
            else frm_data.append(ele.name, ele.value)
        }
    }

    document.getElementById('update_profile_form').onsubmit = (e) => {
        e.preventDefault();
        fetch('/accounts/api/profile/update', {
            method: 'PUT',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: frm_data
        }).then(
            res => res.json()
        ).then(data => {
            document.getElementById('user_profile_img').src = data.prof_img
            document.getElementById('user_banner_img').style.background = `rgba(0, 0, 0, 0) url(${data.banner_img}) no-repeat scroll center center / cover`
            document.getElementById('user_full_name').innerText = data.full_name
            document.getElementById('user_credential').innerText = data.credential
        })
    }
}


function enableLoaderTwo(loaderGif) {
    loaderGif.style.display = 'block';
    console.log('block');
    loaderGif.style.visibility = 1;
    loaderGif.style.opacity = 1;
}

function disableLoaderTwo(loaderGif) {
    loaderGif.style.display = 'none';
    loaderGif.style.visibility = 0;
    loaderGif.style.opacity = 0;
}


export function getFollowersAndFollowing() {
    const followersAndFollowingBtns = document.getElementsByClassName('fAndFBtn');
    const mainPageFAndFBtns = document.getElementsByClassName('mainPageFAnfFBtns');
    let count = 0;
    for (let i = 0; i < followersAndFollowingBtns.length; i++) {
        followersAndFollowingBtns[i].onclick = async (e) => {
            const action = e.target.id;
            await helperFnFirst(action)
        }
        mainPageFAndFBtns[i].onclick = async (e) => {
            console.log('main Page')
            await helperFnFirst('following')
        }
    }
}

async function helperFnFirst(action) {
    const loader = document.getElementById(`loader-${action}`)
    enableLoaderTwo(loader)
    await helperFunctionFAndF(action);
    disableLoaderTwo(loader)
}


async function helperFunctionFAndF(action) {
    const link_id = window.location.pathname.split('/')[2];
    await constructSection(`/accounts/api/user/${link_id}/${action}`, fillRespectiveData, action);
}


function fillRespectiveData(data, action) {
    if (action === 'following') {
        let followingList = '';
        for (let i = 0; i < data.length; i++) {
            followingList += `
      <div class="notification-list notification-list--unread" style="margin-bottom: 0px; border-bottom: 1px solid black;">
      <div class="notification-list_content">
          <div class="notification-list_img">
              <a href="/profile/${data[i].id}">
                  <img src="${data[i].prof_img}" alt="">
              </a>
          </div>
          <div class="notification-list_detail">
              <a href="/profile/${data[i].id}">
                  <a href="/profile/${data[i].id}">
                      <p><b>${data[i].full_name}</b></p>
                  </a>
              </a>
              <p class="text-muted"><small>${data[i].credential}</small></p>
          </div>
      </div>
      <div class="notification-list_feature-img">
      
      ${!data[i].is_following ?
                `<button class="btn btn-sm btn-danger identifyFollowBtns" id="${data[i].id}">Unfollow</button>` :
                `<button id="${data[i].id}" class="btn btn-sm btn-primary identifyFollowBtns">Follow</button>`
            }
    
      </div>
  </div>
      `
        }
        document.getElementById('nav-following').innerHTML = `
          <div class="notification-ui_dd-content" >
            ${followingList}
            <div class="loader5" id="loader-following" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);">
            <img src="/static/img/loader4.gif" alt="Spinning Loader">
        </div>
          </div>
    `
    } else {
        let followersList = '';
        for (let i = 0; i < data.length; i++) {
            followersList += `
      <div class="notification-list notification-list--unread" style="margin-bottom: 0px; border-bottom: 1px solid black;">
      <div class="notification-list_content">
          <div class="notification-list_img">
              <a href="/profile/${data.id}">
                  <img src="${data[i].prof_img}" alt="">
              </a>
          </div>
          <div class="notification-list_detail">
              <a href="/profile/${data[i].id}">
                  <a href="/profile/${data[i].id}">
                      <p><b>${data[i].full_name}</b></p>
                  </a>
              </a>
              <p class="text-muted"><small>${data[i].credential}</small></p>
          </div>
      </div>
      <div class="notification-list_feature-img">
      ${!data[i].is_following ?
                `<button class="btn btn-sm btn-primary identifyFollowBtns" id="${data[i].id}">Follow</button>` :
                `<button class="btn btn-sm btn-danger identifyFollowBtns" id="${data[i].id}">Unfollow</button>`
            }
      </div>
  </div>
      `
        }
        document.getElementById('nav-followers').innerHTML = `
          <div class="notification-ui_dd-content" >
            ${followersList}
            <div class="loader5" id="loader-followers" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);">
            <img src="/static/img/loader4.gif" alt="Spinning Loader">
        </div>
          </div>
    `
    }
    toggleFollowBtn();
}


export function createColectionPostRequest() {
    const createCollectionBtn = document.getElementById('createCollectionBtn');
    const inputBtn = document.getElementById('collectionNameInput')
    createCollectionBtn.disabled = true;
    createCollectionBtn.onclick = async () => {
        const isPostRequestOk = await postJsonData('/hooks/api/collections/', {
            title: inputBtn.value,
        });
        if (isPostRequestOk) window.location.reload();
        else alert('Something Went Wrong, try again later');
    }
    inputBtn.oninput = async () => {
        createCollectionBtn.disabled = inputBtn.value.length <= 0;
    }
}


export function manageInterestFollowOrRemove(classOfElement, toggleClass, existingClass) {
    let followOrRemoveBtns2 = document.getElementsByClassName(classOfElement);
    for (let i = 0; i < followOrRemoveBtns2.length; i++) {
        followOrRemoveBtns2[i].onclick = async (e) => {
            let clikcedBtn = e.target;
            const obj = {
                interest_name : e.target.closest('.intrestBox2').getElementsByTagName('h1')[0].innerText
            }
            if (clikcedBtn.classList.contains('fa')) {
                clikcedBtn.classList.toggle(toggleClass);
                clikcedBtn.classList.toggle(existingClass)
            } else {
                let faElement = clikcedBtn.getElementsByTagName('i')[0];
                faElement.classList.toggle(toggleClass);
                faElement.classList.toggle(existingClass)
            }
            const isPostRequestOk = await postJsonData('/hooks/api/toggle-interest', obj);
            if (!isPostRequestOk) alert('Something Went Wrong, Try Again Later');
        }
    }
}


export function FBfun() {

    window.fbAsyncInit = function () {
        FB.init({
            appId: '1107103839795514',
            cookie: true,
            xfbml: true,
            version: 'v2.7'
        });

        FB.AppEvents.logPageView();

    };

    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    FB.getLoginStatus(function (response) {
        statusChangeCallback(response);
    });


}

async function postFormData(data, url) {
    return await fetch(url, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: data
    })
}

export function handle_login() {
    document.getElementById('login-form').onsubmit = async (e) => {
        e.preventDefault();
        const form_data = new FormData(e.target);
        const res = await postFormData(form_data, '/accounts/api/login')

        if (res.status === 200)
            window.location = '/'
        else if (res.status === 404 || res.status === 400)
            alert('invalid credentials')
    }
}

export function handle_register() {
    document.getElementById('register-form').onsubmit = async (e) => {
        e.preventDefault();
        const form_data = new FormData(e.target)

        const res = await postFormData(form_data, '/accounts/api/register')

        if (res.status === 400) {
            alert('user with this email already exists')
        } else if (res.status === 201) {
            window.location = '/'
        }
    }
}

function addTitleAndUrlTobutton(title,url){
  const sharingButtons = document.getElementsByClassName('sharingButtons');
  for (let i=0;i<sharingButtons.length;i++){
    sharingButtons[i].setAttribute('data-title',title);
    sharingButtons[i].setAttribute('data-url',url);
  }
  document.getElementById('copyUrl').value = 'Copy URL : ' + url;
}

export function shareHookToVariousPlatforms(){
  const shareOnHook = document.getElementsByClassName('share');
  for (let i=0;i<shareOnHook.length;i++){
    shareOnHook[i].onclick = (e) => {
      const parentOne = e.target.closest('.hookPost');
      const title = parentOne.getElementsByClassName('hookTitle')[0].innerText;
      const url = parentOne.getElementsByClassName('redirect')[0].getElementsByTagName('a')[0].href;
      addTitleAndUrlTobutton(title,url);
    }
  }

}