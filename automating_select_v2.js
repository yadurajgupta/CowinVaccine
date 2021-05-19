function add_jquery() {
    let script = document.createElement("script");
    script.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.6.3/jquery.min.js"
    document.getElementsByTagName("head")[0].appendChild(script);
};
add_jquery()
// Audio by Eric Matyas
// www.soundimage.org
let successAudio = new Audio("http://soundimage.org/wp-content/uploads/2016/04/UI_Quirky1.mp3");
let errorAudio = new Audio("https://soundimage.org/wp-content/uploads/2020/01/UI_Quirky_42.mp3");
let SCRIPT_URL = "https://selfregistration.cowin.gov.in/appointment"

//TO BE FILLED BY USER
let minimum_available_slots = 3
// Fill in center names as an array (Lower/Upper Case does not matter)
// Example
// let CENTERS_NAMES = ["PHC", "WAZIRABAD"]
// This would match any center with PHC or WAZIRABAD anywhere in its name (case insensitive substring match)
// The following would match 
// 1. XYZ UPHC
// 2. WAZIRABAD Center
// 3. XYZ PHC
// 4. Center UPHC sector 124 (because "UPCH" has PHC in it)

// or leave empty if any center works
let CENTERS_NAMES = []



let intervalVal = setTimeout(() => {
    CENTERS_NAMES = CENTERS_NAMES.map((name) => { return name.toLowerCase() })
    function playAudio(audio, milis) {
        audio.loop = true;
        audio.play();
        let closure_audio = audio
        setTimeout(() => { closure_audio.loop = false; }, milis);
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
        return $("ion-row")
            .toArray()
            .filter((element) => {
                return $(element).find("ul.slot-available-wrap li a").length > 0
                    && $(element).find("ion-row").length == 0
            })
            .map((element) => {
                return {
                    'center_name': $($(element).find("h5.center-name-title")).text().toLowerCase(),
                    'slots': parse_slots($(element).find("ul.slot-available-wrap li a")),
                };
            })
            .filter((element) => { return element['slots'].length > 0 })
    }
    function filter_by_name(center_info) {
        if (CENTERS_NAMES.length == 0) return true;
        let { center_name } = center_info
        let res = CENTERS_NAMES.some((name) => { return center_name.search(name) != -1; })
        if (res == false) {
            console.log("\n".join(
                [`${center_name} is being BLOCKED DUE TO CENTER NAMES RESTRICTION`,
                `\nCENTER_NAMES={${CENTERS_NAMES}}`,])
            )
        }
        return res;
    }
    function concat_and_sort_slots(accumulator, element) {
        return accumulator.concat(element['slots'])
            .sort((a, b) => { a['availability'] - b['availability'] })
            .sort((a, b) => a['date'] - b['date'])
    }
    function get_slot_with_max_avail(accumulator, element) {
        if (element['availability'] > accumulator['availability']) return element
        return accumulator;
    }
    let clicked_filters_indexes = get_clicked_filters()
    return setInterval(() => {
        try {
            if ($("h3.appoint-success").length > 0) return "DONE";
            if (document.location.href != SCRIPT_URL) throw ["Not at the right page", `Get to ${SCRIPT_URL}`].join("\n");
            $("ion-button.pin-search-btn")[0].click();
            let filters = $("div.agefilterblock div input").toArray()
            clicked_filters_indexes.forEach(element => filters[element].click());
            setTimeout(() => {
                let result = get_centers()
                    .filter(filter_by_name)
                    .reduce(concat_and_sort_slots, [])
                    .reduce(get_slot_with_max_avail, { 'availability': 0 });
                if (result['availability'] > 0) {
                    result['HTMLElement'].click();
                    playAudio(successAudio, 10000);
                    clearInterval(intervalVal);
                }
            }, 100);
        } catch (error) {
            console.error(error);
            playAudio(errorAudio, 10000);
            console.log()
            clearInterval(intervalVal);
        }
    }, 1000);
}, 100);