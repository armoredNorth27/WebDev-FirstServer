/**
 * Comp 2406 Assignment 2 - Fall 2021
 * 
 * @author Alex Nedev
 */

//Load necessary modules
const http = require('http');
const pug = require("pug");
const fs = require("fs");

//Global Variables
let restaurants = {};       //* Contains all restaurants
let restaurantOrders = {};  //* Contains data for each client's submission

//Create Server
const server = http.createServer((request, response) => {

    //? You can uncomment to see what requests are being made
    // console.log(`${request.method} for ${request.url}`)

    //Handles all GET requests
    if(request.method === "GET"){

        //Handles GET request for home page
        if(request.url === '/' || request.url === '/home'){
            response.setHeader("Content-Type", "text/html");
            response.statusCode = 200;
            response.write(pug.renderFile('./home.pug'));
            response.end();
        }
        //Handles GET request for order page
        else if(request.url === '/orderform'){
            //Read orderform.html file and load it
            fs.readFile("orderform.html", (error, data) => {
                //Handles server error
                if(error){
                    response.statusCode = 500;
                    response.write("Server error.");
                    response.end();
                    return;
                }

                response.setHeader("Content-Type", "text/html");
                response.statusCode = 200;
                response.write(data);
                response.end();
            });
        }
        //Handles GET request for client javascript file
        else if(request.url === '/client.js'){
            //Read client.js and load it
            fs.readFile("client.js", (error, data) =>{
                //Handles server error
                if(error){
                    response.statusCode = 500;
                    response.write("Server error.");
                    response.end();
                    return;
                }

                response.setHeader("Content-Type", "application/javascript");
                response.statusCode = 200;
                response.write(data);
                response.end();
            });
        }
        //Handles GET request for add.png
        else if(request.url === '/add.png'){
            //Read add.png and load it
            fs.readFile("add.png", (error, data) =>{
                if(error){
                    response.statusCode = 500;
                    response.write("Server error.");
                    response.end();
                    return;
                }

                response.setHeader("Content-Type", "image/png");
                response.statusCode = 200;
                response.write(data);
                response.end();
            });
        }
        //Handles GET request for remove.png
        else if(request.url === '/remove.png'){
            //Read remove.png and load it
            fs.readFile("remove.png", (error, data) => {
                if(error){
                    response.statusCode = 500;
                    response.write("Server error.");
                    response.end();
                    return;
                }

                response.setHeader("Content-Type", "image/png");
                response.statusCode = 200;
                response.write(data);
                response.end();
            });
        }
        //Handles GET request for favicon
        else if(request.url === '/favicon.ico'){
            //Handles GET request for favicon.png
            fs.readFile("favicon.ico", (error, data) =>{
                if(error){
                    response.statusCode = 500;
                    response.write("Server error.");
                    response.end();
                    return;
                }

                response.setHeader("Content-Type", "image/png");
                response.statusCode = 200;
                response.write(data);
                response.end();
            });
        }
        //Handles GET request for restaurant statistics page
        else if(request.url === '/restaurantStats'){
            response.setHeader("Content-Type", "text/html");
            response.statusCode = 200;
            response.write(pug.renderFile('./restStats.pug', {orders: restaurantOrders}));
            response.end();
        }
        //Handles GET request for the array that holds all restaurants
        else if(request.url === '/restaurants'){
            response.setHeader("Content-Type", "application/json");
            response.statusCode = 200;
            response.write(JSON.stringify(restaurants));
            response.end();
        }
        //Handles GET request for the css file for the home page
        else if(request.url === '/home.css'){
            //Read home.css and load it
            fs.readFile("home.css", (error, data) => {
                if(error){
                    response.statusCode = 500;
                    response.write("Server error.");
                    response.end();
                    return;
                }

                response.setHeader("Content-Type", "text/css");
                response.statusCode = 200;
                response.write(data);
                response.end();
            });
        }
        //Handles GET request for the css file for the orderform page
        else if(request.url === '/orderform.css'){
            fs.readFile("orderform.css", (error, data) =>{
                if(error){
                    response.statusCode = 500;
                    response.write("Server error.");
                    response.end();
                    return;
                }

                response.setHeader("Content-Type", "text/css");
                response.statusCode = 200;
                response.write(data);
                response.end();
            });
        }
        //Handles GET request for the css file for the restaurant stats page
        else if(request.url === '/restStats.css'){
            //Read restStats.css and load it
            fs.readFile("restStats.css", (error, data) =>{
                if(error){
                    response.statusCode = 500;
                    response.write("Server error.");
                    response.end();
                    return;
                }

                response.setHeader("Content-Type", "text/css");
                response.statusCode = 200;
                response.write(data);
                response.end();
            });
        }
        //Handles invalid/bad GET requests
        else{
            response.statusCode = 400;
            response.write("Invalid query");
            response.end();
        }
        
    }
    //Handles all PUT requests
    else if(request.method === "POST"){
        //Records the data from the user's submitted order
        if(request.url === "/submittedOrder"){
            //Holds the data that was sent from the client
            let body = "";
            
            //Adds the data from the client to the body string
            request.on('data', (data) =>{
                body += data;
            });
            
            //When the request is done adding data to the body, store that information
            request.on('end', () =>{
                //Holds the client's order. *Last element in the client order is the name of the restaurant*
                const clientOrder = JSON.parse(body);
                let clientOrderKeys = Object.keys(clientOrder);
                let restaurantsLength = Object.keys(restaurants).length;

                //Represents the current item, amount of times it's been ordered, and it's price
                let currentDish = -1;
                let currentDishAmount = -1;
                let currentDishPrice = -1;
                
                //Goes through all restaurants so we know which one we placed the order in
                for(let i=0; i<restaurantsLength; i++){
                    if(restaurants[i].name == clientOrder.restaurantName){
                        //*=====Keeps track of the total number of orders for the specific restaurant=====*//
                        restaurantOrders[i].totalNumOrders += 1;
                        
                        //*=====Records the total price of all orders(will be averaged later)=====*//
                        //menu variable gets the menu of the restaurant the order was made in
                        let menu = Object.values(restaurants[i].menu);
                        // First for loop goes through all categories for each restaurant.
                        // Category means things like Appetizers, combos, drinks, etc
                        for(let j=0; j<menu.length; j++){
                            //Gets the keys of each dish type(so keys of appetizers, then combos, etc)
                            let category = Object.keys(menu[j]);

                            // Second for loop goes through all menu items for that specific category
                            // So it'll go through all appetizers, or all comboes, etc
                            for(let k=0; k<category.length; k++){

                                //If the current menu item from the restaurant is also in the order,
                                //then calculate its price based on how many were ordered and store it
                                if(category[k] in clientOrder){
                                    currentDishPrice = menu[j][category[k]].price;
                                    currentDishAmount = clientOrder[category[k]];
                                    let tax = 0.1 * (currentDishPrice * currentDishAmount);
                                    restaurantOrders[i].orderTotal += ( (currentDishPrice * currentDishAmount) + tax + restaurants[i].delivery_fee );
                                }
                            }
                        }

                        //*=====Records the number of dishes that were ordered=====*//
                        for(let j=0; j<clientOrderKeys.length-1; j++){
                            currentDish = clientOrderKeys[j];
                            currentDishAmount = clientOrder[clientOrderKeys[j]];

                            //If the ordered dish has already been recorded, then just add the
                            //amount of ordered dishes to the recorded amount
                            if(currentDish in restaurantOrders[i].orderedItems){
                                restaurantOrders[i].orderedItems[currentDish] += currentDishAmount;
                            }

                            //If the ordered dish hasn't been recorded, then add it to the object
                            //that keeps track of all ordered dishes
                            else{
                                restaurantOrders[i].orderedItems[currentDish] = currentDishAmount;
                            }
                        }

                        //*=====Find most popular dish or one of the most popular dishes=====*//
                        //Represent the keys of all ordered dishes and the number of all ordered dishes
                        let orderedItemKeys = Object.keys(restaurantOrders[i].orderedItems);
                        let orderedItemsLength = Object.keys(restaurantOrders[i].orderedItems).length;

                        //Represents the most popular item's key and value
                        let mostPopularItemKey = orderedItemKeys[0];
                        let mostPopularItemAmount = restaurantOrders[i].orderedItems[mostPopularItemKey];

                        //Finds the restaurant's most popular item by searching all items ever ordered
                        for(let j=0; j<orderedItemsLength; j++){
                            //If the item we're looking at is the same as the most popular
                            //then continue to the next item
                            if(mostPopularItemKey == orderedItemKeys[j]){
                                continue;
                            }

                            //If the current item is not the most popular, compare the two
                            //to see which item is more popular
                            else{
                                //Set current item's key and value
                                currentDish = orderedItemKeys[j];
                                currentDishAmount = restaurantOrders[i].orderedItems[orderedItemKeys[j]];

                                //If the current item has more orders than the most popular, than make
                                //the current item the most popular
                                if(mostPopularItemAmount < currentDishAmount){
                                    mostPopularItemKey = currentDish;
                                    mostPopularItemAmount = currentDishAmount;
                                }
                            }
                        }

                        //Find the name of the most popular item based off of it's key
                        for(category in restaurants[i].menu){
                            if(restaurants[i].menu[category][mostPopularItemKey] != undefined){
                                restaurantOrders[i].mostPopularItem = restaurants[i].menu[category][mostPopularItemKey].name;
                                break;
                            }
                        }
                    }
                }

                response.setHeader("Accept", "application/json");
                response.write("Information added.");
                response.end();
            });
        }
        //Handles invalid/bad POST requests
        else{
            response.statusCode = 404;
            response.write("Unknown Resource.");
            response.end();
        }
    }
    //Handles invalid/bad requests
    else{
        response.statusCode = 404;
        response.write("Unknown request");
        response.end();
    }

});

//Read Files and run server once everything's loaded
fs.readdir("./restaurants", (error, files) => {
    if(error){
        return console.log(error);
    }

    //Get each restaurant from the restaurants folder 
    //and add it to an object that will store them all
    for(let i=0; i<files.length; i++){
        //Get each individual restaurant
        let restaurant = require("./restaurants/" + files[i]);
        //Add the individual restaurant to an object that stores all restaurants
        restaurants[i] = restaurant;

        //Set the data to record user's submitted orders for each restaurant
        let restaurantOrder = {};
        restaurantOrder.totalNumOrders = 0;
        restaurantOrder.orderTotal = 0;
        restaurantOrder.orderedItems = {};
        restaurantOrder.mostPopularItem = '';
        restaurantOrder.name = restaurant.name;

        //Add data to an array that will record the total number of orders,
        //the average order total and all ordered items for that specific restaurant
        restaurantOrders[i] = restaurantOrder;
    }

    //Start server
    server.listen(3000);
    console.log('Server running at http://127.0.0.1:3000/');
});
