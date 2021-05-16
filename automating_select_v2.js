let script = document.createElement("script");
script.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.6.3/jquery.min.js"
_ = document.getElementsByTagName("head")[0].appendChild(script);
// Audio by Eric Matyas
// www.soundimage.org
let successAudio = new Audio("http://soundimage.org/wp-content/uploads/2016/04/UI_Quirky1.mp3");
let errorAudio = new Audio("https://soundimage.org/wp-content/uploads/2020/01/UI_Quirky_42.mp3");
let URL = "https://selfregistration.cowin.gov.in/appointment"
let minimum_available_slots = 3
function playAudio(audio, milis) {
    audio.loop = true;
    audio.play();
    setInterval((audio) => { audio.loop = false }, milis);
}
function get_clicked_filters() {
    return $("div.agefilterblock div input").toArray()
        .map((element, index) => {
            return [element, index]
        }).filter((element) => {
            return element[0].checked
        }).map((element) => {
            return element[1]
        })
}
function get_dates() {
    return $("li.availability-date").toArray()
        .filter((_, index) => { return index < 7 }).map((element) => {
            return $(element).text().split(" ")
        })
}
function get_centers() {
    let centers = $("div[_ngcontent-wcq-c114].ng-star-inserted").toArray()
        .filter((element) => {
            return element.classList.length == 1 && $(element).find("mat-list-option").length > 0;
        }).map((element) => {
            let center_name = $($(element).find("h5.center-name-title").toArray()).text()
            return [center_name, $(element).find("ul.slot-available-wrap li a").toArray()];
        })
}
let clicked_filters_indexes = get_clicked_filters()
let intervalVal = setInterval(() => {
    try {
        if (document.location.href != URL) throw ["Not at the right page", `Get to ${URL}`].join("\n");
        $("ion-button.pin-search-btn")[0].click();
        let filters = $("div.agefilterblock div input").toArray()
        clicked_filters_indexes.forEach(element => {
            filters[element].click()
        });
        setTimeout(() => {
            let result = $("ul.slot-available-wrap li a").toArray()
                .filter((element) => {
                    return !isNaN(element.innerText)
                        && parseInt(element.innerText) >= minimum_available_slots
                })
                .reduce((lastRetVal, currElement) => {
                    currNum = parseInt(currElement.innerText);
                    if (currNum > lastRetVal[0]) return [currNum, currElement];
                    else return lastRetVal;
                }, [0, null])[1];
            if (result) {
                result.click();
                playAudio(successAudio, 10000);
                clearInterval(intervalVal);
            }
        }, 100);
    } catch (error) {
        console.error(error);
        playAudio(errorAudio, 10000);
        clearInterval(intervalVal);
    }
}, 1000);
// clearInterval(intervalVal)