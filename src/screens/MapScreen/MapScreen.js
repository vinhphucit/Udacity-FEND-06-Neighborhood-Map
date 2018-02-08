import React from 'react'
import SideMenuLocation from './components/SideMenuLocation'
import * as FoursquareApi from './../../services/FoursquareApi'

//This is the main screen 
class MapScreen extends React.Component {
    state = {
        locations: []
    }
    constructor(props) {
        super(props);
        this.locations = [
            { name: "Thai Express", lat: 21.00769254029714, lng: 105.8023798259395 },
            { name: "King BBQ", lat: 21.00783566823813, lng: 105.80255180433008 },
            { name: "My Way Cafe", lat: 21.007411383682005, lng: 105.80309067099071 },
            { name: "TOKYO Deli", lat: 21.00806831796098, lng: 105.80129063318412 },
            { name: "Paris Baguette", lat: 21.00660013430285, lng: 105.80353208421363 },
            { name: "Quan An Ngon 25T2 Hoang Dao Thuy", lat: 21.00727868835967, lng: 105.80213785171509 }
        ]

        this.initMap = this.initMap.bind(this);
        this.onSearchLocation = this.onSearchLocation.bind(this);
        this.selectFavourite = this.selectFavourite.bind(this);
    }
    componentDidMount() {
        this.setState({ locations: this.locations })
        window.initMap = this.initMap;
        loadJS('https://maps.googleapis.com/maps/api/js?key=AIzaSyA7_2mjv6BUTJSpU_tW4RTRbbLKAmpUZwE&callback=initMap')

    }

    //initialize map
    initMap() {
        var self = this;
        var mapview = document.getElementById('map-canvas');
        mapview.style.height = window.innerHeight + "px";
        var map = new window.google.maps.Map(mapview, {
            center: { lat: 21.0075704, lng: 105.8029119 },
            mapTypeControlOptions: {
                style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: window.google.maps.ControlPosition.LEFT_BOTTOM
            },
            mapTypeControl: true
        });
        this.map = map;
        this.foursquareInfoWindow = new window.google.maps.InfoWindow();
        var bounds = new window.google.maps.LatLngBounds();

        this.state.locations.forEach(function (fav) {
            var favmarker = self.createMarker(fav);
            bounds.extend(favmarker.position);
            fav.marker = favmarker;
        });

        this.map.fitBounds(bounds);
    };

    //show Info Window with data from FourSquareAPI
    populateInfoWindow(marker, infowindow) {
        if (infowindow.marker != marker) {
            this.map.panTo(new window.google.maps.LatLng(marker.position.lat(), marker.position.lng()));
            marker.setAnimation(window.google.maps.Animation.BOUNCE);
            infowindow.marker = marker;
            setTimeout(function () {
                marker.setAnimation(null);
            }, 2000);
            infowindow.setContent('<div>Loading..</div>');
            infowindow.open(this.map, marker);
            infowindow.addListener('closeclick', function () {
                infowindow.marker = null;
            });
        }

        //Using Fetch to get data about the location
        FoursquareApi.requestFoursqureApi(marker.position.lat(), marker.position.lng()).then((response) => {
            console.log(response);
            if (response.response.venues.length > 0) {
                var venue = response.response.venues[0];
                var restName = "";
                var restPhone = "";
                var restAddress = "";
                if (venue.name) {
                    restName = venue.name;
                }
                if (venue.location && venue.location.formattedAddress && venue.location.formattedAddress.length > 0) {
                    restAddress = venue.location.formattedAddress[0];
                }
                if (venue.contact && venue.contact.phone) {
                    restPhone = venue.contact.phone;
                }
                infowindow.setContent('<div><div><strong>Name: ' + restName + '</strong></div><div>Address: ' + restAddress + '</div><div>Phone: ' + restPhone + ' </div></div>');
            }

        }).catch(function (err) {
            infowindow.setContent('<div><strong>Can Not Load Data</strong></div>');
        });;
    }

    //Using JS's Filter to filter the list of locations
    onSearchLocation(query) {
        var self = this;
        this.setState({
            locations: this.locations.filter(location => {
                if (location.marker) {
                    if (location.name.toLowerCase().indexOf(query.toLowerCase().trim()) >= 0) {
                        location.marker.setMap(self.map);
                    } else {
                        location.marker.setMap(null);
                    }
                }
                return location.name.toLowerCase().indexOf(query.toLowerCase().trim()) >= 0;
            })
        })
    }

    //create marker on map
    createMarker(fav) {
        var self = this;
        var marker = new window.google.maps.Marker({
            position: {
                lat: fav.lat,
                lng: fav.lng
            },
            icon: this.makeMarkerIcon(true),
            map: this.map,
            title: fav.name,
            animation: window.google.maps.Animation.DROP
        });
        marker.addListener('click', function () {
            self.populateInfoWindow(this, self.foursquareInfoWindow);
        });
        marker.addListener('mouseover', function () {
            this.setIcon(self.makeMarkerIcon(false));
        });
        marker.addListener('mouseout', function () {
            this.setIcon(self.makeMarkerIcon(true));
        });
        return marker;
    };

    //Customize the Marker icon
    makeMarkerIcon(defaultIcon) {
        console.log("create marker" + defaultIcon)
        var markerNoSale = require('./../../icons/marker.png');
        var markerSale = require('./../../icons/marker_hover.png');
        if (defaultIcon)
            return new window.google.maps.MarkerImage(markerNoSale);
        else
            return new window.google.maps.MarkerImage(markerSale);
    };

    //Choosing location from side menu will automatically show Info Window on map
    selectFavourite(data) {
        console.log(data)
        this.populateInfoWindow(data.marker, this.foursquareInfoWindow);
    }
    render() {
        const { locations } = this.state;
        return (
            <div>
                <div id="map-canvas"></div>
                <SideMenuLocation selectFavourite={this.selectFavourite} locations={locations} onSearchLocation={this.onSearchLocation} />
            </div>
        );
    }
}

export default MapScreen;

function loadJS(src) {
    var ref = window.document.getElementsByTagName("script")[0];
    var script = window.document.createElement("script");
    script.src = src;
    script.async = true;
    ref.parentNode.insertBefore(script, ref);
}
