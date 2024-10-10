export const createTable = () => {
    const flight_table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    let tableHeaders = [
        `ID`,
        `Flight Code`,
        `Flight Number`,
        `Airline Company`,
        `Estimated Departure Time`,
        `Real Departure Time`,
        `Gate`,
        `SV Destination Airport`,
        `FN Destination Airport`,
        `City Hebrew`,
        `City English`,
        `Country Hebrew`,
        `Country English`,
        `Terminal`,
        `CheckIn Counter`,
        `CheckIn Zone`,
        `English Status`,
        `Hebrew Status`
    ];

    // Create table headers
    let headerRow = document.createElement('tr');
    tableHeaders.forEach((header) => {
        let new_header = document.createElement('th');
        new_header.textContent = header;
        headerRow.appendChild(new_header);
    });
    thead.appendChild(headerRow);
    flight_table.appendChild(thead);
    flight_table.appendChild(tbody);

    let fetchFlights = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8080/getData');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            //create rows and fill it with data
            const flights = await response.json();
            flights.rows.forEach((flight) => {
                const row = tbody.insertRow();
                Object.values(flight).forEach((key) => {
                    const cell = row.insertCell();
                    cell.textContent = key;
                });
            });
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    };

    fetchFlights();

    document.getElementById("flight_table").appendChild(flight_table);
};

export const number_of_flights = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8080/getNumberOfFlights');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const num_of_flights = data.num_of_flights;
        document.getElementById("num_flights").textContent = num_of_flights;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
};

export const number_of_inbound_flights = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8080/getNumberOfInboundFlights');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const num_of_inbound_flights = data.num_of_inbound_flights;
        document.getElementById("in_num_flights").textContent = num_of_inbound_flights;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
};

export const number_of_outbound_flights = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8080/getNumberOfOutboundFlights');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const num_of_out_flights = data.num_of_out_flights;
        document.getElementById("out_num_flights").textContent = num_of_out_flights;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
};

export const number_of_delayed_flights = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8080/getNumberOfDelayedFlights');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const delayed_flights = data.num_of_del_flights;
        document.getElementById("dl_num_flights").textContent = delayed_flights;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
};

export const most_popular_destination = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8080/getFavoriteDestination');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const most_popular = data.favorite;
        document.getElementById("fav_dest").textContent = most_popular;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
};

export const flightsByCountry = (searchQ) => {
    let numberOfFlightsByCountry = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8080/getNumberOfFlightsByCountry?searchQ=${searchQ}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const flight_count = await response.json();
            document.getElementById("num_flights_by_country").textContent = JSON.stringify(flight_count.country_count);
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    };

    let numberOfInboundFlightsByCountry = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8080/getNumberOfInboundFlightsByCountry?searchQ=${searchQ}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const flight_count = await response.json();
            document.getElementById("in_num_flights_by_country").textContent = JSON.stringify(flight_count.country_count);
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    };

    let numberOfOutboundFlightsByCountry = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8080/getNumberOfOutboundFlightsByCountry?searchQ=${searchQ}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const flight_count = await response.json();
            document.getElementById("out_num_flights_by_country").textContent = JSON.stringify(flight_count.out_country_count);
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    };

    // Call the functions to fetch and display the data
    numberOfFlightsByCountry();
    numberOfInboundFlightsByCountry();
    numberOfOutboundFlightsByCountry();
};
export const deleteTable = async()=>{
    try {
        const response = await fetch(`http://127.0.0.1:8080/getDeleteTable`);
        if (!response.ok) {
            throw new Error('Error Delete Table');
        }
        console.log('Delete Succeed');
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
};

