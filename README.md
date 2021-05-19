# CowinVaccine

Scripts to help booking vacine slot from cowin site

## [Automating Selection](https://github.com/yadurajgupta/CowinVaccine/blob/main/automating_select_v2.js)

- Code has to be pasted into the console at the cowin search page
- Select either your district or pincode
- Select valid filters on the page
- Press ctrl + shift + J to open console
- Edit the User Edit part if required
- [Youtube Demo](https://youtu.be/epKo8R-mI3k)
- All the code does is
  1. Keeps clicking the search button
  2. Keeps clicking the filters you had selected
  3. Looks at the page and sees if any slot is available
  4. Clicks on the slot with max availibility and plays audio beeps to alert
  5. You will still need to enter the security code and slot timing
  6. If you are automatically logged out then also creates a beep to alert

## [Covid.py](https://github.com/yadurajgupta/CowinVaccine/blob/main/covid.py)(OUTDATED DUE TO CHANGES TO API)

- Install everything from requirements.py
- (path-to-python or python or python3) -m pip install -r ./requirements.txt
- For WSL or linux users this may need to be done [link](https://github.com/greghesp/assistant-relay/issues/49#issuecomment-482837721)
- Run on a loop and beeps whenever it finds a slot in you any districts that you can mention at the top
