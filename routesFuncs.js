/** apiFuncs.js
 * @ implementations of the functions calling to Spotify API
*/
//npm modules
const request       = require ('request')
const rp            = require ('request-promise')
//my modules
const myAppConsts   = require ('./app_consts')
const connection    = require ('./db')
const User          = require ('./user')
const asyncWrapper  = require ('./async.wrapper')
const funcs         = require ('./utilsFuncs')

/** function
 *  @ gets uid & AT
 *  @ Spotify API call to get user playlists
 *  @ returns new Promise:
 *  @ success   :   {status, message, actualResponse, previousResponse}
 *  @ failure   :   {status, message, actualResponse, previousResponse}
 *  @ actualResponse {is: false} OR {is: true, data: what_you_want}
 */
async function f_getPlaylists(uid, myAT){
    let f_name = 'getPlaylists()'
    call1= 'Spotify_API GET /users/{user_id}/playlists'
    console.log(`starting ${f_name}`)
    console.log(`   in ${f_name}> received partially id: ${uid.substr(0, 5)} with partially AT: ${myAT.substr(0, 10)}`)
    return new Promise(async (resolve, reject) => {
        //create call
        let url_api = 'https://api.spotify.com/v1/users/' + uid + '/playlists'
        var options = {
            url: url_api,
            headers: { 'Authorization': 'Bearer ' + myAT },
            json: true
        };
        //make the call
        rp(options)
            .then((body) => {
                let r = {
                    playlists: []
                }
                let items_response = body.items
                items_response.forEach((currItem) => {
                    let curr_id   = currItem.hasOwnProperty('id'  ) ? currItem.id   : 'no id for playlist'
                    let curr_name = currItem.hasOwnProperty('name') ? currItem.name : 'no name for playlist'
                    let curr_img  = '#'
                    if(currItem.hasOwnProperty('images') && currItem.images.length > 0)
                        curr_img = currItem.images[0].url
                    //add to r object
                    r.playlists.push({
                        id: curr_id,
                        name: curr_name,
                        img: curr_img
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
 *  @ gets pl_id & AT
 *  @ Spotify API call to get user tracks of playlist
 *  @ returns new Promise:
 *  @ success   :   {status, message, actualResponse, previousResponse}
 *  @ failure   :   {status, message, actualResponse, previousResponse}
 *  @ actualResponse {is: false} OR {is: true, data: what_you_want}
 */
//
async function f_getTracks(pl_id, myAT){
    let f_name = 'getTracks()'
    call1= 'Spotify_API GET /playlists/{pl_id}/tracks'
    console.log(`starting ${f_name}`)
    console.log(`   in ${f_name}> received partially pl_id: ${pl_id.substr(0, 5)} with partially AT: ${myAT.substr(0, 10)}`)
    return new Promise(async (resolve, reject) => {
        //create call
        let url_api = 'https://api.spotify.com/v1/playlists/' + pl_id + '/tracks'
        var options = {
            url: url_api,
            headers: { 'Authorization': 'Bearer ' + myAT },
            json: true
        }
        //make the call
        rp(options)
            .then((body) => {
                let r = {
                    tracks: []
                }
                let tracks_response = body.items
                tracks_response.forEach((currTrack) => {
                    let flagMsg = null
                    if((currTrack.hasOwnProperty('track')) == false)
                        flagMsg = 'no property track'
                    if(currTrack.hasOwnProperty('track') == true && (currTrack.track.hasOwnProperty('artists') == false))
                        flagMas = 'no property artists'
                    if(currTrack.hasOwnProperty('track') == true && currTrack.track.hasOwnProperty('artists') == true && currTrack.track.artists.length < 1)
                        flagMsg = 'no tracks in playlist'
                    if(flagMsg != null){
                        res.json({
                            statusCode: 404,
                            message: `[${f_name} FAILED with message --${flagMsg}-- from: ${call1}]`,
                            actualResponse: {is: false},
                            previousResponse: body
                        })
                    }
                    let artists_response = currTrack.track.artists
                    let artists = ''
                    artists_response.forEach((currArtist) => {
                        artists += currArtist.name + ', '
                    })
                    artists = artists.slice(0, artists.length-1-1)
                    let track_id   = currTrack.track.hasOwnProperty('id'  ) ? currTrack.track.id   : 'no id for track'
                    let track_name = currTrack.track.hasOwnProperty('name') ? currTrack.track.name : 'no name for playlist'
                    //add to r object
                    r.tracks.push({
                        id: track_id,
                        name: track_name,
                        artist: artists
                    })
                })//forEach track
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
 *  @ gets AT
 *  @ Spotify API call to get user top artists
 *  @ returns new Promise:
 *  @ success   :   {status, message, actualResponse, previousResponse}
 *  @ failure   :   {status, message, actualResponse, previousResponse}
 *  @ actualResponse {is: false} OR {is: true, data: what_you_want}
 */
async function f_getTopArtists(myAT){
    let f_name = 'getTopArtists()'
    call1= 'Spotify_API GET /me/top/artists'
    console.log(`starting ${f_name}`)
    console.log(`   in ${f_name}> received partially AT: ${myAT.substr(0, 10)}`)
    return new Promise(async (resolve, reject) => {
        //create call
        var options = {
            url: 'https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=5',
            headers: { 'Authorization': 'Bearer ' + myAT },
            json: true
        }
        //make the call
        rp(options)
            .then((body) => {
                let r = {
                    artists: []
                }
                let artists_response = body.items
                artists_response.forEach((currArtist) => {
                    let art_id     = currArtist.hasOwnProperty('id'  ) ? currArtist.id   : 'no id for artist'
                    let art_name   = currArtist.hasOwnProperty('name'  ) ? currArtist.name   : 'no name for artist'
                    let art_popu   = currArtist.hasOwnProperty('popularity'  ) ? currArtist.popularity   : 'no popularity for artist'
                    r.artists.push({
                        id: art_id,
                        name: art_name,
                        popu: art_popu
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
 *  @ gets uid
 *  @ Mongoose query to find user's history
 *  @ returns new Promise:
 *  @ success   :   {status, message, actualResponse, previousResponse}
 *  @ failure   :   {status, message, actualResponse, previousResponse}
 *  @ actualResponse {is: false} OR {is: true, data: what_you_want}
 */
async function f_getHistory(uid){
    let f_name = 'getHistory()'
    call1= 'find()'
    console.log(`starting ${f_name}`)
    console.log(`   in ${f_name}> received partially uid: ${uid.substr(0, 5)}`)
    return new Promise(async (resolve, reject) => {
        let lookFor = {
            'id' : uid
        }
        let r ={
            un: uid,
            len: -1,
            history : []
        }
        User.find(lookFor).exec()
            .then((r_find) => {
                let err_history = ['no history for user']
                let r_relevant_JSON = JSON.parse(JSON.stringify(r_find[0]))
                r.history  = r_relevant_JSON.hasOwnProperty('history') ? r_relevant_JSON.history : err_history
                r.len = r.history.length
                return resolve({
                    statusCode: 200,
                    message: `[${f_name} SUCCESS with message: --success-- from: ${call1}]`,
                    actualResponse: {is: true, data: r},
                    previousResponse: r_find
                })
            })
            .catch((err) => {
                let sc = err.hasOwnProperty('statusCode') ? err.statusCode : 999
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
 *  @ gets uid & art_id & AT
 *  @ Creating new playlist based on artist's top tracks
 *  @ returns new Promise:
 *  @ success   :   {status, message, actualResponse, previousResponse}
 *  @ failure   :   {status, message, actualResponse, previousResponse}
 *  @ actualResponse {is: false} OR {is: true, data: what_you_want}
 */
async function f_makePLbyArtist(uid, art_id, myAT){
    let f_name = 'makePLbyArtist()'
    let call1  = 'f_artistTopTracks'
    let call2  = 'f_getArtName()'
    let call3  = 'f_newPL()'
    let call4  = 'f_addToPL()'
    let call5  = 'f_addHistory()'
    console.log(`starting ${f_name}`)
    console.log(`   in ${f_name}> received partially uid: ${uid.substr(0, 5)} and art_id: ${art_id.substr(0, 5)}`)
    var artTopTracks = {
        uris: []
    }
    var artistName = null, newPL_ID = null, pl_name = null, newPL_len = null
    return new Promise(async (resolve, reject) => {
        //
        //get artist's top tracks
        try{
            const resolve_f_artistTopTracks = await funcs.f_artistTopTracks(art_id, myAT)
            let art_tracks = resolve_f_artistTopTracks.actualResponse.data.tracks
            art_tracks.forEach((currTrack) => {
                let curr_trackURI = 'spotify:track:' + currTrack.id
                artTopTracks.uris.push(curr_trackURI)
            })
        }
        catch (reject_f_artistTopTracks){
            let sc = reject_f_artistTopTracks.statusCode
            let ms = reject_f_artistTopTracks.message
            let msg = `[${f_name} FAILED with message ${ms} from ${call1}]`
            return reject({
                statusCode: sc,
                message: msg,
                actualResponse: reject_f_artistTopTracks.actualResponse,
                previousResponse: reject_f_artistTopTracks
            })
        }
        //
        //get artist's name
        try{
            const resolve_f_getArtName = await funcs.f_getArtName(art_id, myAT)
            artistName = resolve_f_getArtName.actualResponse.data.name
        }
        catch (reject_f_getArtName){
            let sc = reject_f_getArtName.statusCode
            let ms = reject_f_getArtName.message
            let msg = `[${f_name} FAILED with message ${ms} from ${call2}]`
            return reject({
                statusCode: sc,
                message: msg,
                actualResponse: reject_f_getArtName.actualResponse,
                previousResponse: reject_f_getArtName
            })
        }
        //
        //create new playlist
        newPL_len = artTopTracks.uris.length
        pl_name = 'Awesome PL of ' + artistName
        let pl_desc = `This awesome playlist based on ${artistName}'s top tracks with ${newPL_len} tracks was created by REST course spotify service`
        let body_newPL = {
            name: pl_name,
            description: pl_desc
        }
        try{
            const resolve_f_newPL = await funcs.f_newPL(uid, body_newPL, myAT)
            newPL_ID = resolve_f_newPL.actualResponse.data.id
        }
        catch (reject_f_newPL){
            let sc = reject_f_newPL.statusCode
            let ms = reject_f_newPL.message
            let msg = `[${f_name} FAILED with message ${ms} from ${call3}]`
            return reject({
                statusCode: sc,
                message: msg,
                actualResponse: reject_f_newPL.actualResponse,
                previousResponse: reject_f_newPL
            })
        }
        //
        //add uris to new playlist
        let body_addToPL = artTopTracks
        try {
            const resolve_f_addToPL = await funcs.f_addToPL(uid, newPL_ID, body_addToPL, myAT)
        }
        catch (reject_f_addToPL){
            let sc = reject_f_addToPL.statusCode
            let ms = reject_f_addToPL.message
            let msg = `[${f_name} FAILED with message ${ms} from ${call4}]`
            return reject({
                statusCode: sc,
                message: msg,
                actualResponse: reject_f_addToPL.actualResponse,
                previousResponse: reject_f_addToPL
            })
        }
        //
        //add command to history
        let body_addHistory = {
            command: 3,
            desc: `new playlist created: ${pl_name} with ${newPL_len} tracks based on: ${artistName}`,
            pl_1: newPL_ID,
            art_id: art_id,
            art_name: artistName
        }
        try {
            const resolve_f_addHistory = await funcs.f_addHistory(uid, body_addHistory)
            let resMsg = `[new playlist created: ${pl_name} with ${newPL_len} tracks based on: ${artistName}]`
            let R = {
                pl_id: newPL_ID,
                pl_name: pl_name,
                pl_art: artistName,
                pl_art_id: art_id,
                pl_length: newPL_len,
                historyCommand: 3
            }
            return resolve({
                statusCode: 200,
                message: `[${f_name} SUCCESS with message --${resMsg}-- from: ${call5}]`,
                actualResponse: {is: true, data: R},
                previousResponse: resolve_f_addHistory
            })
        }
        catch (reject_f_addHistory){
            let sc = reject_f_addHistory.statusCode
            let ms = reject_f_addHistory.message
            let msg = `[${f_name} FAILED with message ${ms} from ${call5} BUT playlist created. SUCCESS from ${call4}]`
            return reject({
                statusCode: sc,
                message: msg,
                actualResponse: reject_f_addHistory.actualResponse,
                previousResponse: reject_f_addHistory
            })
        }
    })
}
//
/** function
 *  @ gets uid & pl1_id & pl2_id & AT
 *  @ Creating new playlist based on artist's top tracks
 *  @ returns new Promise:
 *  @ success   :   {status, message, actualResponse, previousResponse}
 *  @ failure   :   {status, message, actualResponse, previousResponse}
 *  @ actualResponse {is: false} OR {is: true, data: what_you_want}
 */
async function f_makePLbyArtist(uid, pl1_id, pl2_id, myAT){
    //
    //f_getTracks(pl1_id, myAT)
    //f_getTracks(pl2_id, myAT)
    //body_newPL = newPL_name, newPL_desc
    //f_newPL(uid, body_newPL, myAT)
    //add to pl
    //add to history
}
//
//
//
module.exports = {
    f_getPlaylists  : f_getPlaylists  ,
    f_getTracks     : f_getTracks     ,
    f_getTopArtists : f_getTopArtists ,
    f_getHistory    : f_getHistory    ,
    f_makePLbyArtist: f_makePLbyArtist
}