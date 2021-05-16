(() => {
    let script = document.createElement("script");
    script.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.6.3/jquery.min.js"
    _ = document.getElementsByTagName("head")[0].appendChild(script);
})();
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
var months = {}
for (let index = 0; index < 12; index++) {
    months[new Date(0, index).toLocaleString('en-US', { month: 'long' })] = index + 1
}
function get_clicked_filters() {
    return $("div.agefilterblock div input").toArray()
        .map((element, index) => { return [element, index] })
        .filter((element) => { return element[0].checked })
        .map((element) => { return element[1] })
}
function get_dates() {
    return $("li.availability-date").toArray()
        .filter((element) => { return $(element).is(":visible") })
        .map((element) => {
            let arr = $(element).text().split(" ")
            return new Date(arr[2], months[arr[1]], arr[0]);
        })
}
function parse_slots(slots) {
    let dates = get_dates()
    return slots.toArray()
        .map((element, index) => {
            return {
                'HTMLElement': element,
                'availability': parseInt(element.innerText),
                'date': dates[index],
            }
        })
        .filter((element) => {
            return !isNaN(element['availability'])
                && element['availability'] >= minimum_available_slots
        })
}
function get_centers() {
    return $("ion-row").toArray().filter((element) => {
        return $(element).find("ul.slot-available-wrap li a").length > 0
            && $(element).find("ion-row").length == 0
    }).map((element) => {
        return {
            'center_name': $(element).find("h5.center-name-title").innerText,
            'slots': parse_slots($(element).find("ul.slot-available-wrap li a")),
        };
    })
}
let clicked_filters_indexes = get_clicked_filters()
let intervalVal = setInterval(() => {
    try {
        if (document.location.href != URL) throw ["Not at the right page", `Get to ${URL}`].join("\n");
        $("ion-button.pin-search-btn")[0].click();
        let filters = $("div.agefilterblock div input").toArray()
        clicked_filters_indexes.forEach(element => filters[element].click());
        setTimeout(() => {
            let result = get_centers()
                .reduce((accumulator, element) => { return accumulator.concat(element['slots']) }, [])
                .sort((a, b) => { a['availability'] - b['availability'] })
                .sort((a, b) => a['date'] - b['date'])
                .reduce((accumulator, element) => {
                    if (element['availability'] > accumulator['availability']) return element
                    return accumulator;
                }, { 'availability': 0 });

            if (result['availability'] > 0) {
                result['HTMLElement'].click();
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