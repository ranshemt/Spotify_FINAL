/** controller.js
 * @ implementations actual routes for the project
*/
//
//my modules
const connection    = require ('./db')
const User          = require ('./user')
const funcs = require ('./routesFuncs')
const uFuncs = require ('./utilsFuncs')
//
//
/** GET /welcomeMsg/id
 *  @ gets user id from querystring
 *  @ returns res.json():
 *  @ success   :   {status, message, actualResponse, previousResponse}
 *  @ failure   :   {status, message, actualResponse, previousResponse}
 *  @ actualRespone {is: false} OR {is: true, data: what_you_want}
 */
var welcomeMsg = async function(req, res, next){
    let f_name = '/GET welcomeMsg', call1 = 'find()'
    console.log(`starting ${f_name}`)
    const {id = null} = req.params
    //
    //getting user from DB
    let lookFor = {
        'id' : id
    }
    let r = {
        un: 'error name',
        img: '#'
    } 
    User.find(lookFor).exec()
        .then((r_find) => {
            let r_relevant_JSON = JSON.parse(JSON.stringify(r_find[0]))
            r.un  = r_relevant_JSON.hasOwnProperty('name') ? r_relevant_JSON.name : 'no name for user'
            r.img = r_relevant_JSON.hasOwnProperty('img' ) ? r_relevant_JSON.img  : '#'
            res.status(200).json({
                statusCode: 200,
                message: `[${f_name} SUCCESS with message: --success-- from: ${call1}]`,
                actualResponse: {is: true, data: r},
                previousResponse: r_find
            })
        })
        .catch((err) => {
            let sc = err.hasOwnProperty('statusCode') ? err.statusCode : 500
            let ms = err.hasOwnProperty('message'   ) ? err.message    : 'err: no message property'
            res.status(sc).json({
                statusCode: sc,
                message: `[${f_name} FAILED with message: --${ms}-- from: ${call1}]`,
                actualResponse: {is: false},
                previousResponse: err
            })
        })
}
//
/** GET /getPlaylists/id
 *  @ gets user id from querystring
 *  @ returns res.json():
 *  @ success   :   {status, message, actualResponse, previousResponse}
 *  @ failure   :   {status, message, actualResponse, previousResponse}
 *  @ actualResponse {is: false} OR {is: true, data: what_you_want}
 */
var getPlaylists = async function(req, res, next){
    let f_name = '/GET getPlaylists'
    let call1  = 'getAT()'
    let call2  = 'f_getPlaylists()'
    let call3  = 'get_newAT()'
    console.log(`starting ${f_name}`)
    const {id = null} = req.params
    console.log(`   in ${f_name}> received partially id: ${id.substr(0, 5)}`)
    //
    //get AT from DB using our function
    var AT = 'invalid_AT for user: ' + id
    try {
        const resolve_get_AT = await uFuncs.get_AT(id)
        AT = resolve_get_AT
        console.log(`   in ${f_name}> found partially userID: ${id.substr(0, 5)} with partially AT: ${AT.substr(0, 10)}`)
    }
    catch (reject_get_AT) {
        let sc = reject_get_AT.hasOwnProperty('statusCode') ? reject_get_AT.statusCode : 500
        let ms = reject_get_AT.hasOwnProperty('message'   ) ? reject_get_AT.message    : 'err: no message property'
        let msg = `[${f_name} FAILED with message: --${ms}-- from: ${call1}]`
        return res.status(sc).json({
            statusCode  : sc,
            message     : msg,
            actualResponse: {is: false},
            previousResponse: reject_get_AT
        })
    }
    //
    //call to Spotify API using our function
    try {
        const resolve_f_getPlaylists = await funcs.f_getPlaylists(id, AT)
        let ms = resolve_f_getPlaylists.message
        let msg = `[${f_name} SUCCESS with message --${ms}-- from: ${call2}]`
        return res.status(200).json({
            statusCode: 200,
            message: msg,
            actualResponse: resolve_f_getPlaylists.actualResponse,
            previousResponse: resolve_f_getPlaylists
        })
    }
    catch (reject_f_getPlaylists) {
        let sc = reject_f_getPlaylists.statusCode
        if(sc != 401){
            let ms = reject_f_getPlaylists.message
            let msg = `[${f_name} FAILED with message ${ms} from ${call2}]`
            return res.status(sc).json({
                statusCode: sc,
                message: msg,
                actualResponse: reject_f_getPlaylists.actualResponse,
                previousResponse: reject_f_getPlaylists
            })
        }
    }
    //
    //need to get new AT
    try {
        const resolve_get_newAT = await uFuncs.get_newAT(id)
        AT = resolve_get_newAT.access_token
    }
    catch (reject_get_newAT) {
        let sc = reject_get_newAT.statusCode
        let ms = reject_get_newAT.message
        let msg = `[${f_name} FAILED with message ${ms} from ${call3}]`
        return res.status(sc).json({
            statusCode: sc,
            message: msg,
            actualResponse: {is: false},
            previousResponse: reject_get_newAT
        })
    }
    //
    //call again
    try {
        const resolve_f_getPlaylists2 = await funcs.f_getPlaylists(id, AT)
        let ms = resolve_f_getPlaylists2.message
        let msg = `[${f_name} SUCCESS with message --${ms}-- from: ${call2}]`
        return res.status(200).json({
            statusCode: 200,
            message: msg,
            actualResponse: resolve_f_getPlaylists2.actualResponse,
            previousResponse: resolve_f_getPlaylists2
        })
    }
    catch (reject_f_getPlaylists2) {
        let sc = reject_f_getPlaylists2.statusCode
        let ms = reject_f_getPlaylists2.message
        let msg = `[${f_name} FAILED with message ${ms} from ${call2}]`
        return res.status(sc).json({
            statusCode: sc,
            message: msg,
            actualResponse: reject_f_getPlaylists2.actualResponse,
            previousResponse: reject_f_getPlaylists2
        })
    }
}
//
/** GET /getTracks/id&pl_id
 *  @ gets user id & pl_id from querystring
 *  @ returns res.json():
 *  @ success   :   {status, message, actualResponse, previousResponse}
 *  @ failure   :   {status, message, actualResponse, previousResponse}
 *  @ actualResponse {is: false} OR {is: true, data: what_you_want}
 */
var getTracks= async function (req, res, next){
    let f_name = '/GET getTracks'
    let call1  = 'getAT()'
    let call2  = 'f_getTracks()'
    let call3  = 'get_newAT()'
    console.log(`starting ${f_name}`)
    const {id = null} = req.params
    const {pl_id = null} = req.params
    console.log(`   in ${f_name}> received partially id: ${id.substr(0, 5)} with partially pl_id: ${pl_id.substr(0, 5)}`)
    //
    //get AT from DB using our function
    var AT = 'invalid_AT for user: ' + id
    try {
        const resolve_get_AT = await uFuncs.get_AT(id)
        AT = resolve_get_AT
        console.log(`   in ${f_name}> found partially userID: ${id.substr(0, 5)} with partially AT: ${AT.substr(0, 10)}`)
    }
    catch (reject_get_AT) {
        let sc = reject_get_AT.hasOwnProperty('statusCode') ? reject_get_AT.statusCode : 500
        let ms = reject_get_AT.hasOwnProperty('message'   ) ? reject_get_AT.message    : 'err: no message property'
        let msg = `[${f_name} FAILED with message: --${ms}-- from: ${call1}]`
        return res.status(sc).json({
            statusCode  : sc,
            message     : msg,
            actualResponse: {is: false},
            previousResponse: reject_get_AT
        })
    }
    //
    //call to Spotify API using our function
    try {
        const resolve_f_getTracks = await funcs.f_getTracks(pl_id, AT)
        let ms = resolve_f_getTracks.message
        let msg = `[${f_name} SUCCESS with message --${ms}-- from: ${call2}]`
        return res.status(200).json({
            statusCode: 200,
            message: msg,
            actualResponse: resolve_f_getTracks.actualResponse,
            previousResponse: resolve_f_getTracks
        })
    }
    catch (reject_f_getTracks) {
        let sc = reject_f_getTracks.statusCode
        if(sc != 401){
            let ms = reject_f_getTracks.message
            let msg = `[${f_name} FAILED with message ${ms} from ${call2}]`
            return res.status(sc).json({
                statusCode: sc,
                message: msg,
                actualResponse: reject_f_getTracks.actualResponse,
                previousResponse: reject_f_getTracks
            })
        }
    }
    //
    //need to get new AT
    try {
        const resolve_get_newAT = await uFuncs.get_newAT(id)
        AT = resolve_get_newAT.access_token
    }
    catch (reject_get_newAT) {
        let sc = reject_get_newAT.statusCode
        let ms = reject_get_newAT.message
        let msg = `[${f_name} FAILED with message ${ms} from ${call3}]`
        return res.status(sc).json({
            statusCode: sc,
            message: msg,
            actualResponse: {is: false},
            previousResponse: reject_get_newAT
        })
    }
    //
    //call again
    try {
        const resolve_f_getTracks2 = await funcs.f_getTracks(pl_id, AT)
        let ms = resolve_f_getTracks2.message
        let msg = `[${f_name} SUCCESS with message --${ms}-- from: ${call2}]`
        return res.status(200).json({
            statusCode: 200,
            message: msg,
            actualResponse: resolve_f_getTracks2.actualResponse,
            previousResponse: resolve_f_getTracks2
        })
    }
    catch (reject_f_getTracks2) {
        let sc = reject_f_getTracks2.statusCode
        let ms = reject_f_getTracks2.message
        let msg = `[${f_name} FAILED with message ${ms} from ${call2}]`
        return res.status(sc).json({
            statusCode: sc,
            message: msg,
            actualResponse: reject_f_getTracks2.actualResponse,
            previousResponse: reject_f_getTracks2
        })
    }
}
//
/** GET /getTopArtists/id
 *  @ gets user id from querystring
 *  @ returns res.json():
 *  @ success   :   {status, message, actualResponse, previousResponse}
 *  @ failure   :   {status, message, actualResponse, previousResponse}
 *  @ actualResponse {is: false} OR {is: true, data: what_you_want}
 */
var getTopArtists = async function (req, res, next){
    let f_name = '/GET getTopArtists'
    let call1  = 'getAT()'
    let call2  = 'f_getTopArtists()'
    let call3  = 'get_newAT()'
    console.log(`starting ${f_name}`)
    const {id = null} = req.params
    //
    //get AT from DB using our function
    var AT = 'invalid_AT for user: ' + id
    try {
        const resolve_get_AT = await uFuncs.get_AT(id)
        AT = resolve_get_AT
        console.log(`   in ${f_name}> found partially userID: ${id.substr(0, 5)} with partially AT: ${AT.substr(0, 10)}`)
    }
    catch (reject_get_AT) {
        let sc = reject_get_AT.hasOwnProperty('statusCode') ? reject_get_AT.statusCode : 500
        let ms = reject_get_AT.hasOwnProperty('message'   ) ? reject_get_AT.message    : 'err: no message property'
        let msg = `[${f_name} FAILED with message: --${ms}-- from: ${call1}]`
        return res.status(sc).json({
            statusCode  : sc,
            message     : msg,
            actualResponse: {is: false},
            previousResponse: reject_get_AT
        })
    }
    //
    //call to Spotify API using our function
    try {
        const resolve_f_getTopArtists = await funcs.f_getTopArtists(AT)
        let ms = resolve_f_getTopArtists.message
        let msg = `[${f_name} SUCCESS with message --${ms}-- from: ${call2}]`
        return res.status(200).json({
            statusCode: 200,
            message: msg,
            actualResponse: resolve_f_getTopArtists.actualResponse,
            previousResponse: resolve_f_getTopArtists
        })
    }
    catch (reject_f_getTopArtists) {
        let sc = reject_f_getTopArtists.statusCode
        if(sc != 401){
            let ms = reject_f_getTopArtists.message
            let msg = `[${f_name} FAILED with message ${ms} from ${call2}]`
            return res.status(sc).json({
                statusCode: sc,
                message: msg,
                actualResponse: reject_f_getTopArtists.actualResponse,
                previousResponse: reject_f_getTopArtists
            })
        }
    }
    //
    //need to get new AT
    try {
        const resolve_get_newAT = await uFuncs.get_newAT(id)
        AT = resolve_get_newAT.access_token
    }
    catch (reject_get_newAT) {
        let sc = reject_get_newAT.statusCode
        let ms = reject_get_newAT.message
        let msg = `[${f_name} FAILED with message ${ms} from ${call3}]`
        return res.status(sc).json({
            statusCode: sc,
            message: msg,
            actualResponse: {is: false},
            previousResponse: reject_get_newAT
        })
    }
    //
    //call again
    try {
        const resolve_f_getTopArtists2 = await funcs.f_getTopArtists(AT)
        let ms = resolve_f_getTopArtists2.message
        let msg = `[${f_name} SUCCESS with message --${ms}-- from: ${call2}]`
        return res.status(200).json({
            statusCode: 200,
            message: msg,
            actualResponse: resolve_f_getTopArtists2.actualResponse,
            previousResponse: resolve_f_getTopArtists2
        })
    }
    catch (reject_f_getTopArtists2) {
        let sc = reject_f_getTopArtists2.statusCode
        let ms = reject_f_getTopArtists2.message
        let msg = `[${f_name} FAILED with message ${ms} from ${call2}]`
        return res.status(sc).json({
            statusCode: sc,
            message: msg,
            actualResponse: reject_f_getTopArtists2.actualResponse,
            previousResponse: reject_f_getTopArtists2
        })
    }
}
//
/** GET /getHistory/id
 *  @ gets user id from querystring
 *  @ returns res.json():
 *  @ success   :   {status, message, actualResponse, previousResponse}
 *  @ failure   :   {status, message, actualResponse, previousResponse}
 *  @ actualResponse {is: false} OR {is: true, data: what_you_want}
 */
var getHistory = async function (req, res, next){
    let f_name = '/GET getHistory'
    let call1  = 'f_getHistory()'
    console.log(`starting ${f_name}`)
    const {id = null} = req.params
    try {
        const resolve_f_getHistory = await funcs.f_getHistory(id)
        let ms = resolve_f_getHistory.message
        let msg = `[${f_name} SUCCESS with message --${ms}-- from: ${call1}]`
        return res.status(200).json({
            statusCode: 200,
            message: msg,
            actualResponse: resolve_f_getHistory.actualResponse,
            previousResponse: resolve_f_getHistory
        })
    }
    catch (reject_f_getHistory) {
        let sc = reject_f_getHistory.statusCode
        let ms = reject_f_getHistory.message
        let msg = `[${f_name} FAILED with message ${ms} from ${call1}]`
        return res.status(sc).json({
            statusCode: sc,
            message: msg,
            actualResponse: reject_f_getHistory.actualResponse,
            previousResponse: reject_f_getHistory
        })
    }
}
//
/** GET /makePLbyArtist/id&art_id
 *  @ gets user id & art_id from querystring
 *  @ returns res.json():
 *  @ success   :   {status, message, actualResponse, previousResponse}
 *  @ failure   :   {status, message, actualResponse, previousResponse}
 *  @ actualResponse {is: false} OR {is: true, data: what_you_want}
 */
var makePLbyArtist = async function (req, res, next){
    let f_name = '/GET makePLbyArtist'
    let call1  = 'getAT()'
    let call2  = 'f_makePLbyArtist()'
    let call3  = 'get_newAT()'
    console.log(`starting ${f_name}`)
    const {id = null} = req.params
    const {art_id = null} = req.params
    //
    //get AT from DB using our function
    var AT = 'invalid_AT for user: ' + id
    try {
        const resolve_get_AT = await uFuncs.get_AT(id)
        AT = resolve_get_AT
        console.log(`   in ${f_name}> found partially userID: ${id.substr(0, 5)} with partially AT: ${AT.substr(0, 10)}`)
    }
    catch (reject_get_AT) {
        let sc = reject_get_AT.hasOwnProperty('statusCode') ? reject_get_AT.statusCode : 500
        let ms = reject_get_AT.hasOwnProperty('message'   ) ? reject_get_AT.message    : 'err: no message property'
        let msg = `[${f_name} FAILED with message: --${ms}-- from: ${call1}]`
        return res.status(sc).json({
            statusCode  : sc,
            message     : msg,
            actualResponse: {is: false},
            previousResponse: reject_get_AT
        })
    }
    //
    //create new playlist for this artist
    try {
        const resolve_f_makePLbyArtist = await funcs.f_makePLbyArtist(id, art_id, AT)
        let ms = resolve_f_makePLbyArtist.message
        let msg = `[${f_name} SUCCESS with message --${ms}-- from: ${call2}]`
        return res.status(200).json({
            statusCode: 200,
            message: msg,
            actualResponse: resolve_f_makePLbyArtist.actualResponse,
            previousResponse: resolve_f_makePLbyArtist
        })
    }
    catch (reject_f_getTopArtists) {
        let sc = reject_f_getTopArtists.statusCode
        if(sc != 401){
            let ms = reject_f_getTopArtists.message
            let msg = `[${f_name} FAILED with message ${ms} from ${call2}]`
            return res.status(sc).json({
                statusCode: sc,
                message: msg,
                actualResponse: reject_f_getTopArtists.actualResponse,
                previousResponse: reject_f_getTopArtists
            })
        }
    }
    //
    //need to get new AT
    try {
        const resolve_get_newAT = await uFuncs.get_newAT(id)
        AT = resolve_get_newAT.access_token
    }
    catch (reject_get_newAT) {
        let sc = reject_get_newAT.statusCode
        let ms = reject_get_newAT.message
        let msg = `[${f_name} FAILED with message ${ms} from ${call3}]`
        return res.status(sc).json({
            statusCode: sc,
            message: msg,
            actualResponse: {is: false},
            previousResponse: reject_get_newAT
        })
    }
    //
    //try to playlist create again
    try {
        const resolve_f_makePLbyArtist2 = await funcs.f_makePLbyArtist(id, art_id, AT)
        let ms = resolve_f_makePLbyArtist2.message
        let msg = `[${f_name} SUCCESS with message --${ms}-- from: ${call2}]`
        return res.status(200).json({
            statusCode: 200,
            message: msg,
            actualResponse: resolve_f_makePLbyArtist2.actualResponse,
            previousResponse: resolve_f_makePLbyArtist2
        })
    }
    catch (reject_f_getTopArtists2) {
        let sc = reject_f_getTopArtists2.statusCode
        if(sc != 401){
            let ms = reject_f_getTopArtists2.message
            let msg = `[${f_name} FAILED with message ${ms} from ${call2}]`
            return res.status(sc).json({
                statusCode: sc,
                message: msg,
                actualResponse: reject_f_getTopArtists2.actualResponse,
                previousResponse: reject_f_getTopArtists2
            })
        }
    }
}
//
/** POST /mergeMyPlaylists/id
 *  @ gets user id from querystring
 *  @ gets {body}: pl1_id, pl2_id, pl1_name, pl2_name
 *  @ returns res.json():
 *  @ success   :   {status, message, actualResponse, previousResponse}
 *  @ failure   :   {status, message, actualResponse, previousResponse}
 *  @ actualResponse {is: false} OR {is: true, data: what_you_want}
 */
var mergeMyPlaylists = async function (req, res, next){
    let f_name = '/POST mergeMyPlaylists'
    let call1  = 'getAT()'
    let call2  = 'f_mergeMyPlaylists()'
    let call3  = 'get_newAT()'
    console.log(`starting ${f_name}`)
    const {id = null} = req.params
    var body = null
    body = req.body
    console.log(`   in ${f_name}> received partially id: ${id.substr(0, 5)}`)
    //
    //get AT from DB using our function
    var AT = 'invalid_AT for user: ' + id
    try {
        const resolve_get_AT = await uFuncs.get_AT(id)
        AT = resolve_get_AT
        console.log(`   in ${f_name}> found partially userID: ${id.substr(0, 5)} with partially AT: ${AT.substr(0, 10)}`)
    }
    catch (reject_get_AT) {
        let sc = reject_get_AT.hasOwnProperty('statusCode') ? reject_get_AT.statusCode : 500
        let ms = reject_get_AT.hasOwnProperty('message'   ) ? reject_get_AT.message    : 'err: no message property'
        let msg = `[${f_name} FAILED with message: --${ms}-- from: ${call1}]`
        return res.status(sc).json({
            statusCode  : sc,
            message     : msg,
            actualResponse: {is: false},
            previousResponse: reject_get_AT
        })
    }
    //
    //call to Spotify API using our function
    try {
        const resolve_f_mergeMyPlaylists = await funcs.f_mergeMyPlaylists(id, body, AT)
        let ms = resolve_f_mergeMyPlaylists.message
        let msg = `[${f_name} SUCCESS with message --${ms}-- from: ${call2}]`
        return res.status(200).json({
            statusCode: 200,
            message: msg,
            actualResponse: resolve_f_mergeMyPlaylists.actualResponse,
            previousResponse: resolve_f_mergeMyPlaylists
        })
    }
    catch (reject_f_mergeMyPlaylists) {
        let sc = reject_f_mergeMyPlaylists.statusCode
        if(sc != 401){
            let ms = reject_f_mergeMyPlaylists.message
            let msg = `[${f_name} FAILED with message ${ms} from ${call2}]`
            return res.status(sc).json({
                statusCode: sc,
                message: msg,
                actualResponse: reject_f_mergeMyPlaylists.actualResponse,
                previousResponse: reject_f_mergeMyPlaylists
            })
        }
    }
    //
    //need to get new AT
    try {
        const resolve_get_newAT = await uFuncs.get_newAT(id)
        AT = resolve_get_newAT.access_token
    }
    catch (reject_get_newAT) {
        let sc = reject_get_newAT.statusCode
        let ms = reject_get_newAT.message
        let msg = `[${f_name} FAILED with message ${ms} from ${call3}]`
        return res.status(sc).json({
            statusCode: sc,
            message: msg,
            actualResponse: {is: false},
            previousResponse: reject_get_newAT
        })
    }
    //
    //call again
    try {
        const resolve_f_mergeMyPlaylists2 = await funcs.f_mergeMyPlaylists(id, body, AT)
        let ms = resolve_f_mergeMyPlaylists2.message
        let msg = `[${f_name} SUCCESS with message --${ms}-- from: ${call2}]`
        return res.status(200).json({
            statusCode: 200,
            message: msg,
            actualResponse: resolve_f_mergeMyPlaylists2.actualResponse,
            previousResponse: resolve_f_mergeMyPlaylists2
        })
    }
    catch (reject_f_mergeMyPlaylists2) {
        let sc = reject_f_mergeMyPlaylists2.statusCode
        let ms = reject_f_mergeMyPlaylists2.message
        let msg = `[${f_name} FAILED with message ${ms} from ${call2}]`
        return res.status(sc).json({
            statusCode: sc,
            message: msg,
            actualResponse: reject_f_mergeMyPlaylists2.actualResponse,
            previousResponse: reject_f_mergeMyPlaylists2
        })
    }
}
//
//
//
module.exports = {
    welcomeMsg: welcomeMsg,
    getPlaylists: getPlaylists,
    getTracks: getTracks,
    getTopArtists: getTopArtists,
    getHistory : getHistory,
    makePLbyArtist: makePLbyArtist,
    mergeMyPlaylists: mergeMyPlaylists
}