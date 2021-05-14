# CowinVaccine

Scripts to help booking vacine slot from cowin site
#
## [Covid.py](https://github.com/yadurajgupta/CowinVaccine/blob/main/covid.py)
Run on a loop and beeps whenever it finds a slot in you any districts that you can mention at the top
#

## [Automation Selection](https://github.com/yadurajgupta/CowinVaccine/blob/main/automating_select.js)
- Code has to be pasted into the console at the cowin search page    
- Select either your district or pincode 
- All the code does is
  1. Keeps clicking the search button 
  2. Keeps clicking the filters you have selected
  3. Looks at the page and sees if any slot is available 
  4. Clicks on the slot with max availibility and plays audio beeps to alert 
  5. You will still need to enter the security code and slot timing
  6. If you are automatically logged out then also creates a beep to alert 

