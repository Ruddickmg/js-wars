/* --------------------------------------------------------------------------------------*\
    
    app.buildings is a list of each building and the inits they are capable of producing

\* --------------------------------------------------------------------------------------*/

app.buildings = {
    base:{
        infantry:app.units.infantry,
        mech:app.units.mech,
        recon:app.units.recon,
        apc:app.units.apc,
        antiAir:app.units.antiAir,
        tank:app.units.tank,
        midTank:app.units.midTank,
        artillery:app.units.artillery,
        missles:app.units.missles,
        rockets:app.units.infantry,
        neoTank:app.units.neoTank
    },
    airport: {
        tCopter:app.units.tCopter,
        bCopter:app.units.bCopter,
        fighter:app.units.fighter,
        bomber:app.units.bomber
    },
    seaport: {
        lander:app.units.lander,
        cruiser:app.units.cruiser,
        submerine:app.units.submerine,
        bShip:app.units.bShip
    }
};