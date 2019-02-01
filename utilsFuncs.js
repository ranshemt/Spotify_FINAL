/** utilsFuncs.js
 * @ implementations of utilities functions
*/
//
//npm modules
const request       = require ('request')
const rp            = require ('request-promise')
//my modules
const myAppConsts   = require ('./app_consts')
const connection    = require ('./db')
const User          = require ('./user')
const asyncWrapper  = require ('./async.wrapper')


/** function
 *  @ gets user id
 *  @ query mongoose to find 'AT'
 *  @ returns new Promise:
 *  @ resolve   :   {access_token (string)}
 *  @ reject    :   {'property doesnt exist'} OR {err}
 */
async function get_AT(uid){
    return new Promise(async (resolve, reject) => {
        let f_name = 'get_AT()'
        //
        //getting user from DB
        console.log(`starting ${f_name}`)
        console.log(`   in ${f_name}> received partially id: ${uid.substr(0, 5)}`)
        var lookFor = {
            id : uid
        }
        User.find(lookFor).exec()
            .then((res) => {
                let r_relevant_JSON = JSON.parse(JSON.stringify(res[0]))
                if(r_relevant_JSON.hasOwnProperty('AT')){
                    return resolve(r_relevant_JSON.AT)
                } else{
                    return reject('the property you tried to reach doesnt exist')   
                }
            })
            .catch((err) => {
                return reject(err)
            })
    })
}
/** function
 *  @ gets user id
 *  @ query mongoose to find 'RT'
 *  @ returns new Promise:
 *  @ resolve   :   {refresh_token (string)}
 *  @ reject    :   {'property doesnt exist'} OR {err}
 */
async function get_RT(uid){
    return new Promise(async (resolve, reject) => {
        let f_name = 'get_RT()'
        //
        //getting user from DB
        console.log(`starting ${f_name}`)
        console.log(`   in ${f_name}> received partially id: ${uid.substr(0, 5)}`)
        var lookFor = {
            id : uid
        }
        User.find(lookFor).exec()
            .then((res) => {
                let r_relevant_JSON = JSON.parse(JSON.stringify(res[0]))
                if(r_relevant_JSON.hasOwnProperty('RT')){
                    return resolve(r_relevant_JSON.RT)
                } else{
                    return reject('the property you tried to reach doesnt exist')   
                }
            })
            .catch((err) => {
                return reject(err)
            })
    })
}
/** function
 *  @ gets user id
 *  @ returns new Promise:
 *  @ resolve   :   {status, message, access_token, previousResponse}
 *  @ reject    :   {status, message, previousResponse}
 */
async function get_newAT(uid){
    return new Promise(async (resolve, reject) => {
        let f_name = 'get_newAT()'
        let call1 = 'get_RT()'
        let call2= 'Spotify_API: POST /api/token'
        console.log(`starting ${f_name}`)
        console.log(`   in ${f_name}> received partially id: ${uid.substr(0, 5)}`)
        //get RT from DB        
        var RT = 'invalid_RT for user: ' + uid
        try{
            const resolve_get_RT = await get_RT(uid)
            RT = resolve_get_RT
            console.log(`   in ${f_name}> found partially userID: ${uid.substr(0, 5)} with partially RT: ${RT.substr(0, 10)}`)
            //
            //get new access token from Spotify API
            let options = {
                method: 'POST',
                uri: 'https://accounts.spotify.com/api/token',
                form: {
                    grant_type: 'refresh_token',
                    refresh_token: RT
                },
                headers: {
                    'Authorization' : 'Basic ' + (new Buffer.from(myAppConsts.client_id + ':' + myAppConsts.client_secret).toString('base64'))
                },
                json: true
            };
            //
            var access_token    = "some0_invalid_access_token"
            rp(options)
                .then(async (body) => {
                    access_token    = body.access_token
                    console.log(`   in ${f_name}> new partially AT= ${access_token.substr(0, 10)}`)
                    //save new AT in DB
                    User.updateOne({id: uid}, {$set: {AT: access_token}}).exec()
                        .then((res) => {
                            //console.log(`   in ${f_name}> res = ${JSON.stringify(res)}}`)
                            return resolve({
                                statusCode: 200,
                                message: `[${f_name} SUCCESS with message --success-- from: updateOne()]`,
                                access_token: body.access_token,
                                previousResponse: body
                            })
                        })
                        .catch((err) => {
                            //console.log(`   in ${f_name}> err with updateOne() = ${err}`)
                            return reject({
                                statusCode: 404,
                                message: `[${f_name} FAILED with message: --${err}-- from: updateOne()]`,
                                previousResponse: {r: '[no previousResponse]'}
                            })
                        })
                })
                .catch((err) => {
                    console.log(`   in ${f_name}> catch err}`)
                    let sc = err.hasOwnProperty('statusCode') ? err.statusCode : 500
                    let ms = err.hasOwnProperty('message'   ) ? err.message    : 'err: no message property'
                    return reject({
                        statusCode: sc,
                        message: `[${f_name} FAILED with message: --${ms}-- from: ${call2}]`,
                        previousResponse: err
                    })
                })
        }
        catch(reject_get_RT){
            return reject({
                statusCode: 404,
                message: `[${f_name} FAILED with message: --${reject_get_RT}-- from: ${call1}]`,
                previousResponse: {r: '[no previousResponse]'}
            })
        }
    })//new Promise
}
/** function
 *  @ gets user id
 *  @ query mongoose to update 'AT'
 *  @ returns new Promise
 *  @ resolve   :   {status, message, access_token, previousResponse}
 *  @ reject    :   {status, message, previousResponse}
 */
async function make_invalidAT(uid){
    let f_name = 'make_invalidAT()'
    let call1 = 'updateOne()'
    return new Promise(async (resolve, reject) => {
        var newAT = "invalid_AT_for_user__" + uid.substr(0, 5)
        //save new AT in DB
        User.updateOne({id: uid}, {$set: {AT: newAT}}).exec()
        .then((res) => {
            //console.log(`   in ${f_name}> res = ${JSON.stringify(res)}}`)
            return resolve({
                statusCode: 200,
                message: `[${f_name} SUCCESS with message --success-- from: ${call1}]`,
                access_token: newAT,
                previousResponse: res
            })
        })
        .catch((err) => {
            //console.log(`   in ${f_name}> err with updateOne() = ${err}`)
            return reject({
                statusCode: 404,
                message: `[${f_name} FAILED with message: --${err}-- from: ${call1}]`,
                previousResponse: err
            })
        })
    })
}
/** function
 *  @ gets user id & body object
 *  @ returns new Promise:
 *  @ resolve   :   {status, message, actualResponse, previousResponse}
 *  @ reject    :   {status, message, actualResponse, previousResponse}
 */
async function f_addHistory(uid, body){
    let f_name = 'f_addHistory()'
    let call1  = 'findOneAndUpdate()'
    console.log(`starting ${f_name}`)
    return new Promise(async (resolve, reject) => {
        //getting user from DB
        let r = {
            command: 0
        } 
        if(body.hasOwnProperty('command') == false){
            return reject({
                statusCode: 404,
                message: `[${f_name} FAILED with message: --no command sent in body-- from: ${f_name}]`,
                actualResponse: {is: false},
                previousResponse: 'no real response'
            })
        }
        r.command = body.command
        if(body.hasOwnProperty('desc'       )) r.desc       = body.desc
        if(body.hasOwnProperty('pl_1'       )) r.pl_1       = body.pl_1
        if(body.hasOwnProperty('pl_2'       )) r.pl_2       = body.pl_2
        if(body.hasOwnProperty('pl_new'     )) r.pl_new     = body.pl_new
        if(body.hasOwnProperty('uid_shares' )) r.uid_shares = body.uid_shares
        if(body.hasOwnProperty('art_id'     )) r.art_id     = body.art_id
        if(body.hasOwnProperty('art_name'   )) r.art_name   = body.art_name
        //
        User.findOneAndUpdate({id: uid}, {$push: {history: r}}).exec()
            .then((res) => {
                return resolve({
                    statusCode: 200,
                    message: `[${f_name} SUCCESS with message: --success-- from: ${f_name}]`,
                    actualResponse: {is: true, data: r},
                    previousResponse: res
                })
            })
            .catch((err) => {
                let sc = err.hasOwnProperty('statusCode') ? err.statusCode : 500
                let ms = err.hasOwnProperty('message'   ) ? err.message    : 'err: no message property'
                return reject({
                    statusCode: sc,
                    message: `[${f_name} FAILED with message: --${ms}-- from: ${call1}]`,
                    actualResponse: {is: false},
                    previousResponse: err
                })
            })
    })
}
//
/** function
 *  @ gets user AT
 *  @ Spotify call GET /me. to get logged in user data 
 *  @ returns new Promise:
 *  @ resolve   :   {status, message, previousResponse}
 *  @ reject    :   {status, message, previousResponse}
 */
async function SpotAPI_me(myAT){
    let f_name ='SpotAPI_me()'
    let call1 = 'Spotify_API GET /me'
    console.log(`starting ${f_name}`)
    console.log(`   in ${f_name}> received partially AT: ${myAT.substr(0, 10)}`)
    return new Promise(async (resolve, reject) =>{
        var options = {
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': 'Bearer ' + myAT },
            json: true
        }
        rp(options)
            .then((body) => {
                return resolve({
                    statusCode: 200,
                    message: `[${f_name} SUCCESS with message --success-- from: ${call1}]`,
                    previousResponse: body
                })
            })
            .catch((err) => {
                let sc = err.hasOwnProperty('statusCode') ? err.statusCode : 500
                let ms = err.hasOwnProperty('message'   ) ? err.message    : 'err: no message property'
                return reject({
                    statusCode: sc,
                    message: `[${f_name} FAILED with message: --${ms}-- from: ${call1}]`,
                    previousResponse: err
                })
            })
    })//new Promise
}
//
/** function
 *  @ gets art_id & AT
 *  @ Spotify API call to get artist's top tracks
 *  @ returns new Promise:
 *  @ success   :   {status, message, actualResponse, previousResponse}
 *  @ failure   :   {status, message, actualResponse, previousResponse}
 *  @ actualResponse {is: false} OR {is: true, data: what_you_want}
 */
async function f_artistTopTracks(art_id, myAT){
    let f_name = 'artistTopTracks()'
    call1= 'Spotify_API GET /artists/{art_id}/top-tracks'
    console.log(`starting ${f_name}`)
    console.log(`   in ${f_name}> received partially artistID: ${art_id.substr(0, 5)} with partially AT: ${myAT.substr(0, 10)}`)
    return new Promise(async (resolve, reject) => {
        //create call
        let api_url = 'https://api.spotify.com/v1/artists/' + art_id + '/top-tracks?country=IL'
        var options = {
            url: api_url,
            headers: { 'Authorization': 'Bearer ' + myAT },
            json: true
        }
        //make the call
        rp(options)
            .then((body) => {
                let r = {
                    tracks: []
                }
                let tracks_response = body.tracks
                tracks_response.forEach((currTrack) => {
                    r.tracks.push({
                        id: currTrack.id
                    })
                })
                return resolve({
                    statusCode: 200,
                    message: `[${f_name} SUCCESS with message --success-- from: ${call1}]`,
                    actualResponse: {is: true, data: r},
                    previousResponse: body
                })
            })
            .catch((err) => {
                let sc = err.hasOwnProperty('statusCode') ? err.statusCode : 500
                let ms = err.hasOwnProperty('message'   ) ? err.message    : 'err: no message property'
                let msg = `[${f_name} FAILED with message --${ms}-- from: ${call1}]`
                return reject({
                    statusCode: sc,
                    message: msg,
                    actualResponse: {is: false},
                    previousResponse: err
                })
            })
    })//
}
//
/** function
 *  @ gets id & {body} & AT
 *  @ Spotify API call to create new playlist
 *  @ returns new Promise:
 *  @ success   :   {status, message, actualResponse, previousResponse}
 *  @ failure   :   {status, message, actualResponse, previousResponse}
 *  @ actualResponse {is: false} OR {is: true, data: what_you_want}
 */
async function f_newPL(uid, bodyPost, myAT){
    let f_name = 'newPL()'
    let call1= 'Spotify_API POST /users/{user_id}/playlists'
    console.log(`starting ${f_name}`)
    console.log(`   in ${f_name}> received partially id: ${uid.substr(0, 5)} with partially AT: ${myAT.substr(0, 10)}`)
    return new Promise(async (resolve, reject) => {
        const name          = bodyPost.hasOwnProperty('name'         ) ? bodyPost.name          : "default name"
        const public        = bodyPost.hasOwnProperty('public'       ) ? bodyPost.public        : true
        const collaborative = bodyPost.hasOwnProperty('collaborative') ? bodyPost.collaborative : false
        const description   = bodyPost.hasOwnProperty('description'  ) ? bodyPost.description   : "some nice description"
        //create call
        let api_uri = 'https://api.spotify.com/v1/users/' + uid + '/playlists'
        var options = {
            method: 'POST',
            uri: api_uri,
            headers: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + myAT
            },
            body: {
                name: name,
                public: public,
                collaborative: collaborative,
                description: description
            },
            json: true
        }
        //make the call
        rp(options)
            .then((body) => {
                let r = {
                    id: 'error id',
                    name: 'error name'
                }
                r.id   = body.hasOwnProperty('id'  ) ? body.id   : 'no id for new playlist'
                r.name = body.hasOwnProperty('name') ? body.name : 'no name for new playlist'
                return resolve({
                    statusCode: 200,
                    message: `[${f_name} SUCCESS with message --success-- from: ${call1}]`,
                    actualResponse: {is: true, data: r},
                    previousResponse: body
                })
            })
            .catch((err) => {
                let sc = err.hasOwnProperty('statusCode') ? err.statusCode : 500
                let ms = err.hasOwnProperty('message'   ) ? err.message    : 'err: no message property'
                let msg = `[${f_name} FAILED with message --${ms}-- from: ${call1}]`
                return reject({
                    statusCode: sc,
                    message: msg,
                    actualResponse: {is: false},
                    previousResponse: err
                })
            })
    })//
}
//
/** function
 *  @ gets body id & pl_id & {body} & AT
 *  @ Spotify API call to add to playlist
 *  @ returns new Promise:
 *  @ success   :   {status, message, actualResponse, previousResponse}
 *  @ failure   :   {status, message, actualResponse, previousResponse}
 *  @ actualResponse {is: false} OR {is: true, data: what_you_want}
 */
async function f_addToPL(uid, pl_id, bodyPut, myAT){
    let f_name = 'addToPL()'
    let call1= 'Spotify_API POST /playlists/{pl_id}/tracks'
    console.log(`starting ${f_name}`)
    console.log(`   in ${f_name}> received id: ${uid.substr(0, 5)} with pl_id: ${pl_id.substr(0, 5)} and AT: ${myAT.substr(0, 10)}`)
    return new Promise(async (resolve, reject) => {
        //body data
        var default_track = ["spotify:track:1JLLDS0KN1ITeYL9ikHKIr"]
        const uris = bodyPut.hasOwnProperty('uris') ? bodyPut.uris : default_track
        //create call
        let api_uri = 'https://api.spotify.com/v1/playlists/' + pl_id + '/tracks'
        var options = {
            method: 'POST',
            uri: api_uri,
            headers: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + myAT
            },
            body: {
                uris: uris
            },
            json: true
        }
        //make the call
        rp(options)
            .then((body) => {
                let r = {
                    snap_id: 'error snap_id'
                }
                r.snap_id = body.hasOwnProperty('snapshot_id'  ) ? body.snapshot_id   : 'no snap_id for new playlist'
                return resolve({
                    statusCode: 200,
                    message: `[${f_name} SUCCESS with message --success-- from: ${call1}]`,
                    actualResponse: {is: true, data: r},
                    previousResponse: body
                })
            })
            .catch((err) => {
                let sc = err.hasOwnProperty('statusCode') ? err.statusCode : 500
                let ms = err.hasOwnProperty('message'   ) ? err.message    : 'err: no message property'
                let msg = `[${f_name} FAILED with message --${ms}-- from: ${call1}]`
                return reject({
                    statusCode: sc,
                    message: msg,
                    actualResponse: {is: false},
                    previousResponse: err
                })
            })
    })
}
async function f_getArtName(art_id, myAT){
    let f_name = 'getArtName()'
    let call1= 'Spotify_API GET /artists/{art_id}'
    console.log(`starting ${f_name}`)
    console.log(`   in ${f_name}> received art_id: ${art_id.substr(0, 5)}`)
    return new Promise(async (resolve, reject) => {
        //create call
        var options = {
            url: 'https://api.spotify.com/v1/artists/' + art_id,
            headers: { 'Authorization': 'Bearer ' + myAT },
            json: true
        }
        //make the call
        rp(options)
            .then((body) => {
                let r = {
                    name: 'err name'
                }
                if(body.hasOwnProperty('name') == true)
                    r.name = body.name
                return resolve({
                    statusCode: 200,
                    message: `[${f_name} SUCCESS with message --success-- from: ${call1}]`,
                    actualResponse: {is: true, data: r},
                    previousResponse: body
                })
            })
            .catch((err) => {
                let sc = err.hasOwnProperty('statusCode') ? err.statusCode : 500
                let ms = err.hasOwnProperty('message'   ) ? err.message    : 'err: no message property'
                let msg = `[${f_name} FAILED with message --${ms}-- from: ${call1}]`
                return reject({
                    statusCode: sc,
                    message: msg,
                    actualResponse: {is: false},
                    previousResponse: err
                })
            })
    })
}
//
/** function
 *  @ gets art_id
 *  @ Spotify API call to get its name
 *  @ returns new Promise:
 *  @ success   :   {status, message, actualResponse, previousResponse}
 *  @ failure   :   {status, message, actualResponse, previousResponse}
 *  @ actualResponse {is: false} OR {is: true, data: what_you_want}
 */
//
//
//
module.exports = {
    get_AT            : get_AT            ,
    get_RT            : get_RT            ,
    get_newAT         : get_newAT         ,
    make_invalidAT    : make_invalidAT    ,
    SpotAPI_me        : SpotAPI_me        ,
    f_addHistory      : f_addHistory      ,
    f_artistTopTracks : f_artistTopTracks ,
    f_newPL           : f_newPL           ,
    f_addToPL         : f_addToPL,
    f_getArtName: f_getArtName
}