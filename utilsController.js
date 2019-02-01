/** utilsFuncs.js
 * @ implementations of utilities routs
*/
//
//my modules
const uFuncs = require ('./utilsFuncs')
//
//
/** GET /invalidAT/id
 *  @ gets user id from querystring
 *  @ returns res.json():
 *  @ success   :   {status, message, previousResponse}
 *  @ failure   :   {status, message, previousResponse}
 */
var invalidAT = async function(req, res, next){
    let f_name = 'GET invalidAT/id'
    let call1  = 'make_invalidAT()'
    console.log(`starting ${f_name}`)
    const {id = null} = req.params
    console.log(`   in ${f_name}> received partially id: ${id.substr(0, 5)}`)
    //
    //get invalid AT using our function
    try{
        const resolve_make_invalidAT = await uFuncs.make_invalidAT(id)
        console.log(`   in ${f_name}> new_AT is: ${resolve_make_invalidAT.access_token}`)
        let msg = `[${f_name} SUCCESS with message --${resolve_make_invalidAT.message}-- from: ${call1}]`
        //return
        return res.status(200).json({
            statusCode   : 200                                ,
            message      : msg                                ,
            access_token : resolve_make_invalidAT.access_token,
            previousResponse : resolve_make_invalidAT
        })
    }
    catch(reject_make_invalidAT){
        let msg = `[${f_name} FAILED with message: --${reject_make_invalidAT.message}-- from: ${call1}]`
        let sc = reject_make_invalidAT.statusCode
        //return
        return res.status(sc).json({
            statusCode  : sc                    ,
            message     : msg                   ,
            previousResponse: reject_make_invalidAT
        })
    }
}
//
/** GET /newAT/id
 *  @ gets user id from querystring
 *  @ returns res.json():
 *  @ success   :   {status, message, previousResponse}
 *  @ failure   :   {status, message, previousResponse}
 */
var newAT = async function(req, res, next){
    let f_name = '/GET newAT'
    let call1 = 'get_newAT()'
    console.log(`starting ${f_name}`)
    const {id = null} = req.params
    console.log(`   in ${f_name}> received partially id: ${id.substr(0, 5)}`)
    //
    //get new AT using our function
    try {
        const resolve_get_newAT = await uFuncs.get_newAT(id)
        console.log(`   in ${f_name}> partially new_AT is: ${resolve_get_newAT.access_token.substr(0, 10)}`)
        //
        let msg = `[${f_name} SUCCESS with message --${resolve_get_newAT.message}-- from: ${call1}]`
        return res.status(200).json({
            statusCode: 200                 ,
            message: msg                    ,
            previousResponse: resolve_get_newAT
        })
    }
    catch(reject_get_newAT){
        let sc = reject_get_newAT.statusCode
        let msg = `[${f_name} FAILED with message: --${reject_get_newAT.message}-- from: ${call1}]`
        return res.status(sc).json({
            statusCode  : reject_get_newAT.statusCode,
            message     : msg                        ,
            previousResponse: reject_get_newAT
        })
    }
}
//
/** GET /basicData/id
 *  @ gets user id from querystring
 *  @ returns res.json():
 *  @ success   :   {status, message, previousResponse}
 *  @ failure   :   {status, message, previousResponse}
 */
var basicData = async function(req, res, next){
    let f_name = '/GET basicData'
    let call1  = 'getAT()'
    let call2  = 'SpotAPI_me()'
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
            previousResponse: reject_get_AT
        })
    }
    //
    //call to Spotify API using our function
    try {
        const resolve_Spot_API_me = await uFuncs.SpotAPI_me(AT)
        let ms = resolve_Spot_API_me.message
        let msg = `[${f_name} SUCCESS with message --${ms}-- from: ${call2}]`
        return res.status(200).json({
            statusCode: 200,
            message: msg,
            previousResponse: resolve_Spot_API_me
        })
    }
    catch (reject_Spot_API_me) {
        let sc = reject_Spot_API_me.statusCode
        if(sc != 401){
            let ms = reject_Spot_API_me.message
            let msg = `[${f_name} FAILED with message ${ms} from ${call2}]`
            return res.status(sc).json({
                statusCode: sc,
                message: msg,
                previousResponse: reject_Spot_API_me
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
            previousResponse: reject_get_newAT
        })
    }
    //
    //call again
    try {
        const resolve_Spot_API_me2 = await uFuncs.SpotAPI_me(AT)
        let ms = resolve_Spot_API_me2.message
        let msg = `[${f_name} SUCCESS with message --${ms}-- from: ${call2}]`
        return res.status(200).json({
            statusCode: 200,
            message: msg,
            previousResponse: resolve_Spot_API_me2
        })
    }
    catch (reject_Spot_API_me2) {
        let sc = reject_Spot_API_me2.statusCode
        let ms = reject_Spot_API_me2.message
        let msg = `[${f_name} FAILED with message ${ms} from ${call2}]`
        return res.status(sc).json({
            statusCode: sc,
            message: msg,
            previousResponse: reject_Spot_API_me2
        })
    }
}
//
/** GET /artistTopTracks/id&art_id
 *  @ gets user id & artists id from querystring
 *  @ returns res.json():
 *  @ success   :   {status, message, actualResponse, previousResponse}
 *  @ failure   :   {status, message, actualResponse, previousResponse}
 *  @ actualResponse {is: false} OR {is: true, data: what_you_want}
 */
var artistTopTracks = async function(req, res, next){
    let f_name = '/GET artistTopTracks'
    let call1  = 'getAT()'
    let call2  = 'f_artistTopTracks()'
    let call3  = 'get_newAT()'
    console.log(`starting ${f_name}`)
    const {id = null} = req.params
    const {art_id = null} = req.params
    console.log(`   in ${f_name}> received partially id: ${id.substr(0, 5)} with partially art_id: ${art_id.substr(0, 5)}`)
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
        const resolve_f_artistTopTracks = await uFuncs.f_artistTopTracks(art_id, AT)
        let ms = resolve_f_artistTopTracks.message
        let msg = `[${f_name} SUCCESS with message --${ms}-- from: ${call2}]`
        return res.status(200).json({
            statusCode: 200,
            message: msg,
            actualResponse: resolve_f_artistTopTracks.actualResponse,
            previousResponse: resolve_f_artistTopTracks
        })
    }
    catch (reject_f_artistTopTracks) {
        let sc = reject_f_artistTopTracks.statusCode
        if(sc != 401){
            let ms = reject_f_artistTopTracks.message
            let msg = `[${f_name} FAILED with message ${ms} from ${call2}]`
            return res.status(sc).json({
                statusCode: sc,
                message: msg,
                actualResponse: reject_f_artistTopTracks.actualResponse,
                previousResponse: reject_f_artistTopTracks
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
        const resolve_f_artistTopTracks2 = await uFuncs.f_artistTopTracks(art_id, AT)
        let ms = resolve_f_artistTopTracks2.message
        let msg = `[${f_name} SUCCESS with message --${ms}-- from: ${call2}]`
        return res.status(200).json({
            statusCode: 200,
            message: msg,
            actualResponse: resolve_f_artistTopTracks2.actualResponse,
            previousResponse: resolve_f_artistTopTracks2
        })
    }
    catch (reject_f_artistTopTracks2) {
        let sc = reject_f_artistTopTracks2.statusCode
        let ms = reject_f_artistTopTracks2.message
        let msg = `[${f_name} FAILED with message ${ms} from ${call2}]`
        return res.status(sc).json({
            statusCode: sc,
            message: msg,
            actualResponse: reject_f_artistTopTracks2.actualResponse,
            previousResponse: reject_f_artistTopTracks2
        })
    }
}
//
/** POST /newPL/id
 *  @ gets user id from querystring
 *  @ gets from body optional parameters: name/public/collaborative/description
 *  @ returns res.json():
 *  @ success   :   {status, message, actualResponse, previousResponse}
 *  @ failure   :   {status, message, actualResponse, previousResponse}
 *  @ actualResponse {is: false} OR {is: true, data: what_you_want}
 */
var newPL = async function(req, res, next){
    let f_name = '/POST newPL'
    let call1  = 'getAT()'
    let call2  = 'f_newPL()'
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
        const resolve_f_newPL = await uFuncs.f_newPL(id, body, AT)
        let ms = resolve_f_newPL.message
        let msg = `[${f_name} SUCCESS with message --${ms}-- from: ${call2}]`
        return res.status(200).json({
            statusCode: 200,
            message: msg,
            actualResponse: resolve_f_newPL.actualResponse,
            previousResponse: resolve_f_newPL
        })
    }
    catch (reject_f_newPL) {
        let sc = reject_f_newPL.statusCode
        if(sc != 401){
            let ms = reject_f_newPL.message
            let msg = `[${f_name} FAILED with message ${ms} from ${call2}]`
            return res.status(sc).json({
                statusCode: sc,
                message: msg,
                actualResponse: reject_f_newPL.actualResponse,
                previousResponse: reject_f_newPL
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
    //call again
    try {
        const resolve_f_newPL2 = await uFuncs.f_newPL(id, body, AT)
        let ms = resolve_f_newPL2.message
        let msg = `[${f_name} SUCCESS with message --${ms}-- from: ${call2}]`
        return res.status(200).json({
            statusCode: 200,
            message: msg,
            actualResponse: resolve_f_newPL2.actualResponse,
            previousResponse: resolve_f_newPL2
        })
    }
    catch (reject_f_newPL2) {
        let sc = reject_f_newPL2.statusCode
        let ms = reject_f_newPL2.message
        let msg = `[${f_name} FAILED with message ${ms} from ${call2}]`
        return res.status(sc).json({
            statusCode: sc,
            message: msg,
            actualResponse: reject_f_newPL2.actualResponse,
            previousResponse: reject_f_newPL2
        })
    }
}
//
/** PUT /addToPL/id&pl_id
 *  @ gets user id & pl_id from querystring
 *  @ gets from body optional parameters: uris[spotify:track:track_id, ...]
 *  @ returns res.json():
 *  @ success   :   {status, message, actualResponse, previousResponse}
 *  @ failure   :   {status, message, actualResponse, previousResponse}
 *  @ actualResponse {is: false} OR {is: true, data: what_you_want}
 */
var addToPL = async function(req, res, next){
    let f_name = '/PUT addToPL'
    let call1  = 'getAT()'
    let call2  = 'f_addToPL()'
    let call3  = 'get_newAT()'
    console.log(`starting ${f_name}`)
    const {id = null} = req.params
    const {pl_id = null} = req.params
    var body = null
    body = req.body
    console.log(`   in ${f_name}> received partially id: ${id.substr(0, 5)} with pl_id: ${pl_id.substr(0, 5)}`)
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
        const resolve_f_addToPL = await uFuncs.f_addToPL(id, pl_id, body, AT)
        let ms = resolve_f_addToPL.message
        let msg = `[${f_name} SUCCESS with message --${ms}-- from: ${call2}]`
        return res.status(200).json({
            statusCode: 200,
            message: msg,
            actualResponse: resolve_f_addToPL.actualResponse,
            previousResponse: resolve_f_addToPL
        })
    }
    catch (reject_f_addToPL) {
        let sc = reject_f_addToPL.statusCode
        if(sc != 401){
            let ms = reject_f_addToPL.message
            let msg = `[${f_name} FAILED with message ${ms} from ${call2}]`
            return res.status(sc).json({
                statusCode: sc,
                message: msg,
                actualResponse: reject_f_addToPL.actualResponse,
                previousResponse: reject_f_addToPL
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
        const resolve_f_addToPL2 = await uFuncs.f_addToPL(id, pl_id, body, AT)
        let ms = resolve_f_addToPL2.message
        let msg = `[${f_name} SUCCESS with message --${ms}-- from: ${call2}]`
        return res.status(200).json({
            statusCode: 200,
            message: msg,
            actualResponse: resolve_f_addToPL2.actualResponse,
            previousResponse: resolve_f_addToPL2
        })
    }
    catch (reject_f_addToPL2) {
        let sc = reject_f_addToPL2.statusCode
        let ms = reject_f_addToPL2.message
        let msg = `[${f_name} FAILED with message ${ms} from ${call2}]`
        return res.status(sc).json({
            statusCode: sc,
            message: msg,
            actualResponse: reject_f_addToPL2.actualResponse,
            previousResponse: reject_f_addToPL2
        })
    }
}
//
/** PUT /addHistory/id
 *  @ gets user id from querystring
 *  @ gets from body parameters: history{command}
 *  @ gets from body optional parameters: history{desc/pl_1/pl_2/pl_new/uid_shares/art_id/art_name}
 *  @ returns res.json():
 *  @ success   :   {status, message, actualResponse, previousResponse}
 *  @ failure   :   {status, message, actualResponse, previousResponse}
 *  @
 */
var addHistory = async function(req, res, next){
    let f_name = '/PUT addHistory'
    let call1  = 'getAT()'
    let call2  = 'f_addHistory()'
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
        const resolve_f_addHistory = await uFuncs.f_addHistory(id, body)
        let ms = resolve_f_addHistory.message
        let msg = `[${f_name} SUCCESS with message --${ms}-- from: ${call2}]`
        return res.status(200).json({
            statusCode: 200,
            message: msg,
            actualResponse: resolve_f_addHistory.actualResponse,
            previousResponse: resolve_f_addHistory
        })
    }
    catch (reject_f_addHistory) {
        let sc = reject_f_addHistory.statusCode
        if(sc != 401){
            let ms = reject_f_addHistory.message
            let msg = `[${f_name} FAILED with message ${ms} from ${call2}]`
            return res.status(sc).json({
                statusCode: sc,
                message: msg,
                actualResponse: reject_f_addHistory.actualResponse,
                previousResponse: reject_f_addHistory
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
        const resolve_f_addHistory2 = await uFuncs.f_addHistory(id, body)
        let ms = resolve_f_addHistory2.message
        let msg = `[${f_name} SUCCESS with message --${ms}-- from: ${call2}]`
        return res.status(200).json({
            statusCode: 200,
            message: msg,
            actualResponse: resolve_f_addHistory2.actualResponse,
            previousResponse: resolve_f_addHistory2
        })
    }
    catch (reject_f_addHistory2) {
        let sc = reject_f_addHistory2.statusCode
        let ms = reject_f_addHistory2.message
        let msg = `[${f_name} FAILED with message ${ms} from ${call2}]`
        return res.status(sc).json({
            statusCode: sc,
            message: msg,
            actualResponse: reject_f_addHistory2.actualResponse,
            previousResponse: reject_f_addHistory2
        })
    }
}
//
//
//
module.exports = {
    invalidAT       : invalidAT       ,
    newAT           : newAT           ,
    basicData       : basicData       ,
    artistTopTracks : artistTopTracks,
    newPL           : newPL          ,
    addToPL         : addToPL        ,
    addHistory      : addHistory
}