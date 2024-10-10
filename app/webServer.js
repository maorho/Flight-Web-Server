const http = require('http');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const url = require('url');
const fs = require('fs'); 

// The API URL you provided
const apiUrl = 'https://data.gov.il/api/3/action/datastore_search?resource_id=e83f763b-b7d7-479e-b172-ae981ddc6de5&limit=300';

const hostname = '127.0.0.1';
const port = 8080;  // Ensure this port is available

// Initialize SQLite database
const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Create table if it doesn't exist
const createFlightsTableQuery = `
CREATE TABLE IF NOT EXISTS Flights (
    id INTEGER PRIMARY KEY,
    flight_code TEXT NOT NULL,
    flight_number INTEGER NOT NULL,
    company TEXT NOT NULL,
    estimated_departure_time DATETIME NOT NULL,
    real_departure_time DATETIME NOT NULL,
    gate TEXT NOT NULL,
    sv_destination_airport TEXT NOT NULL,
    fn_destination_airport TEXT NOT NULL,
    city_hebrew TEXT NOT NULL COLLATE utf8_general_ci,
    city_English TEXT NOT NULL COLLATE utf8_general_ci,
    country_hebrew TEXT NOT NULL COLLATE utf8_general_ci,
    country_english TEXT NOT NULL COLLATE utf8_general_ci,
    terminal INTEGER NOT NULL,
    checkIn_counter TEXT,
    checkIn_zone TEXT,
    en_status TEXT NOT NULL,
    hw_status TEXT NOT NULL
);
`;
db.run(createFlightsTableQuery);

const deleteQuery = `DROP TABLE IF EXIST Flights`;
const server = http.createServer(async (req, res) => {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500'); // Allow your specific front-end origin
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        // Handle preflight requests
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true); // Parse URL and query string
    const { pathname, query } = parsedUrl;

    if (pathname === '/') {
        
        const filePath = path.join(__dirname, 'public', 'index.html');
        
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.statusCode = 500;
                res.end('Error loading page');
                return;
            } 
            console.log('Serving index.html');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(content);
        });
    } else if (pathname === '/api/data') {
        try {
            // Make a request to the API using Axios Library
            const apiResponse = await axios.get(apiUrl);
            const data = apiResponse.data.result.records;
    
            const insert_flight_query = `
            INSERT OR REPLACE INTO Flights (
                id, flight_code, flight_number, company, estimated_departure_time, 
                real_departure_time, gate, sv_destination_airport, fn_destination_airport, 
                city_hebrew, city_English, country_hebrew, country_english, terminal, 
                checkIn_counter, checkIn_zone, en_status, hw_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            `;
            
            data.forEach(element => {
                db.run(insert_flight_query, [
                    element._id, 
                    element.CHOPER, 
                    element.CHFLTN, 
                    element.CHOPERD, 
                    element.CHSTOL, 
                    element.CHPTOL, 
                    element.CHAORD, 
                    element.CHLOC1, 
                    element.CHLOC1D, 
                    element.CHLOC1TH, 
                    element.CHLOC1T, 
                    element.CHLOC1CH, 
                    element.CHLOCCT, 
                    element.CHTERM, 
                    element.CHCINT, 
                    element.CHCKZN, 
                    element.CHRMINE, 
                    element.CHRMINH
                ], (err) => {
                    if (err) {
                        console.log('Element causing error:', element);
                        console.error('Error during data insertion:', err.message);
                    }
                });
            });
    
            // Send the API data back to the client
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(apiResponse.data));
        } catch (error) {
            console.error('Error fetching data:', error);
            res.statusCode = 500;
            res.end('Error fetching data');
        }
    } 
    else if (pathname === '/getData' && req.method === 'GET') {
        const query = 'SELECT * FROM Flights;';
        db.all(query, (err, rows) => {
            if (err) {
                res.statusCode = 500;
                res.end('Database error');
                return;
            }
             // Send the API data back to the client
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ rows }));
        });
    }
    else if (pathname === '/getNumberOfFlights' && req.method === 'GET') {
        const query = 'SELECT COUNT(*) as num_of_flights FROM Flights;';

        db.get(query, (err, row) => {
            if (err) {
                res.statusCode = 500;
                res.end('Database error');
                return;
            }
             // Send the current number of flights data back to the client
            const num_of_flights = row.num_of_flights;
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ num_of_flights }));
        });
    }
    else if (pathname === '/getNumberOfInboundFlights' && req.method === 'GET') {
        const query = 'SELECT COUNT(*) as num_of_in_flights FROM Flights WHERE checkIn_counter IS NULL';
        db.get(query, (err, row) => {
            if (err) {
                res.statusCode = 500;
                res.end('Database error');
                return;
            }
            // Send the current number of inbound flights data back to the client
            const num_of_inbound_flights = row.num_of_in_flights;
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ num_of_inbound_flights }));
        });
    }
    else if (pathname === '/getNumberOfOutboundFlights' && req.method === 'GET') {
        const query = 'SELECT COUNT(*) as num_of_outbound_flights FROM Flights WHERE checkIn_counter IS NOT NULL';

        db.get(query, (err, row) => {
            if (err) {
                res.statusCode = 500;
                res.end('Database error');
                return;
            }
            // Send the current number of outbound flights data back to the client
            const num_of_out_flights = row.num_of_outbound_flights;
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({num_of_out_flights}));
        });
    }
    else if (pathname === '/getNumberOfDelayedFlights' && req.method === 'GET') {
        const query = 'SELECT COUNT(*) as num_of_delayed_flights FROM Flights WHERE real_departure_time > estimated_departure_time';

        db.get(query, (err, row) => {
            if (err) {
                res.statusCode = 500;
                res.end('Database error');
                return;
            }
            // Send the current number of delayed flights data back to the client
            const num_of_del_flights = row.num_of_delayed_flights;
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ num_of_del_flights }));
        });
    }
    else if (pathname === '/getFavoriteDestination' && req.method === 'GET') {
        const query = `SELECT city_English as most_popular
        FROM Flights
        GROUP BY city_English
        ORDER BY COUNT(*) DESC
        LIMIT 1;`

        db.get(query, (err, row) => {
            if (err) {
                res.statusCode = 500;
                res.end('Database error');
                return;
            }
            // Send the current favorite destination data back to the client
            const favorite = row.most_popular;
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ favorite }));
        });
    }
    else if (pathname === '/getNumberOfFlightsByCountry' && req.method === 'GET') { 
        const country = query.searchQ;
        if (country) {
            const query = `SELECT COUNT(*) as num_of_flights_by_country FROM Flights WHERE  country_english COLLATE NOCASE  ='${country}' OR country_hebrew COLLATE NOCASE  ='${country}'`;
            db.get(query,[], (err, row) => {
                if (err) {
                    res.statusCode = 500;
                    res.end('Database error');
                    return;
                }
                // Send the current number of flights by counrty data back to the client
                const country_count = row.num_of_flights_by_country;
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ country_count }));
            });
        } else {
            res.statusCode = 400;
            res.end('Missing searchQ parameter');
        }
    }
    else if (pathname === '/getNumberOfInboundFlightsByCountry' && req.method === 'GET') { 
        const country = query.searchQ;
        if (country) {
            const query = `SELECT COUNT(*) as num_of_inbound_flights_by_country FROM Flights WHERE (country_english COLLATE NOCASE = '${country}' OR country_hebrew COLLATE NOCASE = '${country}') AND checkIn_counter IS NULL `;
            db.get(query, [], (err, row) => {
                if (err) {
                    res.statusCode = 500;
                    res.end('Database error');
                    return;
                }
                // Send the current number of inbound flights by counrty data back to the client
                const country_count = row.num_of_inbound_flights_by_country;
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ country_count }));
            });
        } else {
            res.statusCode = 400;
            res.end('Missing searchQ parameter');
        }
    }
    else if (pathname === '/getNumberOfOutboundFlightsByCountry' && req.method === 'GET') { 
        const country = query.searchQ;
        if (country) {
            const query = `SELECT COUNT(*) as num_of_outbound_flights_by_country FROM Flights WHERE (country_english COLLATE NOCASE = '${country}' OR country_hebrew COLLATE NOCASE = '${country}') AND checkIn_counter IS NOT NULL`;
            db.get(query, [], (err, row) => {
                if (err) {
                    res.statusCode = 500;
                    res.end('Database error');
                    return;
                }
                // Send the current number of outbound flights by counrty data back to the client
                const out_country_count = row.num_of_outbound_flights_by_country;
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ out_country_count }));
            });
        } else {
            res.statusCode = 400;
            res.end('Missing searchQ parameter');
        }
    }
    else if (pathname === '/getDeleteTable' && req.method === 'GET') { 
            // delete table
            db.run(deleteQuery);
    }
    else {
        res.statusCode = 404;
        res.end('Page Not Found\n');
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
