// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

var query2 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {


    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
            "</h3><hr><p>Magnitude: " + feature.properties.mag + "</p>");
    }



    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function(feature, latlng) {
            var color;
            var r = 255;
            var g = Math.floor(255 - 80 * feature.properties.mag);
            var b = Math.floor(255 - 80 * feature.properties.mag);
            color = "rgb(" + r + " ," + g + "," + b + ")"

            var geojsonMarkerOptions = {
                radius: 4 * feature.properties.mag,
                fillColor: color,
                color: "black",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    });


    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);

}

function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/tatertot53/cjhdgw8du1n6o2rkcrwrbyzbw/tiles/256/{z}/{x}/{y}?" +
        "access_token=pk.eyJ1IjoidGF0ZXJ0b3Q1MyIsImEiOiJjamVseTd1c20xZ2IzMnFwaGQ1MHBxaGczIn0.IDt_Wu2JsJQyv1lPMM2Org");

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Street Map": streetmap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });


    function getColor(d) {
        return d < 1 ? 'rgb(0,229,63)' :
            d < 2 ? 'rgb(162,213,0)' :
            d < 3 ? 'rgb(210,205,0)' :
            d < 4 ? 'rgb(202,93,0)' :
            d < 5 ? 'rgb(194,0,10)' :
            'rgb(255,0,0)';
    }

    // Create a legend to display information about our map
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function(map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 2, 3, 4, 5],
            labels = [];

        div.innerHTML += 'Magnitude<br><hr>'

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(myMap);

    var timelineControl;

    function onLoadData(data) {
        timeline = L.timeline(data, {
            style: function(data) {
                return {
                    stroke: false,
                    color: getColor(data.properties.mag),
                    fillOpacity: 0.5
                }
            },
            waitToUpdateMap: true,
            onEachFeature: function(feature, layer) {
                layer.bindTooltip(feature.properties.name);
            }
        });
        timelineControl = L.timelineSliderControl({
            formatOutput: function(date) {
                return new Date(date).toLocaleDateString();
            },
            enableKeyboardControls: true,
        });
        timeline.addTo(myMap);
        timelineControl.addTo(myMap);
        timelineControl.addTimelines(timeline);
    }

}