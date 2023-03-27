import puppeteer from 'puppeteer-extra';
import validation from './index.js';
import { readFileSync } from 'node:fs';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
  puppeteer.use(StealthPlugin());

let [config_file, stopAdBlock] = process.argv.slice(2)

const config = JSON.parse( // this const import json configuration schema from config folder
      await readFileSync(
        new URL(`./config/${config_file}`, import.meta.url)
      )
    );

const schema = JSON.parse( // this const import json configuration schema from config folder
      await readFileSync(
        new URL(`./schema/${config.validator[0].schema_name[0]}.json`, import.meta.url)
      )
    );

if(stopAdBlock !== "stopAdBlock"){
    puppeteer.use(AdblockerPlugin({ useCache: false }));
  }
    
    (async () => {
      const browser = await puppeteer.launch({headless: false}); // default is true;
      const page = await browser.newPage();
      await page.goto(config.validator[0].url[0]);
      await page.setViewport({width: 1080, height: 1024});
      await page.exposeFunction('bowser', (elm) => {
            validation(schema.items,elm)
      });
      await page.evaluate(async () => {
        for(let elem of window.dataLayer){
          if(elem.event !== "optimize.domChange"){
          bowser(elem)}
        }
        window.dataLayer.push_c = window.dataLayer.push;
        window.dataLayer.push = function (obj) { 
          if(obj.event !== "optimize.domChange"){
            window.dataLayer.push_c(obj);
            bowser(obj)}}
        })
        if (config.validator[0].browserClose) {
          config.validator[0].time ? await page.waitForTimeout(config.validator[0].time) : await page.waitForTimeout(0);
          await browser.close();
        }
      })();

    