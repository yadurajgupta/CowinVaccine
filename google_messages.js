function add_jquery() {
    let script = document.createElement("script");
    script.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.6.3/jquery.min.js"
    document.getElementsByTagName("head")[0].appendChild(script);
};
add_jquery()
localStorage.setItem('OTP', null)
let Interval = setInterval(() => {
    try {
        let messages = $("div.text-msg").toArray()
        let lastest_message = messages[messages.length - 1]
        let OTP = lastest_message.innerText.match("[0-9]{6}")[0]
        if (localStorage.getItem('OTP') != OTP) {
            localStorage.setItem('OTP', OTP)
            console.log(OTP, "SET")
        }
    }
    catch (error) {
        localStorage.setItem('OTP', null)
        console.error(error)
    }
}, 1000)
    // clearInterval(Interval)