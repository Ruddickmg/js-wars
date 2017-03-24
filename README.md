# js-wars
Work in progress, a take on the Advance Wars game for Gameboy Avance, run on NodeJS, written in Javascript (logic), python (database access), CSS and Html (canvas for animations) using a postgresql database.

Lacal:
========

this repo is a bit behind, but you can see the game functioning @ http://www.jswars.com/

I haven't put allot of work into the login UI so it may be a bit buggy, it re-routes to localhost after loggin in (development env), it also lags on the first attempt in a long time to access the page (i think due to free hosting). if this occurs simply refresh till the page shows up, click the button (only button), which will take you to a fb login then login with test credentials. if you are routed to localhost then simply go to www.jswars.com manually (I will work on login UI more extensively after game is completed)

facebook test users. (there are two in since two players can play, you can also set the second player to "cp", which will allow you to start the game with a "computer player", but the computer player is not implimented yet, so it will not behave well)

Email: testy_abhaawg_mctesterson@tfbnw.net  
Password: testing321

Email: mrs_gyqpxjf_mctesterson@tfbnw.net  
Password: testing321

Gameplay:
========

The enter key selects a unit or building,

At this point only infantry and apc's can be built and are represented by blue and orange dots respectively. 

You can build units by pressing enter while the cursor hovers over your base (represented by a blue square).

The headquarters is a purple square

The escape key will escape out of any menu in the game. 

If pressed while no unit or building is selected "esc" will bring up the options menu, you may end your turn by selecting "end" from the options menu.

Units are selected by pressing enter while the cursor is over them. After  a unit is selected, moving the cursor to the desired location within the highlighted movement range then pressing enter will move the unit to that location.

The game is not yet fully animated, more units will be available as they are animated.
