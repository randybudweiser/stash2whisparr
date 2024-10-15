// ==UserScript==
// @name         Add StashID to Whisparr
// @namespace    http://tampermonkey.net/
// @version      2024-10-15
// @description  Add a StashDB scene to your local Whisparr instance.
// @author       randybudweiser
// @match        https://stashdb.org/scenes/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==


// EDIT THESE VALUES TO FIT YOUR USE CASE //
const scheme = "https"; // Set the scheme for your API call
const userDomain = "*****"; // Place the IP/URL to your Whisparr instance here
const apiKey = "*****"; // Place your Whisparr API key here
const quality = "*****"; // Set the quality profile ID for the scene. To find available values run a GET call on /api/v3/qualityProfileId

// LEAVE THESE ALONE //
const apiUrl = `${scheme}://${userDomain}/api/v3/lookup/scene`;
const currentURL = window.location.href;
const splitURL = currentURL.split('https://stashdb.org/scenes/');

(function() {
    'use strict';
    var triggerButton = document.createElement('button');
    triggerButton.innerHTML = 'Add scene to Whisparr';
    triggerButton.style.position = 'fixed';
    triggerButton.style.top = '56px';
    triggerButton.style.left = '12px';
    triggerButton.style.backgroundColor = '#e385ed';
    triggerButton.style.color = 'white';
    triggerButton.style.padding = '10px';
    triggerButton.style.border = 'none';
    triggerButton.style.borderRadius = '5px';
    triggerButton.style.cursor = 'pointer';
    triggerButton.style.zIndex = '1000';
    document.body.appendChild(triggerButton);
    triggerButton.addEventListener('click', function() {
        console.log('Adding to Whisparr!');
        if (splitURL.length > 1) {
            var sceneID = splitURL[1];
            var fullApiUrl = apiUrl + '?term=' + encodeURIComponent(sceneID);
            var headers = {
                'Accept': '*/*',
                'X-Api-Key': apiKey,
                'Connection': 'keep-alive'
            };
            fetch(fullApiUrl, {
                method: 'GET',
                headers: headers
            })
            .then(response => response.json())
            .then(data => {
                console.log('API Response:', data);
                var scene_data = data[0];
                var title = scene_data.movie.title;
                var studio = scene_data.movie.studioTitle;
                var foreign_id = scene_data.foreignId;
                var year = scene_data.year;
                var payload = {
                    title: title,
                    studio: studio,
                    foreignId: foreign_id,
                    year: year,
                    rootFolderPath: `/data/${studio}`,
                    monitored: true,
                    addOptions: {
                        searchForMovie: true
                    },
                    qualityProfileId: quality
                };
                var postHeaders = {
                    'Accept': '*/*',
                    'X-Api-Key': apiKey,
                    'Connection': 'keep-alive',
                    'Content-Type': 'application/json'
                };

                console.log('Constructed Payload:', payload);
                var postApiUrl = `${scheme}://${userDomain}/api/v3/movie`;
                fetch(postApiUrl, {
                    method: 'POST',
                    headers: postHeaders,
                    body: JSON.stringify(payload)
                })
                .then(postResponse => postResponse.json())
                .then(postData => {
                    console.log('POST Response:', postData);
                })
                .catch(postError => {
                    console.error('POST Call Error:', postError);
                });
            })
            .catch(error => {
                console.error('API Call Error:', error);
            });
        } else {
            console.log('No StashID in the URL.');
        }
    });
})();
