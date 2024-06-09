import L from "leaflet";
import iconGreen from "../../../data/maps/marker-icon-green.png";
import iconBlue from "../../../data/maps/marker-icon-blue.png";

const lat = 48.852969;
const lon = 2.349903;

let map;
const ICONS = {
    green: L.icon({
        iconUrl: iconGreen.src,
        iconSize: [25, 41], // size of the icon
        iconAnchor: [25 / 2, 41], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -41], // point from which the popup should open relative to the iconAnchor
    }),
    blue: L.icon({
        iconUrl: iconBlue.src,
        iconSize: [25, 41], // size of the icon
        iconAnchor: [25 / 2, 41], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -41], // point from which the popup should open relative to the iconAnchor
    }),
};

export const initMap = () => {
    map = L.map("map").setView([lat, lon], 5);
    // Leaflet ne récupère pas les cartes (tiles) sur un serveur par défaut. Nous devons lui préciser où nous souhaitons les récupérer. Ici, openstreetmap.fr
    L.tileLayer("https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
        // Il est toujours bien de laisser le lien vers la source des données
        attribution:
            'données © <a href="//osm.org/copyright">OpenStreetMap</a>/ODbL - rendu <a href="//openstreetmap.fr">OSM France</a>',
        minZoom: 1,
        maxZoom: 20,
    }).addTo(map);
};

export const initCityMarkers = (adresses: any[]) => {
    adresses.forEach((element) => {
        const [long, lat] = element.geometry.coordinates;
        const icon = element.visited ? ICONS.green : ICONS.blue;
        const m = L.marker([lat, long], { icon }).addTo(map);
        const { url } = element.properties;
        if (!element.show) {
            const { address = "", country_code = "", name = "" } = element.properties.location;
            const url_content = url ? `<a href="${url}" target="_blank">${url}</a>` : "";
            m.bindPopup(`${name}<br>${address}<br>${country_code}<br>${url_content}`);
        } else {
            m.bindPopup(`<a href="${url}" target="_blank">${url}</a>`);
            m.openPopup();
        }
    });
};
