//START OF USER ARGUMENTS PART

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
let slot_start_date = "DD/MM/YYYY"
let slot_end_date = "DD/MM/YYYY"

// slot_timinng can be set to (1,2,3,4)
// 1 = 09:00AM - 11:00AM
// 2 = 11:00AM - 01:00PM
// 3 = 01:00PM - 03:00PM
// 4 = 03:00PM - 05:00PM
let slot_timing = 1;


let state_list = {
    'uttar pradesh': [
        "Ghaziabad",
        "Gautam Buddha Nagar",],
    'haryana': [
        "Gurgaon",
        "Faridabad",
        "Nuh",
        "Palwal"
    ],
    'delhi': [
        "Central Delhi",
        "East Delhi",
        "New Delhi",
        "North Delhi",
        "North East Delhi",
        "North West Delhi",
        "Shahdara",
        "South Delhi",
        "South East Delhi",
        "South West Delhi",
        "West Delhi",
    ]
};
let stop = false;
//END OF USER ARGUMENTS PART

(async function () {
    let SCRIPT_URL = "https://selfregistration.cowin.gov.in/appointment"

    if (![1, 2, 3, 4].includes(slot_timing)) {
        console.error(`Something wrong with slot_timing ${slot_timing}\nHas to be one of (1, 2, 3, 4)`)
        return
    }

    if (isNaN(minimum_available_slots)) {
        console.error("Something wrong with minimum_available_slots ${minimum_available_slots}\nHas to be a integer")
        return
    }
    if (document.location.href != SCRIPT_URL) {
        console.error(`Not at the right page\nGet to ${SCRIPT_URL}`)
        return
    }
    minimum_available_slots = parseInt(minimum_available_slots)

    let interval_val = null
    let script = document.createElement("script")
    script.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.6.3/jquery.min.js"
    document.getElementsByTagName("head")[0].appendChild(script)
    let initial_jquery_load_timeout = 100
    let error_audio_playback_time = 10000
    let success_audio_playback_time = 10000
    let search_button_timeout = 300
    let slot_select_timeout = 300
    let wait_between_searches = 3000;
    let wait_after_searches = 3000;
    let select_slot_timing_index = slot_timing - 1
    // Audio by Eric Matyas
    // www.soundimage.org
    let success_audio = new Audio("http://soundimage.org/wp-content/uploads/2016/04/UI_Quirky1.mp3")
    let error_audio = new Audio("https://soundimage.org/wp-content/uploads/2020/01/UI_Quirky_42.mp3")
    // Jquery selectors for elements
    let jquery_filters_selector = "div.agefilterblock div input"
    let jquery_slot_selector = "ul.slot-available-wrap li a"
    let jquery_center_name_selector = "h5.center-name-title"
    let success_appointment_header_selector = "h3.appoint-success"
    let search_button_selector = "ion-button.pin-search-btn"
    let center_row_selector = "ion-row"
    let slot_date_selector = "li.availability-date"
    let slot_time_button_selector = "ion-button"
    let drop_down_selectors = "div.mat-select-arrow"
    let confirm_button_selector = "ion-button.register-btn"
    let drop_down_options_selector = "span.mat-option-text"
    let security_code_textbox_selector = "input[type=text]"
    async function wait_for_x_mils(x) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve('resolved');
            }, x);
        });
    }
    await wait_for_x_mils(initial_jquery_load_timeout);
    function parse_date(date_string) {
        if (date_string == "DD/MM/YYYY") return null
        let parsed = date_string.split("/").map((value) => { return parseInt(value) })
        if (parsed.length != 3 || parsed.some(isNaN)) {
            console.error(`Something wrong with date ${date_string}\nIt will not be used`)
            return null
        }
        return new Date(parsed[2], parsed[1] - 1, parsed[0])
    }
    async function playAudio(audio, milis) {
        audio.loop = true
        audio.play()
        await wait_for_x_mils(milis);
        audio.loop = false;
    }
    function get_months() {
        let months = {}
        for (let index = 0; index < 12; index++) {
            months[new Date(0, index).toLocaleString('en-US', { month: 'long' })] = index
        }
        return months
    }
    function get_clicked_filters() {
        return $(jquery_filters_selector).toArray()
            .map((element, index) => { return { 'html_element': element, 'index': index } })
            .filter((element) => { return element['html_element'].checked })
            .map((element) => { return element['index'] })
    }
    function match_month(month) {
        month = month.toLowerCase().trim();
        let months = get_months();
        for (let [key, index] of Object.entries(months)) {
            let month_in_dict = key.toLowerCase().substr(0, month.length);
            if (month_in_dict == month)
                return index;
        }
        return undefined;
    }
    function get_dates() {
        return $(slot_date_selector).toArray()
            .filter((element) => { return $(element).is(":visible") })
            .map((element) => {
                let arr = $(element).text().split(" ")
                return new Date(arr[2], match_month(arr[1]), arr[0])
            })
    }
    function check_date_limits(slot_date, start_date, end_date) {
        if (start_date && start_date > slot_date) return false
        if (end_date && end_date < slot_date) return false
        return true
    }
    function parse_slots(slots, center_name) {
        let dates = get_dates()
        return slots.toArray()
            .map((element, index) => {
                return {
                    'HTMLElement': element,
                    'availability': parseInt(element.innerText),
                    'center_name': center_name,
                    'date': dates[index],
                }
            })
            .filter((element) => {
                return !isNaN(element['availability'])
                    && element['availability'] >= minimum_available_slots
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
                let center_name = $(element).find(jquery_center_name_selector).first().text().trim().toLowerCase()
                return {
                    'center_name': center_name,
                    'slots': parse_slots($(element).find(jquery_slot_selector), center_name),
                }
            })
            .filter((element) => { return element['slots'].length > 0 })
    }
    function filter_by_name(center_name, center_names) {
        return center_names.length == 0
            || center_names.some((name) => { return center_name.search(name) != -1; })
    }
    function concat_slots(accumulator, element) {
        return accumulator.concat(element['slots'])
    }
    function get_slot_with_max_avail(accumulator, element) {
        if (element['availability'] > accumulator['availability']) return element
        return accumulator
    }
    function get_slot_closest(accumulator, element) {
        if (accumulator['date'] == null || element['date'] < accumulator['date'] || (element['date'] == accumulator['date'] && element['availability'] > accumulator['availability'])) return element
        return accumulator
    }
    async function select_slot(timing) {
        await wait_for_x_mils(slot_select_timeout);
        $(slot_time_button_selector).eq(timing).click();
        // $(security_code_textbox_selector).first().focus();
        $(confirm_button_selector).first().click();
    }
    function sort_slots(a, b) {
        let comp = a['availability'] - b['availability']
        if (comp == 0)
            return a['date'] - b['date']
        else
            return comp
    }
    let clicked_filters_indexes = get_clicked_filters()
    let start_date_parsed = parse_date(slot_start_date)
    let end_date_parsed = parse_date(slot_end_date)
    let center_names_parsed = CENTERS_NAMES.map((name) => { return name.trim().toLowerCase() })

    async function select_from_drop_down(drop_down, to_select) {
        $(drop_down).click();
        let found = false;
        $(drop_down_options_selector).toArray().forEach((ele) => {
            if ($(ele).text().trim().toLowerCase() == to_select.trim().toLowerCase()) {
                $(ele).click();
                found = true;
            }
        })
        return found;
    }
    async function select_state_and_district(state, district) {
        let drop_downs = $(drop_down_selectors).toArray()
        let state_drop_down = drop_downs[0];
        let district_drop_down = drop_downs[1];
        let val1 = await select_from_drop_down(state_drop_down, state);
        await wait_for_x_mils(500);
        let val2 = await select_from_drop_down(district_drop_down, district);
        return val1 && val2;
    }
    async function do_search(state, district) {
        try {
            if ($(success_appointment_header_selector).length > 0) throw true
            if (document.location.href != SCRIPT_URL) throw true
            $(search_button_selector).first().click()
            await wait_for_x_mils(search_button_timeout)
            let filters = $(jquery_filters_selector).toArray()
            clicked_filters_indexes.forEach(element => filters[element].click())
            await wait_for_x_mils(search_button_timeout)
            let result = get_centers()
                .filter((center_info) => { return filter_by_name(center_info['center_name'], center_names_parsed) })
                .reduce(concat_slots, [])
                .filter((slot) => { return check_date_limits(slot['date'], start_date_parsed, end_date_parsed) })
                .sort(sort_slots)
                .map((slot) => {
                    console.log(slot)
                    return slot
                })
                .reduce(get_slot_closest, { 'availability': 0 })

            if (result['availability'] > 0) {
                result['HTMLElement'].click()
                playAudio(success_audio, success_audio_playback_time)
                select_slot(select_slot_timing_index)
                clearInterval(interval_val)
                return true;
            }
            return false;
        } catch (error) {
            console.error(error)
            playAudio(error_audio, error_audio_playback_time)
            clearInterval(interval_val)
            return true;
        }
    }
    async function select_state_and_district_and_search() {
        for (let [state, districts] of Object.entries(state_list)) {
            for (let district of districts) {
                if (stop || $(success_appointment_header_selector).length > 0 || document.location.href != SCRIPT_URL) {
                    playAudio(error_audio, error_audio_playback_time)
                    return;
                }
                let found = await select_state_and_district(state, district);
                if (found) {
                    await wait_for_x_mils(100);
                    let res = await do_search(state, district);
                    if (res) return;
                    await wait_for_x_mils(wait_between_searches);
                }
                else {
                    console.log(`Not found ${state} ${district}`);
                }
            }
        }
        await wait_for_x_mils(wait_after_searches);
        await select_state_and_district_and_search();
    }
    select_state_and_district_and_search();
})();