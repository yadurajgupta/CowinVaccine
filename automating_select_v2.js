//START OF USER FILLED PART

// minimum number of slots available
let minimum_available_slots = 1

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

// start and end dates for the slots
// Leave as is if you want to book slot for any day
let slot_start_date = "DD/MM/YYYY";
let slot_end_date = "DD/MM/YYYY";

// slot_timinng can be set to (1,2,3,4)
// 1 = 09:00AM - 11:00AM
// 2 = 11:00AM - 01:00PM
// 3 = 01:00PM - 03:00PM
// 4 = 03:00PM - 05:00PM
let slot_timing = 1;

//END OF USER FILLED PART

(() => {
    let intervalVal = null;
    let script = document.createElement("script");
    script.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.6.3/jquery.min.js"
    document.getElementsByTagName("head")[0].appendChild(script);
    let initial_jquery_load_timeout = 100;
    let script_search_repeat_time = 1000;
    let error_audio_playback_time = 10000;
    let success_audio_playback_time = 10000;
    let search_button_timeout = 300;
    let slot_select_timeout = 300;
    let select_slot_timing = slot_timing;
    setTimeout(() => {

        // Audio by Eric Matyas
        // www.soundimage.org
        let successAudio = new Audio("http://soundimage.org/wp-content/uploads/2016/04/UI_Quirky1.mp3");
        let errorAudio = new Audio("https://soundimage.org/wp-content/uploads/2020/01/UI_Quirky_42.mp3");
        //URL on which script is meant to work on
        let SCRIPT_URL = "https://selfregistration.cowin.gov.in/appointment"

        let center_names_parsed = CENTERS_NAMES.map((name) => { return name.toLowerCase() })

        // Jquery selectors for elements
        let jquery_filters_selector = "div.agefilterblock div input"
        let jquery_slot_selector = "ul.slot-available-wrap li a"
        let jquery_center_name_selector = "h5.center-name-title"
        let success_appointment_header_selector = "h3.appoint-success"
        let search_button_selector = "ion-button.pin-search-btn"
        let center_row_selector = "ion-row"
        let slot_date_selector = "li.availability-date"
        let slot_time_button_selector = "ion-button"
        let security_code_textbox_selector = "input[type=text]"
        function parse_date(date_string) {
            if (date_string == "DD/MM/YYYY") return null;
            let parsed = date_string.split("/").map((value) => { return parseInt(value) })
            return new Date(parsed[2], parsed[1] - 1, parsed[0])
        }
        function playAudio(audio, milis) {
            audio.loop = true;
            audio.play();
            let closure_audio = audio
            setTimeout(() => { closure_audio.loop = false; }, milis);
        }
        var months = {}
        for (let index = 0; index < 12; index++) {
            months[new Date(0, index).toLocaleString('en-US', { month: 'long' })] = index
        }
        function get_clicked_filters() {
            return $(jquery_filters_selector).toArray()
                .map((element, index) => { return { 'html_element': element, 'index': index } })
                .filter((element) => { return element['html_element'].checked })
                .map((element) => { return element['index'] })
        }
        function get_dates() {
            return $(slot_date_selector).toArray()
                .filter((element) => { return $(element).is(":visible") })
                .map((element) => {
                    let arr = $(element).text().split(" ")
                    return new Date(arr[2], months[arr[1]], arr[0]);
                })
        }
        function check_date_limits(slot) {
            if (start_date_parsed == null && end_date_parsed == null) return true;
            if (start_date_parsed != null && start_date_parsed > slot['date']) return false;
            if (end_date_parsed != null && end_date_parsed < slot['date']) return false;
            return true;
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
                        && element['availability'] >= minimum_available_slots && check_date_limits(element)
                })
        }
        function get_centers() {
            return $(center_row_selector)
                .toArray()
                .filter((element) => {
                    return $(element).find(jquery_slot_selector).length > 0
                        && $(element).find(center_row_selector).length == 0
                })
                .map((element) => {
                    return {
                        'center_name': $(element).find(jquery_center_name_selector).first().text().toLowerCase(),
                        'slots': parse_slots($(element).find(jquery_slot_selector)),
                    };
                })
                .filter((element) => { return element['slots'].length > 0 })
        }
        function filter_by_name(center_info) {
            if (center_names_parsed.length == 0) return true;
            let { center_name } = center_info
            return center_names_parsed.some((name) => { return center_name.search(name) != -1; })
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
        function select_slot(timing) {
            setTimeout(() => {
                $(slot_time_button_selector).toArray()[timing - 1].click()
                $(security_code_textbox_selector).first().focus()
            }, slot_select_timeout);

        }
        let clicked_filters_indexes = get_clicked_filters()
        let start_date_parsed = parse_date(slot_start_date)
        let end_date_parsed = parse_date(slot_end_date)

        intervalVal = setInterval(() => {
            try {
                if ($(success_appointment_header_selector).length > 0) return "DONE";
                if (document.location.href != SCRIPT_URL) throw ["Not at the right page", `Get to ${SCRIPT_URL}`].join("\n");
                $(search_button_selector).first().click();
                let filters = $(jquery_filters_selector).toArray()
                clicked_filters_indexes.forEach(element => filters[element].click());
                setTimeout(() => {
                    let result = get_centers()
                        .filter(filter_by_name)
                        .reduce(concat_and_sort_slots, [])
                        .reduce(get_slot_with_max_avail, { 'availability': 0 });
                    if (result['availability'] > 0) {
                        result['HTMLElement'].click();
                        playAudio(successAudio, success_audio_playback_time);
                        clearInterval(intervalVal);
                        select_slot(select_slot_timing);
                    }
                }, search_button_timeout);
            } catch (error) {
                console.error(error);
                playAudio(errorAudio, error_audio_playback_time);
                clearInterval(intervalVal);
            }
        }, script_search_repeat_time);
    }, initial_jquery_load_timeout);
})();