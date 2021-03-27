import {constructSection, getJsonData2} from '../getAndPostRequest.js';
import {
    addHookModal,
    constructSidebar,
    contstructNavbar,
    learnMoreModal,
    loginAndSignupModal,
    privacyModal
} from '../components.js'
import * as utility from '../utilities/utilities.js'

const rootElement = document.getElementById('rootElement');
const loader = document.getElementById('loader');

function constructAllIntrests(data) {
    let interestList = '';
    for (let i = 0; i < data.length; i++) {
        interestList += `
        <div class="intrestBox2" style="background: url(${data[i].image}); background-size: cover">
        <h1>${data[i].name}</h1>
        <div class="colorOverlay"></div>
        <div class="followOrRemove  followOrRemove2" title="Add/Remove Interest">
            <i class="${data[i].is_fav ? "fa fa-trash changeIntrestState" : "fa fa-plus changeIntrestState"}"></i>
        </div>
        <a  href="/interest/${data[i].name}/hooks" title="View Interest Hooks" class="viewInterestHooks followOrRemove">
            <i class="fa fa-expand changeIntrestState"></i>
        </a>
    </div>
        `
    }
    return (
        `
        <div class="intrestsBoxContainer">
            <h4 style="padding-bottom: 5px; letter-spacing: 2px; color:#f2f2f2">Discover New Intrests</h4>
            <div class="mainPageIntrestBoxs">
                ${interestList}
            </div>
        </div>
        `
    )
}

let assemblePage;

async function constructIntrestsPage(urlOne) {
    utility.enableLoader(rootElement, loader);
    const intrestsHtml = constructSection(urlOne, constructAllIntrests)


    let res = await getJsonData2('/hooks/api/user-interests-and-is-authenticated');
    let isAuthenticated = false;
    if (res.status_code === 200)
        isAuthenticated = true;

    const sidebarHtml = await constructSidebar(res.data, isAuthenticated);


    const navbarHtml = contstructNavbar();
    const hookModal = await addHookModal();
    const signupAndSigninModalHtml = loginAndSignupModal();

    const learnMoreModalHtml = learnMoreModal()
    const privacyModalHtml = privacyModal();

    await Promise.all([intrestsHtml]).then(values => {
        assemblePage = `
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
                        ${values[0]}
                    </div>
                    ${hookModal}
                    ${signupAndSigninModalHtml}
                    ${learnMoreModalHtml}
                    ${privacyModalHtml}
            </main>
        </div>
        `
    })
    rootElement.innerHTML = assemblePage;
    utility.manageSidebarStateOnDifferentMediaDevices();
    utility.disableLoader(rootElement, loader);
    utility.loadMainJsFile();
    utility.addNecessaryEventListeners();
    utility.manageOnClickIntrestBox();
    utility.manageSearchResults();
    utility.manageAddHookModalPreveiw();
    utility.manageInterestFollowOrRemove('followOrRemove2', 'fa-trash', 'fa-plus');
    if (!isAuthenticated) {
        utility.loadLoginModalJs();
        utility.handle_login();
        utility.handle_register();
        utility.FBfun();
    }
}

constructIntrestsPage('/hooks/api/user-all-interests')
    .then(() => console.log("prmoise resolved"))
    .catch((err) => console.log(err.message));