# CowinVaccine

Scripts to help booking vacine slot from [Cowin Site](https://www.cowin.gov.in/home)

## [Automating Selection](https://github.com/yadurajgupta/CowinVaccine/blob/main/automating_select_v2.js)

- Login into [Cowin](https://selfregistration.cowin.gov.in/)
- Create or select user
- You can select either your district or pincode to search
- Select valid filters on the page (18+,45+,Covishield,Covaxin,Sputnik V,Paid,Free)
- Press ctrl + shift + J to open console
- Copy and paste code from [automating_select_v2.js](https://raw.githubusercontent.com/yadurajgupta/CowinVaccine/main/automating_select_v2.js)
- Edit the User Edit part at the top of the script if required
- [Youtube Demo](https://youtu.be/epKo8R-mI3k)

### What does the script do?

1. Keeps clicking the search button
2. Keeps clicking the filters you had selected
3. Looks at the page and sees if any slot is available
4. Clicks on the slot with max availibility and plays audio beeps to alert
5. **IMPORTANT:** You will still need to enter the security code and slot timing
6. If you are automatically logged out then also creates a beep to alert
7. if Anything at any point seems to be broken you can just refresh the page to start over

### Extra tips

1. Use telegram alerts to see when have the past slots have come out [Under45](https://under45.in/) or [Above45](https://above45.in/)
   - The slots follow the same patern every day
   - so you will know when to sit for booking slots
2. Use [Google Messages](https://play.google.com/store/apps/details?id=com.google.android.apps.messaging&hl=en_IN&gl=US)
   - Using Google Messages as the default messaging app on your phone will allow you to access texts on Laptop/PC as well
   - Copy OTP faster

## [Covid.py](https://github.com/yadurajgupta/CowinVaccine/blob/main/covid.py)(OUTDATED DUE TO CHANGES TO API)

- Install everything from requirements.py
- (path-to-python or python or python3) -m pip install -r ./requirements.txt
- For WSL or linux users this may need to be done [link](https://github.com/greghesp/assistant-relay/issues/49#issuecomment-482837721)
- Run on a loop and beeps whenever it finds a slot in you any districts that you can mention at the top
