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
    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    var scope = SCOPE
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
    }))
}
//
//update data in DB
var updateDB = async function(data, AT, RT){
    return new Promise(async (resolve, reject) =>{
        User.updateOne(
            {id: ID},
            {$set: {
                    id: data.id,
                    name: data.display_name,
                    img: data.images[1].url,
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
    // your application requests refresh and access tokens
    // after checking the state parameter

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect('/#' +
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
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
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
                    .then(async (body) => {
                        //update data in DB
                        updateDB(body, access_token, refresh_token)
                            .then(mmm => {
                                //send cookie
                                res.cookie('ran_hodaya', {id: body.id})
                                //for validation pass the data to querystring
                                res.redirect('/#' +
                                    querystring.stringify({
                                        access_token: access_token,
                                        refresh_token: refresh_token
                                }))
                            })
                            .catch(err => {
                                res.redirect('/#' +
                                    querystring.stringify({
                                        error: 'save in DB error'
                                }))
                            })
                    })
                    .catch(async (err) => {
                        res.redirect('/#' +
                            querystring.stringify({
                                error: 'invalid_token'
                        }))
                    })
            })
            .catch(async (err) => {
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                }))
            })
    }
}

module.exports = {
    loginRoute,
    callbackRoute
}