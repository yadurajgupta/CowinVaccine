let script = document.createElement("script");
script.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.6.3/jquery.min.js";
document.getElementsByTagName("head")[0].appendChild(script);
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

let intervalVal = setInterval(() => {
    try {
        if (document.location.href != URL) throw ["Not at the right page", `Get to ${URL}`].join("\n");
        $("ion-button.pin-search-btn")[0].click();
        let filters = $("div.agefilterblock div input");
        filters[0].click();   //18+
        // filters[1].click();   //45+
        filters[2].click();   //Covishield
        filters[3].click();   //Covaxin
        filters[4].click();   //Sputnik V
        // filters[5].click();   //Paid
        // filters[6].click();   //Free

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
    } catch (error) {
        console.error(error);
        playAudio(errorAudio, 10000);
        clearInterval(intervalVal);
    }
}, 1000);
// clearInterval(intervalVal)