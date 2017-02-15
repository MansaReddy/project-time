var map;
var markers = [];
//Total Locations
var locations = [{
        title: 'Golconda Fort',
        location: {
            lat: 17.3833,
            lng: 78.4011
        },
        content: 'Fortress complex famed for acoustics'
    },
    {
        title: 'Charminar',
        location: {
            lat: 17.3616,
            lng: 78.4747
        },
        content: 'Iconic mosque with 4 minarets & arches'
    },
    {
        title: 'Husain Sagar',
        location: {
            lat: 17.4239,
            lng: 78.4738
        },
        content: 'Hussain Sagar is a heart shaped lake in which world tallest monolith of Gautama Buddha Statue installed'
    },
    {
        title: 'Salar Jung Museum',
        location: {
            lat: 17.3713,
            lng: 78.4804
        },
        content: 'Varied art & antiques from Asia & Europe'
    },
    {
        title: 'Ramoji Film City',
        location: {
            lat: 17.2543,
            lng: 78.6808
        },
        content: 'Vast Film studio & entertainment complex'
    },
    {
        title: 'Makkah Masjid',
        location: {
            lat: 17.3604,
            lng: 78.4736
        },
        content: 'Monumental, richly decorated mosque'
    },
    {
        title: 'Nehru Zoological Park',
        location: {
            lat: 17.3511,
            lng: 78.4489
        },
        content: 'The Zoo is proud prossessor of a large variety of local and exotic animals'
    },
    {
        title: 'Paradise Food Court',
        location: {
            lat: 17.4416,
            lng: 78.4873
        },
        content:'World famous for Hyderabadi Biryani'
    },
    {
        title: 'Eat Street',
        location: {
            lat: 17.4221,
            lng: 78.4653
        },
        content: 'Fun to hang out with friends for eating'
    }
];
var mapError = function() {
        alert('404 Error Not Found');
};
function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {

            lat: 17.4337,
            lng: 78.5016
        },
        zoom: 13
    });
    var largeInfowindow = new google.maps.InfoWindow();
    // Style the markers a bit. This will be our listing marker icon.
    var defaultIcon = makeMarkerIcon('0091ff');
    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    var highlightedIcon = makeMarkerIcon('FFFF24');
    // The following group uses the location array to create an array of markers on initialize.
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < locations.length; i++) {
        // Get the position from the location array.
        var position = locations[i].location;
        var title = locations[i].title;
        var content = locations[i].content;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            content: content,
            animation: google.maps.Animation.DROP,
            id: i
        });

        // Push the marker to our array of markers.
        markers.push(marker);
        //Extend the boundaries of the map for each marker
        bounds.extend(marker.position);
        // Create an onclick event to open the large infowindow at each marker.
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
        });
        // Two event listeners - one for mouseover, one for mouseout,
        // to change the colors back and forth.
        marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
        });
        marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
        });
    }
    map.fitBounds(bounds);
    //Create "showlistins"and "hideListings" button

    document.getElementById('show-listings').addEventListener('click', showListings);
    document.getElementById('hide-listings').addEventListener('click', hideListings);

}
// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker !== marker) {
        infowindow.marker = marker;
        // Clear the infowindow content to give the streetview time to load.
        infowindow.setContent('');
        infowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
            infowindow.setMarker(null);
        });
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;
        // In case the status is OK, which means the pano was found, compute the
        // position of the streetview image, then calculate the heading, then get a
        // panorama from that and set the options
        function getStreetView(data, status) {
            if (status === google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                infowindow.setContent('<div>' + marker.title +': '+ marker.content+'</div><div id="pano"></div>');
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
            } else {
                infowindow.setContent('<div>' + marker.title +': '+ marker.content+'</div>' +
                    '<div>No Street View Found</div>');
            }
        }
        // Use streetview service to get the closest streetview image within
        // 50 meters of the markers position
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
    }
}

// This function will loop through the markers array and display them all.
function showListings() {
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}

// This function will loop through the listings and hide them all.
function hideListings() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}
//Create the location variable
var Location = function(data, i) {
    this.title = data.title;
    this.content = data.content;
    this.id = i;
};
//Create ViewModel function
var ViewModel = function() {
    var self = this;
    self.searchInput = ko.observable('');
    this.locationList = ko.observableArray([]);
    locations.forEach(function(locationItem, i) {
        self.locationList.push(new Location(locationItem, i));
    });
    //This function triggers the "click" function associatded with location list
    this.setLocation = function(location) {
        var index = location.id;
        google.maps.event.trigger(markers[index], "click");
    };
    //Search filter to make it easy to find a location
    this.searchFilter = ko.computed(function() {
        var searchInput = self.searchInput().toLowerCase();
        var foundLocations = ko.observableArray([]);
        //The marker becomes visible with matching keywords
        if (!searchInput) {
            markers.forEach(function(marker) {
                marker.setVisible(true);
            });
            return self.locationList();

        } else {
            self.locationList().forEach(function(location, i) {
                var title = location.title.toLowerCase();
                var found = title.indexOf(searchInput);
                if (found > -1) {
                    foundLocations.push(location);
                    markers[i].setVisible(true);
                } else {
                    markers[i].setVisible(false);
                }
            });
            return foundLocations();

        }

    });
};

ko.applyBindings(new ViewModel());
// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}
