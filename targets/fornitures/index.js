import express from "express";
import axios from "axios"
import cheerio from "cheerio";
import fs from 'fs';
import {performance} from "perf_hooks";

//import URLs_obj from "../node_scraper/data/data.js";

//.find('div > div > div > .card__title')
// SERV//ER INIT

export const main = async () => {
  const app = express();
  const PORT = 8000;


  const getRegionsRequest = async (URL) => {
    const resp = await axios(URL);
    const HTML = resp.data // get the html from the response
    const $ = cheerio.load(HTML) // ! init cheerio as $
    // get all the regions 
    const regions = $('#form-stacked-select').find('option').toArray().map(item => $(item).text().replace(' ', '-').toLowerCase())
    // remove the first element of the regions array 
    regions.shift()
    //console.log(regions);
    return regions
  }

  const sendRequest = async (URL, region) => {
    // get data from the url using axios and cheerio
    let errors = [];
    let regionObject = {};
    try {
      const resp = await axios(URL);
      const HTML = resp.data // get the html from the response
      const $ = cheerio.load(HTML) // ! init cheerio as $
      
      // get an array of all the titles
      const titles = $('.card__title').toArray().map(item => $(item).text())
      // get an array of all the addresses
      let addresses = $('.card__store-address').toArray().map(item => $(item).text())
      // normalize the addresses array
      addresses = normalizeAddressesArray(addresses)
      regionObject[region] = {
        "names" : titles,
        "addresses" : addresses
      }
      //console.log('TITLES', titles);
      //console.log('ADDRESSES', addresses);
      //console.log(regionObject);
    } catch (error) {
      //console.log('error :::', region);
      errors.push(region); // add the compromised region to the errors array
    }
    return [regionObject, errors];
  }
  // takes in an array of addresses 
  // for each address, transform it into an array 
  // remove useless characters and recombine the array with the strings capitalized
  const normalizeAddressesArray = (addressesArray) => {
    let refinedAddressess = [];
    let finalArray = [];
    for (const iterator of addressesArray) {
      let refinedAddress = iterator.replace(' ', '').trim();
      refinedAddressess.push(refinedAddress);
    } 
    for (const iterator of refinedAddressess) {
      let splittedAddress = iterator.split('\n').map(item => item.trim().toUpperCase());
      finalArray.push(splittedAddress.join(' '));
    }
    //console.log(finalArray);
    return finalArray
  }
  

  const prepareDataToBeSaved = async () => {
    const regions = await getRegionsRequest('https://www.venetacucine.com/store-locator/italia');
    let scrapedData = [];
    let n = 0;
    for (const region of regions) {
      const url = `https://www.venetacucine.com/store-locator/italia/${region}`;
      const [regionData, errors] = await sendRequest(url, region); 
      scrapedData.push(regionData); // add the region data to the scrapedData array
      n++;
      console.log('...iteration n:', n); // print the number of iterations
    }
    const toBeSaved = { data: scrapedData}
    return toBeSaved;
  }

  //let a = performance.now();
  //let b = performance.now();
  //console.log(`Time taken: ${(b - a) / 1000} seconds.`);
  
  const toBeSaved = await prepareDataToBeSaved();
  fs.writeFileSync('./data/scrapedData.json', JSON.stringify(toBeSaved), 'utf8', (err) => {
    if (err) throw err;
    else console.log('The file has been saved!');
  })
  //console.log(scrapedData);
}

  
