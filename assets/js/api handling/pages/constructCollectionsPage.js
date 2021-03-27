import {constructSection, getJsonData2} from '../getAndPostRequest.js';
import {
    addHookModal,
    constructSidebar,
    contstructNavbar,
    createCollectionCard,
    createCollectionModal, learnMoreModal,
    loginAndSignupModal, privacyModal
} from '../components.js'
import * as utility from '../utilities/utilities.js'

const rootElement = document.getElementById('rootElement');
const loader = document.getElementById('loader');

function constructCollections(data) {
    let collections = '';
    for (let i = 0; i < data.length; i++) {
        collections += createCollectionCard(data[i]);
    }
    return (
        `
        <div class="collectionContainer">
            <div class="addCollectionBtn" data-toggle="modal" data-target="#createCollectionModal" title="Create a Collection">
                <div class="plusContainer"  style="background: rgb(21,21, 21); border-radius: 50%; height: 100px; width: 100px; display: flex; justify-content: center; align-items: center; ">
                    <i class="fa fa-plus" style="color: white; font-size: 50px;"></i>
                </div>
            </div>
            ${collections}
        </div>
        `
    )
}

async function constructCollectionsPage(urlOne) {
    utility.enableLoader(rootElement, loader);


    let res = await getJsonData2('/hooks/api/user-interests-and-is-authenticated');
    let isAuthenticated = false;

     if (res.status_code === 200) {
        isAuthenticated = true;
    }

    const sidebarHtml = await constructSidebar(res.data, isAuthenticated)


    const collectionsHtml = await constructSection(urlOne, constructCollections);
    const navbarHtml = contstructNavbar();
    const createCollectionModalHtml = createCollectionModal();
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
                    ${collectionsHtml}
                </div>
                ${hookModal}
                ${createCollectionModalHtml}
                ${signupAndSigninModalHtml}
                ${learnMoreModalHtml}
                ${privacyModalHtml}
        </main>
    </div>
    `
    rootElement.innerHTML = assemblePage;
    utility.manageSidebarStateOnDifferentMediaDevices();
    utility.disableLoader(rootElement, loader);
    utility.loadMainJsFile();
    utility.addNecessaryEventListeners();
    utility.manageOnClickIntrestBox();
    utility.manageSearchResults();
    utility.manageAddHookModalPreveiw();
    utility.createColectionPostRequest();

    if (!isAuthenticated) {

        utility.loadLoginModalJs();
        utility.handle_login();
        utility.handle_register();
        utility.FBfun();
    }

}

constructCollectionsPage('/hooks/api/collections/')
    .then(() => console.log('Promise Resolved'))