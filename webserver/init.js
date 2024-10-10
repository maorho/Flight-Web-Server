import {createTable,number_of_flights,number_of_inbound_flights,number_of_outbound_flights,number_of_delayed_flights,most_popular_destination,flightsByCountry} from "./functions.js";

const init = () =>{
    createTable();
    number_of_flights();
    number_of_inbound_flights();
    number_of_outbound_flights();
    number_of_delayed_flights();
    most_popular_destination();
    declareEvents();
}

const declareEvents = function(){
    const searchButton = document.querySelector("#search_btn");
    const searchInput = document.querySelector("#input_search");

    if (searchButton && searchInput) {
        searchButton.addEventListener("click", () => {
            let val = searchInput.value;
            flightsByCountry(val);
        });

        document.addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                let val = searchInput.value;
                flightsByCountry(val);
            }
        });
    } else {
        console.error("Search button or input field not found in the DOM.");
    }
};

init();
// Schedule the function to run every hour 
setInterval(createTable, 3600000);