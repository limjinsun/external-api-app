// Framework7 App main instance
var app = new Framework7({
    root: '#app', // App root element
    id: 'io.framework7.testapp', // App bundle ID
    name: 'Framework7', // App name
    theme: 'auto', // Automatic theme detection
    // App root data
    data: function() {
        return {
            user: {
                firstName: 'John',
                lastName: 'Doe',
            },
            // Demo products for Catalog section
            products: [{
                    id: '1',
                    title: 'Apple iPhone 8',
                    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi tempora similique reiciendis, error nesciunt vero, blanditiis pariatur dolor, minima sed sapiente rerum, dolorem corrupti hic modi praesentium unde saepe perspiciatis.'
                },
                {
                    id: '2',
                    title: 'Apple iPhone 8 Plus',
                    description: 'Velit odit autem modi saepe ratione totam minus, aperiam, labore quia provident temporibus quasi est ut aliquid blanditiis beatae suscipit odio vel! Nostrum porro sunt sint eveniet maiores, dolorem itaque!'
                },
                {
                    id: '3',
                    title: 'Apple iPhone X',
                    description: 'Expedita sequi perferendis quod illum pariatur aliquam, alias laboriosam! Vero blanditiis placeat, mollitia necessitatibus reprehenderit. Labore dolores amet quos, accusamus earum asperiores officiis assumenda optio architecto quia neque, quae eum.'
                },
            ]
        };
    },
    // App root methods
    methods: {
        helloWorld: function() {
            app.dialog.alert('Hello World!');
        },
    },
    // App routes
    routes: routes,
});

// Dom7
var $$ = Dom7;

// Init/Create views
var homeView = app.views.create('#view-home', {
    url: '/'
});

var catalogView = app.views.create('#view-weather', {
    url: '/weather/'
});

var settingsView = app.views.create('#view-settings', {
    url: '/settings/'
});

$$('.form-action').on('click', function() {
    returnKoreanRate();
});

function geo() {
    navigator.geolocation.getCurrentPosition(geoCallBack, onError);
}

function onError() {
    console.log("error-happened");
}

function geoCallBack(position) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    document.getElementById('lat').innerHTML = Number((lat).toFixed(6));
    document.getElementById('lng').innerHTML = Number((lng).toFixed(6));

    axios.get('https://api.opencagedata.com/geocode/v1/json?q=' + lat + ',' + lng + '&pretty=1&key=9fe4f6573dd740bba0a6e634693fddb2')
        .then(function(response) {
            console.log(response);
            document.getElementById('country').innerHTML = response.data.results[0].components.country;
            document.getElementById('flag').innerHTML = response.data.results[0].annotations.flag;
            document.getElementById('currency').innerHTML = response.data.results[0].annotations.currency.name;
            getCurrencyRate(response.data.results[0].annotations.currency.iso_code);
            document.getElementById('currency_symbol').innerHTML = response.data.results[0].annotations.currency.symbol
            document.getElementById('local-symbol').innerHTML = response.data.results[0].annotations.currency.symbol
            buildMap(lat, lng);
        })
        .catch(function(error) {
            console.log(error);
        });
}

function returnKoreanRate() {
    navigator.geolocation.getCurrentPosition((position) => {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        var localCurrencyCode = null;
        axios.get('https://api.opencagedata.com/geocode/v1/json?q=' + lat + ',' + lng + '&pretty=1&key=9fe4f6573dd740bba0a6e634693fddb2')
            .then(function(response) {
                localCurrencyCode = response.data.results[0].annotations.currency.iso_code;
                axios.get('http://www.apilayer.net/api/live?access_key=b45e3c44c5486406090bad9ee44f5142').then(function(response) {
                        var rate = response.data.quotes['USD' + localCurrencyCode];
                        var USDKRW = response.data.quotes['USDKRW'];
                        var local = document.getElementById('local_currency');
                        console.log(Number((local.value / rate * USDKRW).toFixed(0)));
                        document.getElementById('koreanRate').innerHTML = Number((local.value / rate * USDKRW).toFixed(0)).format();
                        document.getElementById('korean-symbol').style.display = "inline-block";
                    })
                    .catch(function(error) {
                        console.log(error);
                    })
            }).catch(function(error) {
                console.log(error);
            });
    }, onError);
}

function getCurrencyRate(data) {
    axios.get('http://www.apilayer.net/api/live?access_key=b45e3c44c5486406090bad9ee44f5142')
        .then(function(response) {
            var rate = response.data.quotes['USD' + data];
            // console.log(response.data.quotes['USD'+data]);
            document.getElementById('rate').innerHTML = rate;
        })
        .catch(function(error) {
            console.log(error);
        })
        .then(function() {});
}

Number.prototype.format = function(n, x) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
    return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
};

var link = document.getElementById('weather_link');

link.addEventListener('click', () => {
    console.log('weather click handler fired');
    navigator.geolocation.getCurrentPosition((position) => {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        axios.get('https://api.darksky.net/forecast/be2a423c8d3e1da698d97a23bc92f6ef/' + lat + ',' + lng)
            .then((response) => {
                console.log(response);
                document.getElementById('today').innerHTML = response.data.daily.summary;
                document.getElementById('temperature').innerHTML = response.data.currently.temperature;
                document.getElementById('humidity').innerHTML = response.data.currently.humidity;
                document.getElementById('windspeed').innerHTML = response.data.currently.windSpeed;
                console.log(response.data.daily.summary);
            }).catch(function(error) {
                console.log(error);
            });
    }, onError);
});

function buildMap(lat, lng) {
    document.getElementById('mapid').innerHTML = "<div id='map' style='width: 100%; height: 100%;'></div>";
    var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        osmAttribution = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors,' +
        ' <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        osmLayer = new L.TileLayer(osmUrl, { maxZoom: 18, attribution: osmAttribution });
    var map = new L.Map('map');
    map.setView(new L.LatLng(lat, lng), 15);
    map.addLayer(osmLayer);
    // var validatorsLayer = new OsmJs.Weather.LeafletLayer({ lang: 'en' });
    // map.addLayer(validatorsLayer);
}