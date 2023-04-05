import puppeteer from 'puppeteer-extra';
import validation from './index.js';
import { readFileSync } from 'node:fs';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
  puppeteer.use(StealthPlugin());

let [config_file, stopAdBlock] = process.argv.slice(2) // responsible for commands entered at the prompt

const config = JSON.parse( // this const import json configuration schema from config folder
      await readFileSync(
        new URL(`./config/${config_file}`, import.meta.url)
      )
    );

const schema = JSON.parse( // this const import json schema from config folder
      await readFileSync(
        new URL(`./schema/${config.validator[0].schema_name[0]}.json`, import.meta.url)
      )
    );

if(stopAdBlock !== "stopAdBlock"){ // to stop adblock functioning
    puppeteer.use(AdblockerPlugin({ useCache: false }));
  }
    
    (async () => { // opening and validation function in the browser
      const browser = await puppeteer.launch({headless: false}); // default is true;
      const page = await browser.newPage();
      await page.goto(config.validator[0].url[0]); // website to be opened
      await page.setViewport({width: 1080, height: 1024}); // screen size
      await page.exposeFunction('bowser', (elm) => { //intermediary function between machine and browser (injects the validation function into the browser)
            validation(schema.items,elm)
      });
      await page.evaluate(async () => { //performs the validation process in the browser
        for(let elem of window.dataLayer){ //get dataLayer events
          if(elem.event !== "optimize.domChange"){ // 
          bowser(elem)} // validate
        }
        window.dataLayer.push_c = window.dataLayer.push; //change event push

        window.dataLayer.push = function (obj) { 
          if(obj.event !== "optimize.domChange"){
            window.dataLayer.push_c(obj);
            bowser(obj)}} // validates the new dataLayer push
        })
        if (config.validator[0].browserClose) { // check the time and close the browser
          config.validator[0].time ? await page.waitForTimeout(config.validator[0].time) : await page.waitForTimeout(0);
          await browser.close();
        }
      })();

    