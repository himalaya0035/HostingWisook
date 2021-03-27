export function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');


export async function getJsonData(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

export async function getJsonData2(url) {
    const res = await fetch(url);
    const data = await res.json();
    return {
        'status_code': res.status,
        data
    }
}


export async function constructSection(url, callback, sectionName) {
    const jsonData = await getJsonData(url); // Making Api request here
    if (callback && sectionName) {
        return callback(jsonData, sectionName)
    } else if (callback) {
        return callback(jsonData); // this will return html after filling the html with JsonData
    } else {
        return Error('Bc callback to pass kr');
    }
}

export async function postJsonData(url, objdata, method = 'POST') {
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(objdata)
        })
        if (response.status === 201 || response.status === 200 || response.status === 204) {
            return true;
        }
    } catch (err) {
        console.log(err.message)
        return false
    }
}
