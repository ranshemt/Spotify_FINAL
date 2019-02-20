//npm modules
const querystring   = require('querystring')
const rp            = require ('request-promise')
//User model
const User          = require ('./user')
//scope requesting access to
let playlists_scope = 'playlist-read-private playlist-modify-private playlist-modify-public playlist-read-collaborative'
let history_scope = 'user-top-read user-read-recently-played'
let user_scope = 'user-read-email user-read-private'
let library_scope = 'user-library-modify user-library-read'
var SCOPE = playlists_scope + ' ' + history_scope + ' ' + user_scope + ' ' + library_scope;
//
/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//
var stateKey = 'spotify_auth_state';
//
//
//
var loginRoute = async function(req, res, next){
    console.log('starting loginRoute')
    var state = generateRandomString(16);
    res.cookie(stateKey, state);
    // your application requests authorization
    var scope = SCOPE
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: process.env.client_id,
            scope: scope,
            redirect_uri: process.env.redirect_uri,
            state: state
    }))
}
//
//update data in DB
var updateDB = async function(data, AT, RT){
    console.log('starting updateDB')
    let IMG = '#'
    if(data.images.length > 0)  IMG = data.images[0].url
    return new Promise(async (resolve, reject) =>{
        User.updateOne(
            {id: data.id},
            {$set: {
                    id: data.id,
                    name: data.display_name,
                    img: IMG,
                    AT,
                    RT
                }
            },
            {upsert: true}
        ).exec()
            .then((res) => {return resolve({msg: 'success'})})
            .catch((err) => {return reject({msg: 'err'})})
    })
}
//
var callbackRoute = async function (req, res, next) {
    console.log('starting callbackRoute')
    // your application requests refresh and access tokens
    // after checking the state parameter
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect('/#/error' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    }
    else {
        res.clearCookie(stateKey);
        let options = {
            method: 'POST',
            uri: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: process.env.redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(process.env.client_id + ':' + process.env.client_secret).toString('base64'))
            },
            json: true
        }
        //call Spotify API
        rp(options)
            .then(async (body) => {
                var access_token = body.access_token,
                    refresh_token = body.refresh_token;
                

                let optionsMe = {
                    url: 'https://api.spotify.com/v1/me',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
                }

                //get basic data from Spotify API
                rp(optionsMe)
                    .then(async (bodyMe) => {
                        console.log(`bodyMe: ${JSON.stringify(bodyMe)}`)
                        //update data in DB
                        updateDB(bodyMe, access_token, refresh_token)
                            .then(mmm => {
                                //send cookie
                                res.cookie('ran_hodaya', {id: bodyMe.id})
                                //for validation pass the data to querystring
                                res.redirect('/#/user/' +
                                    querystring.stringify({
                                        access_token: access_token,
                                        refresh_token: refresh_token
                                }))
                            })
                            .catch(err => {
                                res.redirect('/#/error/' +
                                    querystring.stringify({
                                        errorMsg: err
                                }))
                            })
                    })
                    .catch(async (err) => {
                        res.redirect('/#/error/' +
                            querystring.stringify({
                                errorMsg: err
                        }))
                    })
            })
            .catch(async (err) => {
                res.redirect('/#/error/' +
                    querystring.stringify({
                        errorMsg: err
                }))
            })
    }
}

module.exports = {
    loginRoute,
    callbackRoute
}