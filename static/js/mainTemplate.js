const pageWrapper = document.getElementsByClassName('page-wrapper')[0];

window.addEventListener('resize', manageToggleSidebar)

function manageToggleSidebar() {
    if (window.innerWidth > 925) {
        pageWrapper.classList.add('toggled')
    } else {
        pageWrapper.classList.remove('toggled')
    }

}

manageToggleSidebar();

let toggleSidebarBtn = document.getElementById('toggle-sidebar');
toggleSidebarBtn.onclick = () => {
    pageWrapper.classList.toggle('toggled');
    if (toggleSidebarBtn.src.indexOf('/static/img/toggle.svg') > -1) {
        toggleSidebarBtn.src = '/static/img/toggle (1).svg';
    } else {
        toggleSidebarBtn.src = '/static/img/toggle.svg'
    }
}
let toggleSidebarBtn2 = document.getElementById('toggle-sidebar2');
toggleSidebarBtn2.onclick = () => {
    pageWrapper.classList.toggle('toggled');
}

let searchSection = document.getElementsByClassName('searchSection')[0];
let searchInput = document.getElementsByClassName('searchInput')[0];
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

let searchCategories = document.getElementsByClassName('searchCategory');


for (let i = 0; i < searchCategories.length; i++) {
    searchCategories[i].addEventListener('change', () => {
        let searchBar = searchCategories[i].closest('.searchBar') || searchCategories[i].closest('.searchBar2');
        let selectedInput = searchBar.getElementsByClassName('searchInput')[0];
        switch (searchCategories[i].value) {
            case 'Hooks':
                selectedInput.placeholder = 'Search Hooks ...'
                break;
            case 'Users':
                selectedInput.placeholder = 'Search Users ...'
                break;
            case 'Intrests':
                selectedInput.placeholder = 'Search Intrests ...'
                break;
        }
    })
}


function addSlider(element) {
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


addSlider('.hookScroller')
addSlider('.usersScroller')
let imgTag = document.getElementsByTagName('img');

for (i = 0; i < imgTag.length; i++) {
    imgTag[i].draggable = false;
}