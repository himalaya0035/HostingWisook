import {constructSection, getJsonData2} from '../getAndPostRequest.js';
import {
    addHookModal,
    constructSidebar,
    contstructNavbar,
    fillSingleNotificationElement, learnMoreModal,
    loginAndSignupModal, privacyModal
} from '../components.js'
import * as utility from '../utilities/utilities.js'

const rootElement = document.getElementById('rootElement');
const loader = document.getElementById('loader');

function constrcuctNotifications(data) {
    let notifications = '';
    for (let i = 0; i < data.length; i++) {
        notifications += fillSingleNotificationElement(data[i]);
    }
    return (
        `
        <section class="">
            <h3 class="heading-line" style="margin-bottom: 20px;">Notifications <i class="fa fa-bell text-white"></i></h3>
            <div class="notification-ui_dd-content">
                ${notifications}
            </div>
        </section>
        `
    )
}

async function constrcuctNotificationsPage(urlOne) {
    utility.enableLoader(rootElement, loader);


    let res = await getJsonData2('/hooks/api/user-interests-and-is-authenticated');
    let isAuthenticated = false;
    if (res.status_code === 200)
        isAuthenticated = true;


    const sidebarHtml = await constructSidebar(res.data, isAuthenticated);


    const notificationsHtml = await constructSection(urlOne, constrcuctNotifications);
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
                    ${notificationsHtml}
                </div>
                ${hookModal}
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
    if (!isAuthenticated) {

        utility.loadLoginModalJs();
        utility.handle_login();
        utility.handle_register();
        utility.FBfun();
    }
}

constrcuctNotificationsPage('/notifications/api')
    .then(() => console.log('Promise Resolved'))