import express from "express";
import axios from "axios"
import cheerio from "cheerio";
import fs from 'fs';


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

  const sendRequest = async (URL, provincia = "") => {
    // get data from the url using axios and cheerio
    let errors = [];
    let dataFromProvincia = [];
    let addressMatrix = [];
    //let formattedProvincia = provincia.replace(' ', '-').capitalize();
    try {
      const resp = await axios(URL);
      const HTML = resp.data // get the html from the response
      const $ = cheerio.load(HTML) // ! init cheerio as $

      // get an array of all the titles
      const titles = $('.card__title').toArray().map(item => $(item).text())
      // get an array of all the addresses
      let addresses = $('.card__store-address').toArray().map(item => $(item).text())
      // normalize the addresses array
      //console.log('TITLES', titles);
      addressMatrix = normalizeAddressesArray(addresses);
      for (let index = 0; index < titles.length; index++) {
        dataFromProvincia.push({
          name: titles[index],
          indirizzo: addressMatrix[index][0].toUpperCase(),
          citta: addressMatrix[index][1].replace(" ", "-").toUpperCase(),
          provincia: provincia,
        })
      }
      //console.log('dataFromProvincia', dataFromProvincia);
    } catch (error) {
      //console.log('error :::', error);
      console.log('error :::', `name of ${provincia} not found`);
      errors.push(provincia); // add the compromised region to the errors array
    }
    return [dataFromProvincia, errors];
  }

  //sendRequest("https://www.venetacucine.com/store-locator/italia/agrigento");
  const normalizeAddressesArray = (addresses) => {
    let matrix = [];
    for (const address of addresses) {
      let normalizedSingleAddress = address.replace(' ', '').trim().split('\n') // rimuove spazi centrali e inizio fine, poi fa lo split per a capo
      normalizedSingleAddress.pop() // rimuove l'ultimo elemento dell'array perchè è inutile
      normalizedSingleAddress[1] = normalizedSingleAddress[1].replace(' ', '').trim() // manipola la seconda stringa nell'array per rimuovere gli spazi
      let extrapulatedCity = normalizedSingleAddress[1].split(' '); // splitta la stringa basandosi sugli spazi
      extrapulatedCity.shift() //rimuove l'elemento iniziale dell'array
      extrapulatedCity.pop() // rimuove l'ultimo elemento dell'array
      extrapulatedCity = extrapulatedCity.join(' ') // riunisce l'array in una stringa
      normalizedSingleAddress[1] = extrapulatedCity.trim() // rimuove spazi all'inizio e alla fine
      matrix.push(normalizedSingleAddress) // aggiunge l'array alla matrice
    }
    return matrix;
  }

  const prepareDataToBeSaved = async () => {
    const provincie = await getRegionsRequest('https://www.venetacucine.com/store-locator/italia');
    let scrapedData = [];
    let n = 0;
    for (const provincia of provincie) {  // ! temporary sliced array of provincie
      const url = `https://www.venetacucine.com/store-locator/italia/${provincia}`;
      const [regionData, errors] = await sendRequest(url, provincia);
      for (const iterator of regionData) { // region data e' un array di oggetti
        iterator["provincia"] = `${provincia[0].toUpperCase()}${provincia.slice(1).toLowerCase()}`.replace(' ', '-');
        scrapedData.push(iterator); // voglio aggiungere ogni oggetto all'array scrapedData
      }
      n++;
      console.log(`iteratin n: ${n} on the province ${provincia}`); // print the number of iterations
    }
    const toBeSaved = { data: scrapedData }
    return toBeSaved;
  }
  //let a = performance.now();
  //let b = performance.now();
  //console.log(`Time taken: ${(b - a) / 1000} seconds.`);
  const toBeSaved = await prepareDataToBeSaved();
  console.log("Writing the json file...");
  fs.writeFileSync('./data/scrapedData.json', JSON.stringify(toBeSaved), 'utf8', (err) => {
    if (err) {
      throw err;
    }
    else {
      console.log('The file has been saved!');
    }
  })
}


