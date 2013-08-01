if (/access_token/i.test(window.location.hash.substring(1))) {
    window.localStorage.setItem(
        'access_token',
        /access_token=([^&\/]+)/i.exec(window.location.hash.substring(1))[1]);
}

//Foursquare access
var accessToken = window.localStorage.getItem('access_token');

if (!accessToken) {
    document.querySelector('body').innerHTML =
    '<a href="https://foursquare.com/oauth2/authenticate?' +
    'client_id=PZHASJ4VA4PDMC1TBJIORWHMTM44WORMLGZ20SDK5LUAPOCL&' +
    'response_type=token&redirect_uri=http://localhost:8000/"' +
    'target="_blank">Login to Foursquare</a>';
}

// create a map in the "map" div, set the view to a given place and zoom
var map = L.map('map').setView([51.505, -0.09], 13);

// add an OpenStreetMap tile layer
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',  {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// add a marker in the given location, attach some popup content to it and open the popup
L.marker([51.5, -0.09]).addTo(map)
    .bindPopup('A pretty CSS3 popup. <br> Easily customizable.')
    .openPopup();

new L.Control.GeoSearch({
    provider: new  L.GeoSearch.Provider.Esri()
}).addTo(map);

map.on('geosearch_foundlocations',function(data){

    //var latlng = this._initialCenter;
    var latlng = data.Locations[0];
    $.ajax('https://api.foursquare.com/v2/venues/explore',
    {
        data: {
          v: '20130801',
          ll: latlng.Y + ',' + latlng.X,
          radius: 25000,
          venuePhotos: 1,
          oauth_token: accessToken
        },
        success: parseFourSquare
    });
});
function parseFourSquare(data){

    var numResults = data.numResults;
    var results = data.response.groups[0];

    var markers = results.items.map(function(n){
        var venue = n.venue, hours = '';
        var marker = new L.Marker([venue.location.lat,venue.location.lng]);//.addTo(map);
        var photo = venue.photos;
        if (photo.groups && photo.groups[0] && photo.groups[0].items && photo.groups[0].items[0]) {
            photo = '<a href="' + venue.canonicalUrl + '" target="_blank">' +
            '<img width="50" height="50" src="' +
            venue.photos.groups[0].items[0].prefix + '400x400' +
            venue.photos.groups[0].items[0].suffix
            + '"/></a>';
        }
        if (venue.hours) {
            console.log(venue.hours)
            hours = 'Hours: <span class="' + (venue.hours.isOpen ? 'green' : 'red') + '">' + venue.hours.status+'</span>';
            console.log(hours);
        }

        marker.bindPopup(
            [venue.name,
            venue.likes.summary,
            hours,
            photo
            ].join('<br/>')
            );
        return marker;
    });
    var group = new L.featureGroup(markers).addTo(map);
    map.fitBounds(group.getBounds());
}









