var map;
var geocoder;
var infowindows = [];
var gmarkers = [];
var checkins = [];
var access_token;
var isLoaded = false;
var uid;

function statusChangeCallback(response) {
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
        uid = response.authResponse.userID;
        access_token = response.authResponse.accessToken;
        google.maps.event.addDomListener(window, 'load', initialize);
        document.getElementById('login-button').className = "hidden";
        testAPI();
        initialize();
    } else if (response.status === 'not_authorized') {
        // The person is logged into Facebook, but not your app.
        document.getElementById('status').innerHTML = 'Please log ' +
            'into this app.';
    } else {
        // The person is not logged into Facebook, so we're not sure if
        // they are logged into this app or not.
        document.getElementById('status').innerHTML = 'Please log ' +
            'into Facebook.';
    }
}

// This function is called when someone finishes with the Login
// Button.  See the onlogin handler attached to it in the sample
// code below.
function checkLoginState() {
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
}

window.fbAsyncInit = function() {
    FB.init({
        appId      : '1089401731070027',
        cookie     : true,  // enable cookies to allow the server to access
                            // the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v2.2' // use version 2.2
    });

    // Now that we've initialized the JavaScript SDK, we call
    // FB.getLoginStatus().  This function gets the state of the
    // person visiting this page and can return one of three states to
    // the callback you provide.  They can be:
    //
    // 1. Logged into your app ('connected')
    // 2. Logged into Facebook, but not your app ('not_authorized')
    // 3. Not logged into Facebook and can't tell if they are logged into
    //    your app or not.
    //
    // These three cases are handled in the callback function.

    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
    isLoaded = true;

};

// Load the SDK asynchronously
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
function testAPI() {
    FB.api('/me', function(response) {
        console.log('Successful login for: ' + response.name);
        document.getElementById('status').innerHTML =
            'Thanks for logging in, ' + response.name + '!';
    });
}

function initialize() {
    var styles =[
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
                { "color": "#b1bdd6" }
            ]
        },{
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
            { "color": "#ffffff" },
            { "weight": 0.2 }
        ]
    },{
        "featureType": "water",
        "elementType": "labels.text.stroke",
        "stylers": [
            { "color": "#a0aecc" }
        ]
    },{
        "featureType": "landscape",
        "stylers": [
            { "color": "#e8e5e5" }
        ]
    },{
        "featureType": "administrative.province",
        "stylers": [
            { "weight": 0.5 },
            { "color": "#d1d0cf" }
        ]
    },{
        "featureType": "poi.park",
        "stylers": [
            { "visibility": "on" },
            { "color": "#c5dea2" }
        ]
    },{
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            { "color": "#f3f3f2" }
        ]
    },{
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
            { "visibility": "on" },
            { "invert_lightness": true },
            { "color": "#787878" }
        ]
    },{
        "featureType": "administrative.country",
        "stylers": [
            { "color": "#868686" },
            { "weight": 0.7 }
        ]
    },{
        "featureType": "administrative.country",
        "elementType": "labels.text.fill",
        "stylers": [
            { "color": "#999999" }
        ]
    },{
        "featureType": "poi.park",
        "elementType": "labels.text.stroke",
        "stylers": [
            { "color": "#ffffff" }
        ]
    },{
        "featureType": "administrative.country",
        "elementType": "labels.text.stroke",
        "stylers": [
            { "color": "#ffffff" },
            { "weight": 2.8 }
        ]
    },
        {featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }]}
    ];

    var mapOptions = {
        zoom: 8,
        streetViewControl: false,
        mapTypeControl: false,
        rotateControl: false
    };

    var styledMap = new google.maps.StyledMapType(styles,
        {name: "Styled Map"});

    var mapDiv = document.getElementById('map-canvas');
    map = new google.maps.Map(mapDiv, mapOptions);
    map.mapTypes.set('map_style', styledMap);
    map.setMapTypeId('map_style');

    // Try HTML5 geolocation
    if(navigator.geolocation){

        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
            load(pos);
        }, function(){
            var pos = new google.maps.LatLng(40.70, -74.01);
            load(pos);
        });

    } else {
        // Browser doesn't support Geolocation
        var pos = new google.maps.LatLng(40.70, -74.01);
        load(pos);
    }

}

function load(pos){
    map.setCenter(pos);

    geocoder = new google.maps.Geocoder();

    google.maps.event.addListener(map, 'click', function(e) {
        var latlng = e.latLng;
        document.getElementById('latlng').value = latlng.lat().toFixed(6)+","+latlng.lng().toFixed(6);
        facebook(map,latlng.lat(), latlng.lng());
    });

    document.getElementById('latlng').value = pos.lat().toFixed(6)+","+pos.lng().toFixed(6);
    facebook(map,pos.lat(), pos.lng());


    //geo places search
    var input = (document.getElementById('pac-input'));

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    google.maps.event.addListener(autocomplete, 'place_changed', function(){

        var place = autocomplete.getPlace();
        document.getElementById('latlng').value = place.geometry.location.lat().toFixed(6)+","+place.geometry.location.lng().toFixed(6);

        if (!place.geometry) {
            return;
        }

        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }

        //marker.setPosition(place.geometry.location);
        //create(map, place.geometry.location);
        facebook(map,place.geometry.location.lat(), place.geometry.location.lng());
    });
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return 'i' + s4() + s4() + s4() + s4() + s4() + s4();
}

function removeMarkers(){
    for(i=0; i<infowindows.length; i++){
        gmarkers[i].setMap(null);
    }
    gmarkers = [];
}

function removeInfoWindows(){
    infowindows = [];
}

function postFacebook(tid){
    var id = tid.id;
    var message = document.getElementById("message_"+id).value;
    var place = document.getElementById('place_'+id).value;
    var place_id = document.getElementById('place_id_'+id).value;
    var marker_index = document.getElementById('marker_'+id).value;
    var infowindow_index = document.getElementById('infowindow_'+id).value;


    $.ajax({
            type: 'POST',
            url: 'https://graph.facebook.com/me/feed',
            async: false,
            data: {
                access_token: access_token,
                message: message,
                place: place_id,
                privacy: {
                    value:'SELF'
                }
            },
            success: function(response) {
                if (response && !response.error) {
                    //getCheckins();
                    gmarkers[marker_index].setIcon('../img/post.png');
                    tid.innerHTML = "<div id='popupOuter'>" +
                        "<div id='popupInner'>" +
                        "<div id='popup_head'><h1>" + place + "</h1></div>" +
                        "<div id='personal'>Message posted on location page.</div>" +
                        "<div id='contactArea'>" +
                        "<img id='profile' src='https://graph.facebook.com/" + uid + "/picture?type=small'>" +
                        "<textarea onfocus='this.blur()' readonly='readonly'>"+ message + "</textarea>" +
                        "</div>" +
                        "<div id='buttonArea'>" +
                        "<div id='Sharer_btns'>" +
                        "<input type='reset' value='Close' class='btn' onclick='closeInfoWindow("+infowindow_index+")'/>" +
                        "</div>" +
                        "</div>" +
                        "</div>" +
                        "</div>";

                    //$('#places').dataTable().api().rows().invalidate().draw()
                } else {
                    console.log(response);
                }
            }
        }
    );
}

function setLocation(post_id, checkin) {
    $.ajax({
        type: 'GET',
        url: 'https://graph.facebook.com/'+post_id,
        async: false,
        data: {
            access_token: access_token,
            fields: 'place'
        },
        success: function(response) {
            if (response && !response.error) {
                checkin.location = response.place.location;
                }
            }
        }
    );
}

function getCheckins(){
    checkins = [];

    $.ajax({
        type: 'GET',
        url: 'https://graph.facebook.com/me/feed',
        async: false,
        data: {
            access_token: access_token,
            with: 'location'
        },
        success: function(response) {
            if (response && !response.error) {
                response.data.forEach(function (f) {
                    var checkin = {};
                    setLocation(f.id, checkin);
                    checkin.id = f.id;
                    checkin.message = f.message;
                    checkins.push(checkin);
                });
            }
        }
    });
}

function findCheckin(longitude, latitude){
    var checkin = null;
    checkins.forEach(function (c) {
        if (c.location.latitude == latitude && c.location.longitude == longitude) {
            checkin = c;
        }
    });
    return checkin;
}

function closeInfoWindow(id){
    infowindows[id].close();
}

function facebook(map, lat, lng){
    var center=lat+","+lng;
    var distance=1000;
    var type='place';
    var places = 'https://graph.facebook.com/search?type='+type+'&center='+center+'&distance='+distance+'&access_token='+access_token;
    getCheckins();

    var t = $('#places').dataTable({
        "bDestroy":true,
        "ajax": places,
        "sAjaxDataProp": "data",
        "bLengthChange": false,
        "bSearchable": false,
        "bFilter": false,
        "bInfo": false,
        "iDisplayLength": 8,
        "columns": [
            { "data": "name", "defaultContent": ""},
            //{ "data": null, "defaultContent": ""},
            { "data": "location.street", "defaultContent": ""},
            { "data": "location.city", "defaultContent": ""},
            { "data": "location.zip", "defaultContent": ""},
            { "data": "location.country", "defaultContent": ""},
            { "data": "location.latitude", "defaultContent": ""},
            { "data": "location.longitude", "defaultContent": ""}
        ]/*,
        "aoColumnDefs": [{
            "aTargets": [1],
            //TODO: support multiple checkins
            "mRender": function(data, display, full){
                var checkin = findCheckin(full.location.longitude, full.location.latitude);
                if (checkin != null) {
                    return '<a href="https://graph.facebook.com/v2.2/' + checkin.id + '" class="load">2</a>';
                }
            }
        }]*/
    });
    t.on('xhr.dt', function(e, settings, response){
        //logic here depends on API, facebook always returns next page but the limit is a huge 5K
        //when data is empty next page does not show so we should trigger more once to see if there is more...
        if(response.data.length==5000){
            if(response.paging.next){
                places = response.paging.next;
                $("#more").show();
            }
        }
        var bounds = new google.maps.LatLngBounds();

        //drop places as markers on Google Map
        if(response.data.length>0){

            //remove if we have markers on the map already
            removeMarkers();
            removeInfoWindows();

            //add markers based on FaceBook Data
            response.data.forEach(function(f){

                var myLatLng = new google.maps.LatLng(f.location.latitude, f.location.longitude);
                var infowindow = new google.maps.InfoWindow();
                var infowindow_index = infowindows.push(infowindow) - 1;

                var tid = guid();

                var icon = "../img/nopost.png";

                var marker = new google.maps.Marker({
                    position: myLatLng,
                    map: map,
                    title: f.name
                });
                var marker_index = gmarkers.push(marker) - 1;

                var content = "<form id='"+tid+"'>" +
                    "<div id='popupOuter'>" +
                        "<div id='popupInner'>" +
                            "<div id='popup_head'><h1>" + f.name + "</h1></div>" +
                            "<div id='personal'>Following message will be posted on location page.</div>" +
                            "<div id='contactArea'>" +
                                "<img id='profile' src='https://graph.facebook.com/" + uid + "/picture?type=small'>" +
                                "<textarea id='message_"+ tid+"'></textarea>" +
                            "</div>" +
                            "<input type='hidden' id='infowindow_"+tid+"' value='"+ infowindow_index + "'>" +
                            "<input type='hidden' id='marker_"+tid+"' value='"+ marker_index + "'>" +
                            "<input type='hidden' id='place_"+tid+"' value='"+ f.name + "'>" +
                            "<input type='hidden' id='place_id_"+tid+"' value='"+ f.id + "'>" +
                            "<div id='buttonArea'>" +
                                "<div id='Sharer_btns'>" +
                                    "<input type='submit' value='Post' class='btn primary' onclick='postFacebook(" + tid + ")'/>" +
                                    "&nbsp;&nbsp;" +
                                    "<input type='reset' value='Cancel' class='btn' onclick='closeInfoWindow("+infowindow_index+")'/>" +
                                "</div>" +
                            "</div>" +
                        "</div>" +
                    "</div>"+
                "</form>";


                // check if user has already checked in place
                // if so, fetch his post and plug it in + change marker color and description
                checkins.forEach(function (c) {
                    if (c.location.latitude == f.location.latitude && c.location.longitude == f.location.longitude) {
                        icon = "../img/post.png";
                         content = "<div id='popupOuter'>" +
                            "<div id='popupInner'>" +
                            "<div id='popup_head'><h1>" + f.name + "</h1></div>" +
                            "<div id='personal'>Message posted on location page.</div>" +
                            "<div id='contactArea'>" +
                            "<img id='profile' src='https://graph.facebook.com/" + uid + "/picture?type=small'>" +
                            "<textarea onfocus='this.blur()' readonly='readonly'>"+ c.message + "</textarea>" +
                            "</div>" +
                            "<div id='buttonArea'>" +
                            "<div id='Sharer_btns'>" +
                            "<input type='reset' value='Close' class='btn' onclick='closeInfoWindow("+infowindow_index+")'/>" +
                            "</div>" +
                            "</div>" +
                            "</div>" +
                            "</div>";
                    }
                });

                marker.setIcon(icon);
                infowindow.setContent(content);

                google.maps.event.addListener(infowindow, 'domready', function() {

                    // Reference to the DIV which receives the contents of the infowindow using jQuery
                    var iwOuter = $('.gm-style-iw');

                    /* The DIV we want to change is above the .gm-style-iw DIV.
                     * So, we use jQuery and create a iwBackground variable,
                     * and took advantage of the existing reference to .gm-style-iw for the previous DIV with .prev().
                     */
                    var iwBackground = iwOuter.prev();

                    // Remove the background shadow DIV
                    iwBackground.children(':nth-child(2)').css({'display' : 'none'});

                    // Remove the white background DIV
                    iwBackground.children(':nth-child(4)').css({'display' : 'none'});

                    var iwCloseBtn = iwOuter.next();

                    iwCloseBtn.css({
                        display: 'none' // by default the close button has an opacity of 0.7
                    });

                    // Remove pointer shadow
                    iwBackground.children(':nth-child(1)').css({'display': 'none'});

                    var iwPointer = iwBackground.children(':nth-child(3)');

                    // Left side
                    iwPointer.children(':nth-child(1)').children(':nth-child(1)').css({
                        'background-color': 'rgba(128,128,128,0.6)',
                        'box-shadow': 'none'
                    });

                    // Right side
                    iwPointer.children(':nth-child(2)').children(':nth-child(1)').css({
                        'background-color': 'rgba(128,128,128,0.6)',
                        'box-shadow': 'none'
                    });
                });

                google.maps.event.addListener(marker, 'click', function() {
                    infowindow.open(map, this);
                });

                //extend bounds to all markers placed on map
                bounds.extend(myLatLng);
            });
            //reposition map to fit bounds
            map.fitBounds(bounds);
        }
    });


    $('#places').on('click', '.load', function(){

        var idurl = $(this).attr("href")+'?access_token='+access_token;

        $.getJSON(idurl).done(function(data){

            var jsondata = JSON.stringify(data,null,'\t');

            //simplemodal
            $.modal('<div><h2>Checkin Details</h2>' +
                '<div id="details"><pre><code class="json">'+jsondata+'</pre></code></div></div>'
            );

            //highlight.js
            hljs.highlightBlock($(".json")[0]);
        });
        return false;
    });

    $('#more').on('click',function(){
        $.getJSON(places).done(function(data){
            if(data.data.length>0){
                t.fnAddData(data.data);
            }

            if(data.paging.next){
                places = data.paging.next;
            } else {
                $("#more").hide();
            }
            t.fnAddData(data.data);
        });
    });
}