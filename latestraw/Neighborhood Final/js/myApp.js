var map;
var markers = [];
//Total Locations
var locations = [{
        title: 'Golconda Fort',
        location: {
            lat: 17.3833,
            lng: 78.4011
        }
    },
    {
        title: 'Charminar',
        location: {
            lat: 17.3616,
            lng: 78.4747
        }
    },
    {
        title: 'Husain Sagar',
        location: {
            lat: 17.4239,
            lng: 78.4738
        }
    },
    {
        title: 'Salar Jung Museum',
        location: {
            lat: 17.3713,
            lng: 78.4804
        }
    },
    {
        title: 'Ramoji Film City',
        location: {
            lat: 17.2543,
            lng: 78.6808
        }
    },
    {
        title: 'Makkah Masjid',
        location: {
            lat: 17.3604,
            lng: 78.4736
        }
    },
    {
        title: 'Nehru Zoological Park',
        location: {
            lat: 17.3511,
            lng: 78.4489
        }
    },
    {
        title: 'Paradise Food Court',
        location: {
            lat: 17.4416,
            lng: 78.4873
        }
    },
    {
        title: 'Eat Street',
        location: {
            lat: 17.4221,
            lng: 78.4653
        }
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
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < locations.length; i++) {
         // Get the position from the location array.
         var position = locations[i].location;
         var title = locations[i].title;
         // Create a marker per location, and put into markers array.
         var marker = new google.maps.Marker({
             map: map,
             position: position,
             title: title,
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
               bounceMarker(marker);
           });
}

        // This is to re-center the map upon resizing of the window
  window.onresize = function() {
      map.fitBounds(bounds);
  };
  // when clicked on elsewhere on the map, close the infowindow
  map.addListener("click", function() {
    infowindow.close(infowindow);
});
        //https://developers.google.com/maps/documentation/javascript/examples/marker-animations
        function bounceMarker(marker) {
            if (marker.getAnimation() !== null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function() {
                    marker.setAnimation(null);
                }, 3000);
            }
        }

        // This function populates the infowindow when the marker is clicked. We'll only allow
        // one infowindow which will open at the marker that is clicked, and populate based
        // on that markers position.
        function populateInfoWindow(marker, infowindow) {
            // Check to make sure the infowindow is not already opened on this marker.
            if (infowindow.marker !== marker) {
                infowindow.marker = marker;
                infowindow.setContentinfowindow.setContent('<div><img src="images/mediawiki.png" alt="mediawiki image"><h3>' + marker.title + '</h3><ul id="wiki-info"></ul></div>');
                var wikiUrl ='https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
                $.ajax({
                        url: wikiUrl,
                        dataType: "jsonp"
                    })
                    .done(function(response) {
                        var articleList = response[3];
                        var $wiki = $('#wiki-info');
                        for (var i = 0; i < articleList.length; i++) {
                            articleStr = articleList[i];
                            $wiki.append('<li><a href="' + articleStr + '" target="blank">Click here for more info' + '</a></li>');
                        }
                    })
                    .fail(function() {
                        alert("An Error Occured");
                    });

                infowindow.open(map, marker);
                // Make sure the marker property is cleared if the infowindow is closed.
                infowindow.addListener('closeclick', function() {
                    infowindow.setMarker(null);
                });

              }

            }


        //Create the location variable
        var Location = function(data, i) {
            this.title = ko.observable(data.title);
            this.location = data.location;
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
}
