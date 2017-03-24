# js-wars
Work in progress, a take on the Advance Wars game for Gameboy Avance, run on NodeJS, written in Javascript (logic), python (database access), CSS and Html (canvas for animations) using a postgresql database.

Lacal:
========

this repo is a bit behind, but you can see the game functioning @ http://www.jswars.com/

I haven't put allot of work into the login UI so it may be a bit buggy, it not re-routes to localhost after loggin in (development env), it also lags on the first attempt in a long time to access the page (i think do to free hosting). if this occurs simply refresh till the page shows up, click the button (only button), which will take you to a fb login then login with test credentials. if you are routed to localhost then simply go to www.jswars.com manually (I will work on login UI more extensively after game is completed)

login with facebook test users (there are two in since at least two players are required to play): 

Email: testy_abhaawg_mctesterson@tfbnw.net  
Password: testing321

Email: mrs_gyqpxjf_mctesterson@tfbnw.net  
Password: testing321

Gameplay:
========

The enter key selects a unit or building,

at this point only infantry can be built and are represented by blue dots, you can build infantry using the base which is represented by a blue square, the headquarters is a purple square

The escape key will escape out of any menu in the game and if pressed while no unit or building is selected it will bring up the options menu, you may end your turn by selecting end from the options menu

Units are moved by selecting them, moving the cursor to the desired location within the highlighted movement range and then pressing enter again

at least two players are needed to start a game, there is still some work to be done coordinating menu's etc, so game creation and joining may be buggy under certain circumstances

the game is not yet animated, more units will be available as they are become animated
