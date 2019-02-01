//npm modules
const express       =   require ('express')
//my modules
const ctrl          =   require ('./controller')
const utilsCtrl     =   require ('./utilsController')
const asyncWrapper  =   require ('./async.wrapper')

//Establish app()
const app   =   express()
const port  =   process.env.PORT || 3000

//Middleware(s)
app.use(express.json())
app.use(express.urlencoded({extended: true}))


//Routes - Actual (View)
app.get ('/welcomeMsg/:id'              , asyncWrapper(ctrl.welcomeMsg      ))
app.get ('/getPlaylists/:id'            , asyncWrapper(ctrl.getPlaylists    ))
app.get ('/getTracks/:id&:pl_id'        , asyncWrapper(ctrl.getTracks)       )
app.get ('/getTopArtists/:id'           , asyncWrapper(ctrl.getTopArtists   ))
app.get ('/getHistory/:id'              , asyncWrapper(ctrl.getHistory      ))
//Routes - Actual (Functionality)
app.get  ('/makePLbyArtist/:id&:art_id' , asyncWrapper(ctrl.makePLbyArtist   ))
app.post ('/mergeMyPlaylists/:id'       , asyncWrapper(ctrl.mergeMyPlaylists ))
//
//Routes - Utilities / Debug
app.get ('/basicData/:id'               , asyncWrapper(utilsCtrl.basicData       ))
app.get ('/newAT/:id'                   , asyncWrapper(utilsCtrl.newAT           ))
app.get ('/invalidAT/:id'               , asyncWrapper(utilsCtrl.invalidAT       ))
app.get ('/artistTopTracks/:id&:art_id' , asyncWrapper(utilsCtrl.artistTopTracks ))
app.post('/newPL/:id'                   , asyncWrapper(utilsCtrl.newPL           ))
app.put ('/addToPL/:id&:pl_id'          , asyncWrapper(utilsCtrl.addToPL         ))
app.put ('/addHistory/:id'              , asyncWrapper(utilsCtrl.addHistory      ))


//Run the server
app.listen(port,
    () => console.log(`Express server ready on port: ${port}`))