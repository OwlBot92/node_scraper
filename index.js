/* ----- IMPORTS ----- */
import express from "express";
import axios from "axios"
import cheerio from "cheerio";
import URLs_obj from "../node_scraper/data/data.js";
import fs from 'fs';


//SERVER INIT
const app = express();
const PORT = 8000;
const ONE_HOUR = 60 * 60000
const TWO_HOURS = ONE_HOUR * 2
const THREE_HOURS = ONE_HOUR * 3


//FUNCTIONS
const sendRequest = async (array, priceSelector, titleSelector, victim) => {
    let resultArray = [];
    let errorCounter = 0;
    for (const URL of array) {
        try {
            const resp = await axios(URL);
            const HTML = resp.data
            const $ = cheerio.load(HTML)
            let price = $(priceSelector).first().text().trim();
            let title = $(titleSelector).first().text().trim();

            let obj = {
                "title": title,
                "price": price,
            }
            resultArray.push(obj);

        } catch (err) {
            errorCounter++;
            console.log("BLOCKED REQUEST");
        }
    }

    /* fs.writeFile('scrapedData.json', JSON.stringify(resultArray), (err)=>{
        if (err) {
            return console.log(err);
        }
    }) */

    console.log(`\nSCRAPING ${victim}...`);
    console.log("Comunication errors: ", errorCounter);
    console.log("Valid results: ", resultArray);
}


const multipleRequestHandler = () => {
    sendRequest(URLs_obj.amazon_urls, "#priceblock_ourprice", "#productTitle", "AMAZON");
    sendRequest(URLs_obj.euronics_urls, ".productDetails__price", ".productDetails__name", "EURONICS");
    sendRequest(URLs_obj.mediaworld_urls, ".price", ".product-name", "MEDIAWORLD");
    sendRequest(URLs_obj.nzxt_urls, '#product-price span', '.bg-yellow-300', 'NZXT')
}

const intervalRequestHandler = (time) => {
    setInterval(() => {
        multipleRequestHandler();
    }, time);
}

//DRIVER FUNCTIONS
multipleRequestHandler();
//intervalRequestHandler(THREE_HOURS)

//SERVER UP
app.listen(PORT, () => console.log(`server running on PORT ${PORT} \n`))
